import { NextFunction, Request, Response } from "express";
import { ExpressError } from "../utils/customError.js";
import {
  paginateHandler,
  sortHandler,
  bodyHandler,
} from "../utils/queryHandler.js";
import CRUD from "../models/CRUD.js";
import { PreProcessorHook, ValidatorHook } from "./controller.js";

export default class ControlApiFactory<U> {
  constructor(private Model: CRUD<U>) {}

  createDoc(
    requiredFields: string[],
    validator: ValidatorHook,
    preProcessor: PreProcessorHook
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const missingFields = requiredFields.filter((field) => !req.body[field]);
      if (missingFields.length) {
        return next(
          new ExpressError(
            400,
            `Missing Required Fields: ${missingFields.join(", ")}`
          )
        );
      }
      const validity = validator(req.body);
      if (!validity.isValid) {
        return next(
          new ExpressError(400, validity.error || "Validation Failed")
        );
      }
      const processedData = preProcessor<U>(req.body);

      const newDoc = await this.Model.createOne(processedData);
      res.status(201).json({ status: "success", data: { data: newDoc } });
    };
  }

  getDoc() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      if (!id) {
        return next(new ExpressError(400, "Invalid Id"));
      }
      const doc = await this.Model.readOne(id);
      res.status(200).json({ status: "success", data: { data: doc } });
    };
  }

  getAllDocs(sortKeys: string[], populatePath?: string) {
    return async (
      req: Request,
      res: Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      next: NextFunction
    ) => {
      const page = paginateHandler(req.query);
      const sort = sortHandler<U>(req.query, sortKeys);
      const docs = await this.Model.readAll(page, sort, populatePath);
      res.status(200).json({ status: "success", data: { data: docs } });
    };
  }

  updateDoc(allowedFields: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const doc = bodyHandler<U>(req.body, allowedFields);

      const { id } = req.params;
      if (!id) {
        return next(new ExpressError(400, "Invalid Id"));
      }
      const updatedDoc = await this.Model.updateOne(id, doc as Partial<U>);
      res.status(200).json({ status: "success", data: { data: updatedDoc } });
    };
  }

  deleteDoc() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      if (!id) {
        return next(new ExpressError(400, "Invalid Id"));
      }
      await this.Model.deleteOne(id);
      res.status(204).json({ status: "success", data: {} });
    };
  }
}

import { NextFunction, Request, Response } from "express";

import CRUD from "../models/crud.js";
import { ExpressError } from "../utils/customError.js";
import type { CascadeHook } from "../models/model.js";

import {
  paginateHandler,
  sortHandler,
  bodyHandler,
} from "../utils/queryHandler.js";

import type {
  AsyncValidatorHook,
  FilterBuilderHook,
  PopulateBuilderHook,
  PreProcessorHook,
  ValidatorHook,
} from "./controller.js";

export default class ControllerApiFactory<T, U> {
  constructor(private Model: CRUD<U>) {}

  createDoc(
    requiredFields: string[],
    validator: ValidatorHook<T>,
    preProcessor: PreProcessorHook<T, U>,
    returnDoc?: boolean
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
      const processedData = preProcessor(req.body);

      const newDoc = await this.Model.createOne(processedData);
      if (returnDoc) {
        return newDoc;
      }
      res.status(201).json({ status: "success", data: { data: newDoc } });
    };
  }

  getDoc(populateBuilder?: PopulateBuilderHook) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      if (!id) {
        return next(new ExpressError(400, "Invalid Id"));
      }
      const populate = populateBuilder?.(req.query);
      const doc = await this.Model.readOne(id, populate);
      res.status(200).json({ status: "success", data: { data: doc } });
    };
  }

  getAllDocs(
    filterBuilder: FilterBuilderHook<U>,
    sortKeys: string[],
    populateBuilder?: PopulateBuilderHook
  ) {
    return async (
      req: Request,
      res: Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      next: NextFunction
    ) => {
      const filter = filterBuilder(req.query);
      const page = paginateHandler(req.query);
      const sort = sortHandler<U>(req.query, sortKeys);
      const populate = populateBuilder?.(req.query);
      const docs = await this.Model.readAll(filter, page, sort, populate);
      res
        .status(200)
        .json({ status: "success", data: { items: docs.length, data: docs } });
    };
  }

  updateDoc(
    allowedFields: string[],
    validator: ValidatorHook<T> | AsyncValidatorHook<T>,
    preProcessor: PreProcessorHook<T, Partial<U>>
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const doc = bodyHandler<T>(req.body, allowedFields);

      const validity =  await validator(doc as T);
      if (!validity.isValid) {
        return next(
          new ExpressError(400, validity.error || "Validation Failed")
        );
      }

      const processedData: Partial<U> = preProcessor(doc as T);

      const { id } = req.params;
      if (!id) {
        return next(new ExpressError(400, "Invalid Id"));
      }
      const updatedDoc = await this.Model.updateOne(id, processedData);
      res.status(200).json({ status: "success", data: { data: updatedDoc } });
    };
  }

  deleteDoc(cascader?: CascadeHook) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      if (!id) {
        return next(new ExpressError(400, "Invalid Id"));
      }
      if (cascader) await cascader(id);
      await this.Model.deleteOne(id);
      res.status(204).json({ status: "success", data: {} });
    };
  }

  addRefDoc<A>(prop: string, refDocValidator: AsyncValidatorHook<A>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      if (!id) {
        return next(new ExpressError(400, "Invalid Id"));
      }
      const refDocs = req.body[prop];
      if (!refDocs?.length) {
        return next(new ExpressError(400, `${prop} Required`));
      }
      const validity = await refDocValidator(refDocs);
      if (!validity.isValid) {
        return next(new ExpressError(400, validity.error));
      }
      const doc = await this.Model.addRefDoc(id, prop, refDocs);
      res.status(200).json({ status: "success", data: { data: doc } });
    };
  }

  removeRefDoc(prop: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      if (!id) {
        return next(new ExpressError(400, "Invalid Id"));
      }
      const refDocs = req.body[prop];
      if (!refDocs?.length) {
        return next(new ExpressError(400, `${prop} Required`));
      }
      const doc = await this.Model.removeRefDoc(id, prop, refDocs);
      res.status(200).json({ status: "success", data: { data: doc } });
    };
  }
}

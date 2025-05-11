import {
  type HydratedDocument,
  type Model,
  type UpdateQuery,
  RootFilterQuery,
  Types,
} from "mongoose";

import type { Pagination, Populate, Sort } from "./model.js";
import { ExpressError } from "../utils/customError.js";

export default class CRUD<T> {
  constructor(private model: Model<T>) {}

  async createOne(doc: T): Promise<HydratedDocument<T>> {
    const newdoc: HydratedDocument<T> = new this.model(doc);
    await newdoc.save();
    return newdoc;
  }

  async readOne(id: string, populate?: Populate): Promise<HydratedDocument<T>> {
    const query = this.model.findById(id);
    if (populate?.length) query.populate(populate);
    const doc = await query.exec();
    if (!doc) {
      throw new ExpressError(404, "ReadError:Entity Not Found - " + id);
    }
    return doc;
  }

  async readFilteredOne(
    filter: RootFilterQuery<T>,
    populate?: Populate
  ): Promise<HydratedDocument<T>> {
    const query = this.model.findOne(filter);
    if (populate?.length) query.populate(populate);
    const doc = await query.exec();
    if (!doc) {
      throw new ExpressError(404, "ReadError:Entity Not Found");
    }
    return doc;
  }

  async readAll(
    filter: RootFilterQuery<T> = {},
    page?: Pagination,
    sort?: Sort<T>,
    populate?: Populate
  ): Promise<HydratedDocument<T>[]> {
    if (!page) {
      page = { page: 0, limit: 10, skip: 0 };
    }
    const query = this.model.find(filter);
    query.skip(page.skip);
    query.limit(page.limit);
    query.sort(sort);
    if (populate?.length) query.populate(populate);
    const docs = await query.exec();

    if (!docs.length) {
      throw new ExpressError(404, "ReadAllError:Entities Do Not Exist ");
    }
    return docs;
  }

  async updateOne(id: string, doc: Partial<T>): Promise<HydratedDocument<T>> {
    const updatedDoc = await this.model.findByIdAndUpdate(
      id,
      { $set: doc },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedDoc) {
      throw new ExpressError(404, "UpdateError:Entity Not Found - " + id);
    }
    return updatedDoc;
  }

  async deleteOne(id: string): Promise<HydratedDocument<T>> {
    const deletedDoc = await this.model.findByIdAndDelete(id);
    if (!deletedDoc) {
      throw new ExpressError(404, "DeletionError:Entity Not Found - " + id);
    }
    return deletedDoc;
  }

  async addRefDoc(
    id: string,
    prop: string,
    refDocs: string[]
  ): Promise<HydratedDocument<T>> {
    const newRefDocs = refDocs
      .map((val) => new Types.ObjectId(val))
      .filter((ref) => Types.ObjectId.isValid(ref));

    const update = {
      $addToSet: { [prop]: { $each: newRefDocs } },
    };

    const doc = await this.model.findByIdAndUpdate(
      id,
      update as UpdateQuery<T>,
      { runValidators: true, new: true }
    );

    if (!doc) {
      throw new ExpressError(
        404,
        "UpdateError:new Entities Not Added to " + (prop as string)
      );
    }
    return doc;
  }

  async removeRefDoc(
    id: string,
    prop: string,
    refDocs: string[]
  ): Promise<HydratedDocument<T>> {
    const newRefDocs = refDocs
      .map((val) => new Types.ObjectId(val))
      .filter((ref) => Types.ObjectId.isValid(ref));

    const update = {
      $pull: { [prop]: { $each: newRefDocs } },
    };

    const doc = await this.model.findByIdAndUpdate(
      id,
      update as UpdateQuery<T>,
      { runValidators: true, new: true }
    );

    if (!doc) {
      throw new ExpressError(
        404,
        "UpdateError:new Entities Not Removed from " + this.model.name
      );
    }
    return doc;
  }
}

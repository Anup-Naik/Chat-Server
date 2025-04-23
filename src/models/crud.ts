import { HydratedDocument, Model, Types, UpdateQuery } from "mongoose";
import { ExpressError } from "../utils/customError.js";
import { Pagination, Sort } from "./model.js";

export default class CRUD<T> {
  constructor(private model: Model<T>) {}

  async createOne(doc: T): Promise<HydratedDocument<T>> {
    const newdoc: HydratedDocument<T> = new this.model(doc);
    await newdoc.save();
    return newdoc;
  }

  async readOne(id: string): Promise<HydratedDocument<T>> {
    const doc = await this.model.findById(id);
    if (!doc) {
      throw new ExpressError(404, "ReadError:Entity Not Found - " + id);
    }
    return doc;
  }

  //IIIII filtering IIIIII
  async readAll(
    page: Pagination = { page: 0, limit:10, skip: 0 },
    sort: Sort<T>
  ): Promise<HydratedDocument<T>[]> {
    const docs = await this.model
      .find({})
      .skip(page.skip)
      .limit(page.limit)
      .sort(sort);
    if (!docs.length) {
      throw new ExpressError(
        404,
        "ReadAllError:Entities Do Not Exist - " + this.model.name
      );
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
    prop: keyof T,
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
        "UpdateError:new Entities Not Added to " + this.model.name
      );
    }
    return doc;
  }

  async removeRefDoc(
    id: string,
    prop: keyof T,
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

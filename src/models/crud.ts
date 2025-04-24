import { HydratedDocument, Model, Types, UpdateQuery } from "mongoose";
import { ExpressError } from "../utils/customError.js";
import { Pagination, Sort } from "./model.js";

export default class CRUD<T> {
  constructor(private model: Model<T>) {}

  async createOne(doc: T): Promise<HydratedDocument<T>> {
    const newdoc: HydratedDocument<T> = new this.model(doc);
    await newdoc.save({});
    return newdoc;
  }

  async readOne(
    id: string,
    pathPopulate: string = ""
  ): Promise<HydratedDocument<T>> {
    const query = this.model.findById(id);
    if (pathPopulate) query.populate({ path: pathPopulate });
    const doc = await query.exec();
    if (!doc) {
      throw new ExpressError(404, "ReadError:Entity Not Found - " + id);
    }
    return doc;
  }

  //IIIII FILTERING,POPULATE-PROJECTION IIIIII
  async readAll(
    page: Pagination = { page: 0, limit: 10, skip: 0 },
    sort: Sort<T>,
    pathPopulate: string = ""
  ): Promise<HydratedDocument<T>[]> {
    const query = this.model.find({});
    query.skip(page.skip);
    query.limit(page.limit);
    query.sort(sort);
    if (pathPopulate) query.populate({ path: pathPopulate });
    const docs = await query.exec();

    if (!docs.length) {
      throw new ExpressError(
        404,
        "ReadAllError:Entities Do Not Exist " 
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
        "UpdateError:new Entities Not Added to " + (prop as string)
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

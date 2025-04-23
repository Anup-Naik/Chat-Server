import { HydratedDocument, Model, Types } from "mongoose";
import { ExpressError } from "../utils/customError.js";

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
   
  //IIIIIpagination, filtering, or sortingIIIIII
  async readAll(filter,page,sort): Promise<HydratedDocument<T>[]> {
    const docs = await this.model.find({});
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
    prop: string,
    refDocs: string[]
  ): Promise<HydratedDocument<T>> {
    const newRefDocs = refDocs
      .map((val) => new Types.ObjectId(val))
      .filter((ref) => Types.ObjectId.isValid(ref));
    const doc = await this.model.findByIdAndUpdate(
      id,
      {
        $push: { [prop]: { $each: newRefDocs } },
      },
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
}

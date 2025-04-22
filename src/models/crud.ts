import { HydratedDocument, Model, Types } from "mongoose";

export default class CRUD<T> {
  constructor(private model: Model<T>) {}

  async createOne(doc: T): Promise<HydratedDocument<T>> {
    const newdoc: HydratedDocument<T> = new this.model(doc);
    await newdoc.save();
    return newdoc;
  }

  async readOne(id: Types.ObjectId): Promise<HydratedDocument<T> | null> {
    return await this.model.findOne({ _id: id });
  }

  async readAll(): Promise<HydratedDocument<T>[]> {
    return await this.model.find({});
  }

  async updateOne(
    id: Types.ObjectId,
    doc: Partial<T>
  ): Promise<HydratedDocument<T>> {
    const updatedDoc = await this.model.findByIdAndUpdate(id, doc, {
      new: true,
      runValidators:true,
    });
    if (!updatedDoc) {
      throw new Error("Document Not Found");
    }
    return updatedDoc;
  }

  async deleteOne(id: Types.ObjectId): Promise<HydratedDocument<T> | null> {
    return await this.model.findByIdAndDelete(id);
  }
}

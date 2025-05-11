import { MongooseError } from "mongoose";

export class ExpressError extends Error {
  constructor(
    public statusCode: number = 500,
    public message: string = "Something went wrong"
  ) {
    super(message);
  }
}

export function customError(err: unknown) {
  const errMessage = err instanceof Error ? err.message : "";
  console.error(errMessage);
  if (err instanceof ExpressError) {
    return err;
  } else if (errMessage.includes("SyntaxError")) {
    return new ExpressError(400, "Invalid Req");
  } else if (errMessage.includes("BSONError")) {
    return new ExpressError(400, "Invalid Id");
  } else if (errMessage.includes("E11000")) {
    return new ExpressError(400, "Name or Email Already Exists");
  } else if (errMessage.includes("Enter a valid email")) {
    return new ExpressError(400, "Enter a valid email");
  } else if (errMessage.includes("username")) {
    return new ExpressError(400, "Enter Valid Username of length 5 to 10");
  } else if (errMessage.includes("Validation failed: name")) {
    return new ExpressError(400, "Enter Valid Name of length 5 to 10");
  } else if (err instanceof MongooseError && err.message) {
    console.error(err.message);
    return new ExpressError(400, "Database Error");
  } else {
    console.error(err);
    return new ExpressError();
  }
}

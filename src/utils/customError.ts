export class ExpressError extends Error {
  constructor(
    public statusCode: number = 500,
    public message: string = "Something went wrong"
  ) {
    super(message);
  }
}

export function customError(err: unknown) {
  const errMessage = err.toString();
  // console.log(errMessage); 
  if (errMessage.includes("BSONError")) {
    return new ExpressError(400, "Invalid Id");
  } else if (errMessage.includes("E11000", "duplicate key")) {
    return new ExpressError(400, "Username or Email Already Exists");
  } else if (errMessage.includes("ValidationError", "Enter a valid email")) {
    return new ExpressError(400, "Enter a valid email");
  } else {
    return new ExpressError();
  }
}

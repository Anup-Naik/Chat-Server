import { Socket } from "socket.io";

type Handler<T> = (data: T) => void | Promise<void>;

export const errorHandler = <T>(
  handler: Handler<T>,
  socket: Socket,
  defaultMessage: string
) => {
  const handleError = (err: Error) => {
    console.error("SocketError:", err);
    const message = err.message || defaultMessage || "Something went wrong";
    socket.emit("error", { message });
  };

  return (...args: [T]) => {
    try {
      const ret = handler.apply(this, args);
      if (ret && typeof ret.catch === "function") {
        // async handler
        ret.catch(handleError);
      }
    } catch (e) {
      // sync handler
      handleError(e as Error);
    }
  };
};

import type { Query } from "express-serve-static-core";

export const paginateHandler = (query: Query) => {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  const skip = (page - 1) * limit;
  const pagination = { skip, page, limit };
  return pagination;
};

export const sortHandler = <T>(
  query: Query,
  allowedKeys: string[]
): { [key in keyof Partial<T>]: 1 | -1 } => {
  if (!query.sort)
    return { [allowedKeys[0] as string]: 1 } as {
      [key in keyof Partial<T>]: 1 | -1;
    };
  const filteredSort = Object.entries(query.sort)
    .filter(([key, val]) => {
      return allowedKeys.includes(key) && [1, -1].includes(Number(val));
    })
    .map(([k, v]) => [k, Number(v)]);

  return Object.fromEntries(filteredSort);
};

export const bodyHandler = <T>(body: Partial<T>, allowedKeys: string[]) => {
  return Object.fromEntries(
    Object.entries(body).filter(([key, value]) => {
      return allowedKeys.includes(key) && value;
    })
  );
};

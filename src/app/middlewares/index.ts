import { ErrorHandler } from "./errorhandler";

type Middleware = typeof ErrorHandler;

const middlewares = <Middleware[]>[ErrorHandler];

export { middlewares };

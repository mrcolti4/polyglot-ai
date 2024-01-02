import User from "./User";
import Polyglot from "./Polyglot";

type Controller = typeof User;

const controllers = <Controller[]>[User, Polyglot];

export { controllers };

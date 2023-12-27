import User from "./User";

type Controller = typeof User;

const controllers = <Controller[]>[User];

export { controllers };

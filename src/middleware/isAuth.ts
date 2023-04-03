import { MyContext } from "src/context";

export const isAuth = ( {req}: MyContext) => {
  if (!req.session.userId) {
    throw new Error("Not Authenticated!");
  }
};
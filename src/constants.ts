import process from "process";

export const COOKIE_NAME = "qid";
export const __prod__ = process.env.NODE_ENV === "production";
export const FORGET_PASSWORD_PREFIX = "forget-password:";
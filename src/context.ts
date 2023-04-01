import { Prisma, PrismaClient } from "@prisma/client"
import { Request , Response } from "express"
import { Session, SessionData } from "express-session";
import { Redis } from "ioredis";

export type MyContext = {
    req: Request & { session: Session & Partial<SessionData> };
    res : Response;
    redis : Redis;
    prisma : PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>;
}; 
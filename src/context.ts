import { Prisma, PrismaClient } from "@prisma/client"
import { Request , Response 
} from "express"

export type MyContext = {
    req : Request,
    res : Response
    prisma : PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>
};
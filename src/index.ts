import { PrismaClient } from '@prisma/client'
import { ApolloServer } from "apollo-server-express";
import { HelloResolver } from "./resolvers/Hello"
import { PostResolver } from "./resolvers/post";
import { typeDefs } from "./schema";
import { MyContext } from "./context";
import { UserResolver } from "./resolvers/UserResolver";
import RedisStore from "connect-redis"
import session from "express-session"
import {createClient} from "redis"
import express from 'express';

const prisma = new PrismaClient();


async function main() {

    const app = express();

    const redisClient = createClient()
    redisClient.connect().catch(console.error)
    const redisStore = new RedisStore({
        client: redisClient,
        disableTouch : true, 
        prefix: "myapp:",
    })

    //cookie testing on apollo studio
    // app.set('trust proxy', process.env.NODE_ENV !== 'production')


    //redis session middleware
    app.use(
        session({
            name : 'qid',
            store: redisStore,
            cookie : {
                maxAge : 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly : true,
                sameSite : 'lax',
                secure : false, // Cookie only works in https (set to true when in prod) 
            },
            resave: false, // required: force lightweight session keep alive (touch)
            saveUninitialized: false, // recommended: only save session when data exists
            secret: "keyboard cat",
        })
    )

    const apolloServer = new ApolloServer<MyContext>({
        resolvers : [HelloResolver , PostResolver , UserResolver],
        typeDefs, 
        context : ({req , res}) => ({prisma : prisma , req , res})
    });
    await apolloServer.start();
    
    //_______________apollo middleware______________
    // const corsOptions = {
    //     origin : 'https://studio.apollographql.com',
    //     credentials : true
    // }
    apolloServer.applyMiddleware({ app  });
 
    app.listen(4000 , ()=>{
        console.log("server started on http://localhost:4000/")
    });
    // const { url } = await startStandaloneServer(apolloServer, {
    //     context :async () => ({
    //         prisma : prisma
    //     }),
    //     listen : {port : 4000},
    //   });
   
    
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error:Error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    })
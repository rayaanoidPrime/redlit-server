import { PrismaClient } from "@prisma/client";
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { HelloResolver } from "./resolvers/Hello"
import { PostResolver } from "./resolvers/post";
import { typeDefs } from "./schema";
import { MyContext } from "./context";


const prisma = new PrismaClient();


async function main() {
    
    const apolloServer = new ApolloServer<MyContext>({
        resolvers : [HelloResolver , PostResolver],
        typeDefs, 
    });

    const { url } = await startStandaloneServer(apolloServer, {
        context :async () => ({
            prisma : prisma
        }),
        listen : {port : 4000},
      });
   
    console.log(`🚀  Server ready at: ${url}`);
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
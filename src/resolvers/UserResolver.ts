import { MyContext } from "src/context";
import argon2 from "argon2";

type UsernamePasswordInput ={
    username : string,
    password : string
}

export const UserResolver = {
    Query : {
        allusers : (_parent: any, _args: any, {prisma}: MyContext)=>{
            return prisma.user.findMany();
        },
        user : (_parent : any , args : { id : number} , {prisma} : MyContext)=>{
            return prisma.user.findUnique({
                where : {
                    id : args.id || undefined
                }
            })
        }
    },
    Mutation : {
        register : async(_parent : any , args : UsernamePasswordInput , {prisma} : MyContext)=>{
            const hashedPassword = await argon2.hash(args.password);
            const user = await prisma.user.create({
                data : {
                    username : args.username,
                    password : hashedPassword
                }
            })

            return user;
        }
    }
}
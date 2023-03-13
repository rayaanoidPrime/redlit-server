import { MyContext } from "src/context";
import argon2 from "argon2";
import { User } from "@prisma/client";
import { ISession } from "src/session";

type UsernamePasswordInput ={
    username : string,
    password : string
}

type FieldError = {
    field : string,
    message : string
}

type UserResponse = {
    errors? : FieldError[],
    user? : User
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
        register : async(_parent : any , args : UsernamePasswordInput , {prisma} : MyContext): Promise<UserResponse>=>{
            
            if(args.username.length <= 2){
                return {
                    errors : [
                        {
                            field : "Username",
                            message : "Length of username must be greater than 2"
                        },
                    ]
                }
            }

            if(args.password.length <= 3 ){
                return {
                    errors : [
                        {
                            field : "Password",
                            message : "Pasword length must be greater than 3"
                        },
                    ]
                }
            }
            
            const exists = await prisma.user.findFirst({
                where : {
                    username : args.username
                }
            })

            if(exists){
                return {
                    errors : [
                        {
                            field : "Username",
                            message : "Username already exists"
                        }
                    ]
                }
            }

            const hashedPassword = await argon2.hash(args.password);
            const user = await prisma.user.create({
                data : {
                    username : args.username,
                    password : hashedPassword
                }
            })

            return {
                user : user
            };
        },
        login : async(_parent : any , args : UsernamePasswordInput , {prisma , req} : MyContext) : Promise<UserResponse>=>{
            
            const user = await prisma.user.findUnique({
                where:{
                    username : args.username
                }
            })

            if(!user){
                return {
                    errors : [
                        {
                        field : 'Username',
                        message : 'User does not exist'
                        },
                    ],
                };
            }

            const valid = await argon2.verify(user.password , args.password);
            if(!valid){
                return {
                    errors : [
                        {
                        field : 'Password',
                        message : 'Password incorrect'
                        },
                    ],
                };
            }
            (req.session as ISession).userId = user.id;

            return {
                user : user,
            };
        }
    }
}
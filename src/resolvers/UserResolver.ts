import { MyContext } from "src/context";
import argon2 from "argon2";
import { User } from "@prisma/client";
import { COOKIE_NAME } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from '../../utils/validatRegister';

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
        },
        me : async(_parent: any, _args: any, {prisma , req}: MyContext)=>{

            //check for not logged in
            if(!req.session.userId ){
                return null
            }

            const user  = await prisma.user.findUnique({
                where : {
                    id : req.session.userId
                }
            })

            return user;

        }
    },
    Mutation : {
        // forgotPassoword : async(_parent : any , email : string , {prisma , req} : MyContext): Promise<UserResponse> => {
        //     const user = await prisma.user.findUnique({
        //         where : {
        //             em
        //         }
        //     })
        // },

        register : async(_parent : any , args : UsernamePasswordInput , {prisma , req} : MyContext): Promise<UserResponse>=>{
            
            const errors = validateRegister(args);
            if (errors){
                return {errors};
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
                            field : "username",
                            message : "Username already exists"
                        }
                    ]
                }
            }

            const hashedPassword = await argon2.hash(args.password);
            const user = await prisma.user.create({
                data : {
                    email : args.email,
                    username : args.username,
                    password : hashedPassword,
                    createdAt : new Date(),
                    updatedAt : new Date()
                }
            });

            req.session.userId  = user.id;
            
            return {
                user : user
            };
        },
        login : async(_parent : any , usernameOrEmail : string , password : string  , {prisma , req} : MyContext) : Promise<UserResponse>=>{
            
            const user = usernameOrEmail.includes('@') ? 
                await prisma.user.findUnique({
                    where : {
                        email : usernameOrEmail,
                    }
                }) : await prisma.user.findUnique({
                    where : {
                        username : usernameOrEmail,
                    }
                });

            if(!user){
                return {
                    errors : [
                        {
                        field : 'username',
                        message : 'User does not exist'
                        },
                    ],
                };
            }

            const valid = await argon2.verify(user.password , password);
            if(!valid){
                return {
                    errors : [
                        {
                        field : 'password',
                        message : 'Password incorrect'
                        },
                    ],
                };
            }
            req.session.userId = user.id;

            return {
                user : user,
            };
        },
 
        logout : async(_parent : any , _args : any ,{req , res} : MyContext) => {
            return new Promise((resolve ) => {
                req.session.destroy((error)=>{
                    res.clearCookie(COOKIE_NAME);
                    if(error){ 
                        console.log(error);
                        resolve(false);
                        return;
                    }
                    resolve(true);
                })

                
            })
            
        }
    }
}
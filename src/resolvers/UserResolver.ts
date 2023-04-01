import { MyContext } from "src/context";
import argon2 from "argon2";
import { User } from "@prisma/client";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from '../../utils/validatRegister';
import { LoginInput } from "./LoginInput";
import {sendEmail} from "../../utils/sendEmail"
import {v4} from "uuid";

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

        changePassword : async (_parent : any , args : {token : string , newPassword : string} , {redis , prisma , req} : MyContext) : Promise<UserResponse> => {

            
            if(args.newPassword.length <= 3 ){
                return {
                    errors: [
                        {
                            field : "newPassword",
                            message : "Password length must be greater than 3"
                        },
                    ]
                }
            }
            const userId = await redis.get(FORGET_PASSWORD_PREFIX + args.token)
            console.log('user : ' , args.token)
            if(!userId){
                return {
                    errors : [
                        {
                            field : 'token',
                            message : 'token expired'
                        }
                    ]
                }
            }

            const user = await prisma.user.findUnique({
                where : {
                    id : parseInt(userId)
                }
            })

            if(!user) {
                return {
                    errors : [
                        {
                            field : 'token',
                            message : 'User no longer exists'
                        }
                    ]
                }
            }
            
            const updatedUser = await prisma.user.update({
                where : {
                    id : parseInt(userId)
                },
                data : {
                    password : await argon2.hash(args.newPassword)
                }
            })

            await redis.del(FORGET_PASSWORD_PREFIX + args.token);
            
            req.session.userId = updatedUser.id;

            return {
                user : updatedUser
            }

        },       

        forgotPassword : async(_parent : any , args : {email : string} , {prisma , redis} : MyContext): Promise<boolean>=> {
            const user = await prisma.user.findUnique({
                where : {
                    email : args.email
                }
            });
            if (!user){
                //the email is not in the database
                return true;
            }

            const token = v4();
            await  redis.set(FORGET_PASSWORD_PREFIX + token ,user.id , "EX" , 1000*60*60*24*3);


            await sendEmail(
                args.email , 
                `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`
            );

            return true;
        },

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
        login : async(_parent : any , args : LoginInput , {prisma , req} : MyContext) : Promise<UserResponse>=>{
            
            const user = (args.usernameOrEmail.includes('@')) ? 
                await prisma.user.findUnique({
                    where : {
                        email : args.usernameOrEmail,
                    }
                }) : await prisma.user.findUnique({
                    where : {
                        username : args.usernameOrEmail,
                    }
                });

            if(!user){
                return {
                    errors : [
                        {
                        field : 'usernameOrEmail',
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
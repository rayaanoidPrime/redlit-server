import { MyContext } from "src/context";
import argon2 from "argon2";
import { User } from "@prisma/client";


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
        },
        me : async(_parent: any, _args: any, {prisma , req}: MyContext)=>{
            console.log(req.session)
            //check for not logged in
            if(!req.session.userId ){
                return null
            }

            const uid = req.session.userId ;
            const user  = await prisma.user.findUnique({
                where : {
                    id : uid
                }
            })

            return user;

        }
    },
    Mutation : {
        register : async(_parent : any , args : UsernamePasswordInput , {prisma , req} : MyContext): Promise<UserResponse>=>{
            
            if(args.username.length <= 2){
                return {
                    errors : [
                        {
                            field : "username",
                            message : "Length of username must be greater than 2"
                        },
                    ]
                }
            }

            if(args.password.length <= 3 ){
                return {
                    errors : [
                        {
                            field : "password",
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
                            field : "username",
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
            });

            req.session.userId  = user.id;
            
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
                        field : 'username',
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
        }
    }
}
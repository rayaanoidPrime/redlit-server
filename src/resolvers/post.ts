
import { Post } from "@prisma/client";
import { isAuth } from "../middleware/isAuth";
// import { isAuth } from "src/middleware/isAuth";
import { MyContext } from "../context";

type PostInput = {
    title : string,
    text : string
}

export const PostResolver = {
    Query : {
        allposts : (_parent: any, _args: any, {prisma}: MyContext)=>{
            return prisma.post.findMany();
        },
        post : (_parent : any , args : { id : number} , {prisma} : MyContext)=>{
            return prisma.post.findUnique({
                where : {
                    id : args.id || undefined
                }
            })
        }
    },
    Mutation : {
        createPost : async(_parent : any , args : PostInput, context : MyContext ) : Promise<Post> => {

            isAuth( context );
            const post = await context.prisma.post.create({ 
                data : { 
                    title : args.title,
                    text : args.text,
                    authorId : context.req.session.userId as any   
                    //// TODO : MIDDLEWARE in APOLLO ??
                } , 
            });
            return post;
        },
        updatePost : async(_parent : any , args : { id : number , title : string} , {prisma} : MyContext) => {
            // const post = await prisma.post.findUnique({
            //     where:{
            //         id : args.id || undefined
            //     }
            // })

            // if(!post){
            //     return null;
            // }

            try {
                const post = await prisma.post.update({
                    where : {
                        id : args.id || undefined
                    },
                    data : {
                        title : args.title
                    }
                })
                return post;
            } catch (error) {
                console.log(error.code)
                return null;
            }

            // return prisma.post.update({
            //     where : {
            //         id : args.id || undefined
            //     },
            //     data : {
            //         title : args.title
            //     }
            // })          
        },
        deletePost : async(_parent : any , args : { id : number } , {prisma} : MyContext) : Promise<Boolean> =>{
            try {
                const post_ = await prisma.post.delete({
                    where: { 
                        id: args.id 
                    },
                  })
                console.log(post_)
                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        }
    }
}
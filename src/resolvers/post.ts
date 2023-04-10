
import { Post } from "@prisma/client";
import { isAuth } from "../middleware/isAuth";
// import { isAuth } from "src/middleware/isAuth";
import { MyContext } from "../context";

type PostInput = {
    title : string,
    text : string
}

type PaginatedPosts = {
    posts : Post[],
    hasMore : boolean
}

export const PostResolver = {
    Query : {
        allposts : async(_parent: any, args: {limit : number , cursor : string | null}, {prisma}: MyContext) : Promise<PaginatedPosts>=>{

            const realLimit = Math.min(50, args.limit);
            const realLimitPlusOne = realLimit + 1; 
            const latest = await prisma.post.findFirst({
                orderBy : {
                    createdAt : 'desc'
                }
            });
            // console.log(latest);
            const posts = await prisma.post.findMany({
                skip : !args.cursor ? 0 : 1 , 
                take : realLimitPlusOne,
                cursor : {
                   createdAt : !args.cursor ? latest?.createdAt : args.cursor
                },
                where : {
                    createdAt : {
                        lte : !args.cursor ? latest?.createdAt : args.cursor
                    }
                },
                orderBy : {
                    createdAt : 'desc'
                },

            });

            return {
                posts : posts.slice(0,realLimit),
                hasMore : posts.length === realLimitPlusOne
            }
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
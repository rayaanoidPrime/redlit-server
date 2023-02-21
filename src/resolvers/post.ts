
import { MyContext } from "../context";

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
        createPost : async(_parent : any , args : { title : string} , {prisma} : MyContext) => {
            const post = await prisma.post.create({ data : { title : args.title } });
            return post;
        },
        updatePost : async(_parent : any , args : { id : number , title : string} , {prisma} : MyContext) => {
            const post = prisma.post.findUnique({
                where:{
                    id : args.id
                }
            })

            if(!post){
                return null;
            }

            return prisma.post.update({
                where : {
                    id : args.id 
                },
                data : {
                    title : args.title
                }
            })
        }
    }
}
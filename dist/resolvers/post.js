"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
exports.PostResolver = {
    Query: {
        allposts: (_parent, _args, { prisma }) => {
            return prisma.post.findMany();
        },
        post: (_parent, args, { prisma }) => {
            return prisma.post.findUnique({
                where: {
                    id: args.id || undefined
                }
            });
        }
    },
    Mutation: {
        createPost: (_parent, args, { prisma }) => __awaiter(void 0, void 0, void 0, function* () {
            const post = yield prisma.post.create({ data: { title: args.title } });
            return post;
        }),
        updatePost: (_parent, args, { prisma }) => __awaiter(void 0, void 0, void 0, function* () {
            const post = prisma.post.findUnique({
                where: {
                    id: args.id
                }
            });
            if (!post) {
                return null;
            }
            return prisma.post.update({
                where: {
                    id: args.id
                },
                data: {
                    title: args.title
                }
            });
        })
    }
};
//# sourceMappingURL=post.js.map
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
const client_1 = require("@prisma/client");
const server_1 = require("@apollo/server");
const standalone_1 = require("@apollo/server/standalone");
const Hello_1 = require("./resolvers/Hello");
const post_1 = require("./resolvers/post");
const schema_1 = require("./schema");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const apolloServer = new server_1.ApolloServer({
            resolvers: [Hello_1.HelloResolver, post_1.PostResolver],
            typeDefs: schema_1.typeDefs,
        });
        const { url } = yield (0, standalone_1.startStandaloneServer)(apolloServer, {
            context: () => __awaiter(this, void 0, void 0, function* () {
                return ({
                    prisma: prisma
                });
            }),
            listen: { port: 4000 },
        });
        console.log(`🚀  Server ready at: ${url}`);
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}))
    .catch((error) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(error);
    yield prisma.$disconnect();
    process.exit(1);
}));
//# sourceMappingURL=index.js.map
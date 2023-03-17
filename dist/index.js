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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const apollo_server_express_1 = require("apollo-server-express");
const Hello_1 = require("./resolvers/Hello");
const post_1 = require("./resolvers/post");
const schema_1 = require("./schema");
const UserResolver_1 = require("./resolvers/UserResolver");
const connect_redis_1 = __importDefault(require("connect-redis"));
const express_session_1 = __importDefault(require("express-session"));
const redis_1 = require("redis");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        const redisClient = (0, redis_1.createClient)();
        redisClient.connect().catch(console.error);
        const redisStore = new connect_redis_1.default({
            client: redisClient,
            disableTouch: true,
            prefix: "myapp:",
        });
        app.use((0, cors_1.default)({
            origin: 'http://localhost:3000',
            credentials: true
        }));
        app.use((0, express_session_1.default)({
            name: 'qid',
            store: redisStore,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
            },
            resave: false,
            saveUninitialized: false,
            secret: "keyboard cat",
        }));
        const apolloServer = new apollo_server_express_1.ApolloServer({
            resolvers: [Hello_1.HelloResolver, post_1.PostResolver, UserResolver_1.UserResolver],
            typeDefs: schema_1.typeDefs,
            context: ({ req, res }) => ({ prisma: prisma, req, res })
        });
        yield apolloServer.start();
        apolloServer.applyMiddleware({ app, cors: false });
        app.listen(4000, () => {
            console.log("server started on http://localhost:4000/");
        });
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
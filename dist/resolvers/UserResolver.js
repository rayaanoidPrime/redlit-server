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
exports.UserResolver = void 0;
const argon2_1 = __importDefault(require("argon2"));
exports.UserResolver = {
    Query: {
        allusers: (_parent, _args, { prisma }) => {
            return prisma.user.findMany();
        },
        user: (_parent, args, { prisma }) => {
            return prisma.user.findUnique({
                where: {
                    id: args.id || undefined
                }
            });
        },
        me: (_parent, _args, { prisma, req }) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(req.session);
            if (!req.session.userId) {
                return null;
            }
            const uid = req.session.userId;
            const user = yield prisma.user.findUnique({
                where: {
                    id: uid
                }
            });
            return user;
        })
    },
    Mutation: {
        register: (_parent, args, { prisma, req }) => __awaiter(void 0, void 0, void 0, function* () {
            if (args.username.length <= 2) {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "Length of username must be greater than 2"
                        },
                    ]
                };
            }
            if (args.password.length <= 3) {
                return {
                    errors: [
                        {
                            field: "password",
                            message: "Pasword length must be greater than 3"
                        },
                    ]
                };
            }
            const exists = yield prisma.user.findFirst({
                where: {
                    username: args.username
                }
            });
            if (exists) {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "Username already exists"
                        }
                    ]
                };
            }
            const hashedPassword = yield argon2_1.default.hash(args.password);
            const user = yield prisma.user.create({
                data: {
                    username: args.username,
                    password: hashedPassword
                }
            });
            req.session.userId = user.id;
            return {
                user: user
            };
        }),
        login: (_parent, args, { prisma, req }) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({
                where: {
                    username: args.username
                }
            });
            if (!user) {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'User does not exist'
                        },
                    ],
                };
            }
            const valid = yield argon2_1.default.verify(user.password, args.password);
            if (!valid) {
                return {
                    errors: [
                        {
                            field: 'password',
                            message: 'Password incorrect'
                        },
                    ],
                };
            }
            req.session.userId = user.id;
            return {
                user: user,
            };
        })
    }
};
//# sourceMappingURL=UserResolver.js.map
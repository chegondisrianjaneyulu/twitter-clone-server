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
exports.reslovers = void 0;
const db_1 = require("../../clients/db");
const user_1 = __importDefault(require("../../services/user"));
const tweet_1 = __importDefault(require("../../services/tweet"));
const queries = {
    verifyGoogleToken: (parent_1, _a) => __awaiter(void 0, [parent_1, _a], void 0, function* (parent, { token }) {
        const resultToken = yield user_1.default.verifyGoogleToken(token);
        return resultToken;
    }),
    getCurrentUser: (parent, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const id = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!id)
            return null;
        const user = user_1.default.getUserById(id);
        return user;
    }),
    getUserById: (parent_1, _a, ctx_1) => __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function* (parent, { id }, ctx) {
        const user = user_1.default.getUserById(id);
        return user;
    })
};
const mutations = {
    followUser: (parent_1, _a, ctx_1) => __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function* (parent, { to }, ctx) {
        if (!ctx.user || !ctx.user.id)
            throw new Error('Unauthencated');
        yield user_1.default.followUser(ctx.user.id, to);
        return true;
    }),
    unFollowUser: (parent_1, _a, ctx_1) => __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function* (parent, { to }, ctx) {
        if (!ctx.user || !ctx.user.id)
            throw new Error('Unauthencated');
        yield user_1.default.unFollowUser(ctx.user.id, to);
        return true;
    })
};
const extraReslovers = {
    User: {
        tweets: (parent) => (
        // prismaClient.tweet.findMany({where: {author: {id: parent.id}}})
        tweet_1.default.getTweetsByUserId(parent.id)),
        follower: (parent) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield db_1.prismaClient.follows.findMany({ where: { following: { id: parent.id } }, include: { follower: true } });
            return result.map((el) => el.follower);
        }),
        following: (parent) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield db_1.prismaClient.follows.findMany({ where: { follower: { id: parent.id } }, include: { following: true } });
            return result.map((el) => el.following);
        })
    }
};
exports.reslovers = { queries, extraReslovers, mutations };

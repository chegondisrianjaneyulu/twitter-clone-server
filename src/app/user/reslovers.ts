import axios from "axios";
import { prismaClient } from "../../clients/db";
import JWTService from "../../services/jwt";
import { GraphqlContext } from "../../interfaces";
import { User } from "@prisma/client";
import UserService from "../../services/user";
import TweetService from "../../services/tweet";

interface GoogleTokenResult {
    iss? : string;
    nbf? : string;
    aud? :string;
    sub? :string;
    email? : string;
    email_verified?: string;
    azp?: string;
    name?:  string;
    picture?:  string;
    given_name: string;
    family_name?: string;
    iat? : string;
    exp? :string;
    jti? : string;
    alg? :string;
    kid? : string;
    typ? : string
}

const queries =  {

    verifyGoogleToken: async (parent: any, {token}: {token: string}) => {
        const resultToken = await UserService.verifyGoogleToken(token)
        return resultToken
    },

    getCurrentUser: async (parent:any, args:any, ctx: GraphqlContext) => {
       const id = ctx.user?.id;
       if (!id) return null;

       const user = UserService.getUserById(id);
       return user
    },

    getUserById:  async (parent:any, {id}:{id: string}, ctx: GraphqlContext) => {
       const user = UserService.getUserById(id)
       return user;
    }
}

const extraReslovers = {
    User: {
        tweets: (parent: User) => (
            // prismaClient.tweet.findMany({where: {author: {id: parent.id}}})
           TweetService.getTweetsByUserId(parent.id)
        )
    }
}

export const reslovers = {queries, extraReslovers}
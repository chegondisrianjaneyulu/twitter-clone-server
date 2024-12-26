import axios from "axios";
import { prismaClient } from "../../clients/db";
import JWTService from "../../services/jwt";
import { GraphqlContext } from "../../interfaces";
import { User } from "@prisma/client";
import UserService from "../../services/user";
import TweetService from "../../services/tweet";
import { redisClient } from "../../clients/redis";

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

const mutations = {
    followUser: async (parent: any,  {to}: {to: string}, ctx: GraphqlContext) => {
       if (!ctx.user || !ctx.user.id) throw new Error('Unauthencated')

       await UserService.followUser(ctx.user.id, to)
       await redisClient.del(`RECOMMENDED_USERS:${ctx.user.id}`)
       return true
    },

    unFollowUser: async (parent:any, {to}: {to: string}, ctx: GraphqlContext) => {
        if (!ctx.user || !ctx.user.id) throw new Error('Unauthencated')

        await UserService.unFollowUser(ctx.user.id, to)
        await redisClient.del(`RECOMMENDED_USERS:${ctx.user.id}`)
        return true
    }
}

const extraReslovers = {
    User: {
        tweets: (parent: User) => (
            // prismaClient.tweet.findMany({where: {author: {id: parent.id}}})
           TweetService.getTweetsByUserId(parent.id)
        ),
        follower: async (parent: User) => {
           const result = await  prismaClient.follows.findMany({where: {following: {id: parent.id}}, include: {follower: true}})
          
           return  result.map((el) => el.follower)
        },
        following: async (parent: User) => {
            const result = await prismaClient.follows.findMany({where: {follower: {id: parent.id}}, include: {following: true}})
            return result.map((el) => el.following)
        },
        recommendedUsers: async (parent: User, _:any, ctx:GraphqlContext) => {
            if (!ctx.user) return []
           
            // let cachedValue = await redisClient.get(`RECOMMENDED_USERS:${ctx.user.id}`)

            // if (cachedValue) return JSON.parse(cachedValue)

            const myFollowing = await prismaClient.follows.findMany({where: {follower: {id: ctx.user.id}}, include: {following: {include : {follower: {include: {following: true}}}}}})
            
            const users: User[] = []

            for (const followings of myFollowing) {
                for (const followingOfFollowedUser of followings.following.follower) {
                    if ( followingOfFollowedUser.following.id !== ctx.user.id && myFollowing.findIndex(el => el?.followerId === followingOfFollowedUser.following.id) < 0) {
                        users.push(followingOfFollowedUser.following)
                    }
                }
            }

            // await redisClient.set(`RECOMMENDED_USERS:${ctx.user.id}`, JSON.stringify(users))
            return users
        }
    } 
}



export const reslovers = {queries, extraReslovers, mutations}
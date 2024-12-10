import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";


interface CreateTweetPayload {
   content: string;
   imageUrl?: string
}


const queries = {
    getAllTweets: () => prismaClient.tweet.findMany({orderBy: {createdAt: 'desc'}})
}

const muatations = {
    createTweet: async(parent:any, {payload}: {payload: CreateTweetPayload}, ctx: GraphqlContext) => {
        if (!ctx.user) throw new Error('You are not authenticated');
        
        const tweet = await prismaClient.tweet.create({
            data: {
                content: payload.content,
                imageUrl: payload.imageUrl,
                author: {connect : {id: ctx.user.id}}
            }
        })

        return tweet;

    }
} 

const extraReslovers = {
    Tweet: {
        author: (parent: Tweet) => {
           return  prismaClient.user.findUnique({where: {id: parent.authorId}})
        }
    }
}


export const reslovers = {muatations, extraReslovers, queries}
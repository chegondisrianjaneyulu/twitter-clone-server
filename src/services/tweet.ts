import { prismaClient } from "../clients/db"

export interface CreateTweetPayload {
    content: string;
    imageUrl?: string;
    userId: string;
}

class TweetService {
     public static async createTweet (payload:CreateTweetPayload) {
        const tweet = await prismaClient.tweet.create({
            data: {
                content: payload.content,
                imageUrl: payload.imageUrl,
                author: {connect : {id: payload.userId}}
            }
        })
        return tweet
     }

     public static getAllTweets() {
       return prismaClient.tweet.findMany({orderBy: {createdAt: 'desc'}})
     }

     public static getTweetsByUserId(id: string) {
        return prismaClient.tweet.findMany({where: {author: {id: id}}})
     }
}


export default TweetService
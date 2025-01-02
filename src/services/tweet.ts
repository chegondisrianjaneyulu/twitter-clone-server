import { prismaClient } from "../clients/db"


export interface CreateTweetPayload {
    content: string;
    imageUrl?: string;
    userId: string;
}

class TweetService {
     public static async createTweet (payload:CreateTweetPayload) {
        // const rateLimitFlag = await redisClient.get(`RATE_LIMIT:TWEET:${ payload.userId}`)

        // if (rateLimitFlag) throw new Error('Please try after time....')

        const tweet = await prismaClient.tweet.create({
            data: {
                content: payload.content,
                imageUrl: payload.imageUrl,
                author: {connect : {id: payload.userId}}
            }
        })
        // await redisClient.setex(`RATE_LIMIT:TWEET:${ payload.userId}`, 10,  payload.userId)
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
import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import UserService from "../../services/user";
import TweetService, { CreateTweetPayload } from "../../services/tweet";
import { redisClient } from "../../clients/redis";



const s3Client = new S3Client({
    region: process.env.AWS_S3_BUCKET_REGION as string,
    credentials: {secretAccessKey: process.env.AWS_S3_BUCKET_SECRET_KEYS as string, accessKeyId: process.env.AWS_S3_BUCKET_ACCESS_KEYS as string}
})

const queries = {
    getAllTweets: () => {
        return TweetService.getAllTweets()
    },

    getSignedURLForTweet: async (parent:any, {imageType, imageName}: {imageType: string, imageName:string}, ctx: GraphqlContext) => {

        if (!ctx.user || !ctx.user.id ) {
            throw new Error('You are not authenticated')
        }

        let allowedTypes = ['jpg', 'jpeg', 'png', 'webp']

        if ( !allowedTypes.includes(imageType) ) {
            throw new Error('Unsupported Image type');
        }

        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `uploads/${ctx.user.id}/${imageName}-${Date.now()}.${imageType}`
        })

        const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {expiresIn: 120})

        return signedUrl
    }
}

const muatations = {
    createTweet: async(parent:any, {payload}: {payload: CreateTweetPayload}, ctx: GraphqlContext) => {
        
        if (!ctx.user) throw new Error('You are not authenticated');
        
        const tweet = await TweetService.createTweet({...payload, userId: ctx.user.id})

        
        
        return tweet;

    }
} 

const extraReslovers = {
    Tweet: {
        author: (parent: Tweet) => {
           return  UserService.getUserById(parent.authorId)
        }
    }
}


export const reslovers = {muatations, extraReslovers, queries}
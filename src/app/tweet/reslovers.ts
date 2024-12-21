import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface CreateTweetPayload {
   content: string;
   imageUrl?: string
}


const s3Client = new S3Client({
    region: process.env.AWS_S3_BUCKET_REGION as string,
    credentials: {secretAccessKey: process.env.AWS_S3_BUCKET_SECRET_KEYS as string, accessKeyId: process.env.AWS_S3_BUCKET_ACCESS_KEYS as string}
})

const queries = {
    getAllTweets: () => prismaClient.tweet.findMany({orderBy: {createdAt: 'desc'}}),
    getSignedURLForTweet: async (parent:any, {imageType, imageName}: {imageType: string, imageName:string}, ctx: GraphqlContext) => {

        if (!ctx.user || !ctx.user.id ) {
            throw new Error('You are not authenticated')
        }

        let allowedTypes = ['jpg', 'jpeg', 'png', 'webp']

        if ( !allowedTypes.includes(imageType) ) {
            throw new Error('Unsupported Image type');
        }

        const putObjectCommand = new PutObjectCommand({
            Bucket: 'hk-test-s3bucket',
            Key: `uploads/${ctx.user.id}/${imageName}-${Date.now()}.${imageType}`
        })

        const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {expiresIn: 120})

        return signedUrl
    }
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
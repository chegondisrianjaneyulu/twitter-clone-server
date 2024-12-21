export const types = `#graphql
   type User {
    id: ID!
    firstName: String!
    lastName: String
    email: String!
    profileImageUrl: String
    tweets: [Tweet]
    follower: [User]
    following: [User]
   }
`
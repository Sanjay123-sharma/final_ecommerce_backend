import {ApolloServer} from 'apollo-server'
import {ApolloServerPluginLandingPageGraphQLPlayground} from 'apollo-server-core'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

import { resolvers } from './Query_Resolvers.js'
import { typeDefs } from './Query_Resolvers.js'



const server=new ApolloServer({
    typeDefs:typeDefs,
    resolvers:resolvers,
    context:({req})=>{
        const {authorization}=req.headers;
        if(authorization){
            const {email}=jwt.verify(authorization,process.env.SECRET_KEY);
            return {email};

        }
    }
})

server.listen().then(({url})=>{
    console.log(`Listen to PORT ${url}`)
})

import Express from "express";
import * as expCore from "express-serve-static-core";
import graphqlHTTP from "express-graphql";
//import { ApolloServer } from "apollo-server-express";
//import * as graphqlType from "type-graphql";
import * as graphql from "graphql";
import * as fs from "fs";
import { RootApiResolver } from "./RootApiResolver";
import path from "path";

export class CcimsApi {

    private port: number;
    private expressServer: expCore.Express;
    private schema: graphql.GraphQLSchema | undefined;
    //private apolloServer: ApolloServer | undefined;

    public constructor(port: number) {
        this.port = port;
        //this.apolloServer = undefined;
        this.expressServer = Express();
        this.schema = graphql.buildSchema(fs.readFileSync("schemas/schema.graphql").toString());
        this.expressServer.use("/api", graphqlHTTP({
            schema: this.schema,
            rootValue: new RootApiResolver(),
            graphiql: true
        }))
    }

    
    public async start() {
        /*
        this.apolloServer = new ApolloServer({
            schema: this.schema
        });
        this.apolloServer.applyMiddleware({
            app: this.expressServer
        });
        */

        this.expressServer.listen({ port: this.port }, console.error);
        console.log("Started api");
    }
    
}
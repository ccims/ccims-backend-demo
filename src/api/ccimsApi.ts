import Express from "express";
import * as expCore from "express-serve-static-core";
import graphqlHTTP from "express-graphql";
//import { ApolloServer } from "apollo-server-express";
//import * as graphqlType from "type-graphql";
import * as graphql from "graphql";
import * as fs from "fs";
import { RootApiResolver } from "./RootApiResolver";
import path from "path";
import { DBClient } from "../domain/DBClient";
import { tokenResponseRouter } from "./tokenResponseRouter";
import { tokenRequestRouter } from "./tokenRequestRouter";

export class CcimsApi {

    private readonly port: number;
    private readonly expressServer: expCore.Express;
    private readonly schema: graphql.GraphQLSchema;
    //private apolloServer: ApolloServer | undefined;
    private readonly dbClient: DBClient;

    public constructor(port: number, dbClient: DBClient) {
        this.port = port;
        //this.apolloServer = undefined;
        this.expressServer = Express();
        this.schema = graphql.buildSchema(fs.readFileSync("schemas/schema.graphql").toString());
        this.dbClient = dbClient;
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
        this.expressServer.use("/api", graphqlHTTP({
            schema: this.schema,
            rootValue: new RootApiResolver(this.dbClient),
            graphiql: true
        }));
        const requestRouter = await tokenRequestRouter(this.dbClient);
        this.expressServer.use("/tokenResponse", tokenResponseRouter);
        this.expressServer.use("/tokenRequest", requestRouter);
        this.expressServer.listen({ port: this.port }, console.error);
        console.log("Started api");
    }
}
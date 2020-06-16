import Express from "express";
import * as expCore from "express-serve-static-core";
import { ApolloServer } from "apollo-server-express";
import * as graphqlType from "type-graphql";
import * as graphql from "graphql";

export class ccimsApi {

    private port: number;
    private expressServer: expCore.Express;
    private schema: graphql.GraphQLSchema | null;
    private apolloServer: ApolloServer | null;

    public constructor(port: number) {
        this.port = port;
        this.apolloServer = null;
        this.expressServer = Express();
        this.schema = null;
    }

    /*
    public async start() {
        this.schema = await graphqlType.buildSchema({
            resolvers: [],
            emitSchemaFile: true,
            validate: false
        });
        this.apolloServer = new ApolloServer({
            schema: this.schema ?
        });
        this.apolloServer.applyMiddleware({ this.expressServer });

        this.expressServer.listen({ port: this.port }, console.error);
    }
    */
}
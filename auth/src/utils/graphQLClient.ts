import { GraphQLClient } from "graphql-request";

const perchApi = process.env.PERCH_API || '';

export const graphQLClient = new GraphQLClient(perchApi);

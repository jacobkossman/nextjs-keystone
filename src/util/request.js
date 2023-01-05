import { ApolloClient, InMemoryCache } from '@apollo/client';

export const client = new ApolloClient({
	uri: process.env.APOLLO_CLIENT_GRAPHQL_URI || 'http://localhost:4000/api/graphql',
	cache: new InMemoryCache()	
});
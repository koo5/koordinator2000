var fetch = require('cross-fetch');
var gql = require('graphql-tag');
var apollo = require('@apollo/client');
var timeout_link = require('apollo-link-timeout');

export function client() {

    console.log('process.env:', process.env);
    const uri = `https://${process.env.VITE_PUBLIC_GRAPHQL_ENDPOINT}`
    console.log('Connecting to GraphQL endpoint:', uri);
    const httpLink = new apollo.HttpLink({
        uri,
        headers: {
            'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
        },
        fetch
    });

    const timeoutHttpLink = new timeout_link.default(10000).concat(httpLink);

    return new apollo.ApolloClient({
        cache: new apollo.InMemoryCache(),
        link: timeoutHttpLink,
        defaultOptions: {
            query: {
                fetchPolicy: 'no-cache',
            },
        }
    });

}

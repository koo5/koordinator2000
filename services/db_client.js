var config_file = require('../sapper4/frontend/src/config.js');
//console.log(config_file);
var config = config_file.config;

var fetch = require('cross-fetch');
var gql = require('graphql-tag');
var apollo = require('@apollo/client');
var timeout_link = require('apollo-link-timeout');

const httpLink = new apollo.HttpLink({
    uri: 'https://' + config.GRAPHQL_ENDPOINT,
    headers: {
      //"Authorization": `Bearer ${process.env.FAUNADB_SECRET}`,
      ...config.PUBLIC_GRAPHQL_HEADERS
    },
    fetch
  });

const timeoutHttpLink = new timeout_link.default(10000).concat(httpLink);

module.exports = new apollo.ApolloClient({
  cache: new apollo.InMemoryCache(),
  link: timeoutHttpLink,
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  }
})

import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'

/**
 * Create a new apollo client and export as default
 */


const cache = new InMemoryCache()
const link = new HttpLink({
  uri: 'http://localhost:4000/'
})

const client = new ApolloClient({
  link,
  cache,
})

export default client;

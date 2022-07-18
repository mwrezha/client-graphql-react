import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'

/**
 * Create a new apollo client and export as default
 */


const cache = new InMemoryCache()
const link = new HttpLink({ uri: 'https://rickandmortyapi.com/graphql' })

const client = new ApolloClient({
  link,
  cache,
})

const query = gql`
    {
      characters {
        info {
          count
          pages
        }
        results {
          id
          name
          type
          image
        }
      }
    }
`;

client.query({query}).then(result => console.log('characters', result))

export default client;

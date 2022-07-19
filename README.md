# Intro to Client GraphQL with React

## What is GraphQL?

A [spec](http://spec.graphql.org/) that describes a declarative query language that your
clients can use to ask an API for the exact data they want. This
is achieved by creating a strongly typed Schema for your API,
ultimate flexibility in how your API can resolve data, and client
queries validated against your Schema.

## Queries and Mutations from the client

### Operation names

Unique names for your client side Query and Mutation
operations. Used for client side caching, indexing inside of
tools like GraphQL playground, etc. Like naming your
functions in JS vs keeping them anonymous.

Example of operations

```graphql
pets {
  name
  id
  type
  img
}
```

Example for Operation names

```graphql
query getPets {
  pets {
    name
    id
    type
    img
  }
}
```

### Variables with operations

Operations can define arguments, very much like a function in
most programming languages. Those variables can then be
passed to query / mutation calls inside the operation as
arguments. Variables are expected to be given at run time
during operation execution from your client.

Example variables with operations

```graphql
query getPets($input: PetsInput) {
  result: pets(input: $input) {
    name
   id
    img
    type
  }
```

Query variable of `$input`

```graphql
{
  "input": {
    "type": "DOG"
  }
}
```

## [Apollo React](https://www.apollographql.com/docs/react/get-started)
<!--
[Apollo Client](https://www.apollographql.com/docs/react/get-started)
[Apollo Server](https://www.apollographql.com/docs/apollo-server/getting-started)
-->
### Query

```js
const GET_PETS = gql`
  query getPets {
    pets {
      name
      id
      type
      img
    }
  }
`;
```

```js
const {data, loading, error} = useQuery(GET_PETS);
```

```js
if (loading) return 'Loading...';
if (error) return `Error! ${error.message}`;
```

### Mutations

```js

const CREATE_PET = gql`
  mutation createPet($input: NewPetInput!) {
    addPet(input: $input) {
      id
      type
      name
      img
    }
  }
`;
```

```js
const [
  createpet, 
  createdPet
] = useMutation(CREATE_PET);
```

```js
const onSubmit = input => {
    setModal(false)
    createpet({
      variables: {
        input: input
      }
    });
  }
```

## Keeping Cache in Sync

### Why is the cache out of sync?

>If you perform a mutation that updates or creates a single
node, then apollo will update your cache automatically given
the mutation and query has the same fields and id.
>
>If you perform a mutation that updates a node in a list or
removes a node, you are responsible for updating any queries
referencing that list or node. There are many ways to do this
with apollo.

### Keeping cache in sync

- [Refetch](https://www.apollographql.com/blog/apollo-client/caching/when-to-use-refetch-queries/) matching queries after a mutation

  ```js
    const [
    createpet, 
    createdPet
  ] = useMutation(CREATE_PET, {
    // add this code
    refetchQueries: [
      { query: GET_PETS }
    ]
  });
  ```

- Use update method on mutation

  ```js
  const [
    createpet, 
    createdPet
  ] = useMutation(CREATE_PET, {
    // add this code
    update(cache, { data: { addPet } }) {
      const { pets } = cache.readQuery({ query: GET_PETS });
      cache.writeQuery({
        query: GET_PETS,
        data: { pets: [addPet, ...pets] }
      })
    }
  });
  ```

## Optimistic UI

Optimistic UI is a pattern that you can use to simulate the results of a mutation and update the UI even before receiving a response from the server. Once the response is received from the server, the optimistic result is thrown away and replaced with the actual result.

```js
createpet({
  variables: {
    input: input
  },

  // Add this code
  optimisticResponse: {
    __typename: 'Mutation',
    addPet: {
      __typename: 'Pet',
      id: Math.floor(Math.random() * 1000) + '',
      name: input.name,
      type: input.type,
      img: 'https://via.placeholder.com/300',
    }
  }
});
```

```js
...
const delay = setContext(
  request =>
    new Promise((success, fail) => {
      setTimeout(() => {
        success()
      }, 800)
    })
)

...

const http = new HttpLink({
  uri: 'http://localhost:4000/'
})

const link = ApolloLink.from([
  delay,
  http
])

...

const client = new ApolloClient({
  cache,
  link,
})

```

## Directives

Configure GraphQL types, fields, and arguments

A directive decorates part of a GraphQL schema or operation with additional configuration. Tools like Apollo Server (and [Apollo Client](https://www.apollographql.com/docs/react/local-state/managing-state-with-field-policies/#querying)) can read a GraphQL document's directives and perform custom logic as appropriate.

client.js

>typeDefs,
>
>resolvers

```js
const typeDefs = gql`
  extend type Pet {
    vacinated: Boolean!
  }
`;

const resolvers = {
  Pet: {
    vacinated: () => true
  }
};

...


const client = new ApolloClient({
  cache,
  link,
  // add this code below
  typeDefs,
  resolvers
})
```

## Local-only fields in Apollo Client

Fetch local and remote data with one GraphQL query. Your Apollo Client queries can include local-only fields that aren't defined in your GraphQL server's schema:

Pets.js
>vacinated @client

```js

const GET_PETS = gql`
  query getPets {
    pets {
      name
      id
      type
      img
      vacinated @client # This is a local-only field
    }
  }
`;
```

## [Fragments](https://www.apollographql.com/docs/react/data/fragments/)

Share fields between operations

A GraphQL [fragment](https://graphql.org/learn/queries/#fragments) is a piece of logic that can be shared between multiple queries and mutations.

Here's the declaration of a `PetsFields` fragment that can be used with any `Pet` object:

```js
const PET_FRAGMENT = gql`
  fragment PetsFields on Pet {
    name
    id
    type
    img
    vacinated @client
  }
`;
```

Every fragment includes a subset of the fields that belong to its associated type. In the above example, the `Pet` type must declare `name`, `id`, `type`, `img` and `vacinated @client` fields for the `PetsFields` fragment to be valid.

We can now include the `PetsFields` fragment in any number of queries and mutations that refer to `Pet` objects, like so:

```js
const GET_PETS = gql`
  query getPets {
    pets {
      ...PetsFields
    }
  }
  ${PET_FRAGMENT}
`;
```

```js
const CREATE_PET = gql`
  mutation createPet($input: NewPetInput!) {
    addPet(input: $input) {
      ...PetsFields
    }
  }
  ${PET_FRAGMENT}
`;
```

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

## Apollo React
<!--
[Apollo Client](https://www.apollographql.com/docs/react/get-started)
[Apollo Server](https://www.apollographql.com/docs/apollo-server/getting-started)
-->

[Apollo](https://www.apollographql.com/docs/react/get-started) Client is a comprehensive state management library for JavaScript that enables you to manage both local and remote data with GraphQL. Use it to fetch, cache, and modify application data, all while automatically updating your UI.

### Query (Fetch data with the useQuery hook)

The `useQuery` React `hook` is the primary API for executing queries in an Apollo application. To run a query within a React component, call `useQuery` and pass it a GraphQL query string. When your component renders, `useQuery` returns an object from Apollo Client that contains `loading`, `error`, and `data` properties you can use to render your UI.

First, we'll create a GraphQL query named `GET_PETS`. Remember to wrap query strings in the `gql` function to parse them into query documents:

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

we'll pass our `GET_PETS` query to the `useQuery` hook:

```js
const {data, loading, error} = useQuery(GET_PETS);
```

As our query executes and the values of `loading`, `error`, and `data` change, the component can intelligently render different UI elements according to the query's state:

```js
if (loading) return 'Loading...';
if (error) return `Error! ${error.message}`;
```

- As long as `loading` is `true` (indicating the query is still in flight), the component presents a `Loading...` notice.
- When `loading` is `false` and there is no `error`, the query has completed. The component renders a `data` returned by the server.

### Mutations (Modify data with the useMutation hook)

The `useMutation` React `hook` is the primary API for executing mutations in an Apollo application. To execute a mutation, you first call `useMutation` within a React component and pass it the mutation you want to execute

First, we'll create a corresponding GraphQL mutation named `CREATE_PET`. Remember to wrap GraphQL strings in the gql function to parse them into query documents:

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

Next, we'll create a component named `createpet` that represents the submission form for the to-do list. Inside it, we'll pass our `CREATE_PET` mutation to the `useMutation` hook:

```js
const [
  createpet, 
  { data, loading, error }
] = useMutation(CREATE_PET);
```

In this example, our form's `onSubmit` handler calls the mutate function (named `createpet`) that's returned by the `useMutation` hook. This tells Apollo Client to execute the mutation by sending it to our GraphQL server.
>Note that this behavior differs from `useQuery`, which executes its operation as soon as its component renders. This is because mutations are more commonly executed in response to a user action (such as submitting a form in this case).

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

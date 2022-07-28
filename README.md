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

Apollo Client allows you to make local modifications to your GraphQL data by [updating the cache](https://www.apollographql.com/docs/react/data/mutations/#updating-the-cache-directly), but sometimes it's more straightforward to update your client-side GraphQL data by refetching queries from the server.

- [Refetch](https://www.apollographql.com/blog/apollo-client/caching/when-to-use-refetch-queries/) matching queries after a mutation,

  If you know that your app usually needs to refetch certain queries after a particular mutation, you can include a `refetchQueries` array in that mutation's options:

  ```js
    const [
    createpet, 
    { data, loading, error }
  ] = useMutation(CREATE_PET, {
    // add this code
    refetchQueries: [ { query: GET_PETS } ], // DocumentNode object parsed with gql
    'getPets' // Query name
  });
  ```
  Each element in the `refetchQueries` array is one of the following:

  An object referencing `query` (a `DocumentNode` object parsed with the `gql` function) and `variables`
  The name of a query you've previously executed, as a string (e.g., `getPets`)
  To refer to queries by name, make sure each of your app's queries has a unique name.
  Each included query is executed with its most recently provided set of variables.

  You can provide the `refetchQueries` option either to `useMutation` or to the mutate function. For details, see [Option precedence](https://www.apollographql.com/docs/react/data/mutations/#option-precedence).

- Use update method on mutation

  When a [mutation's response](https://www.apollographql.com/docs/react/data/mutations/#include-modified-objects-in-mutation-responses) is insufficient to update all modified fields in your cache (such as certain list fields), you can define an `update` function to apply manual changes to your cached data after a mutation.

  You provide an `update` function to `useMutation`, like so:

  ```js
  const [
    createpet, 
    { data, loading, error }
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
  As shown, the `update` function is passed a `cache` object that represents the Apollo Client cache. This object provides access to cache API methods like `readQuery`/`writeQuery`, `readFragment`/`writeFragment`, `modify`, and `evict`. These methods enable you to execute GraphQL operations on the cache as though you're interacting with a GraphQL server.

  >Learn more about supported cache functions in [Interacting with cached data](https://www.apollographql.com/docs/react/caching/cache-interaction).
  
  The `update` function is _also_ passed an object with a `data` property that contains the result of the mutation. You can use this value to update the cache with `cache.writeQuery`, `cache.writeFragment`, or `cache.modify`.

  When the `CREATE_PET` mutation executes in the above example, the newly added and returned `addPet` object is automatically saved into the cache _before_ the `update` function runs. However, the cached list of `ROOT_QUERY.pets` (which is watched by the `GET_PETS` query) is not automatically updated. This means that the `GET_PETS` query isn't notified of the new `Pet` object, which in turn means that the query doesn't update to show the new item.

  To address this, we use cache.modify to surgically insert or delete items from the cache, by running "modifier" functions. In the example above, we know the results of the `GET_PETS` query are stored in the `ROOT_QUERY.pets` array in the cache, so we use a `pets` modifier function to update the cached array to include a reference to the newly added `Pet`. With the help of `cache.writeFragment`, we get an internal reference to the added `Pet`, then append that reference to the `ROOT_QUERY.pets` array.

  Any changes you make to cached data inside of an `update` function are automatically broadcast to queries that are listening for changes to that data. Consequently, your application's UI will update to reflect these updated cached values.

## Optimistic UI (Update your UI before your server responds)

Optimistic UI is a pattern that you can use to simulate the results of a mutation and update the UI even before receiving a response from the server. Once the response is received from the server, the optimistic result is thrown away and replaced with the actual result.

To enable this optimistic UI behavior, we provide an `optimisticResponse` option to the [mutate function](https://www.apollographql.com/docs/react/data/mutations/#executing-a-mutation) that we use to execute our mutation.

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

As this example shows, the value of `optimisticResponse` is an object that matches the shape of the mutation response we expect from the server. Importantly, this includes the `Pet`'s `id` and `__typename` fields. The Apollo Client cache uses these values to generate the pet's [unique cache identifier](https://www.apollographql.com/docs/react/caching/cache-configuration/#customizing-cache-ids) (e.g., `Pet:5`).

### Optimistic mutation lifecycle

1. When the code above calls `mutate`, the Apollo Client cache stores a `Pet` object with the field values specified in `optimisticResponse`. However, it does not overwrite the existing cached `Pet` with the same cache identifier. Instead, it stores a separate, optimistic version of the object. This ensures that our cached data remains accurate if our `optimisticResponse` is wrong.

2. Apollo Client notifies all active queries that include the modified Pet. Those queries automatically update, and their associated components re-render to reflect the optimistic data. Because this doesn't require any network requests, it's nearly instantaneous to the user.

3. Eventually, our server responds with the mutation's actual resulting `Pet` object.

4. The Apollo Client cache removes the optimistic version of the `Pet` object. It also overwrites the canonical cached version with values returned from the server.

5. Apollo Client notifies all affected queries again. The associated components re-render, but if the server's response matches our `optimisticResponse`, this is invisible to the user.

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

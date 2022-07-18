# Intro to Client GraphQL with React

## What is GraphQL?

A [spec](http://spec.graphql.org/) that describes a declarative query language that your
clients can use to ask an API for the exact data they want. This
is achieved by creating a strongly typed Schema for your API,
ultimate flexibility in how your API can resolve data, and client
queries validated against your Schema.

## Queries and Mutations from the client

### Operation names

> Unique names for your client side Query and Mutation
operations. Used for client side caching, indexing inside of
tools like GraphQL playground, etc. Like naming your
functions in JS vs keeping them anonymous.

### Variables with operations

> Operations can define arguments, very much like a function in
most programming languages. Those variables can then be
passed to query / mutation calls inside the operation as
arguments. Variables are expected to be given at run time
during operation execution from your client.

## Apollo React

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
if (loading) return <Loader />;
if (error) return `Error! ${error.message}`;
```
```js
console.log('data', data);
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
## Caching
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

client.js
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
>typeDefs,
>
>resolvers

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
      vacinated @client
    }
  }
`;
```
## Fragments
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

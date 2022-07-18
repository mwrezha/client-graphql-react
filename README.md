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

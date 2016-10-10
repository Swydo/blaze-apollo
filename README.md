# BlazeApollo
Blaze integration for the Apollo Client. Load GraphQL data directly in your templates!

## Installation

```
meteor add swydo:blaze-apollo
```

## Setup

```javascript
import ApolloClient from 'apollo-client';
import { setup } from 'meteor/swydo:blaze-apollo';
import { meteorClientConfig } from 'meteor/apollo';

const client = new ApolloClient(meteorClientConfig());

setup({ client });
```

## Something to query.
For the examples below we'll use the following data:

```javascript
import gql from 'graphql-tag';

const HUMAN_QUERY = gql`
{
  human(id: "1000") {
    name
    height(unit: FOOT)
  }
}
`;
```
The result will look like this:
```javascript
{
  "data": {
    "human": {
      "name": "Luke Skywalker",
      "height": 5.6430448
    }
  }
}
```
Directly copied from the awesome [GraphQL examples](http://graphql.org/learn/queries/).

## Basic template example

```handlebars
<template name="human">
  <h1>{{human.name}}</h1>
  <p>The height of this human is {{human.height}} foot.</p>
</template>
```

```javascript
import './human.html';

Template.human.helpers({
  human() {
    return Template.instance().gqlQuery({ query: HUMAN_QUERY }).get().human;
  }
});
```
And done! GraphQL data in your templates!

Besides `query`, all other options for [ApolloClient.watchQuery](http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient.watchQuery) are available. Like `pollInterval`, `forceFetch`, `noFetch` and `variables`.

## Deep dive into the API
The example above is great for a quick setup, but sometimes you need more control. We can do that by catching the result of the query. This gives us a `Result` variable with a reactive `get()` method, just like any ReactiveVar:

```javascript
Template.myTemplate.onCreated(function() {
  const result = this.gqlQuery({ query: QUERY });

  // This is reactive
  result.get();

  // So this will rerun automatically when data in the cache changes
  // This includes updates from mutations and (GraphQL) subscriptions
  this.autorun(function() {
    result.get();
  });

  // Stop listening to updates
  // Note: This is automatically done when the template is destroyed
  result.unsubscribe();

  // You might need some control over the observer
  // It's simply available on the result
  result.observer.setVariables({});
});
```
### Generic template helpers.
```handlebars
<template name="myTemplate">
  {{#if queriesReady}}
    <p>Loaded {{human.name}}</p>
  {{else}}
    <p>Loading...</p>
  {{/if}}
</template>
```

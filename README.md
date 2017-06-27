# BlazeApollo

Blaze integration for the Apollo Client. Load GraphQL data directly in your templates!

[![Build Status](https://travis-ci.org/Swydo/blaze-apollo.svg?branch=master)](https://travis-ci.org/Swydo/blaze-apollo)
[![Greenkeeper badge](https://badges.greenkeeper.io/Swydo/blaze-apollo.svg)](https://greenkeeper.io/)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Installation](#installation)
- [Setup](#setup)
  - [Server](#server)
  - [Client](#client)
- [Something to query](#something-to-query)
- [GraphQL Queries](#graphql-queries)
- [GraphQL Mutations](#graphql-mutations)
- [GraphQL Subscriptions](#graphql-subscriptions)
- [Deep dive into the API](#deep-dive-into-the-api)
- [Generic template helpers](#generic-template-helpers)
- [Testing](#testing)
- [Sponsor](#sponsor)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Installation
```
meteor add swydo:blaze-apollo
```

```
meteor npm install --save apollo-client
```

## Setup

### Server
Before using this package it's recommended to first setup you GraphQL server.
You can use the [apollo](https://github.com/apollostack/meteor-integration) package, which uses express and HTTP requests. Or use [swydo:ddp-apollo](https://github.com/Swydo/ddp-apollo), which leverages your current DDP connection, without setting up an HTTP server. `ddp-apollo` also give you subscriptions out of the box! Installation instructions are in the README of those packages.

### Client
```javascript
import ApolloClient from 'apollo-client';
import { setup } from 'meteor/swydo:blaze-apollo';

// When using the meteor/apollo package:
import { meteorClientConfig } from 'meteor/apollo';
const client = new ApolloClient(meteorClientConfig());

// When using meteor/swydo:ddp-apollo:
import { DDPNetworkInterface } from 'meteor/swydo:ddp-apollo';
const client = new ApolloClient ({
  networkInterface: new DDPNetworkInterface()
});

setup({ client });
```

## Something to query
For the examples below we'll use the following data:

```graphql
{
  human(id: "1000") {
    name
    height(unit: FOOT)
  }
}
```
The result will look like this:
```json
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

## GraphQL Queries

```handlebars
<template name="human">
  <h1>{{human.name}}</h1>
  <p>The height of this human is {{human.height}} foot.</p>
</template>
```

```javascript
import './human.html';
import HUMAN_QUERY from './humanQuery.graphql';

Template.human.helpers({
  human() {
    return Template.instance().gqlQuery({ query: HUMAN_QUERY }).get().human;
  }
});
```
And done! GraphQL data in your templates!

Besides `query`, all other options for [ApolloClient.watchQuery](http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient.watchQuery) are available. Like `pollInterval`, `forceFetch`, `noFetch` and `variables`.

## GraphQL Mutations
```javascript
Template.human.onCreated(function () {
  this.gqlMutate({
    query: HUMAN_MUTATION_QUERY
  });
});
```

## GraphQL Subscriptions
This packages works with any Apollo Client that has subscriptions available. No special setup required.

```javascript
Template.human.onCreated(function () {
  this.gqlSubscribe({
    query: HUMAN_SUBSCRIPTION_QUERY
  });
});
```

GraphQL subscribtions initiated with `gqlSubscribe` will automatically be unsubscribed when the template is destroyed!

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
  
  // Detect if a result is loaded for the first time
  // This is also reactive
  result.isReady();
});
```
## Generic template helpers
```handlebars
<template name="myTemplate">
  {{#if queriesReady}}
    <p>Loaded {{human.name}}</p>
  {{else}}
    <p>Loading...</p>
  {{/if}}
</template>
```

## Testing
This package uses `practicalmeteor:mocha` for testing:

```
meteor test-packages ./ --driver-package practicalmeteor:mocha
```

## Sponsor
[![Swydo](http://assets.swydo.com/img/s-wydo-logo.228x100.png)](https://swy.do)

Want to work with Meteor and GraphQL? [Join the team!](https://swy.do/jobs)

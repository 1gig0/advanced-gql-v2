const {ApolloServer, PubSub, AuthenticationError, UserInputError, ApolloError} = require('apollo-server');
const gql = require('graphql-tag');

const pubSub = new PubSub();
const NEW_ITEM = 'NEW_ITEM';

const typeDefs = gql`
  type User {
      id: ID!
      username: String!
      createdAt: Int!
  }
  
  type Settings {
      user: User!
      theme: String!
  }
  
  input NewSettingsInput {
      userID: ID!
      theme: String!
  }
  
  type Item {
      task: String!
  }
  
  type Query {
      me: User!
      settings(userID: ID!): Settings!
      testError: String!
  }
  
  type Mutation {
      settings(input: NewSettingsInput!): Settings!
      createItem(task: String!): Item!
  }
  
  type Subscription {
      newItem: Item!
  }
`

const resolvers = {
  Query: {
    me() {
      return {
        id: 1111,
        username: 'user-1111',
        createdAt: 1111
      }
    },

    settings(__, {userID}) {
      return {
        userID,
        theme: 'dark'
      };
    },

    testError() {
      throw new AuthenticationError('not auth');
    }
  },

  Mutation: {
    settings(__, {input}) {
      return {
        userID: input.userID,
        theme: input.theme
      };
    },

    createItem(_, {task}) {
      const item = {task};
      pubSub.publish(NEW_ITEM, {newItem: item});
      return item;
    }
  },

  Subscription: {
    newItem: {
      subscribe: () => pubSub.asyncIterator(NEW_ITEM)
    }
  },

  Settings: {
    user(settings) {
      return {
        id: settings.userID,
        username: `user-${settings.userID}`,
        createdAt: settings.userID
      }
    }
  }

}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError(e) {
    console.log(e);
    console.log(e instanceof AuthenticationError);
    console.log(e instanceof UserInputError);
    console.log(e instanceof ApolloError);
    console.log(e instanceof Error);
    return new Error('My custom error');
  },
  context({connection}) {
    if (connection) {
      console.log(connection.context, 'connection.context');
      return {...connection.context}
    }
  },
  subscriptions: {
    onConnect(connectionParams) {
      console.log(connectionParams, 'for authentication');
    }
  }
})

server.listen(3000)
  .then(() => console.log('on port: 3000'))

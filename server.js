const {ApolloServer, PubSub, AuthenticationError, UserInputError, ApolloError, SchemaDirectiveVisitor} = require('apollo-server');
const gql = require('graphql-tag');
const {defaultFieldResolver, GraphQLString} = require('graphql');

const pubSub = new PubSub();
const NEW_ITEM = 'NEW_ITEM';

// class LogDirective extends SchemaDirectiveVisitor {
//   visitFieldDefinition(field) {
//     const resolver = field.resolve || defaultFieldResolver;
//
//     //Directive argument
//     const {message} = this.args;
//
//     field.resolve = (...args) => {
//       console.log('logg', message);
//       return resolver.apply(this, args);
//     }
//   }
// }

class LogDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;

    field.args.push({
      type: GraphQLString,
      name: 'message'
    })

    field.resolve = (root, {message, ...rest}, ctx, info) => {
      const {message: schemaMessage} = this.args;

      console.log('logg', message || schemaMessage);

      return resolver.call(this, root, rest, ctx, info);
    }
  }
}

const typeDefs = gql`
    
  directive @log(message: String = "My directive message") on FIELD_DEFINITION
    
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
  
  type Post {
      id: ID!
      name: String! @log
      description: String!
      relatedPostId: Int! @deprecated(reason: "We use 'postId' filed for it")
      postId: Int!
  }
  
  type Query {
      me: User!
      settings(userID: ID!): Settings!
      testError: String! @deprecated(reason: "We have new error handler for it")
      post: Post!
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
    },

    post() {
      return {
        id: 3,
        name: 'test name',
        description: 'test description',
        relatedPostId: 7,
        postId: 7
      }
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
  schemaDirectives: {
    log: LogDirective
  },
  formatError(e) {
    // console.log(e);
    // console.log(e instanceof AuthenticationError);
    // console.log(e instanceof UserInputError);
    // console.log(e instanceof ApolloError);
    // console.log(e instanceof Error);
    return e;
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

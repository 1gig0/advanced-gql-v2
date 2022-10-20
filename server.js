const {ApolloServer} = require('apollo-server');
const gql = require('graphql-tag');

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
  
  type Query {
      me: User!
      settings(userID: ID!): Settings!
  }
  
  type Mutation {
      settings(input: NewSettingsInput!): Settings!
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
    }
  },

  Mutation: {
    settings(__, {input}) {
      return {
        userID: input.userID,
        theme: input.theme
      };
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
  resolvers
})

server.listen(3000)
  .then(() => console.log('on port: 3000'))

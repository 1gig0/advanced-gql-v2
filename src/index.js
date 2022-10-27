const {ApolloServer} = require('apollo-server')
const typeDefs = require('./typedefs')
const resolvers = require('./resolvers')
const {FormatDateDirective, AuthenticationDirective, AuthorizationDirective} = require('./directives');
const {createToken, getUserFromToken} = require('./auth')
const db = require('./db')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    formatDate: FormatDateDirective,
    dateFormat: FormatDateDirective,
    authenticated: AuthenticationDirective,
    authorized: AuthorizationDirective
  },
  context({req, connection}) {
    const context = {...db};
    if (connection) {
      //connection.context is in subscriptions -> onConnect returned object
      return {...context, ...connection.context};
    }
    const token = req.headers.authorization
    const user = getUserFromToken(token)
    return {...db, user, createToken}
  },
  subscriptions: {
    onConnect(params) {
      const token = params.authToken
      const user = getUserFromToken(token)
      // if (!user) {
      //   throw Error('not authenticated') //if we want to authenticated user to all subscriptions
      // }
      return {user};
    }
  }
})

server.listen(1000).then(({url}) => {
  console.log(`🚀 Server ready at ${url}`)
})

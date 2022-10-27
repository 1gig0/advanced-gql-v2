const gql = require('graphql-tag')

module.exports = gql`
  
  directive @formatDate(format: String! = "dd MMM yyy") on FIELD_DEFINITION
  directive @dateFormat(format: String! = "dd MMM yyy") on FIELD_DEFINITION
  
  directive @authenticated on FIELD_DEFINITION
  directive @authorized(role: Role!) on FIELD_DEFINITION
    
  enum Theme {
    DARK
    LIGHT
  }

  enum Role {
    ADMIN
    MEMBER
    GUEST
  }

  type User {
    id: ID!
    email: String!
    avatar: String!
    verified: Boolean!
    createdAt: String!
    posts: [Post]!
    role: Role!
    settings: Settings!
  }

  type AuthUser {
    token: String!
    user: User!
  }

  type Post {
    id: ID!
    message: String!
    author: User!
    createdAt: String! @formatDate
    likes: Int!
    views: Int!
  }

  type Settings {
    id: ID!
    user: User!
    theme: Theme!
    emailNotifications: Boolean!
    pushNotifications: Boolean!
  }

  type Invite {
    email: String!
    from: User!
    createdAt: String!
    role: Role!
  }

  input NewPostInput {
    message: String!
  }

  input UpdateSettingsInput {
    theme: Theme
    emailNotifications: Boolean
    pushNotifications: Boolean
  }

  input UpdateUserInput {
    email: String
    avatar: String
    verified: Boolean
  }

  input InviteInput {
    email: String!
    role: Role!
  }

  input SignupInput {
    email: String!
    password: String!
    role: Role!
  }

  input SigninInput {
    email: String!
    password: String!
  }

  type Query {
    me: User! @authenticated
    posts: [Post]! @authenticated
    post(id: ID!): Post! @authenticated
    userSettings: Settings! @authenticated
    feed: [Post]!
  }

  type Mutation {
    updateSettings(input: UpdateSettingsInput!): Settings! @authenticated
    createPost(input: NewPostInput!): Post! @authenticated
    updateMe(input: UpdateUserInput!): User @authenticated
    invite(input: InviteInput!): Invite! @authorized(role: ADMIN) @authenticated
    signup(input: SignupInput!): AuthUser!
    signin(input: SigninInput!): AuthUser!
  }
  
  type Subscription {
      newPost: Post! @authorized(role: ADMIN) @authenticated
  }

`

/**
 * TODO: Execution happens in the opposite direction, right-to-left.
 * @authenticated @authorized(role: ADMIN)
 * https://github.com/ardatan/graphql-tools/issues/630
 */

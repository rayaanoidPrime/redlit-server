

export const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  type Query {
    hello: String
    allposts : [Post]
    post(id : Int) : Post
    allusers : [User]
    user(id : Int) : User
    me : User
  }
  type Mutation {
    createPost( title : String) : Post
    updatePost(id: Int , title : String) : Post
    deletePost(id: Int) : Boolean
    register( email : String , username : String, password : String) : UserResponse
    login(usernameOrEmail : String, password : String) : UserResponse
    logout : Boolean
    forgotPassword(email : String) : Boolean
    changePassword(token : String , newPassword : String) : UserResponse
  }

  type Post {
    id : Int!
    createdAt : DateTime!
    updatedAt : DateTime!
    title : String
  }

  type User{
    id : Int!
    username : String!
    email : String!
    createdAt : DateTime!
    updatedAt : DateTime!
  }

  type FieldError {
    field : String!,
    message : String!
  }

  type UserResponse {
    errors : [FieldError],
    user : User
  }


  scalar DateTime
`;
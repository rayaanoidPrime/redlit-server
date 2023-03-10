

export const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  type Query {
    hello: String
    allposts : [Post]
    post(id : Int) : Post
  }
  type Mutation {
    createPost( title : String) : Post
    updatePost(id: Int , title : String) : Post
    deletePost(id: Int) : Boolean
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
    createdAt : DateTime!
    updatedAt : DateTime!
  }

  scalar DateTime
`;
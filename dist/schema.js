"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
exports.typeDefs = `#graphql
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
  }

  type Post {
    id : Int!
    createdAt : DateTime!
    updatedAt : DateTime!
    title : String
  }

  scalar DateTime
`;
//# sourceMappingURL=schema.js.map
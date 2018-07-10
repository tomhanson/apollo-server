const { ApolloServer, gql } = require('apollo-server');
const fetch = require('node-fetch');

// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.

const propertiesFunc =  async(results) => {
  const data = await fetch(`https://abbeymillhomes.co.uk/wp-json/wp/v2/properties?per_page=${results}`).then(data => data.json());
  const t =  data.map( (item) => {
    return { 
      title: item.title.rendered,
      slug: item.slug,
      latlng: item.latlng,
      mainPhoto: {
        url: item.acf.main_photo.url
      },
      property_description: item.acf.property_description
    }
  })
  return t;
}

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  type Property {
    title: String
    slug: String
    latlng: String
    mainPhoto: MainPhotoType
    property_description: String
  }

  type MainPhotoType {
    url: String
  }

  # The "Query" type is the root of all GraphQL queries.
  type Query {
    properties(results: Int!): [Property!]!
  }
`;


// Resolvers define the technique for fetching the types in the
// schema.  
const resolvers = {
  Query: {
    // properties: propertiesFunc
    properties(_, { results }) {
      return propertiesFunc(results);
    }
  }, 
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers, tracing: true });

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

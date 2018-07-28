const { ApolloServer, gql } = require('apollo-server');
const fetch = require('node-fetch');
// const home = require('./mocks/properties');
// const data = require('./mocks/data')

const getPageData = async (page) => {
  return homeData();
}

const homeData = async () => {
  const data = await fetch('https://abbeymillhomes.co.uk/wp-json/wp/v2/pages?slug=home').then(data => data.json());
  const home = data[0]
  return {
    bannerImage: home.acf.home_banner_image.sizes['bg-img-lg'],
    home_banner_headline: home.acf.home_banner_headline,
    home_banner_video: home.acf.home_banner_video,
    home_top_content: home.acf.home_top_content,
    home_bottom_content_headline: home.acf.home_bottom_content_headline,
    home_bottom_content_subheadline: home.acf.home_bottom_content_subheadline,
    home_testimonials_headline: home.acf.home_testimonials_headline,
    home_testimonials_subheadline: home.acf.home_testimonials_subheadline,
  }
}
const propertiesFunc = async (results) => {
  const data = await fetch(`https://abbeymillhomes.co.uk/wp-json/wp/v2/properties?per_page=${results}`).then(data => data.json());
  return data.map((item) => {
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

  type ImageInfo {
    width: String,
    height: String,
    url: String
  }

  type Images {
    thumbnail: ImageInfo,
    medium:  ImageInfo,
    large: ImageInfo,
    imgXs: ImageInfo,
    propertyTileSm: ImageInfo,
    propertyTile: ImageInfo,
    propertyTileMd: ImageInfo,
    propertyTileSquare: ImageInfo,
    galleryXs: ImageInfo,
    gallerySm:ImageInfo,
    galleryMd: ImageInfo,
    galleryLg:ImageInfo,
    portfolio:ImageInfo,
    bgLg: ImageInfo,
  }

  type Home {
    bannerImage: Images
    bannerHeadline: String
    bannerVideo: String
    topContent: String
    bottomContentHeadline: String
    bottomContentSubheadline: String
    testimonialsHeadline: String
    testimonialsSubheadline: String
  }

  type About {
    leftContent: String
    image: String
    charityInfoHeadline: String
  }


  type MainPhotoType {
    url: String
  }

  # The "Query" type is the root of all GraphQL queries.
  type Query {
    properties(results: Int!): [Property!]!
    pages(page: String!): Page
  }
  type Page {
    home: Home
    about: About
  }
`;


// Resolvers define the technique for fetching the types in the
// schema.  
const resolvers = {
  Query: {
    properties(_, { results }) {
      return propertiesFunc(results);
    },
    pages(_, { page }) {
      return fetch(`https://abbeymillhomes.co.uk/wp-json/wp/v2/pages?slug=${page}`).then(data => data.json()).then(data => data[0]);
    }
  },
  Page: {
    home: (data) => data,
    about: (data) => data
  },
  ImageInfo: {
    width: (data) => data.width,
    height: (data) => data.height,
    url: (data) => data.url,
  },
  Images: {
    thumbnail: (data) => ({ width: data['thumbnail-width'], height: data['thumbnail-height'], url: data.thumbnail }),
    medium: (data) => ({ width: data['medium-width'], height: data['medium-height'], url: data.medium }),
    large: (data) => ({ width: data['large-width'], height: data['large-height'], url: data.large }),
    imgXs: (data) => ({ width: data['img-xs-width'], height: data['img-xs-height'], url: data['img-xs'] }),
    propertyTileSm: (data) => ({ width: data['img-property-tile-sm-width'], height: data['img-property-tile-sm-height'], url: data['img-property-tile-sm'] }),
    propertyTile: (data) => ({ width: data['img-property-tile-width'], height: data['img-property-tile-height'], url: data['img-property-tile'] }),
    propertyTileMd: (data) => ({ width: data['img-property-tile-md-width'], height: data['img-property-tile-md-height'], url: data['img-property-tile-md'] }),
    propertyTileSquare: (data) => ({ width: data['img-property-tile-sq-width'], height: data['img-property-tile-sq-height'], url: data['img-property-tile-sq'] }),
    galleryXs: (data) => ({ width: data['gallery-img-xs-width'], height: data['gallery-img-xs-height'], url: data['gallery-img-xs'] }),
    gallerySm: (data) => ({ width: data['gallery-img-sm-width'], height: data['gallery-img-sm-height'], url: data['gallery-img-sm'] }),
    galleryMd: (data) => ({ width: data['gallery-img-md-width'], height: data['gallery-img-md-height'], url: data['gallery-img-md'] }),
    galleryLg: (data) => ({ width: data['gallery-img-lg-width'], height: data['gallery-img-lg-height'], url: data['gallery-img-lg'] }),
    portfolio: (data) => ({ width: data['img-portfolio-width'], height: data['img-portfolio-height'], url: data['img-portfolio'] }),
    bgLg: (data) => ({ width: data['bg-img-lg'], height: data['bg-img-lg'], url: data['bg-img-lg'] }),
  },
  Home: {
    bannerImage: (homeData) => homeData.acf.home_banner_image.sizes,
    bannerHeadline: (homeData) => homeData.acf.home_banner_headline,
    bannerVideo: (homeData) => homeData.acf.home_banner_video,
    topContent: (homeData) => homeData.acf.home_top_content,
    bottomContentHeadline: (homeData) => homeData.acf.home_bottom_content_headline,
    bottomContentSubheadline: (homeData) => homeData.acf.home_bottom_content_subheadline,
    testimonialsHeadline: (homeData) => homeData.acf.home_testimonials_headline,
    testimonialsSubheadline: (homeData) => homeData.acf.home_testimonials_subheadline,
  },
  About: {
    leftContent: (aboutData) => aboutData.acf.about_left_content,
    image: (aboutData) => aboutData.acf.about_us_image,
    charityInfoHeadline: (aboutData) => aboutData.acf.about_charity_info_headline,
    // charityInformation: (aboutData) => aboutData.acf.about_charity_info_headline,

  }
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
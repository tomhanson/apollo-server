const { ApolloServer, gql } = require('apollo-server');
const fetch = require('node-fetch');
// const home = require('./mocks/properties');
// const data = require('./mocks/data')


// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  type Gallery {
    images: Images
  }
  
  type Property {
    title: String
    slug: String
    featuredImage: [Images]
    status: Boolean
    address: String
    description: String
    gallery: [Gallery]
    brochure: [Gallery]
    brochureDownload: String
    specs: String
    price: String
    latlng: String
    mainPhoto: MainPhotoType
    completionDate: String
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
  
  type DynamicProperty {
    id: String
  }

  type Home {
    bannerImage: Images
    bannerHeadline: String
    bannerVideo: String
    sliderProperties: [DynamicProperty]
    topContent: String
    bottomContentHeadline: String
    bottomContentSubheadline: String
    contentImage: String
    testimonialsHeadline: String
    testimonialsSubheadline: String
  }

  type CharityData {
    charityLogo: Images
    charityInformation: String
    charityLink: String
  }

  type About {
    leftContent: String
    image: String
    charityInfoHeadline: String
    charityInformation: [CharityData]
  }


  type MainPhotoType {
    url: String
  }

  # The "Query" type is the root of all GraphQL queries.
  type Query {
    properties(results: Int!): [Property!]!
    property(id: Int!): Property!
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
      return fetch(`https://abbeymillhomes.co.uk/wp-json/wp/v2/properties?per_page=${results}`).then(data => data.json());
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
  DynamicProperty: {
    id: (data) => data.property.ID
  },
  Home: {
    bannerImage: (homeData) => homeData.acf.home_banner_image.sizes,
    bannerHeadline: (homeData) => homeData.acf.home_banner_headline,
    bannerVideo: (homeData) => homeData.acf.home_banner_video,
    sliderProperties: (homeData) => homeData.acf.home_properties,
    topContent: (homeData) => homeData.acf.home_top_content,
    contentImage: (homeData) => homeData.acf.home_content_image,
    bottomContentHeadline: (homeData) => homeData.acf.home_bottom_content_headline,
    bottomContentSubheadline: (homeData) => homeData.acf.home_bottom_content_subheadline,
    testimonialsHeadline: (homeData) => homeData.acf.home_testimonials_headline,
    testimonialsSubheadline: (homeData) => homeData.acf.home_testimonials_subheadline,
  },
  CharityData: {
    charityLogo: (data) => data.charity_logo.sizes,
    charityInformation: (data) => data.charity_information,
    charityLink: (data) => data.charity_link
  },
  About: {
    leftContent: (aboutData) => aboutData.acf.about_left_content,
    image: (aboutData) => aboutData.acf.about_us_image,
    charityInfoHeadline: (aboutData) => aboutData.acf.about_charity_info_headline,
    charityInformation: (aboutData) => aboutData.acf.about_charity_information,
  },
  Gallery: {
    images: (data) => data.sizes
  },
  Property: {
    title: (propData) => propData.title.rendered,
    slug: (propData) => propData.slug,
    featuredImage: (propData) => propData.better_featured_image.media_details.sizes,
    status: (propData) => propData.acf.property_status,
    address: (propData) => propData.acf.property_address,
    description: (propData) => propData.acf.property_description,
    gallery: (propData) => propData.acf.gallery,
    brochure: (propData) => propData.acf.brochure,
    brochureDownload: (propData) => propData.acf.brochure_download,
    specs: (propData) => propData.acf.property_specs,
    price: (propData) => propData.acf.property_price,
    latlng: (propData) => propData.acf.latlng,
    mainPhoto: (propData) => propData.acf.main_photo.sizes,
    completionDate: (propData) => propData.acf.completion_date
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
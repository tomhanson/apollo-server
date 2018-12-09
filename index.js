const { ApolloServer, gql } = require('apollo-server');
const fetch = require('node-fetch');
// const home = require('./mocks/properties');
// const data = require('./mocks/data')
const memoize = require('memoizee');

function convertImageName(param) {
  switch (param) {
    case 'imgXs':
      return 'img-xs'
    case 'propertyTileSm':
      return 'img-property-tile-sm'
    case 'propertyTile':
      return 'img-property-tile'
    case 'propertyTileMd':
      return 'img-property-tile-md'
    case 'propertyTileSquare':
      return 'img-property-tile-sq'
    case 'galleryXs':
      return 'gallery-img-xs'
    case 'gallerySm':
      return 'gallery-img-sm'
    case 'galleryMd':
      return 'gallery-img-md'
    case 'galleryLg':
      return 'gallery-img-lg'
    case 'portfolio':
      return 'img-portfolio'
    case 'portfolioRetina':
      return 'img-portfolio-retina"'
    case 'bgLg':
      return 'bg-img-lg'
    default:
      return param;
  }
}
const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  type Images {
    preload: ImageInfo,
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
    portfolioRetina:ImageInfo,
    bgLg: ImageInfo,
  }

  enum ImageSizes {
    preload
    thumbnail
    medium
    large
    imgXs
    propertyTileSm
    propertyTile
    propertyTileMd
    propertyTileSquare
    galleryXs
    gallerySm
    galleryMd
    galleryLg
    portfolio
    portfolioRetina
    bgLg
  }

  enum NavLocation {
    PRIMARY_NAVIGATION
    FOOTER_NAV_ONE
    FOOTER_NAV_TWO
  }

  enum PageName {
    HOME
    ABOUT_US
    CONTACT_US
    PORTFOLIO
    PROPERTIES
  }
  type Gallery {
    images: Images
  }
  
  type Property {
    id: ID!
    title: String
    slug: String
    featuredImage: FeatImages
    status: String
    address: String
    description: String
    gallery(size: ImageSizes): [ImageInfo]
    brochure(size: ImageSizes): [ImageInfo]
    brochureDownload: String
    specs: String
    price: String
    latlng: String
    mainPhoto(size: ImageSizes): ImageInfo
    completionDate: String
  }

  type ImageInfo {
    width: String,
    height: String,
    url: String
  }

  type FeatImages {
    preload: ImageInfo,
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
    portfolio:ImageInfo,
    portfolioRetina:ImageInfo,

  }
  
  type DynamicProperty {
    propertyData: Property
  }


  type CharityData {
    charityLogo: Images
    charityInformation: String
    charityLink: String
  }


  type Options {
    contactnumber: String
    contactEmail: String
    contactAddress: String
  }

  # The "Query" type is the root of all GraphQL queries.
  type Query {
    properties(results: Int!, offset: Int, exclude: Int, filter: FilterOptions): [Property]!
    property(id: Int!): Property!
    pages(page: String): Page
    options: Options
    navigation(navLocation: NavLocation!): [Navigation!] 
  }

  enum FilterOptions {
    SOLD,
    DEVELOPMENT
  }

  type Navigation {
    id: ID!
    title: String!
    url: String!
  }

  interface Page {
    id: ID!
    slug: String
  }
  type About implements Page {
    id: ID!
    slug: String
    leftContent: String
    image: String
    charityInfoHeadline: String
    charityInformation: [CharityData]
  }
  type Home implements Page {
    id: ID!
    slug: String
    bannerImage(size: ImageSizes): ImageInfo
    bannerHeadline: String
    bannerVideo: String
    sliderProperties: [Property]
    topContent: String
    bottomContentHeadline: String
    bottomContentSubheadline: String
    contentImage(size: ImageSizes): ImageInfo
    testimonialsHeadline: String
    testimonialsSubheadline: String
  }

  type Properties implements Page {
    id: ID!
    slug: String
    title: String
    content: String
  }
  
  type Contact implements Page {
    id: ID!
    slug: String
    mainImage: String
  }
`;
const getNav = (navLocation) => {
  return fetch(`https://abbeymillhomes.co.uk/wp-json/wp-api-menus/v2/menu-locations/${navLocation}`).then(data => data.json()).then(data => data);
}
const memoizeGetNav = memoize(getNav, { maxAge: 1000 * 60 * 60, promise: true })

const getProps = (results, offset, exclude, filter) => {
  const offsetString = offset ? `&offset=${offset}` : ''
  const excludedCategories = exclude ? `&categories_exclude=${exclude}` : '';
  const filtered = filter ? `&filter[meta_key]=property_status&filter[meta_compare]=IN&filter[meta_value]=${filter}` : '';
  // &categories_exclude=3&filter[meta_key]=property_status&filter[meta_compare]=IN&filter[meta_value]=Sold
  return fetch(`https://abbeymillhomes.co.uk/wp-json/wp/v2/properties?per_page=${results}${offsetString}${excludedCategories}${filtered}`).then(data => data.json());
}

const memoizeGetProps = memoize(getProps, { maxAge: 1000 * 60 * 60, promise: true })

const getPages = (page) => {
  return fetch(`https://abbeymillhomes.co.uk/wp-json/wp/v2/pages?slug=${page}`).then(data => data.json()).then(data => data[0]);
}

const memoizeGetPages = memoize(getPages, { maxAge: 1000 * 60 * 60, promise: true })

// Resolvers define the technique for fetching the types in the
// schema.  
const resolvers = {
  Query: {
    properties(_, { results, offset, exclude, filter }) {
      return memoizeGetProps(results, offset, exclude, filter);
    },
    property(_, { id }) {
      return fetch(`https://abbeymillhomes.co.uk/wp-json/wp/v2/properties/${id}`).then(data => data.json());
    },
    pages(_, { page }) {
      return memoizeGetPages(page)
    },
    options(_, { page }) {
      return fetch(`https://abbeymillhomes.co.uk/wp-json/acf/v2/options`).then(data => data.json()).then(data => data.acf);
    },
    navigation(_, { navLocation }) {
      return memoizeGetNav(navLocation);
    }
  },
  Page: {
    slug: (data) => data.slug,
    __resolveType(data, context, info) {
      switch (data.slug) {
        case 'home':
          return 'Home';
        case 'about-us':
          return 'About';
        case 'contact-us':
          return 'Contact';
        case 'our-properties':
          return 'Properties';
        default:
          return null
      }
      return null;
    },
  },

  FilterOptions: {
    'SOLD': 'Sold',
    'DEVELOPMENT': 'Development'
  },

  NavLocation: {
    'PRIMARY_NAVIGATION': 'primary_navigation',
    'FOOTER_NAV_ONE': 'footer_nav_1',
    'FOOTER_NAV_TWO': 'footer_nav_2'
  },
  Navigation: {
    id: ({ ID }) => ID
  },
  Images: {
    preload: (data, args) => ({ width: data['preload-width'], height: data['preload-height'], url: data.preload }),
    thumbnail: (data, args) => ({ width: data['thumbnail-width'], height: data['thumbnail-height'], url: data.thumbnail }),
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
    portfolioRetina: (data) => ({ width: data['img-portfolio-retina-width'], height: data['img-portfolio-retina-height'], url: data['img-portfolio'] }),
    bgLg: (data) => ({ width: data['bg-img-lg-width'], height: data['bg-img-lg-height'], url: data['bg-img-lg'] }),
  },
  FeatImages: {
    preload: ({ preload: data }) => ({ width: data.width, height: data.height, url: data.source_url }),
    thumbnail: ({ thumbnail: data }) => ({ width: data.width, height: data.height, url: data.source_url }),
    medium: ({ medium: data }) => ({ width: data.width, height: data.height, url: data.source_url }),
    large: ({ large: data }) => ({ width: data.width, height: data.height, url: data.source_url }),
    imgXs: (data) => ({ width: data['img-xs'].width, height: data['img-xs'].height, url: data['img-xs'].source_url }),
    propertyTileSm: (data) => ({ width: data['img-property-tile-sm'].width, height: data['img-property-tile-sm'].height, url: data['img-property-tile-sm'].source_url }),
    propertyTile: (data) => ({ width: data['img-property-tile'].width, height: data['img-property-tile'].height, url: data['img-property-tile'].source_url }),
    propertyTileMd: (data) => ({ width: data['img-property-tile-md'].width, height: data['img-property-tile-md'].height, url: data['img-property-tile-md'].source_url }),
    propertyTileSquare: (data) => ({ width: data['img-property-tile-sq'].width, height: data['img-property-tile-sq'].height, url: data['img-property-tile-sq'].source_url }),
    galleryXs: (data) => ({ width: data['gallery-img-xs'].width, height: data['gallery-img-xs'].height, url: data['gallery-img-xs'].source_url }),
    gallerySm: (data) => ({ width: data['gallery-img-sm'].width, height: data['gallery-img-sm'].height, url: data['gallery-img-sm'].source_url }),
    galleryMd: (data) => ({ width: data['gallery-img-md'].width, height: data['gallery-img-md'].height, url: data['gallery-img-md'].source_url }),
    portfolio: (data) => ({ width: data['img-portfolio'].width, height: data['img-portfolio'].height, url: data['img-portfolio'].source_url }),
    portfolioRetina: (data) => ({ width: data['img-portfolio-retina'].width, height: data['img-portfolio-retina'].height, url: data['img-portfolio-retina'].source_url }),
  },
  DynamicProperty: {
    propertyData: (data) => fetch(`https://abbeymillhomes.co.uk/wp-json/wp/v2/properties/${data.property.ID}`).then(data => data.json())
  },
  Home: {
    bannerImage: (homeData, { size }) => ({ width: homeData.acf.home_banner_image.sizes[`${convertImageName(size)}-width`], height: homeData.acf.home_banner_image.sizes[`${convertImageName(size)}-height`], url: homeData.acf.home_banner_image.sizes[`${convertImageName(size)}`] }),
    bannerHeadline: (homeData) => homeData.acf.home_banner_headline,
    bannerVideo: (homeData) => homeData.acf.home_banner_video,
    sliderProperties: (homeData) => homeData.acf.home_properties.map(({ property }) => fetch(`https://abbeymillhomes.co.uk/wp-json/wp/v2/properties/${property.ID}`).then(data => data.json())),
    topContent: (homeData) => homeData.acf.home_top_content,
    contentImage: (homeData, { size }) => ({ width: homeData.acf.home_content_image.sizes[`${convertImageName(size)}-width`], height: homeData.acf.home_content_image.sizes[`${convertImageName(size)}-height`], url: homeData.acf.home_content_image.sizes[convertImageName(size)] }),
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
  Contact: {
    mainImage: (data) => data.acf.contact_main_image
  },
  Options: {
    contactnumber: ({ global_contact_number }) => global_contact_number,
    contactEmail: ({ global_contact_email }) => global_contact_email,
    contactAddress: ({ global_contact_address }) => global_contact_address
  },
  Gallery: {
    images: (data) => data.sizes
  },
  Properties: {
    title: ({ title }) => title.rendered,
    content: ({ content }) => content.rendered,
  },
  Property: {
    title: ({ title }) => title.rendered,
    featuredImage: (propData) => propData.better_featured_image.media_details.sizes,
    status: ({ acf: { property_status } }) => property_status,
    address: (propData) => propData.acf.property_address,
    description: (propData) => propData.acf.property_description,
    gallery: (propData, { size }) => (propData.acf.gallery) ? propData.acf.gallery.map(image => ({ width: image.sizes[`${convertImageName(size)}-width`], height: image.sizes[`${convertImageName(size)}-height`], url: image.sizes[`${convertImageName(size)}`] })) : null,
    brochure: (propData, { size }) => (propData.acf.brochure) ? propData.acf.brochure.map(image => ({ width: image.sizes[`${convertImageName(size)}-width`], height: image.sizes[`${convertImageName(size)}-height`], url: image.sizes[`${convertImageName(size)}`] })) : null,
    brochureDownload: (propData) => propData.acf.brochure_download,
    specs: (propData) => propData.acf.property_specs,
    price: (propData) => propData.acf.property_price,
    latlng: (propData) => propData.acf.latlng,
    mainPhoto: (homeData, { size }) => ({ width: homeData.acf.main_photo.sizes[`${convertImageName(size)}-width`], height: homeData.acf.main_photo.sizes[`${convertImageName(size)}-height`], url: homeData.acf.main_photo.sizes[`${convertImageName(size)}`] }),
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
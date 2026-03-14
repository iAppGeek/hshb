import * as contentful from 'contentful'

export const contentfulClient = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE!,
  accessToken: process.env.CONTENTFUL_TOKEN!,
})

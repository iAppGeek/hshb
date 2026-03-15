import { type Metadata } from 'next'

import { Contact } from '@/sections/Contact'
import { Footer } from '@/sections/Footer'
import { Hero } from '@/sections/Hero'
import { Introduction } from '@/sections/Introduction'
import { Navbar } from '@/sections/Navbar'
import { Events } from '@/sections/Events'
import { Community } from '@/sections/Community'
import { AboutUs } from '@/sections/AboutUs'
import { Testimonials } from '@/components/Testimonials'
import {
  getAccordion,
  getCommunityDirectory,
  getEvents,
  getFeaturedQuotes,
  getHeroVideo,
  getTestimonials,
  getTextSectionData,
} from '@/data/contentful'
import { contentfulClient as client } from '@/data/contentfulClient'
import { Enrolement } from '@/sections/Enrolment'

export const metadata: Metadata = {
  title: 'Greek School in North London | Hellenic School of High Barnet',
  description:
    'HSHB is a Greek language school in Cockfosters, North London. We teach children Greek language, history, and culture. Serving families in Barnet, Enfield, and Hertfordshire.',
  alternates: { canonical: 'https://www.hshb.org.uk' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['EducationalOrganization', 'LocalBusiness'],
  name: 'Hellenic School of High Barnet',
  alternateName: 'HSHB',
  url: 'https://www.hshb.org.uk',
  telephone: '+44-7753-829692',
  email: 'info@hshb.org.uk',
  foundingDate: '1977',
  description:
    'The Hellenic School of High Barnet (HSHB) is an independent Greek language school in Cockfosters, North London, founded in 1977. Over 150 children attend from Nursery through to A Level, learning modern Greek language, history, and culture. The school prepares students for GCSE and A Level Greek examinations.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'East Barnet School, 5 Chestnut Grove',
    addressLocality: 'Cockfosters',
    addressRegion: 'London',
    postalCode: 'EN4 8PU',
    addressCountry: 'GB',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 51.6421,
    longitude: -0.1568,
  },
  areaServed: [
    'Barnet',
    'Enfield',
    'Cockfosters',
    'North London',
    'Hertfordshire',
  ],
  knowsLanguage: ['el', 'en'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Greek Language Education',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Course',
          name: 'Greek Language — Nursery to Primary',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Course', name: 'Greek Language — GCSE' },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Course', name: 'Greek Language — A Level' },
      },
    ],
  },
  nonprofit: true,
  legalName: 'The Hellenic School of High Barnet Limited',
  sameAs: [
    'https://twitter.com/HSHBInfo',
    'https://www.facebook.com/eastbarnetgreekschool/',
    'https://register-of-charities.charitycommission.gov.uk/en/charity-search/-/charity-details/1053527',
    'https://find-and-update.company-information.service.gov.uk/company/03132566',
  ],
}

const Home = async () => {
  const heroText = await getTextSectionData(client, 'hero-section')
  const heroVideoUrl = await getHeroVideo(client)

  const quotes = await getFeaturedQuotes(client)
  const introText = await getTextSectionData(client, 'spotlight-section')

  const aboutUsText = await getTextSectionData(client, 'aboutUs-blurb')
  const aboutHighlight1 = await getTextSectionData(
    client,
    'aboutUs-highlighted-1',
  )
  const aboutHighlight2 = await getTextSectionData(
    client,
    'aboutUs-highlighted-2',
  )
  const aboutUsAcordian = await getAccordion(client, 'About Us')

  const admissionsText = await getTextSectionData(client, 'admissions-blurb')

  const contactText = await getTextSectionData(client, 'contact-text')
  const contactEmail = await getTextSectionData(client, 'contact-email')
  const contactNumber = await getTextSectionData(client, 'contact-number')
  const contactAddress = await getTextSectionData(client, 'contact-address')

  const directory = await getCommunityDirectory(client)

  const events = await getEvents(client)

  const testimonials = await getTestimonials(client)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <Hero heroText={heroText} quotes={quotes} />
      <Introduction text={introText} videoUrl={heroVideoUrl} />

      <AboutUs
        text={aboutUsText}
        highlightedTexts={[aboutHighlight1, aboutHighlight2]}
        accordian={aboutUsAcordian}
      />

      <Community directory={directory} />

      <Events events={events} />

      <Enrolement text={admissionsText} />
      <Testimonials testimonials={testimonials} />

      <Contact
        text={contactText}
        address={contactAddress}
        email={contactEmail}
        number={contactNumber}
      />

      <Footer />
    </>
  )
}

export default Home

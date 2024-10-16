import * as contentful from 'contentful'

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
  getFeaturedQuote,
  getTestimonials,
  getTextSectionData,
} from '@/data/contentful'

const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE,
  accessToken: process.env.CONTENTFUL_TOKEN,
})

const Home = async () => {
  const heroText = await getTextSectionData(client, 'hero-section')
  const quote = await getFeaturedQuote(client)
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

  const contactText = await getTextSectionData(client, 'contact-text')
  const contactEmail = await getTextSectionData(client, 'contact-email')
  const contactNumber = await getTextSectionData(client, 'contact-number')
  const contactAddress = await getTextSectionData(client, 'contact-address')

  const directory = await getCommunityDirectory(client)

  const events = await getEvents(client)

  const testimonials = await getTestimonials(client)

  return (
    <>
      <Navbar />

      <Hero heroText={heroText} quote={quote} />
      <Introduction text={introText} />

      <AboutUs
        text={aboutUsText}
        highlightedTexts={[aboutHighlight1, aboutHighlight2]}
        accordian={aboutUsAcordian}
      />

      <Community directory={directory} />

      <Events events={events} />
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

import * as contentful from 'contentful'

import { Contact } from '@/sections/Contact'
import { Footer } from '@/sections/Footer'
import { Hero } from '@/sections/Hero'
import { Introduction } from '@/sections/Introduction'
import { Navbar } from '@/sections/Navbar'
import { Events } from '@/sections/Events'
import { Community } from '@/sections/Community'
import { AboutUs } from '@/sections/AboutUs'
import avatarImage2 from '@/images/avatars/avatar-2.png'
import { Testimonial } from '@/components/Testimonial'
import { Testimonials } from '@/components/Testimonials'
import {
  getCommunityDirectory,
  getEvents,
  getFeaturedQuote,
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
  const aboutUsText = await getTextSectionData(client, 'aboutUs-section')

  const contactText = await getTextSectionData(client, 'contact-text')
  const contactEmail = await getTextSectionData(client, 'contact-email')
  const contactNumber = await getTextSectionData(client, 'contact-number')
  const contactAddress = await getTextSectionData(client, 'contact-address')

  const directory = await getCommunityDirectory(client)

  const events = await getEvents(client)

  return (
    <>
      <Navbar />

      <Hero heroText={heroText} quote={quote} />
      <Introduction text={introText} />

      <AboutUs text={aboutUsText} />
      <Testimonial
        id="testimonial-from-tommy-stroman"
        author={{
          name: 'Tommy Stroman',
          role: 'Front-end developer',
          image: avatarImage2,
        }}
      >
        <p>
          “I didn’t know a thing about icon design until I read this book. Now I
          can create any icon I need in no time. Great resource!”
        </p>
      </Testimonial>

      <Community directory={directory} />

      <Events events={events} />
      <Testimonials />

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

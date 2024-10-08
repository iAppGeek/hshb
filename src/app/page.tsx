import { Contact } from '@/sections/Contact'
import { Footer } from '@/sections/Footer'
import { Hero } from '@/sections/Hero'
import { Introduction } from '@/sections/Introduction'
import { Navbar } from '@/sections/Navbar'
import { Events } from '@/sections/Events'
import { Community } from '@/sections/Community'
import { AboutUs } from '@/sections/AboutUs'
import { Testimonial } from '@/components/Testimonial'
import { Testimonials } from '@/components/Testimonials'
import avatarImage1 from '@/images/avatars/avatar-1.png'

export default function Home() {
  return (
    <>
      <Navbar />

      <Hero />
      <Introduction />

      <AboutUs />
      <Testimonial
        id="testimonial-from-tommy-stroman"
        author={{
          name: 'Tommy Stroman',
          role: 'Front-end developer',
          image: avatarImage1,
        }}
      >
        <p>
          “I didn’t know a thing about icon design until I read this book. Now I
          can create any icon I need in no time. Great resource!”
        </p>
      </Testimonial>
      
      <Community />
      
      <Events />
      <Testimonials />
      
      <Contact />

      <Footer />
    </>
  )
}

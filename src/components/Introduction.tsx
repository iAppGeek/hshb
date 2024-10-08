import { Container } from '@/components/Container'
import coverImage from '@/images/logo.png'

export function Introduction() {
  return (
    <section
      id="introduction"
      aria-label="Introduction"
      className="pb-16 pt-20 sm:pb-20 md:pt-36 lg:py-32"
    >
      <Container className="text-lg tracking-tight text-slate-700">
        <p className="font-display text-4xl font-bold tracking-tight text-slate-900">
        "Students and staff have worked very hard to make HSHB the outstanding school it is and we are all proud of our achievements.
        </p>
        
        <div>
        <video src="assets/video/drone.webm" autoPlay loop></video>
        </div>
      </Container>
    </section>
  )
}

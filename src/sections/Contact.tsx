import { ContactForm, type ContactFormProps } from '@/components/ContactForm'

export const Contact = (props: ContactFormProps) => {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="py-4 m:py-6 lg:py-10">
      <ContactForm {...props} />
      <div>
        <iframe title="map-location" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4997.911542211335!2d-0.15680473521513305!3d51.64212411557962!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876184d9db5d43f%3A0x81b210a5b54871a3!2sHellenic%20School%20Of%20High%20Barnet%20Committee!5e0!3m2!1sen!2suk!4v1728414601898!5m2!1sen!2suk" width="100%" height="400" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </section>
  )
}

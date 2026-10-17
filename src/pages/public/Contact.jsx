import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import EnquiryLink from "./EnquiryLink";

export default function Contact() {
  return (
    <div className="public-inner-page">
      <section className="public-page-hero">
        <span className="public-eyebrow">CONTACT US</span>
        <h1>We’re here to <em>help.</em></h1>
        <p>Questions about INSTITEXA or interested in learning more? Get in touch and we’ll be happy to hear from you.</p>
      </section>
      <section className="contact-card">
        <div className="contact-card-icon"><Mail size={27} /></div>
        <div className="contact-card-copy">
          <span className="public-eyebrow">EMAIL OUR TEAM</span>
          <h2>Start a conversation</h2>
          <p>Send us a message about the product, a demo, or anything else you’d like to know.</p>
          <a href="mailto:kavitac029@gmail.com">kavitac029@gmail.com <ArrowRight size={17} /></a>
        </div>
        <MessageCircle className="contact-card-decoration" size={90} />
      </section>
      <section className="contact-extra">
        <h2>Looking for product information?</h2>
        <p>Send us your details and what you’d like to know. We’ll follow up with you.</p>
        <EnquiryLink className="public-button">Send an enquiry <ArrowRight size={18} /></EnquiryLink>
      </section>
    </div>
  );
}

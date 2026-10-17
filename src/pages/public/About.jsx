import { ArrowRight, HeartHandshake, Lightbulb, UserRound } from "lucide-react";
import EnquiryLink from "./EnquiryLink";

export default function About() {
  return (
    <div className="public-inner-page">
      <section className="public-page-hero">
        <span className="public-eyebrow">ABOUT INSTITEXA</span>
        <h1>Built with coaching institutes <em>in mind.</em></h1>
        <p>We believe the tools behind a great learning experience should make everyday work feel simpler, clearer, and more connected.</p>
      </section>
      <section className="about-story">
        <div className="about-story-mark"><Lightbulb size={28} /></div>
        <div>
          <span className="public-eyebrow">OUR PURPOSE</span>
          <h2>Give educators more room to focus on what matters.</h2>
          <p>INSTITEXA brings essential coaching operations—students, batches, attendance, tests, and fee tracking—into one practical platform. We want institute teams to spend less time coordinating information and more time helping learners move forward.</p>
        </div>
      </section>
      <section className="about-owner">
        <div className="about-owner-icon"><UserRound size={32} /></div>
        <div>
          <span className="public-eyebrow">MEET THE OWNER</span>
          <h2>Kavita Singh</h2>
          <p>Kavita brings good experience in product handling and a thoughtful, hands-on perspective to INSTITEXA. Her focus is on shaping a useful, dependable product for the people who keep coaching institutes running.</p>
        </div>
        <HeartHandshake className="about-owner-heart" size={38} />
      </section>
      <section className="public-page-cta">
        <div><h2>Let’s make your institute’s work a little simpler.</h2><p>Tell us about your needs and we’ll help you get started.</p></div>
        <EnquiryLink className="public-button">Talk to our team <ArrowRight size={18} /></EnquiryLink>
      </section>
    </div>
  );
}

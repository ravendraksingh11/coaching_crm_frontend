import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, BookOpenCheck, CalendarCheck, ChartNoAxesCombined, CheckCircle2, ClipboardList, IndianRupee, LoaderCircle, MessageSquareText, UsersRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logoHero from "../../assets/logo_hero.png";
import { submitProductEnquiry } from "../../api/enquiries.api";
import EnquiryLink from "./EnquiryLink";

const features = [
  {
    icon: <UsersRound />,
    title: "Student & batch management",
    description: "Keep student profiles, courses, and batches organized in one place.",
  },
  {
    icon: <CalendarCheck />,
    title: "Attendance made clear",
    description: "Record attendance and help students and parents stay informed.",
  },
  {
    icon: <ClipboardList />,
    title: "Tests & results",
    description: "Create tests, track submissions, and make progress easier to follow.",
  },
  {
    icon: <IndianRupee />,
    title: "Fee tracking",
    description: "Manage fee plans, due amounts, and payment records with less manual work.",
  },
];

const initialForm = { fullName: "", mobile: "", email: "", enquiry: "" };

export default function Product() {
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (location.pathname === "/institexa" && location.hash === "#enquiry") {
      requestAnimationFrame(() => {
        document.getElementById("enquiry")?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [location.pathname, location.hash]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitted(false);
    setSubmitting(true);

    try {
      await submitProductEnquiry(form);
      setForm(initialForm);
      setSubmitted(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "We couldn't send your enquiry. Please try again or email us directly."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="product-hero">
        <div className="product-hero-inner">
          <div className="product-hero-copy">
            <span className="public-eyebrow"><span /> A simpler way to run your institute</span>
            <h1>More time for teaching.<br /><em>Less time on admin.</em></h1>
            <p>
              INSTITEXA brings your students, batches, attendance, tests, and fee
              tracking together—so your coaching institute can run smoothly every day.
            </p>
            <div className="product-hero-actions">
              <EnquiryLink className="public-button">Talk to our team <ArrowRight size={18} /></EnquiryLink>
              <a className="public-text-link" href="#features">Explore the product <ArrowDown size={16} /></a>
            </div>
            <div className="product-hero-note">
              <CheckCircle2 size={17} /> Designed around the day-to-day of coaching institutes
            </div>
          </div>
          <div className="product-hero-art">
            <div className="hero-art-glow" />
            <img src={logoHero} alt="INSTITEXA coaching institute management" />
            <div className="hero-art-caption"><BookOpenCheck size={17} /> One connected place for your institute</div>
          </div>
        </div>
        <div className="product-hero-bottom">
          <span>STUDENTS</span><i /><span>CLASSES</span><i /><span>ATTENDANCE</span><i /><span>PROGRESS</span>
        </div>
      </section>

      <section className="public-section product-intro" id="features">
        <div className="public-section-heading">
          <span className="public-eyebrow">THE INSTITEXA PLATFORM</span>
          <h2>All the essentials, <em>working together.</em></h2>
          <p>Spend less time switching between lists and more time supporting your students.</p>
        </div>
        <div className="product-feature-grid">
          {features.map((feature, index) => (
            <article className="product-feature-card" key={feature.title}>
              <div className="product-feature-icon">{feature.icon}</div>
              <span className="product-feature-number">0{index + 1}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
        <div className="product-benefit">
          <div className="product-benefit-icon"><ChartNoAxesCombined /></div>
          <div><strong>A clearer view of the whole institute</strong><p>Bring everyday operations into one organized workflow for your team.</p></div>
          <Link to="/about">Get to know INSTITEXA <ArrowRight size={17} /></Link>
        </div>
      </section>

      <section className="enquiry-section" id="enquiry">
        <div className="enquiry-copy">
          <span className="public-eyebrow">LET'S TALK</span>
          <h2>Curious what INSTITEXA can do for you?</h2>
          <p>Tell us a little about what you need. Our team will get in touch to help you explore the product.</p>
          <div className="enquiry-contact">
            <MessageSquareText size={18} />
            <span>Prefer email? <a href="mailto:kavitac029@gmail.com">kavitac029@gmail.com</a></span>
          </div>
        </div>
        <form className="enquiry-form" onSubmit={handleSubmit}>
          <div className="enquiry-form-heading">
            <h3>Request product information</h3>
            <span>We’ll be in touch with you.</span>
          </div>
          {submitted && <div className="enquiry-notice success" role="status">Thank you! Your enquiry has been sent. We’ll contact you soon.</div>}
          {error && <div className="enquiry-notice failure" role="alert">{error}</div>}
          <label>
            Full name
            <input name="fullName" autoComplete="name" maxLength="120" value={form.fullName} onChange={updateField} placeholder="Your name" required />
          </label>
          <div className="enquiry-form-row">
            <label>
              Mobile number
              <input name="mobile" type="tel" autoComplete="tel" minLength="7" maxLength="20" value={form.mobile} onChange={updateField} placeholder="+91 98765 43210" required />
            </label>
            <label>
              Email address
              <input name="email" type="email" autoComplete="email" maxLength="254" value={form.email} onChange={updateField} placeholder="you@example.com" required />
            </label>
          </div>
          <label>
            Your enquiry
            <textarea name="enquiry" minLength="5" maxLength="2000" rows="4" value={form.enquiry} onChange={updateField} placeholder="What would you like to know about INSTITEXA?" required />
          </label>
          <button className="public-button enquiry-submit" type="submit" disabled={submitting}>
            {submitting ? <><LoaderCircle className="spinning" size={18} /> Sending…</> : <>Submit enquiry <ArrowRight size={18} /></>}
          </button>
          <small>By submitting, you agree to our <Link to="/privacy-policy">Privacy Policy</Link>.</small>
        </form>
      </section>
    </>
  );
}

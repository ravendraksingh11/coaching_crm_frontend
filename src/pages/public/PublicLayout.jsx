import { Link, NavLink, Outlet } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import logo from "../../assets/logo.png";
import EnquiryLink from "./EnquiryLink";

const links = [
  { to: "/shikvanta", label: "Product", end: true },
  { to: "/about", label: "About us" },
  { to: "/contact", label: "Contact" },
];

export default function PublicLayout() {
  return (
    <div className="public-site">
      <header className="public-header">
        <div className="public-header-inner">
          <Link className="public-brand" to="/shikvanta" aria-label="Shikvanta home">
            <img src={logo} alt="Shikvanta" />
          </Link>
          <nav className="public-nav" aria-label="Main navigation">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <EnquiryLink className="public-header-cta">
            Request a demo <ArrowUpRight size={16} />
          </EnquiryLink>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="public-footer-main">
          <div>
            <Link className="public-brand" to="/shikvanta" aria-label="Shikvanta home">
              <img src={logo} alt="Shikvanta" />
            </Link>
            <p>Thoughtful tools for better-run coaching institutes.</p>
          </div>
          <div className="public-footer-links">
            <Link to="/about">About us</Link>
            <Link to="/contact">Contact us</Link>
            <Link to="/privacy-policy">Privacy policy</Link>
            <Link to="/terms-and-conditions">Terms &amp; conditions</Link>
          </div>
          <a className="public-footer-email" href="mailto:kavitac029@gmail.com">
            kavitac029@gmail.com
          </a>
        </div>
        <div className="public-footer-bottom">
          <span>© {new Date().getFullYear()} Shikvanta</span>
          <span>Made for coaching institutes</span>
        </div>
      </footer>
    </div>
  );
}

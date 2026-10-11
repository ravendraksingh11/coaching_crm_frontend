import { Link, useLocation } from "react-router-dom";

export default function EnquiryLink({ children, ...props }) {
  const location = useLocation();

  function handleClick(event) {
    if (location.pathname === "/shikvanta" && location.hash === "#enquiry") {
      event.preventDefault();
      document.getElementById("enquiry")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <Link to="/shikvanta#enquiry" onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}

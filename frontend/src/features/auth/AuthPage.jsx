import { useNavigate } from "react-router-dom";
import AuthFormCard from "./AuthFormCard";
import "./AuthPage.css";

export default function AuthPage() {
  const navigate = useNavigate();

  function handleSuccess(user) {
    if (user.role === "ORGANIZER") {
      navigate("/organizer");
    } else if (user.role === "STAFF") {
      navigate("/checkin");
    } else {
      navigate("/");
    }
  }

  return (
    <div className="auth-page">
      <p className="auth-logo">
        <img src="/logo-elite.png" alt="" className="auth-logo-icon" />
        EliteTicket
      </p>

      <AuthFormCard onSuccess={handleSuccess} />
    </div>
  );
}

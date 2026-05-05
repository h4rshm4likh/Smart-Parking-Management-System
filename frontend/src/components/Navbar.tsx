import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex justify-between items-center">
      <Link to={user?.role === "admin" ? "/admin" : "/dashboard"} className="text-xl font-bold text-white tracking-tight">
        Smart Parking System
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-neutral-400 text-sm">Welcome, {user?.name}</span>
        <button 
          onClick={handleLogout}
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

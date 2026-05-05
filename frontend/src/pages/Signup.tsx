import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { SparklesCore } from "../components/ui/sparkles";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicle_number: "",
    password: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/register", formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={800}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>
      <div className="max-w-md w-full bg-neutral-900/80 backdrop-blur-md rounded-xl p-8 border border-neutral-800 shadow-2xl relative z-10">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Full Name</label>
            <input 
              type="text" name="name"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              onChange={handleChange} required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
            <input 
              type="email" name="email"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              onChange={handleChange} required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Phone Number</label>
            <input 
              type="tel" name="phone"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              onChange={handleChange} required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Vehicle Plate Number</label>
            <input 
              type="text" name="vehicle_number"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              onChange={handleChange} required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Password</label>
            <input 
              type="password" name="password"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              onChange={handleChange} required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-6"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-400">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

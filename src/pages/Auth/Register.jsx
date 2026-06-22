import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsFillExclamationDiamondFill, BsFillCheckCircleFill } from "react-icons/bs";
import { ImSpinner2 } from "react-icons/im";
import { useAuth } from "../../contexts/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { signUp, session, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [waitingRedirect, setWaitingRedirect] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Jika register langsung login (email confirmation OFF), redirect otomatis
  useEffect(() => {
    if (waitingRedirect && session && profile) {
      setWaitingRedirect(false);
      setLoading(false);
      if (profile.role === "admin") {
        navigate("/administrator/dashboard", { replace: true });
      } else {
        navigate("/member/dashboard", { replace: true });
      }
    }
  }, [waitingRedirect, session, profile, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Password and Confirm Password do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { data, error: authError } = await signUp(form.email, form.password, form.fullName);

    if (authError) {
      setError(authError.message || "Registration failed");
      setLoading(false);
      return;
    }

    // Cek apakah user langsung confirmed (email confirmation OFF)
    if (data?.session) {
      // Langsung login — tunggu profile dari AuthContext lalu redirect
      setWaitingRedirect(true);
      setTimeout(() => {
        setWaitingRedirect(false);
        setLoading(false);
        navigate("/member/dashboard", { replace: true });
      }, 5000);
    } else {
      // Email confirmation ON — minta user cek email
      setSuccess("Registrasi berhasil! Cek email kamu untuk verifikasi, lalu login.");
      setLoading(false);
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  const errorInfo = error ? (
    <div className="bg-red-200 mb-5 p-4 text-sm font-light text-gray-600 rounded flex items-center">
      <BsFillExclamationDiamondFill className="text-red-600 me-2 text-lg" />
      {error}
    </div>
  ) : null;

  const successInfo = success ? (
    <div className="bg-green-200 mb-5 p-4 text-sm font-light text-gray-600 rounded flex items-center">
      <BsFillCheckCircleFill className="text-green-600 me-2 text-lg" />
      {success}
    </div>
  ) : null;

  const loadingInfo = loading ? (
    <div className="bg-gray-200 mb-5 p-4 text-sm rounded flex items-center">
      <ImSpinner2 className="me-2 animate-spin" />
      Processing...
    </div>
  ) : null;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
        Create Your Account ✨
      </h2>

      {errorInfo}
      {successInfo}
      {loadingInfo}

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400"
            placeholder="Your full name"
            required
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400"
            placeholder="********"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400"
            placeholder="********"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
        >
          Register
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-green-600 font-semibold hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}

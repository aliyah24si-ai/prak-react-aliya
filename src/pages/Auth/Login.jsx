import { useState, useEffect } from "react";
import { BsFillExclamationDiamondFill } from "react-icons/bs";
import { ImSpinner2 } from "react-icons/im";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, profile, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [waitingRedirect, setWaitingRedirect] = useState(false);
  const [dataForm, setDataForm] = useState({
    email: "",
    password: "",
  });

  // Setelah login berhasil, tunggu profile dari AuthContext lalu redirect
  useEffect(() => {
    if (waitingRedirect && session && profile) {
      setLoading(false);
      setWaitingRedirect(false);
      if (profile.role === "admin") {
        navigate("/administrator/dashboard", { replace: true });
      } else if (profile.role === "member") {
        navigate("/member/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [waitingRedirect, session, profile, navigate]);

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setDataForm({ ...dataForm, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await signIn(dataForm.email, dataForm.password);

    if (authError) {
      setError(authError.message || "Login failed");
      setLoading(false);
      return;
    }

    // Tandai bahwa kita menunggu profile dari AuthContext
    setWaitingRedirect(true);
    // Timeout fallback: kalau 8 detik profile belum ada, redirect ke /
    setTimeout(() => {
      setWaitingRedirect((prev) => {
        if (prev) {
          setLoading(false);
          navigate("/", { replace: true });
        }
        return false;
      });
    }, 8000);
  };

  const errorInfo = error ? (
    <div className="bg-red-200 mb-5 p-5 text-sm font-light text-gray-600 rounded flex items-center">
      <BsFillExclamationDiamondFill className="text-red-600 me-2 text-lg" />
      {error}
    </div>
  ) : null;

  const loadingInfo = loading ? (
    <div className="bg-gray-200 mb-5 p-5 text-sm rounded flex items-center">
      <ImSpinner2 className="me-2 animate-spin" />
      Mohon Tunggu...
    </div>
  ) : null;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
        Welcome Back 👋
      </h2>

      {errorInfo}
      {loadingInfo}

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="text"
            id="email"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400"
            placeholder="you@example.com"
            name="email"
            value={dataForm.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400"
            placeholder="********"
            name="password"
            value={dataForm.password}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
        >
          Login
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        Don't have an account?{" "}
        <Link to="/register" className="text-green-600 font-semibold hover:underline">
          Register
        </Link>
      </p>
      <p className="text-center text-sm mt-2">
        <Link to="/forgot" className="text-gray-500 hover:underline">
          Forgot password?
        </Link>
      </p>
    </div>
  );
}

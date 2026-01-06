import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });

      // Always success (anti-enumeration)
      toast.success(
        "If an account exists, a password reset link has been sent."
      );
      setEmail("");
    } catch {
      toast.error("Unable to send reset email. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-sm space-y-6"
      >
        <h2 className="text-xl font-semibold text-center">
          Forgot your password?
        </h2>

        <p className="text-sm text-gray-500 text-center">
          Enter your email and we’ll send you a reset link.
        </p>

        <input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>

        <div className="text-center text-sm">
          <Link to="/signin" className="text-blue-600 hover:underline">
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}

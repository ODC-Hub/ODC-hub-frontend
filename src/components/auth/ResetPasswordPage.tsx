import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState(false);
  const [strength, setStrength] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return <p className="text-center mt-20">Invalid reset link</p>;
  }

  const evaluateStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[\W_]/.test(password)) score++;

    if (score <= 2) return "Weak";
    if (score === 3) return "Medium";
    return "Strong";
  };

  const validate = () => {
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    if (
      form.newPassword.length < 8 ||
      !/[A-Z]/.test(form.newPassword) ||
      !/[a-z]/.test(form.newPassword) ||
      !/\d/.test(form.newPassword) ||
      !/[\W_]/.test(form.newPassword)
    ) {
      toast.error(
        "Password must contain upper, lower, number and special character"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: form.newPassword,
      });

      toast.success("Password updated successfully");
      setTimeout(() => navigate("/signin"), 1500);
    } catch (err: any) {
      toast.error(err.response?.data || "Reset link expired or invalid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md space-y-6"
      >
        <h2 className="text-xl font-semibold text-center">
          Reset your password
        </h2>

        <div className="relative">
          <input
            type={show ? "text" : "password"}
            placeholder="New password"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            value={form.newPassword}
            onChange={(e) => {
              setForm({ ...form, newPassword: e.target.value });
              setStrength(evaluateStrength(e.target.value));
            }}
            required
          />

          
        </div>

        {form.newPassword && (
          <p
            className={`text-sm ${
              strength === "Strong"
                ? "text-green-600"
                : strength === "Medium"
                ? "text-yellow-600"
                : "text-red-500"
            }`}
          >
            Strength: {strength}
          </p>
        )}

        <input
          type={show ? "text" : "password"}
          placeholder="Confirm password"
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
          required
        />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" onChange={() => setShow(!show)} />
          Show passwords
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition"
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </div>
  );
}

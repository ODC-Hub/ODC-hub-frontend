import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

import api from "../../api/axios";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { AuthContext } from "../../context/AuthContext";

export default function SignInForm() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  if (!auth) throw new Error("AuthContext missing");

  const { login } = auth;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const redirectByRole = (role: string) => {
    if (role === "ADMIN") {
      navigate("/admin/users/pending");
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Login → cookies set
      await api.post("/auth/login", {
        email,
        password,
      });

      // 2️⃣ Fetch current user
      const res = await api.get("/auth/me");

      // 3️⃣ Save in context
      login(res.data);

      toast.success("Login successful");

      // 4️⃣ Redirect
      redirectByRole(res.data.role);
    } catch (err: any) {
      const status = err.response?.status;
      const data = err.response?.data;
      
      console.log("LOGIN ERROR:", status, data);

      if (status === 423) {
        toast.error(data || "Your account is locked. Try again later.");
        return;
      }

      if (status === 401) {
      toast.error(data || "Invalid email or password");
        return;
      }

      if (typeof data === "string") {
        toast.error(data);
        return;
      }

      toast.error("Login failed");
    }finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md px-4 py-10 mx-auto sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
          Sign in
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Access your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <Label>Email *</Label>
          <Input
            type="email"
            value={email}
            placeholder="you@email.com"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div>
          <Label>Password *</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="flex justify-end text-sm">
          <Link
            to="/forgot-password"
            className="text-brand-500 hover:text-brand-600"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-700 dark:text-gray-400">
        Don’t have an account?{" "}
        <Link
          to="/signup"
          className="text-brand-500 hover:text-brand-600 font-medium"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

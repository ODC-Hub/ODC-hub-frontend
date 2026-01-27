import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

type Errors = {
  email?: string;
  password?: string;
  role?: string;
};

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* 🔐 Password live checks */
  const passwordChecks = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[@$!%*?&]/.test(formData.password),
  };

  const validateForm = () => {
    const newErrors: Errors = {};

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!STRONG_PASSWORD_REGEX.test(formData.password)) {
      newErrors.password =
        "Password must meet all security requirements";
    }

    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!isChecked) {
      setMessage("You must agree to the terms and conditions");
      return;
    }

    if (!validateForm()) return;

    try {
      setLoading(true);

      await api.post("/auth/register", {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setMessage(
        "Signup request sent. Await admin approval. You will receive an email once approved."
      );

      setFormData({ email: "", password: "", role: "" });
      setErrors({});
      setIsChecked(false);
    } catch (err: any) {
      setMessage(
        err.response?.data?.message ||
          "Signup failed. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const Rule = ({ ok, text }: { ok: boolean; text: string }) => (
    <li className={`flex items-center gap-2 ${ok ? "text-green-600" : "text-gray-400"}`}>
      <span>{ok ? "✔" : "•"}</span>
      {text}
    </li>
  );

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 px-4 sm:px-8 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto py-10">

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Signup requires admin approval.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@email.com"
              required
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <Label>Password *</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeIcon className="w-5 h-5 fill-gray-500" />
                ) : (
                  <EyeCloseIcon className="w-5 h-5 fill-gray-500" />
                )}
              </span>
            </div>

            {/* LIVE PASSWORD FEEDBACK */}
            <ul className="text-xs mt-2 space-y-1">
              <Rule ok={passwordChecks.length} text="At least 8 characters" />
              <Rule ok={passwordChecks.upper} text="One uppercase letter" />
              <Rule ok={passwordChecks.lower} text="One lowercase letter" />
              <Rule ok={passwordChecks.number} text="One number" />
              <Rule ok={passwordChecks.special} text="One special character (@$!%*?&)" />
            </ul>

            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <Label>Role *</Label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Select a role</option>
              <option value="BOOTCAMPER">Bootcamper</option>
              <option value="FORMATEUR">Formateur</option>
            </select>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <Checkbox checked={isChecked} onChange={setIsChecked} />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              I agree to the <span className="font-medium">Terms</span> and{" "}
              <span className="font-medium">Privacy Policy</span>.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium rounded-lg"
          >
            {loading ? "Submitting..." : "Sign Up"}
          </button>

          {message && (
            <p
              className={`text-sm text-center mt-2 ${
                message.toLowerCase().includes("sent")
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>

        <div className="mt-6 text-sm text-center text-gray-700 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/signin" className="text-brand-500 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../api/axios";

type Status = "pending" | "success" | "expired" | "error";

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("pending");
  const [message, setMessage] = useState("");

  const calledRef = useRef(false);

  useEffect(() => {
    if (!token || calledRef.current) return;
    calledRef.current = true;

    const activateAccount = async () => {
      try {
        const res = await api.get("/auth/activate", {
          params: { token },
        });

        setStatus("success");
        setMessage(
          typeof res.data === "string"
            ? res.data
            : "Account activated successfully."
        );
      } catch (err: any) {
        const backendMsg =
          err.response?.data?.message ||
          err.response?.data ||
          "Activation failed.";

        const msg = backendMsg.toString().toLowerCase();

        if (msg.includes("expired")) {
          setStatus("expired");
        } else {
          setStatus("error");
        }

        setMessage(backendMsg);
      }
    };

    activateAccount();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50 dark:bg-gray-900">
      {status === "pending" && (
        <p className="text-lg text-gray-700 dark:text-gray-300">
          🔄 Activating your account...
        </p>
      )}

      {status === "success" && (
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-green-600">
            🎉 Account Activated
          </h1>
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
          <Link
            to="/signin"
            className="inline-block bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 rounded-lg transition"
          >
            Go to Login
          </Link>
        </div>
      )}

      {status === "expired" && (
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-red-600">
            ❌ Activation Link Expired
          </h1>
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
          <p className="text-sm text-gray-500">
            Please contact an administrator.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-red-600">
            ❌ Activation Failed
          </h1>
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
        </div>
      )}
    </div>
  );
}

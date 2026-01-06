import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { toast } from "react-toastify";
import { changePassword } from "../../api/auth";
import { Eye, EyeOff } from "lucide-react";

export default function UpdatePasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =======================
     VALIDATION
  ======================= */
  const validate = () => {
    const e: any = {};

    if (!form.currentPassword) {
      e.currentPassword = "Current password is required";
    }

    if (!form.newPassword) {
      e.newPassword = "New password is required";
    } else {
      if (form.newPassword.length < 8)
        e.newPassword = "Password must be at least 8 characters";
      else if (!/[A-Z]/.test(form.newPassword))
        e.newPassword = "Must contain an uppercase letter";
      else if (!/[a-z]/.test(form.newPassword))
        e.newPassword = "Must contain a lowercase letter";
      else if (!/[0-9]/.test(form.newPassword))
        e.newPassword = "Must contain a number";
      else if (!/[\W_]/.test(form.newPassword))
        e.newPassword = "Must contain a special character";
    }

    if (form.confirmPassword !== form.newPassword) {
      e.confirmPassword = "Passwords do not match";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* =======================
     SUBMIT
  ======================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      toast.success("Password updated successfully");

      handleClose();
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Change password failed";

      toast.error(message);

      if (message.toLowerCase().includes("current")) {
        setErrors((p) => ({ ...p, currentPassword: message }));
      } else {
        setErrors((p) => ({ ...p, newPassword: message }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setErrors({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShow(false);
    onClose();
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Change password
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* CURRENT PASSWORD */}
              <div>
                <input
                  type={show ? "text" : "password"}
                  placeholder="Current password"
                  value={form.currentPassword}
                  onChange={(e) =>
                    setForm({ ...form, currentPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                {errors.currentPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* NEW PASSWORD */}
              <div>
                <input
                  type={show ? "text" : "password"}
                  placeholder="New password"
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                {errors.newPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* CONFIRM */}
              <div>
                <input
                  type={show ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* SHOW PASSWORD */}
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  {show ? "Hide passwords" : "Show passwords"}
                </button>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update password"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}

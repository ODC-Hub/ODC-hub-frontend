import { useState } from "react";
import UpdatePasswordModal from "./UpdatePasswordModal";
import { Lock } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function AccountSettings() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Account Settings" />
      <div className="p-8 max-w-3xl mx-auto">

        <div
          onClick={() => setOpen(true)}
          className="mt-10 flex items-start gap-6 cursor-pointer rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow transition bg-white dark:bg-gray-800"
        >
          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 p-3 rounded-full">
            <Lock className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change password</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your account password
            </p>
          </div>
        </div>

        <UpdatePasswordModal isOpen={open} onClose={() => setOpen(false)} />
      </div>
    </>

  );
}

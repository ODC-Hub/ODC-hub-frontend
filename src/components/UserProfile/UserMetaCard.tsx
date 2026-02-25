import { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import {
  getMyProfile,
  updateProfile,
  uploadAvatar,
  Profile,
} from "../../api/profile";
import { toast } from "react-toastify";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* =======================
     LOAD PROFILE
  ======================= */
  useEffect(() => {
    getMyProfile()
      .then((data) => {
        setProfile(data);
        setForm(data);
      })
      .catch(() => toast.error("Failed to load profile"));
  }, []);

  /* =======================
     AVATAR UPLOAD
  ======================= */
  const handleAvatarChange = async (file: File) => {
    try {
      setAvatarPreview(URL.createObjectURL(file));
      await uploadAvatar(file);

      const refreshed = await getMyProfile();
      setProfile(refreshed);
      setForm(refreshed);
      setAvatarPreview(null);

      toast.success("Avatar updated");

    } catch {
      toast.error("Avatar upload failed");
    }
  };

  /* =======================
     SAVE PROFILE
  ======================= */
  const handleSave = async () => {
    try {
      setLoading(true);
      const updated = await updateProfile(form);
      setProfile(updated);
      setForm(updated);

      // force avatar refresh
      setAvatarPreview(null);

      toast.success("Profile updated");
      closeModal();

    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  const avatarSrc =
    avatarPreview ||
    (profile.avatarFileId
      ? `http://35.181.154.39:8080/api/users/avatar/${profile.avatarFileId}?v=${profile.updatedAt}`
      : "/images/user/avatar-placeholder.png");


  /* =======================
     RENDER
  ======================= */
  return (
    <>
      {/* PROFILE CARD */}
      <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
        <div className="flex flex-col items-center text-center gap-4">

          {/* Avatar */}
          <label className="relative cursor-pointer">
            <img
              src={avatarSrc}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border"
            />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                e.target.files && handleAvatarChange(e.target.files[0])
              }
            />
          </label>

          {/* Social Icons */}
          <div className="flex gap-3 mt-1">
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <svg
                      className="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 0.5C5.73 0.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.02c-3.2.7-3.88-1.38-3.88-1.38-.53-1.33-1.29-1.68-1.29-1.68-1.06-.73.08-.72.08-.72 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.75-1.56-2.55-.29-5.23-1.27-5.23-5.66 0-1.25.45-2.27 1.19-3.07-.12-.29-.52-1.45.11-3.02 0 0 .97-.31 3.18 1.17a11.1 11.1 0 0 1 5.8 0c2.21-1.48 3.18-1.17 3.18-1.17.63 1.57.23 2.73.11 3.02.74.8 1.19 1.82 1.19 3.07 0 4.4-2.69 5.36-5.25 5.64.42.36.8 1.08.8 2.18v3.23c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/>
                </svg>              </a>
            )}

            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener"
                className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.78381 4.16645C5.78351 4.84504 5.37181 5.45569 4.74286 5.71045C4.11391 5.96521 3.39331 5.81321 2.92083 5.32613C2.44836 4.83904 2.31837 4.11413 2.59216 3.49323C2.86596 2.87233 3.48886 2.47942 4.16715 2.49978C5.06804 2.52682 5.78422 3.26515 5.78381 4.16645ZM5.83381 7.06645H2.50048V17.4998H5.83381V7.06645ZM11.1005 7.06645H7.78381V17.4998H11.0672V12.0248C11.0672 8.97475 15.0422 8.69142 15.0422 12.0248V17.4998H18.3338V10.8914C18.3338 5.74978 12.4505 5.94145 11.0672 8.46642L11.1005 7.06645Z"
                    fill=""
                  />
                </svg>
              </a>
            )}
          </div>

          {/* Name */}
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
            {profile.fullName || "—"}
          </h4>

          {/* Bio */}
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            {profile.bio || "—"}
          </p>

          {/* Role + Email */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {profile.role} · {profile.email}
          </div>

          {/* Edit Button */}
          <Button
            variant="outline"
            className="mt-3 px-10"
            onClick={openModal}
          >
            Edit
          </Button>
        </div>
      </div>

      {/* ================= EDIT MODAL ================= */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6">
          <h4 className="text-xl font-semibold mb-6 dark:text-white/90">Edit Profile</h4>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Email</Label>
              <Input value={profile.email} disabled />
            </div>

            <div>
              <Label>Role</Label>
              <Input value={profile.role} disabled />
            </div>

            <div>
              <Label>Full Name</Label>
              <Input
                value={form.fullName || ""}
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone || ""}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Bio</Label>
              <textarea
                rows={3}
                className="w-full rounded-lg border px-4 py-2 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 text-sm focus:outline-hidden focus:ring-3 focus:ring-brand-500/20"
                value={form.bio || ""}
                onChange={(e) =>
                  setForm({ ...form, bio: e.target.value })
                }
              />
            </div>

            <div>
              <Label>GitHub</Label>
              <Input
                value={form.githubUrl || ""}
                onChange={(e) =>
                  setForm({ ...form, githubUrl: e.target.value })
                }
              />
            </div>

            <div>
              <Label>LinkedIn</Label>
              <Input
                value={form.linkedinUrl || ""}
                onChange={(e) =>
                  setForm({ ...form, linkedinUrl: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button disabled={loading} onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

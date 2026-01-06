import { useEffect, useState, useContext } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { FiFilter } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import Badge from "../../components/ui/badge/Badge";
import { AuthContext } from "../../context/AuthContext";

/* =========================
   TYPES (MATCH BACKEND)
========================= */

type Role = "ADMIN" | "FORMATEUR" | "BOOTCAMPER";
type AccountStatus = "ACTIVE" | "PENDING" | "APPROVED" | "DISABLED";

interface User {
  id: string;
  email: string;
  role: Role;
  status: AccountStatus;
}

/* =========================
   COMPONENT
========================= */

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [filterEmail, setFilterEmail] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "">("");
  const [filterStatus, setFilterStatus] = useState<AccountStatus | "">("");

  const [showFilters, setShowFilters] = useState(false);

  const [editedUsers, setEditedUsers] = useState<
    Record<string, Partial<User>>
  >({});

  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  /* =========================
     FETCH USERS
  ========================== */
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params: any = {};

            if (filterEmail.trim()) params.email = filterEmail.trim();
            if (filterRole) params.role = filterRole;
            if (filterStatus) params.status = filterStatus;

            const res = await api.get("/admin/users/search", { params });
            setUsers(res.data);
            setEditedUsers({});
        } catch {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
    fetchUsers();
    }, [filterEmail, filterRole, filterStatus]);


  /* =========================
     HANDLE EDIT
  ========================== */
  const handleChange = (
    userId: string,
    field: keyof User,
    value: any
  ) => {
    setEditedUsers((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  };

  /* =========================
     SAVE USER
  ========================== */
  const handleSave = async (user: User) => {
    const updates = editedUsers[user.id];
    if (!updates) return;

    // ❌ Prevent admin locking themselves out
    if (
      auth?.user?.email === user.email &&
      updates.role &&
      updates.role !== "ADMIN"
    ) {
      toast.error("You cannot remove your own admin role");
      return;
    }

    setSavingId(user.id);

    try {
      if (updates.role) {
        await api.patch(`/admin/users/${user.id}/role`, null, {
          params: { role: updates.role },
        });
      }

      if (updates.status) {
        await api.patch(`/admin/users/${user.id}/status`, null, {
          params: { status: updates.status },
        });
      }

      toast.success("User updated");

      // If admin updated themselves
      if (auth?.user?.email === user.email) {
        auth.login({ ...auth.user, ...updates });
        if (updates.role && updates.role !== "ADMIN") {
          navigate("/");
        }
      }

      fetchUsers();
    } catch {
      toast.error("Update failed");
    } finally {
      setSavingId(null);
    }
  };

  /* =========================
     RENDER
  ========================== */
  return (
    <>
      <PageMeta
        title="User Management"
        description="Admin user management"
      />

      <PageBreadcrumb pageTitle="User Management" />

      {/* Filters */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowFilters((p) => !p)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <FiFilter />
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 flex gap-4">
          <input
            placeholder="Filter by email"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            className="rounded-md border border-gray-200 bg-white text-gray-500 px-3 py- text-sm focus:ring-2 focus:ring-brand-500 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-gray-300"/>
          <select
            value={filterRole}
            onChange={(e) =>
              setFilterRole(e.target.value as Role | "")
            }
            className="rounded-md border border-gray-200 bg-white text-gray-700 px-3 py-1 text-sm focus:ring-1 focus:ring-brand-500 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-gray-300">
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="FORMATEUR">Formateur</option>
            <option value="BOOTCAMPER">Bootcamper</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) =>
                setFilterStatus(e.target.value as AccountStatus | "")
            }
            className="rounded-md border border-gray-200 bg-white text-gray-700 px-3 py-1 text-sm focus:ring-1 focus:ring-brand-500 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-gray-300 focus:ring-2 focus:ring-brand-500dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-gray-300">
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="DISABLED">Disabled</option>
        </select>

        </div>
      )}

      {/* Table */}
      <ComponentCard title="Users">
        {loading ? (
          <div className="py-10 text-center text-gray-500">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No users found
          </div>
        ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                {/* Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Role</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>

                {/* Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {users.map((user) => {
                    const edits = editedUsers[user.id] || {};

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{user.email}</TableCell>

                        {/* Role */}
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <select
                            value={edits.role ?? user.role}
                            onChange={(e) =>
                              handleChange(
                                user.id,
                                "role",
                                e.target.value as Role
                              )
                            }
className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm
    focus:ring-1 focus:ring-brand-500
    dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-gray-300"                          >
                            <option value="ADMIN">Admin</option>
                            <option value="FORMATEUR">Formateur</option>
                            <option value="BOOTCAMPER">Bootcamper</option>
                          </select>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <select
                            value={edits.status ?? user.status}
                            onChange={(e) =>
                              handleChange(
                                user.id,
                                "status",
                                e.target.value as AccountStatus
                              )
                            }
className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm
    focus:ring-1 focus:ring-brand-500
    dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-gray-300"                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="DISABLED">DISABLED</option>
                          </select>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <button
                            onClick={() => handleSave(user)}
                            disabled={savingId === user.id}
                            className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                          >
                            {savingId === user.id ? "Saving..." : "Save"}
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </ComponentCard>
    </>
  );
}

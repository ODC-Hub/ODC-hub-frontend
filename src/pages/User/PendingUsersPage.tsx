import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import ConfirmDialog from "../../components/common/ConfirmDialog";

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

interface User {
  id: string;
  email: string;
  role: string;
  status: "PENDING";
}


export default function PendingUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const [confirmReject, setConfirmReject] = useState<{
    open: boolean;
    userId: string | null;
  }>({ open: false, userId: null });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users/pending");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load pending users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    setApprovingId(userId);
    try {
      await api.post(`/admin/users/${userId}/approve`);
      setUsers((prev) => prev.filter((u) => (u.id) !== userId));
      toast.success("User approved");
    } catch {
      toast.error("Approval failed");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async () => {
    if (!confirmReject.userId) return;
    setRejectingId(confirmReject.userId);
    try {
      await api.delete(`/admin/users/${confirmReject.userId}/reject`);
      setUsers((prev) =>
        prev.filter((u) => (u.id) !== confirmReject.userId)
      );
      toast.success("User rejected");
    } catch {
      toast.error("Rejection failed");
    } finally {
      setRejectingId(null);
      setConfirmReject({ open: false, userId: null });
    }
  };

  return (
    <>
      <PageMeta title="Pending Signup Requests"   description="Admin page to review and approve pending signup requests" />
      <PageBreadcrumb pageTitle="Pending Signup Requests" />

      <ComponentCard title="Pending Requests">
        {loading ? (
          <div className="py-10 text-center text-gray-500">
            Loading...
          </div>
        ) : users.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No pending requests
          </div>
        ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table>
                {/* Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                    <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                        Email
                    </TableCell>
                    <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                        Role
                    </TableCell>
                    <TableCell
                        isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                        Actions
                    </TableCell>
                    </TableRow>
                </TableHeader>

                {/* Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {users.map((user) => {
                    const userId = user.id;
                    return (
                        <TableRow key={userId}>
                        {/* Email */}
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {user.email}
                        </TableCell>

                        {/* Role */}
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <Badge size="sm" color="warning">
                            {user.role}
                            </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <div className="inline-flex items-center gap-2">
                            <button
                                className="rounded-lg bg-success-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-success-600 disabled:opacity-50"
                                onClick={() => handleApprove(userId)}
                                disabled={approvingId === userId}
                            >
                                Approve
                            </button>
                            <button
                                className="rounded-lg bg-error-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-error-600 disabled:opacity-50"
                                onClick={() =>
                                setConfirmReject({ open: true, userId })
                                }
                                disabled={rejectingId === userId}
                            >
                                Reject
                            </button>
                            </div>
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

      <ConfirmDialog
        open={confirmReject.open}
        message="Are you sure you want to reject this user?"
        onConfirm={handleReject}
        onCancel={() => setConfirmReject({ open: false, userId: null })}
      />
    </>
  );
}

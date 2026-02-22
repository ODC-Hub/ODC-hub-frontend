import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from "@/socket/notificationSocket";
import api from "@/api/axios";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

export type NotificationType =
  | "PLANNING_ITEM_CREATED"
  | "PLANNING_ITEM_UPDATED"
  | "PLANNING_ITEM_DELETED"
  | "RESOURCE_CREATED"
  | "HOMEWORK_ASSIGNED"
  | "HOMEWORK_SUBMITTED"
  | "HOMEWORK_REVIEWED"
  | "PROJECT_ASSIGNED"
  | "QUIZ_SUBMITTED"
  | "QUIZ_GRADED"
  | "USER_ROLE_UPDATED"
  | "USER_REGISTRATION_REQUESTED";
export interface Notification {
  type: NotificationType;   // ✅ REQUIRED
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  entityType?: string;
  entityId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType>(
  {} as NotificationContextType
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initial REST load
  useEffect(() => {
    api.get("/notifications").then((res) => {
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: any) => !n.read).length);
    });

    api.get("/notifications/unread-count").then((res) => {
      setUnreadCount(res.data);
    });
  }, []);

  const { user } = useAuth();

  // WebSocket
  useEffect(() => {
    if (!user) return;
    connectNotificationSocket((notif) => {
      setNotifications((prev) => {
        const next = [notif, ...prev];
        setUnreadCount(next.filter(n => !n.read).length);
        return next;
      });

      toast.custom(
        <div className="pointer-events-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg px-4 py-3 transition-all text-sm">
          <div className="font-medium text-gray-900 dark:text-white">
              {notif.title}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
              {notif.message}
          </div>
        </div>,
        { duration: 4000 }
    );
    });

    return () => disconnectNotificationSocket();
  }, [user]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    api.patch(`/notifications/${id}/read`);
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
    );
    setUnreadCount(0);
    api.post("/notifications/read-all");
};

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () =>
  useContext(NotificationContext);
import { useNotifications } from "@/context/NotificationContext";

export default function NotificationsPage() {
  const { notifications, markAsRead } = useNotifications();
  

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

      {notifications.length === 0 && (
        <p className="text-gray-500">No notifications</p>
      )}

      <ul className="space-y-2">
        {notifications.map((n) => (
          <li
            key={n.id}
            onClick={() => markAsRead(n.id)}
            className={`cursor-pointer rounded-lg p-4 border ${
              !n.read
                ? "bg-orange-50 border-orange-200"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="font-medium">{n.title}</div>
            <div className="text-sm text-gray-600">{n.message}</div>
            <div className="text-xs text-gray-400 mt-1">
              {new Date(n.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
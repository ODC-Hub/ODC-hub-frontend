import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router";
import { useNotifications } from "@/context/NotificationContext";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  function toggleDropdown() {
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      {/*Bell button */}
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        {/*Unread indicator */}
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute inline-flex h-full w-full animate-ping bg-orange-400 opacity-75 rounded-full"></span>
          </span>
        )}

        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Dropdown */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
          <button
            onClick={closeDropdown}
            className="text-gray-500 transition hover:text-gray-700 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Notification list */}
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {notifications.length === 0 && (
            <li className="p-4 text-sm text-center text-gray-500">
              No notifications
            </li>
          )}

          {notifications.slice(0, 8).map((n) => (
            <li key={n.id}>
              <DropdownItem
                onItemClick={() => {
                    if (!n.read) markAsRead(n.id);

                    switch (n.type) {

                      case "PLANNING_ITEM_CREATED":
                        navigate("/calendar");
                        break;

                      case "PLANNING_ITEM_UPDATED":
                        navigate("/calendar");
                        break;

                      case "PLANNING_ITEM_DELETED":
                        navigate("/calendar");
                        break;

                      case "RESOURCE_CREATED":
                        // Bootcamper → resource list (highlighted)
                        navigate(`/resources?resourceId=${n.entityId}`);
                        break;

                      case "HOMEWORK_ASSIGNED":
                        // Bootcamper → homework details
                        navigate(`/resources?resourceId=${n.entityId}`);
                        break;

                      case "HOMEWORK_SUBMITTED":
                        // ADMIN / FORMATEUR → review submissions
                        navigate(`/homework/${n.entityId}/reviews`);
                        break;

                      case "HOMEWORK_REVIEWED":
                        // Bootcamper → review details
                        navigate(`/my-submissions`);
                        break;

                      case "PROJECT_ASSIGNED":
                        navigate(`/projects?projectId=${n.entityId}`);
                        break;
                      case "USER_REGISTRATION_REQUESTED":
                        navigate("/admin/users/pending");
                        break;
                      default:
                        navigate("/notifications");
                    }
                    
                  closeDropdown();                
                }}
                className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${
                  !n.read ? "bg-orange-50 dark:bg-orange-900/10" : ""
                }`}
              >
                <span className="block">
                  <span className="block font-medium text-gray-800 dark:text-white">
                    {n.title}
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">
                    {n.message}
                  </span>
                  <span className="block mt-1 text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </span>
              </DropdownItem>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <Link
          to="/notifications"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          View All Notifications
        </Link>
        <button
          onClick={markAllAsRead}
          className="text-xs text-orange-500 hover:underline"
        >
          Mark all as read
        </button>
      </Dropdown>
    </div>
  );
}
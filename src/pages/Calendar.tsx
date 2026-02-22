import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { EventResizeDoneArg } from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import { useAuth } from "../context/AuthContext";
import { getPlanning, createPlanning, updatePlanning, deletePlanning } from "../api/planningApi";
import { getAllUsers, UserResponse } from "../api/adminApi";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";

interface PlanningItem {
  id: string;
  title: string;
  description: string;
  type: "SESSION" | "EVENT" | "DEADLINE" | "ASSESSMENT";
  startDate: string;
  endDate: string;
  userIds: string[];
  tags: string[];
  createdBy: string;
}

interface CalendarEvent extends EventInput {
  extendedProps: {
    description: string;
    type: string;
    userIds: string[];
    tags: string[];
  };
}

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "FORMATEUR";

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);


  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [availableUsers, setAvailableUsers] = useState<UserResponse[]>([]);


  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventType, setEventType] = useState<string>("SESSION");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [eventTags, setEventTags] = useState(""); 

  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

const getTypeColor = (type: string) => {
  switch (type) {
    case "SESSION":
      return "#4F46E5"; // Indigo
    case "DEADLINE":
      return "#E11D48"; // Rose
    case "EVENT":
      return "#F59E0B"; // Amber
    case "ASSESSMENT":
      return "#10B981"; // Emerald
    default:
      return "#4F46E5";
  }
};
  
  useEffect(() => {
    loadEvents();
    if (canEdit) {
      loadUsers();
    }
  }, [canEdit]);

  const loadEvents = async () => {
    try {
      const response = await getPlanning();
      const planningItems: PlanningItem[] = response.data;

      const calendarEvents: CalendarEvent[] = planningItems.map(item => ({
        id: item.id,
        title: item.title,
        start: item.startDate,
        end: item.endDate,
        backgroundColor: getTypeColor(item.type),
        borderColor: getTypeColor(item.type),
        textColor: "#ffffff",
        extendedProps: {
          description: item.description,
          type: item.type,
          userIds: item.userIds || [],
          tags: item.tags || []
        }
      }));
      setEvents(calendarEvents);
    } catch (error) {
      console.error("Failed to fetch planning items", error);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await getAllUsers();
      setAvailableUsers(users);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (!canEdit) return;
    resetModalFields();
 
    const start = selectInfo.startStr.includes("T") ? selectInfo.startStr.slice(0, 16) : selectInfo.startStr + "T09:00";
    const end = selectInfo.endStr
      ? (selectInfo.endStr.includes("T") ? selectInfo.endStr.slice(0, 16) : (selectInfo.allDay ? selectInfo.endStr + "T09:00" : selectInfo.endStr))
      : start;

    setEventStartDate(start);
    setEventEndDate(end);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;

    setSelectedEventId(event.id);
    setEventTitle(event.title);
    setEventDescription(event.extendedProps.description || "");
    setEventType(event.extendedProps.type || "SESSION");

   
    const startStr = event.start?.toISOString().slice(0, 16) || "";
    const endStr = event.end?.toISOString().slice(0, 16) || "";
    setEventStartDate(startStr);
    setEventEndDate(endStr);

    setSelectedUserIds(event.extendedProps.userIds || []);
    setEventTags((event.extendedProps.tags || []).join(", "));

    openModal();
  };

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    if (!canEdit) {
      dropInfo.revert();
      return;
    }

    const { event } = dropInfo;
    const payload = {
      startDate: event.start?.toISOString(),
      endDate: event.end?.toISOString() || event.start?.toISOString()
    };

    try {
      await updatePlanning(event.id, payload);
     
    } catch (err) {
      console.error("Failed to move event", err);
      dropInfo.revert();
    }
  };

  const handleEventResize = async (resizeInfo: EventResizeDoneArg) => {
    if (!canEdit) {
      resizeInfo.revert();
      return;
    }
    const { event } = resizeInfo;
    const payload = {
      startDate: event.start?.toISOString(),
      endDate: event.end?.toISOString()
    };
    try {
      await updatePlanning(event.id, payload);
    } catch (err) {
      console.error("Failed to resize event", err);
      resizeInfo.revert();
    }
  };

 
  const handleAddOrUpdateEvent = async () => {
    if (!canEdit) return;

 
    if (!eventTitle || !eventStartDate) {
      alert("Title and Start Date are required");
      return;
    }

    
    const startIso = eventStartDate.length === 16 ? eventStartDate + ":00" : eventStartDate;
    const endIso = eventEndDate && eventEndDate.length === 16 ? eventEndDate + ":00" : (eventEndDate || startIso);

    const payload = {
      title: eventTitle,
      description: eventDescription,
      type: eventType,
      startDate: startIso,
      endDate: endIso,
      userIds: selectedUserIds,
      tags: eventTags.split(",").map(t => t.trim()).filter(Boolean)
    };

    try {
      if (selectedEventId) {
        await updatePlanning(selectedEventId, payload);
      } else {
        await createPlanning(payload);
      }
      closeModal();
      resetModalFields();
      loadEvents();
    } catch (error) {
      console.error("Failed to save event", error);
      alert("Failed to save event");
    }
  };

  const handleDeleteClick = () => {
  if (!selectedEventId || !canEdit) return;

  closeModal();

  setShowDeleteConfirm(true);
};

const confirmDeleteEvent = async () => {
  if (!selectedEventId) return;

  try {
    setDeleteLoading(true);
    await deletePlanning(selectedEventId);

    setShowDeleteConfirm(false);
    closeModal();
    resetModalFields();
    loadEvents();
  } catch (err) {
    console.error("Failed to delete", err);
  } finally {
    setDeleteLoading(false);
  }
};

  const resetModalFields = () => {
    setSelectedEventId(null);
    setEventTitle("");
    setEventDescription("");
    setEventType("SESSION");
    setEventStartDate("");
    setEventEndDate("");
    setSelectedUserIds([]);
    setEventTags("");
  };

 
  const toggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const selectAllUsers = () => {
    if (selectedUserIds.length === availableUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(availableUsers.map(u => u.id));
    }
  };

  return (
    <>
      <PageMeta
        title="Planning | ODC Hub"
        description="Bootcamp Planning Calendar"
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar p-4">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            editable={canEdit}
            selectable={canEdit}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            eventContent={renderEventContent}
            height="auto" 
          />
        </div>

        {/* Floating Add Button for Admin/Formateur */}
        {canEdit && (
          <div className="mt-4 flex justify-end px-4 pb-4">
            <button
              onClick={() => { resetModalFields(); openModal(); }}
              className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 focus:ring-4 focus:ring-brand-500/20"
            >
              <span>+</span> Add Planning Item
            </button>
          </div>
        )}

        <Modal
          isOpen={isOpen}
          onClose={closeModal}         
          className="max-w-[700px] p-6 lg:p-10"
        >
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar max-h-[85vh]">
            <div className="mb-6">
              <h5 className="font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                {selectedEventId ? (canEdit ? "Edit Item" : "Item Details") : "Add Planning Item"}
              </h5>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Title *
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Description
                </label>
                <textarea
                  disabled={!canEdit}
                  rows={3}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              {/* Type */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Type
                </label>
                <select
                  disabled={!canEdit}
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="SESSION">Session</option>
                  <option value="EVENT">Event</option>
                  <option value="DEADLINE">Deadline</option>
                  <option value="ASSESSMENT">Assessment</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    disabled={!canEdit}
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    disabled={!canEdit}
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>
              </div>

              
              {canEdit && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Participants
                    </label>
                    <button type="button" onClick={selectAllUsers} className="text-xs text-brand-500 hover:underline">
                      {selectedUserIds.length === availableUsers.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 dark:border-gray-700">
                    {availableUsers.map(u => (
                      <div key={u.id} className="flex items-center mb-2 last:mb-0">
                        <input
                          type="checkbox"
                          id={`user-${u.id}`}
                          checked={selectedUserIds.includes(u.id)}
                          onChange={() => toggleUser(u.id)}
                          className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor={`user-${u.id}`} className="ml-2 text-sm text-gray-900 dark:text-gray-300 cursor-pointer">
                          {u.fullName} ({u.role})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={eventTags}
                  onChange={(e) => setEventTags(e.target.value)}
                  placeholder="e.g. spring-boot, react, team-building"
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8 modal-footer sm:justify-end">
              {canEdit && selectedEventId && (
                <button
  onClick={handleDeleteClick}
  type="button"
  className="mr-auto w-full justify-center rounded-lg border border-red-500 bg-red-50 text-red-600 px-4 py-2.5 text-sm font-medium hover:bg-red-100 sm:w-auto"
>
  Delete
</button>
              )}

              <button
                onClick={closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Close
              </button>
              {canEdit && (
                <button
                  onClick={handleAddOrUpdateEvent}
                  type="button"
                  className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                >
                  {selectedEventId ? "Update Changes" : "Save Planning Item"}
                </button>
              )}
            </div>
          </div>
        </Modal>
      </div>
      <ConfirmationDialog
  open={showDeleteConfirm}
  title="Delete planning item"
  message="This action is irreversible. The planning item will be permanently deleted."
  confirmText="Delete"
  cancelText="Cancel"
  danger
  confirmDisabled={deleteLoading}
  onCancel={() => setShowDeleteConfirm(false)}
  onConfirm={confirmDeleteEvent}
/>
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const { title, extendedProps } = eventInfo.event;
  const { type, tags = [] } = extendedProps;

  return (
    <div className="fc-event-card">
      {/* Header */}
      <div className="fc-event-header">
        <span className="fc-event-type">{type}</span>
        {eventInfo.timeText && (
          <span className="fc-event-time">{eventInfo.timeText}</span>
        )}
      </div>

      {/* Title */}
      <div className="fc-event-title">{title}</div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="fc-event-tags">
          {tags.slice(0, 3).map((tag: string) => (
            <span key={tag} className="fc-event-tag">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Calendar;

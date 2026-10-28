const STORAGE_KEY = 'closr_notifications_store';
export const INITIAL_NOTIFICATIONS = [
    {
        id: 'notif-1',
        category: 'escalations',
        priority: 'urgent',
        title: 'Critical Triage Escalation ESC-310',
        description: 'Ramesh K. reported acute chest discomfort and breathlessness during chat. Immediate 108 emergency protocol triggered. Human triage desk review required.',
        timestamp: '5:41 PM',
        rawDate: '2026-10-29',
        isRead: false,
        actionRequired: true,
        relatedPatientId: 'pat-5',
        relatedPatientName: 'Ramesh K.',
        relatedEscalationId: 'ESC-310',
        relatedConversationId: 'conv-4',
        destinationRoute: '/messages?id=conv-4',
        destinationLabel: 'Review Conversation',
    },
    {
        id: 'notif-2',
        category: 'appointments',
        priority: 'normal',
        title: 'Appointment Confirmed (SAT-2041)',
        description: 'Rohit V. confirmed 5:30 PM slot with Dr. Sharma for fever consultation via Closr AI Receptionist.',
        timestamp: '5:13 PM',
        rawDate: '2026-10-29',
        isRead: false,
        actionRequired: false,
        relatedPatientId: 'pat-3',
        relatedPatientName: 'Rohit V.',
        relatedBookingId: 'SAT-2041',
        relatedConversationId: 'conv-1',
        destinationRoute: '/appointments?booking=SAT-2041',
        destinationLabel: 'View Appointment',
    },
    {
        id: 'notif-3',
        category: 'conversations',
        priority: 'high',
        title: 'Waitlist Inquiry Received',
        description: 'Imran S. asked "Is there a slot available tomorrow?" in response to freed 5:00 PM slot notification.',
        timestamp: '5:02 PM',
        rawDate: '2026-10-29',
        isRead: false,
        actionRequired: true,
        relatedPatientId: 'pat-2',
        relatedPatientName: 'Imran S.',
        relatedConversationId: 'conv-2',
        destinationRoute: '/messages?id=conv-2',
        destinationLabel: 'Open Patient Chat',
    },
    {
        id: 'notif-4',
        category: 'activity',
        priority: 'normal',
        title: 'New Patient Profile Captured',
        description: 'Pooja D. registered for first visit at 6:15 PM and digital consent form was issued via SMS.',
        timestamp: '4:48 PM',
        rawDate: '2026-10-29',
        isRead: true,
        actionRequired: false,
        relatedPatientId: 'pat-4',
        relatedPatientName: 'Pooja D.',
        destinationRoute: '/patients?id=pat-4',
        destinationLabel: 'Inspect Profile',
    },
    {
        id: 'notif-5',
        category: 'appointments',
        priority: 'normal',
        title: 'Follow-up Confirmed (SAT-2038)',
        description: 'Anita M. acknowledged 4:30 PM appointment reminder for viral recovery lab review.',
        timestamp: '4:35 PM',
        rawDate: '2026-10-29',
        isRead: true,
        actionRequired: false,
        relatedPatientId: 'pat-1',
        relatedPatientName: 'Anita M.',
        relatedBookingId: 'SAT-2038',
        relatedConversationId: 'conv-5',
        destinationRoute: '/appointments?booking=SAT-2038',
        destinationLabel: 'View Booking',
    },
    {
        id: 'notif-6',
        category: 'appointments',
        priority: 'normal',
        title: 'Appointment Cancelled (SAT-1998)',
        description: 'Anil T. cancelled 6:00 PM slot due to travel conflict. Slot automatically released to waitlist.',
        timestamp: 'Yesterday, 6:00 PM',
        rawDate: '2026-10-28',
        isRead: true,
        actionRequired: false,
        relatedPatientId: 'pat-6',
        relatedPatientName: 'Anil T.',
        relatedBookingId: 'SAT-1998',
        destinationRoute: '/appointments',
        destinationLabel: 'Appointments Calendar',
    },
    {
        id: 'notif-7',
        category: 'system',
        priority: 'normal',
        title: 'Closr Clinic Platform Ready',
        description: 'Local clinic environment initialized in demo mode with full appointments, messaging, and triage support.',
        timestamp: 'Yesterday, 9:00 AM',
        rawDate: '2026-10-28',
        isRead: true,
        actionRequired: false,
        destinationRoute: '/settings',
        destinationLabel: 'View Settings',
    },
];
// In-memory cache
let inMemoryNotifications = loadFromStorage();
const subscribers = new Set();
function notifySubscribers() {
    subscribers.forEach((cb) => {
        try {
            cb();
        }
        catch (e) {
            console.warn('Notification subscriber error', e);
        }
    });
}
function loadFromStorage() {
    if (typeof window === 'undefined')
        return [...INITIAL_NOTIFICATIONS];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [...INITIAL_NOTIFICATIONS];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
        return [...INITIAL_NOTIFICATIONS];
    }
    catch (err) {
        console.warn('Could not read notifications from localStorage, using initial mock data', err);
        return [...INITIAL_NOTIFICATIONS];
    }
}
function saveToStorage(records) {
    inMemoryNotifications = records;
    if (typeof window === 'undefined')
        return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
    catch (err) {
        console.warn('Could not persist notifications to localStorage', err);
    }
    notifySubscribers();
}
export const notificationService = {
    /**
     * Retrieves all notifications.
     */
    async getNotifications() {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...inMemoryNotifications]), 30);
        });
    },
    /**
     * Synchronous getter for immediate badge rendering.
     */
    getNotificationsSync() {
        return [...inMemoryNotifications];
    },
    /**
     * Calculates current unread count.
     */
    getUnreadCount() {
        return inMemoryNotifications.filter((n) => !n.isRead).length;
    },
    /**
     * Calculates count of notifications requiring staff action.
     */
    getNeedsAttentionCount() {
        return inMemoryNotifications.filter((n) => n.actionRequired && (!n.isRead || n.priority === 'urgent')).length;
    },
    /**
     * Marks a single notification as read.
     */
    async markAsRead(id) {
        const updated = inMemoryNotifications.map((n) => n.id === id ? { ...n, isRead: true } : n);
        saveToStorage(updated);
        return updated.find((n) => n.id === id);
    },
    /**
     * Marks a single notification as unread.
     */
    async markAsUnread(id) {
        const updated = inMemoryNotifications.map((n) => n.id === id ? { ...n, isRead: false } : n);
        saveToStorage(updated);
        return updated.find((n) => n.id === id);
    },
    /**
     * Marks all notifications as read.
     */
    async markAllAsRead() {
        const updated = inMemoryNotifications.map((n) => ({ ...n, isRead: true }));
        saveToStorage(updated);
    },
    /**
     * Dismisses / deletes a notification.
     */
    async dismissNotification(id) {
        const updated = inMemoryNotifications.filter((n) => n.id !== id);
        saveToStorage(updated);
    },
    /**
     * Adds a new notification event to the inbox.
     */
    async addNotification(data) {
        const now = new Date();
        const newRecord = {
            ...data,
            id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: data.timestamp ||
                now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            rawDate: data.rawDate || now.toISOString().split('T')[0],
            isRead: data.isRead !== undefined ? data.isRead : false,
        };
        saveToStorage([newRecord, ...inMemoryNotifications]);
        return newRecord;
    },
    /**
     * Common event source: Returns synchronized clinic activity events
     * for Home Timeline, Analytics, and Notifications views.
     */
    async getActivityEvents() {
        const notifs = await this.getNotifications();
        return notifs.map((n) => ({
            id: n.id,
            timestamp: n.timestamp,
            title: n.title,
            description: n.description,
            category: n.category === 'escalations' ? 'escalation' : (n.category === 'appointments' ? 'booking' : (n.category === 'conversations' ? 'waitlist' : 'lead')),
            status: n.priority === 'urgent' ? 'urgent' : (n.isRead ? 'completed' : 'info'),
            relatedId: n.relatedBookingId || n.relatedEscalationId || n.relatedPatientId,
            isRead: n.isRead,
            actionRequired: n.actionRequired,
        }));
    },
    /**
     * Subscribes a component to notification changes.
     */
    subscribe(callback) {
        subscribers.add(callback);
        return () => {
            subscribers.delete(callback);
        };
    },
};

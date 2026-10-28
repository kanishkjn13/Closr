import { mockConversations, mockMessages } from '../data/mockMessages';
import { mockEscalations } from '../data/mockActivity';
import { notificationService } from './notificationService';
// In-memory data store for Phase 6 frontend operations
let conversationsStore = [...mockConversations];
let messagesStore = [...mockMessages];
let escalationsStore = [...mockEscalations];
export const conversationService = {
    /**
     * Retrieves all patient conversations.
     * TODO: Connect to backend GET /api/v1/conversations
     */
    async getConversations() {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...conversationsStore]), 40);
        });
    },
    /**
     * Retrieves a single conversation by ID.
     */
    async getConversationById(id) {
        return new Promise((resolve) => {
            const match = conversationsStore.find((c) => c.id === id);
            setTimeout(() => resolve(match ? { ...match } : undefined), 30);
        });
    },
    /**
     * Retrieves messages for a specific conversation.
     * TODO: Connect to backend GET /api/v1/conversations/:id/messages
     */
    async getMessagesByConversationId(conversationId) {
        return new Promise((resolve) => {
            const messages = messagesStore.filter((m) => m.conversationId === conversationId);
            setTimeout(() => resolve([...messages]), 30);
        });
    },
    /**
     * Marks a conversation as read.
     */
    async markAsRead(conversationId) {
        const index = conversationsStore.findIndex((c) => c.id === conversationId);
        if (index !== -1) {
            conversationsStore[index] = {
                ...conversationsStore[index],
                unreadCount: 0,
            };
        }
    },
    /**
     * Marks a conversation as unread.
     */
    async markAsUnread(conversationId) {
        const index = conversationsStore.findIndex((c) => c.id === conversationId);
        if (index !== -1) {
            conversationsStore[index] = {
                ...conversationsStore[index],
                unreadCount: Math.max(1, conversationsStore[index].unreadCount + 1),
            };
        }
    },
    /**
     * Marks a conversation as resolved or active.
     */
    async toggleResolved(conversationId) {
        const index = conversationsStore.findIndex((c) => c.id === conversationId);
        if (index === -1)
            throw new Error('Conversation not found');
        const isNowResolved = !conversationsStore[index].isResolved;
        conversationsStore[index] = {
            ...conversationsStore[index],
            isResolved: isNowResolved,
            status: isNowResolved ? 'archived' : 'active',
        };
        return { ...conversationsStore[index] };
    },
    /**
     * Escalates a conversation to staff attention and registers an escalation record.
     */
    async escalateConversation(conversationId, reason, priority = 'high', notes) {
        const index = conversationsStore.findIndex((c) => c.id === conversationId);
        if (index === -1)
            throw new Error('Conversation not found');
        const targetConv = conversationsStore[index];
        conversationsStore[index] = {
            ...targetConv,
            status: 'escalated',
        };
        // Check if an escalation already exists for this patient
        let escalation = escalationsStore.find((e) => e.patientId === targetConv.patientId);
        if (escalation) {
            escalation = {
                ...escalation,
                reason,
                priority,
                status: 'open',
                notes: notes || escalation.notes,
            };
            escalationsStore = escalationsStore.map((e) => (e.id === escalation?.id ? escalation : e));
        }
        else {
            const newEscId = `ESC-${Math.floor(311 + Math.random() * 80)}`;
            escalation = {
                id: newEscId,
                patientId: targetConv.patientId,
                patientName: targetConv.patientName,
                reason,
                priority,
                status: 'open',
                createdAt: 'Just now',
                notes,
            };
            escalationsStore = [escalation, ...escalationsStore];
        }
        // Auto-dispatch urgent escalation notification
        try {
            notificationService.addNotification({
                category: 'escalations',
                priority: priority === 'critical' ? 'urgent' : 'high',
                title: `Clinical Triage Alert (${escalation.id})`,
                description: `${targetConv.patientName}: ${reason}`,
                relatedPatientId: targetConv.patientId,
                relatedPatientName: targetConv.patientName,
                relatedEscalationId: escalation.id,
                relatedConversationId: conversationId,
                destinationRoute: `/messages?id=${conversationId}`,
                destinationLabel: 'Review Triage Chat',
                actionRequired: true,
            });
        }
        catch (e) {
            console.warn('Could not dispatch notification', e);
        }
        return {
            conversation: { ...conversationsStore[index] },
            escalation: { ...escalation },
        };
    },
    /**
     * Retrieves all escalations.
     */
    async getEscalations() {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...escalationsStore]), 30);
        });
    },
    /**
     * Retrieves escalation by patient ID.
     */
    async getEscalationByPatientId(patientId) {
        const item = escalationsStore.find((e) => e.patientId === patientId);
        return item ? { ...item } : undefined;
    },
    /**
     * Updates status of an escalation.
     */
    async updateEscalationStatus(escalationId, status) {
        const index = escalationsStore.findIndex((e) => e.id === escalationId);
        if (index === -1)
            throw new Error('Escalation not found');
        const updated = {
            ...escalationsStore[index],
            status,
            resolvedAt: status === 'resolved' ? 'Just now' : undefined,
        };
        escalationsStore[index] = updated;
        if (status === 'resolved') {
            try {
                notificationService.addNotification({
                    category: 'escalations',
                    priority: 'normal',
                    title: `Escalation Resolved (${updated.id})`,
                    description: `Clinical escalation for ${updated.patientName} was marked resolved by staff.`,
                    relatedPatientId: updated.patientId,
                    relatedPatientName: updated.patientName,
                    relatedEscalationId: updated.id,
                    destinationRoute: '/messages',
                    destinationLabel: 'Messages',
                    actionRequired: false,
                });
            }
            catch (e) {
                console.warn('Could not dispatch escalation resolution notification', e);
            }
        }
        return { ...updated };
    },
    /**
     * Sends a new message in a conversation.
     * TODO: Connect to backend POST /api/v1/conversations/:id/messages
     */
    async sendMessage(conversationId, content, sender = 'doctor', type = 'text', metadata) {
        return new Promise((resolve) => {
            const newMessage = {
                id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                conversationId,
                sender,
                content,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                type,
                metadata,
            };
            messagesStore = [...messagesStore, newMessage];
            // Update conversation snippet
            const convIndex = conversationsStore.findIndex((c) => c.id === conversationId);
            if (convIndex !== -1) {
                conversationsStore[convIndex] = {
                    ...conversationsStore[convIndex],
                    lastMessage: content,
                    lastMessageTimestamp: newMessage.timestamp,
                };
            }
            setTimeout(() => resolve({ ...newMessage }), 30);
        });
    },
};

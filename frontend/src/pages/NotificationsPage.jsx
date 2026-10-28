import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { NotificationSummaryCards } from '../components/notifications/NotificationSummaryCards';
import { NotificationFiltersToolbar, } from '../components/notifications/NotificationFiltersToolbar';
import { NotificationListItem } from '../components/notifications/NotificationListItem';
import { NotificationDetailsDrawer } from '../components/notifications/NotificationDetailsDrawer';
import { notificationService } from '../services/notificationService';
import { CheckCheck, Settings, SearchX, Inbox } from 'lucide-react';
export const NotificationsPage = () => {
    const { onOpenMobileMenu } = useOutletContext();
    const toast = useToast();
    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [readFilter, setReadFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [summaryFilter, setSummaryFilter] = useState('all');
    // Load and subscribe to notification changes
    const refreshNotifications = useCallback(async () => {
        const list = await notificationService.getNotifications();
        setNotifications(list);
    }, []);
    useEffect(() => {
        refreshNotifications();
        return notificationService.subscribe(() => {
            refreshNotifications();
        });
    }, [refreshNotifications]);
    // Total Counts
    const totalCount = notifications.length;
    const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
    const needsAttentionCount = useMemo(() => notifications.filter((n) => n.actionRequired && (!n.isRead || n.priority === 'urgent')).length, [notifications]);
    // Handle Summary Card Filter Click
    const handleSummaryCardFilter = (filter) => {
        setSummaryFilter(filter);
        if (filter === 'all') {
            setReadFilter('all');
            setPriorityFilter('all');
        }
        else if (filter === 'unread') {
            setReadFilter('unread');
            setPriorityFilter('all');
        }
        else if (filter === 'attention') {
            setReadFilter('all');
            setPriorityFilter('urgent');
        }
    };
    // Reset all filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setReadFilter('all');
        setCategoryFilter('all');
        setPriorityFilter('all');
        setSortOrder('newest');
        setSummaryFilter('all');
    };
    const hasActiveFilters = Boolean(searchQuery.trim()) ||
        readFilter !== 'all' ||
        categoryFilter !== 'all' ||
        priorityFilter !== 'all' ||
        summaryFilter !== 'all';
    // Filter & Search Logic
    const filteredNotifications = useMemo(() => {
        let list = [...notifications];
        // Read status filter
        if (readFilter === 'unread') {
            list = list.filter((n) => !n.isRead);
        }
        else if (readFilter === 'read') {
            list = list.filter((n) => n.isRead);
        }
        // Category filter
        if (categoryFilter !== 'all') {
            list = list.filter((n) => n.category === categoryFilter);
        }
        // Priority filter
        if (priorityFilter !== 'all') {
            list = list.filter((n) => n.priority === priorityFilter);
        }
        // Search query filter
        const q = searchQuery.toLowerCase().trim();
        if (q) {
            list = list.filter((n) => n.title.toLowerCase().includes(q) ||
                n.description.toLowerCase().includes(q) ||
                (n.relatedPatientName && n.relatedPatientName.toLowerCase().includes(q)) ||
                (n.relatedBookingId && n.relatedBookingId.toLowerCase().includes(q)) ||
                (n.relatedEscalationId && n.relatedEscalationId.toLowerCase().includes(q)) ||
                (n.relatedConversationId && n.relatedConversationId.toLowerCase().includes(q)));
        }
        // Sort order
        list.sort((a, b) => {
            if (sortOrder === 'oldest') {
                return a.rawDate.localeCompare(b.rawDate);
            }
            return b.rawDate.localeCompare(a.rawDate);
        });
        return list;
    }, [notifications, readFilter, categoryFilter, priorityFilter, searchQuery, sortOrder]);
    // Grouping by Date (Today: 2026-10-29, Yesterday: 2026-10-28, Earlier)
    const groupedNotifications = useMemo(() => {
        const today = [];
        const yesterday = [];
        const earlier = [];
        filteredNotifications.forEach((n) => {
            if (n.rawDate === '2026-10-29' || n.timestamp.includes('Today')) {
                today.push(n);
            }
            else if (n.rawDate === '2026-10-28' || n.timestamp.includes('Yesterday')) {
                yesterday.push(n);
            }
            else {
                earlier.push(n);
            }
        });
        return { today, yesterday, earlier };
    }, [filteredNotifications]);
    // Action Handlers
    const handleToggleRead = async (id, currentRead) => {
        if (currentRead) {
            await notificationService.markAsUnread(id);
            toast.info('Notification marked as unread');
        }
        else {
            await notificationService.markAsRead(id);
            toast.success('Notification marked as read');
        }
        // Update local selected item if open
        if (selectedNotification?.id === id) {
            setSelectedNotification((prev) => (prev ? { ...prev, isRead: !currentRead } : null));
        }
    };
    const handleMarkAllAsRead = async () => {
        await notificationService.markAllAsRead();
        toast.success('All notifications marked as read (demo)');
        if (selectedNotification) {
            setSelectedNotification((prev) => (prev ? { ...prev, isRead: true } : null));
        }
    };
    const handleDismiss = async (id) => {
        await notificationService.dismissNotification(id);
        if (selectedNotification?.id === id) {
            setSelectedNotification(null);
        }
        toast.info('Notification dismissed');
    };
    return (<div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Notifications" subtitle="Stay updated on appointments, patient conversations, and clinic activity." onOpenMobileMenu={onOpenMobileMenu}/>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 justify-end -mt-4 sm:mt-0">
          <Badge variant="neutral" size="sm" className="hidden sm:inline-flex bg-[#EDEBE3] text-closr-text-muted border-closr-border">
            Demo Mode
          </Badge>

          {unreadCount > 0 && (<Button type="button" variant="outline" size="sm" onClick={handleMarkAllAsRead} className="flex items-center gap-1.5 shadow-2xs">
              <CheckCheck className="w-3.5 h-3.5 text-closr-forest"/>
              <span>Mark all read</span>
            </Button>)}

          <Link to="/settings?section=notifications" className="p-2 rounded-xl bg-closr-card border border-closr-border text-closr-text-muted hover:text-closr-text hover:bg-closr-sage/30 transition-colors shadow-2xs closr-focus" title="Notification Rules & Preferences">
            <Settings className="w-4 h-4"/>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <NotificationSummaryCards totalCount={totalCount} unreadCount={unreadCount} needsAttentionCount={needsAttentionCount} activeFilter={summaryFilter} onSelectFilter={handleSummaryCardFilter}/>

      {/* Filters & Search Toolbar */}
      <NotificationFiltersToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} readFilter={readFilter} onReadFilterChange={setReadFilter} categoryFilter={categoryFilter} onCategoryFilterChange={setCategoryFilter} priorityFilter={priorityFilter} onPriorityFilterChange={setPriorityFilter} sortOrder={sortOrder} onSortOrderChange={setSortOrder} onResetFilters={handleResetFilters} hasActiveFilters={hasActiveFilters}/>

      {/* Main Inbox & Details Workspace Layout */}
      <div className="flex items-start gap-6 relative">
        {/* Left Column: Notification Feed */}
        <div className="flex-1 w-full min-w-0 space-y-6">
          {filteredNotifications.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-closr-card border border-closr-border shadow-soft text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-closr-sage/30 flex items-center justify-center text-closr-forest mx-auto">
                {hasActiveFilters ? (<SearchX className="w-6 h-6"/>) : (<Inbox className="w-6 h-6"/>)}
              </div>
              <h3 className="font-serif font-bold text-base text-closr-text">
                {hasActiveFilters
                ? 'No Notifications Match Your Filter'
                : 'All Caught Up! Inbox is Clear'}
              </h3>
              <p className="text-xs text-closr-text-muted max-w-sm mx-auto leading-relaxed">
                {hasActiveFilters
                ? 'No notifications matched your search query or criteria. Try resetting filters to view all records.'
                : 'You have no unread notifications or pending triage items at this moment.'}
              </p>
              {hasActiveFilters && (<div className="pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleResetFilters}>
                    Clear All Filters
                  </Button>
                </div>)}
            </div>) : (<>
              {/* Today Group */}
              {groupedNotifications.today.length > 0 && (<div className="space-y-2.5 text-left">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs font-semibold text-closr-forest uppercase tracking-wider">
                      Today · 29 October 2026
                    </span>
                    <span className="text-[10px] text-closr-text-muted bg-closr-sage/40 px-2 py-0.5 rounded-full border border-closr-border">
                      {groupedNotifications.today.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {groupedNotifications.today.map((notif) => (<NotificationListItem key={notif.id} notification={notif} onSelect={(n) => setSelectedNotification(n)} onToggleRead={handleToggleRead} onDismiss={handleDismiss} isSelected={selectedNotification?.id === notif.id}/>))}
                  </div>
                </div>)}

              {/* Yesterday Group */}
              {groupedNotifications.yesterday.length > 0 && (<div className="space-y-2.5 text-left pt-2">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs font-semibold text-closr-text-muted uppercase tracking-wider">
                      Yesterday · 28 October 2026
                    </span>
                    <span className="text-[10px] text-closr-text-muted bg-closr-sage/40 px-2 py-0.5 rounded-full border border-closr-border">
                      {groupedNotifications.yesterday.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {groupedNotifications.yesterday.map((notif) => (<NotificationListItem key={notif.id} notification={notif} onSelect={(n) => setSelectedNotification(n)} onToggleRead={handleToggleRead} onDismiss={handleDismiss} isSelected={selectedNotification?.id === notif.id}/>))}
                  </div>
                </div>)}

              {/* Earlier Group */}
              {groupedNotifications.earlier.length > 0 && (<div className="space-y-2.5 text-left pt-2">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs font-semibold text-closr-text-muted uppercase tracking-wider">
                      Earlier Records
                    </span>
                    <span className="text-[10px] text-closr-text-muted bg-closr-sage/40 px-2 py-0.5 rounded-full border border-closr-border">
                      {groupedNotifications.earlier.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {groupedNotifications.earlier.map((notif) => (<NotificationListItem key={notif.id} notification={notif} onSelect={(n) => setSelectedNotification(n)} onToggleRead={handleToggleRead} onDismiss={handleDismiss} isSelected={selectedNotification?.id === notif.id}/>))}
                  </div>
                </div>)}
            </>)}
        </div>

        {/* Right Column / Slide Drawer: Notification Details Panel */}
        {selectedNotification && (<div className="fixed inset-y-0 right-0 z-50 lg:static lg:z-auto lg:block h-full lg:h-auto shadow-2xl lg:shadow-none">
            <NotificationDetailsDrawer notification={selectedNotification} onClose={() => setSelectedNotification(null)} onToggleRead={handleToggleRead} onDismiss={handleDismiss}/>
          </div>)}
      </div>
    </div>);
};

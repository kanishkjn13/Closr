import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { useToast } from '../components/ui/Toast';
import { DateRangeSelector } from '../components/analytics/DateRangeSelector';
import { AnalyticsKpiCards } from '../components/analytics/AnalyticsKpiCards';
import { AppointmentTrendsChart } from '../components/analytics/AppointmentTrendsChart';
import { AppointmentStatusDonut } from '../components/analytics/AppointmentStatusDonut';
import { ReceptionistPerformanceCard } from '../components/analytics/ReceptionistPerformanceCard';
import { PatientEngagementCard } from '../components/analytics/PatientEngagementCard';
import { PopularServicesCard } from '../components/analytics/PopularServicesCard';
import { RecentAnalyticsActivity } from '../components/analytics/RecentAnalyticsActivity';
import { analyticsService, DEMO_TODAY } from '../services/analyticsService';
export const AnalyticsPage = () => {
    const { onOpenMobileMenu } = useOutletContext();
    const toast = useToast();
    // Date Range State (Defaults to '7d' ending on DEMO_TODAY for rich immediate visibility)
    const [selectedPreset, setSelectedPreset] = useState('7d');
    const initialBounds = analyticsService.getDateBounds('7d');
    const [startDate, setStartDate] = useState(initialBounds.startDate);
    const [endDate, setEndDate] = useState(initialBounds.endDate);
    // Analytics Datasets
    const [kpiSummary, setKpiSummary] = useState({
        totalAppointments: 0,
        confirmedAppointments: 0,
        confirmationRate: 0,
        cancelledAppointments: 0,
        cancellationRate: 0,
        uniquePatientsAssisted: 0,
    });
    const [trends, setTrends] = useState([]);
    const [statusDistribution, setStatusDistribution] = useState([]);
    const [receptionistMetrics, setReceptionistMetrics] = useState({
        conversationsHandled: 0,
        appointmentsBooked: 0,
        escalationsCount: 0,
        bookingConversionRate: null,
        avgResponseTimeSeconds: null,
    });
    const [patientEngagement, setPatientEngagement] = useState({
        uniquePatients: 0,
        newPatients: 0,
        returningPatients: 0,
        conversationsNeedingAttention: 0,
        unreadConversations: 0,
    });
    const [categoryMetrics, setCategoryMetrics] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    // Loading States
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    // Load all analytics data for current date bounds
    const loadAnalytics = useCallback(async (start, end, silent = false) => {
        if (!silent)
            setIsLoading(true);
        try {
            const [kpi, tr, dist, rec, eng, cat, act] = await Promise.all([
                analyticsService.getKpiSummary(start, end),
                analyticsService.getAppointmentTrends(start, end),
                analyticsService.getStatusDistribution(start, end),
                analyticsService.getReceptionistMetrics(start, end),
                analyticsService.getPatientEngagement(start, end),
                analyticsService.getCategoryMetrics(start, end),
                analyticsService.getActivityTimeline(),
            ]);
            setKpiSummary(kpi);
            setTrends(tr);
            setStatusDistribution(dist);
            setReceptionistMetrics(rec);
            setPatientEngagement(eng);
            setCategoryMetrics(cat);
            setRecentActivity(act);
        }
        finally {
            if (!silent)
                setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        loadAnalytics(startDate, endDate);
    }, [startDate, endDate, loadAnalytics]);
    // Handle Preset Changes
    const handlePresetChange = (preset) => {
        setSelectedPreset(preset);
        if (preset !== 'custom') {
            const bounds = analyticsService.getDateBounds(preset);
            setStartDate(bounds.startDate);
            setEndDate(bounds.endDate);
        }
    };
    // Handle Custom Range Apply
    const handleCustomRangeApply = (customStart, customEnd) => {
        setSelectedPreset('custom');
        setStartDate(customStart);
        setEndDate(customEnd);
        toast.info(`Updated analytics range: ${customStart} to ${customEnd}`);
    };
    // Handle Refresh
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await loadAnalytics(startDate, endDate, true);
            toast.success('Analytics recalculated from local clinic data');
        }
        catch {
            toast.error('Failed to refresh analytics');
        }
        finally {
            setIsRefreshing(false);
        }
    };
    // Handle CSV Export
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const csvContent = await analyticsService.generateCsvReport(startDate, endDate);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const fileName = `closr-analytics-${endDate || DEMO_TODAY}.csv`;
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success(`Exported ${fileName} successfully`);
        }
        catch {
            toast.error('Failed to export analytics report');
        }
        finally {
            setIsExporting(false);
        }
    };
    return (<div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <PageHeader title="Analytics" subtitle="Understand appointments, patient engagement, and receptionist performance." onOpenMobileMenu={onOpenMobileMenu}/>
      </div>

      {/* Date Range Selector Toolbar */}
      <DateRangeSelector selectedPreset={selectedPreset} startDate={startDate} endDate={endDate} onPresetChange={handlePresetChange} onCustomRangeApply={handleCustomRangeApply} onRefresh={handleRefresh} onExport={handleExport} isRefreshing={isRefreshing} isExporting={isExporting}/>

      {/* Loading Skeleton Indicator */}
      {isLoading ? (<div className="py-20 flex flex-col items-center justify-center text-closr-text-muted gap-3 text-xs">
          <div className="w-6 h-6 border-2 border-closr-forest border-t-transparent rounded-full animate-spin"/>
          <span>Aggregating clinic intelligence...</span>
        </div>) : (<div className="space-y-6">
          {/* Row 1: KPI Summary Cards */}
          <AnalyticsKpiCards kpi={kpiSummary}/>

          {/* Row 2: Large Appointment Trends Chart */}
          <AppointmentTrendsChart data={trends}/>

          {/* Row 3: Appointment Status Donut + AI Receptionist Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AppointmentStatusDonut distribution={statusDistribution} totalAppointments={kpiSummary.totalAppointments}/>
            <ReceptionistPerformanceCard metrics={receptionistMetrics}/>
          </div>

          {/* Row 4: Patient Engagement + Popular Appointment Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PatientEngagementCard engagement={patientEngagement}/>
            <PopularServicesCard categories={categoryMetrics}/>
          </div>

          {/* Row 5: Recent Activity Audit Log */}
          <RecentAnalyticsActivity events={recentActivity}/>
        </div>)}
    </div>);
};

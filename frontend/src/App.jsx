import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { PatientsPage } from './pages/PatientsPage';
import { MessagesPage } from './pages/MessagesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReceptionistPage } from './pages/ReceptionistPage';
import { NotFoundPage } from './pages/NotFoundPage';
export const App = () => {
    return (<ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Mobile AI Receptionist dedicated route */}
          <Route path="/receptionist" element={<ReceptionistPage />}/>

          {/* Desktop Dashboard shell & routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />}/>
            <Route path="appointments" element={<AppointmentsPage />}/>
            <Route path="patients" element={<PatientsPage />}/>
            <Route path="messages" element={<MessagesPage />}/>
            <Route path="analytics" element={<AnalyticsPage />}/>
            <Route path="settings" element={<SettingsPage />}/>
            <Route path="notifications" element={<NotificationsPage />}/>
            <Route path="*" element={<NotFoundPage />}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>);
};
export default App;

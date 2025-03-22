// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ----- Auth Components -----
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';

// ----- Viewer Components -----
import Profile from './components/Viewer/Profile';
import BrowseStreams from './components/Viewer/BrowseStreams';
import StreamViewer from './components/Viewer/StreamViewer';
import Chat from './components/Viewer/Chat';
import BecomeStreamer from './components/Viewer/BecomeStreamer';
import ReportContent from './components/Viewer/ReportContent';

// ----- Streamer Components -----
import ChannelSetup from './components/Streamer/ChannelSetup';
import GoLive from './components/Streamer/GoLive';
import ScheduleStream from './components/Streamer/ScheduleStream';

// ----- Admin Components -----
import AdminReports from './components/Admin/AdminReports';
import UserManagement from './components/Admin/UserManagement';
import Notifications from './components/Admin/Notifications';

// ----- Common Components -----
import NotificationsDisplay from './components/Common/NotificationsDisplay';

function App() {
  return (
    <BrowserRouter>
      {/* Display notifications for all users */}
      <NotificationsDisplay />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Viewer Routes */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/browse" element={<BrowseStreams />} />
        <Route path="/stream/:id" element={<StreamViewer />} />
        <Route path="/chat/:streamId" element={<Chat />} />
        <Route path="/become-streamer" element={<BecomeStreamer />} />
        <Route path="/report" element={<ReportContent />} />

        {/* Streamer Routes */}
        <Route path="/stream-setup" element={<ChannelSetup />} />
        <Route path="/go-live/:streamId" element={<GoLive />} />
        <Route path="/schedule" element={<ScheduleStream />} />

        {/* Admin Routes */}
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/notifications" element={<Notifications />} />

        {/* Default Route */}
        <Route path="/" element={<BrowseStreams />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
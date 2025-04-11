# Digital Marketing (Streaming Platform for Hot Gadgets)

A full‑stack web application that provides a live streaming platform with multiple user roles (Viewer, Streamer, Admin). The application features live streaming (using OBS and RTMP/HLS), real‑time chat, content reporting, profile management, and administrative actions – all built with a Flask backend and React frontend styled with Material‑UI.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Installation and Setup](#installation-and-setup)

## Features

- **User Roles:**
  - **Viewer:** Create account, login/logout, browse streams, watch live/recorded streams, follow streamers, customize profile, live chat.
  - **Streamer:** All viewer functionality plus channel setup, go live (start streaming), channel customization, scheduling streams.
  - **Admin:** Review and manage content reports, suspend/unsuspend accounts, send platform‑wide notifications.
- **Live Streaming:**
  - Integration with OBS for streaming to a local RTMP server.
  - RTMP to HLS conversion using Nginx with the RTMP module.
  - HLS playback in the browser using hls.js.
- **Real‑Time Chat:**
  - Persistent chat history with Socket.IO.
  - Users can chat in real time while watching streams.
- **Responsive Frontend:**
  - React application using Material‑UI for a modern and responsive design.
- **Administrative Panel:**
  - Manage reports, suspend/unsuspend users, and view notifications.

## Project Structure

### Backend

backend/
- nginx 1.7.11.3 Gryphon/hls
- app.py
- models.py
- database.py
- requirements.txt
 
 ### Frontend
frontend/
- src/
- - App.js
- - index.js
- - components/
- - - Admin
- - - - AdminReports.js
- - - - Notifications.js
- - - - UserManagement.js
- - - Auth
- - - - Login.js
- - - - Signup.js
- - - Common
- - - - NotificationsDisplay.js
- - - - Header.js
- - - Streamer
- - - - ChannelSetup.js
- - - - GoLive.js
- - - - ScheduleStream.js
- - - Viewer
- - - - BecomeAdmin.js
- - - - BecomeStreamer.js
- - - - BrowseStreams.js
- - - - Chat.js
- - - - Profile.js
- - - - ReportContent.js
- - - - StreamViewer.js


## Requirements

### Backend

- Python 3.7+
- Flask
- Flask-CORS
- Flask-SQLAlchemy
- Flask-SocketIO
- Werkzeug

### Frontend

- Node.js (v12+)
- npm
- React
- Material‑UI (v5)
- Axios
- React Router (v6)
- hls.js

### RTMP/HLS Streaming Server

- Nginx with the RTMP module  
_Note: For development on Windows, you can either use a pre‑compiled version of Nginx with RTMP support or run a Linux‑based Docker container._

## Installation and Setup

1. Open Two Terminals. in frontend and one in backend.
2. From /frontend terminal run npm start
3. from /backend terminal run python app.py 
4. Open Nginx folder and run the nginx.exe or open a terminal navigate to the folder and run nginx
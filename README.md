# MedTrack Pro - Local Setup Guide

Follow these steps to run the Patient Management & Hospital Visit Tracker on your local machine.

## Prerequisites
- **Node.js**: Ensure you have Node.js (v18 or higher) installed.
- **NPM**: Comes bundled with Node.js.

## Installation

1. **Install Dependencies**:
   Open your terminal in the project root and run:
   ```bash
   npm install
   ```

2. **API Key Setup**:
   The API key is already configured in the `.env` file for you. If you need to change it, update the `API_KEY` value in `.env`.

## Running the App

1. **Start Development Servers**:
   Run the following command to start both the Frontend (Vite) and the Backend (Node.js/Express):
   ```bash
   npm run dev
   ```

2. **Access the App**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:3001/api/data](http://localhost:3001/api/data)

## Features
- **Data Persistence**: Your data is saved to `db.json` in the root folder.
- **AI Insights**: Uses Gemini AI to provide clinical suggestions based on diagnosis.
- **PWA Ready**: Works offline via Service Workers and can be "Installed" to your desktop.
- **CSV Export**: Export your entire patient database to a spreadsheet-ready format.

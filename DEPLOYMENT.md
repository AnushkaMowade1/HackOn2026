# MedTriage AI - Deployment Guide

## System Overview
MedTriage AI is an AI-based emergency triage assistant that prioritizes patients based on:
- **Vital Signs**: Heart rate, blood pressure, SpO2, temperature, pain level
- **Symptoms**: Patient-reported and observed symptoms
- **Medical History**: Chronic diseases, allergies, medications, surgeries
- **Arrival Mode**: Walk-in vs Ambulance

## System Architecture

### Frontend (React + TypeScript + Vite)
- Dashboard: Patient intake and triage analysis
- Queue: Real-time patient prioritization
- Ambulance Alerts: Incoming emergency vehicles
- History: Past patient records

### Backend (json-server - Development / Database - Production)
- Stores patients, alerts, and history
- RESTful API endpoints

### AI Engine
- **Primary**: Google Generative AI (Gemini)
- **Fallback**: Rule-based clinical triage system

## Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnushkaMowade1/HackOn2026.git
   cd HackOn2026
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   API_KEY=your_google_ai_api_key_here
   VITE_API_URL=http://localhost:3001
   ```

4. **Start the backend server** (in one terminal)
   ```bash
   npm run server
   ```

5. **Start the frontend** (in another terminal)
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open http://localhost:3000 in your browser

### Default Login Credentials
- **Admin**: admin@medtriage.com / admin123
- **Receptionist**: receptionist@medtriage.com / reception123
- **Ambulance Controller**: ambulance@medtriage.com / ambulance123

## Production Deployment (Render)

### Step 1: Prepare the Repository
Ensure all changes are committed and pushed to GitHub.

### Step 2: Deploy Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `medtriage-backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`
   - **Plan**: Free

5. Add environment variables:
   - `API_KEY`: Your Google AI API key

6. Click **Create Web Service**
7. Copy the service URL (e.g., `https://medtriage-backend.onrender.com`)

### Step 3: Deploy Frontend on Render (or Vercel)

#### Option A: Render

1. Create another web service
2. Configure:
   - **Name**: `medtriage-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
   - **Environment Variables**:
     - `VITE_API_URL`: Your backend URL from Step 2
     - `API_KEY`: Your Google AI API key

#### Option B: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts
4. Add environment variables in Vercel dashboard:
   - `VITE_API_URL`: Your backend URL
   - `API_KEY`: Your Google AI API key

### Step 4: Update .env.production

Update the `.env.production` file with your actual backend URL:
```
VITE_API_URL=https://your-backend-url.onrender.com
```

## Features & Workflow

### 1. Patient Intake (Dashboard)
- Enter patient details, vitals, and symptoms
- Click "Predict Triage" to analyze
- AI analyzes and assigns triage level:
  - **Emergency** (Red): Immediate life-threatening
  - **Urgent** (Orange): Serious but stable
  - **Routine** (Green): Standard care needed
  - **Self-care** (Blue): Minor issues

### 2. Queue Management
- View all waiting patients by priority
- Click "Treat" to move patient to treatment
- Click "Complete" to discharge/admit patient
- Patients automatically sorted by triage level and time

### 3. Ambulance Alerts
- Ambulance controllers create incoming patient alerts
- Receptionists analyze alerts and add to queue
- Real-time ETA tracking
- Auto-priority for ambulance arrivals

### 4. History & Analytics
- View all discharged patients
- Export records to PDF
- Track treatment outcomes

## Triage Algorithm

### AI-Based (Primary)
Uses Google Gemini to analyze:
- Clinical presentation
- Vital signs abnormalities
- Symptom severity
- Age factors
- Arrival mode

### Rule-Based (Fallback)
When AI is unavailable, uses clinical protocols:
- Heart rate: <40 or >140 bpm = Emergency
- Blood pressure: <80 or >200 systolic = Emergency
- SpO2: <85% = Emergency
- Temperature: <34°C or >40°C = Emergency
- Pain: ≥8/10 = Urgent
- Critical symptoms: Chest pain, difficulty breathing = Emergency
- Ambulance arrival = Minimum Urgent

## Troubleshooting

### Queue not showing patients
- Ensure patients are added through "Add to Queue" button
- Check that `npm run server` is running
- Verify VITE_API_URL is correct

### Predict Triage not working
- Check API_KEY is set correctly
- Fallback will activate if API fails
- Check browser console for errors

### Build failures
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (18+ required)

## API Endpoints

- `GET /patients` - List all active patients
- `POST /patients` - Add new patient
- `PUT /patients/:id` - Update patient
- `DELETE /patients/:id` - Remove patient
- `GET /alerts` - List ambulance alerts
- `POST /alerts` - Create alert
- `GET /history` - Patient history

## Security Notes

- Never commit API keys to git
- Use environment variables for sensitive data
- Implement proper authentication in production
- Enable HTTPS for all deployments
- Sanitize all user inputs

## Support

For issues or questions:
- GitHub Issues: https://github.com/AnushkaMowade1/HackOn2026/issues
- Email: support@medtriage.ai

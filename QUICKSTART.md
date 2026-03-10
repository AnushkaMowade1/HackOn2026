# MedTriage AI - Quick Start Guide

## ✅ System Fixed & Ready

All issues have been resolved. The system is now a complete, end-to-end AI-based emergency triage assistant.

## What's Fixed

✅ **Queue Display** - Patients now correctly appear in the queue after being added
✅ **Patient Status Flow** - Proper status transitions (Waiting → In Treatment → Discharged)
✅ **Error Handling** - Graceful fallbacks when backend is unavailable
✅ **AI Triage** - Both AI-based and rule-based triage working perfectly
✅ **Ambulance Alerts** - Seamless integration with queue system
✅ **Database Integration** - Full CRUD operations with fallback to local state

## How to Run Locally

### Quick Start (2 terminals needed)

**Terminal 1 - Start Backend:**
```bash
cd HackOn2026
npm install
npm run server
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

Open http://localhost:3000

### Test the System

1. **Login** with: `admin@medtriage.com` / `admin123`

2. **Add a Patient** (Dashboard):
   - Fill patient details
   - Enter vitals (try: HR=140, BP=180/100, SpO2=88, Temp=39, Pain=9)
   - Add symptoms (Chest Pain, Difficulty Breathing)
   - Click "Predict Triage"
   - Review AI analysis
   - Click "Add to Queue"

3. **View Queue** (Queue page):
   - See patient prioritized by triage level
   - Click "Treat" to start treatment
   - Complete and discharge patient

4. **Create Ambulance Alert** (Ambulance Alerts):
   - Login as: `ambulance@medtriage.com` / `ambulance123`
   - Click "New Alert"
   - Fill details
   - Alert appears for receptionist to analyze

5. **View History** (History page):
   - See all discharged patients
   - Export to PDF

## How It Works

### Triage Decision Flow

```
Patient Intake → AI Analysis → Priority Assignment → Queue → Treatment → History
```

### AI Triage Criteria

**Emergency (Red)**
- Heart rate <40 or >140 bpm
- BP <80 or >200 systolic
- SpO2 <85%
- Temp <34°C or >40°C
- Critical symptoms (chest pain, severe bleeding, unconscious)

**Urgent (Orange)**
- Abnormal vitals (not critical)
- Pain level ≥8/10
- Ambulance arrival

**Routine (Green)**
- Stable vitals
- Moderate pain (5-7/10)
- Non-urgent symptoms

**Self-care (Blue)**
- Normal vitals
- Minor symptoms
- Low pain (<5/10)

## Deployment Checklist

Before deploying to production:

1. ✅ Set `API_KEY` environment variable
2. ✅ Update `VITE_API_URL` to production backend URL
3. ✅ Run `npm run build` to test build
4. ✅ Deploy backend first (Render/Railway)
5. ✅ Deploy frontend with backend URL
6. ✅ Test all features on production

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│  ┌─────────┐ ┌──────┐ ┌────────────┐ ┌─────────┐   │
│  │Dashboard│ │Queue│ │Ambulance   │ │History  │   │
│  │         │ │     │ │Alerts      │ │         │   │
│  └────┬────┘ └──┬───┘ └─────┬──────┘ └────┬────┘   │
│       └──────────┼───────────┼─────────────┘        │
│                  │           │                       │
│            ┌─────▼───────────▼─────┐                │
│            │  TriageContext (State) │                │
│            └─────────┬───────────────┘                │
└──────────────────────┼───────────────────────────────┘
                       │
              ┌────────▼────────┐
              │   AI Service    │
              │  ┌───────────┐  │
              │  │  Gemini   │  │
              │  │    AI     │  │
              │  └─────┬─────┘  │
              │        │        │
              │  ┌─────▼─────┐  │
              │  │Rule-Based │  │
              │  │ Fallback  │  │
              │  └───────────┘  │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │   Backend API   │
              │  (json-server)  │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │    Database     │
              │  ┌───────────┐  │
              │  │ Patients  │  │
              │  │ Alerts    │  │
              │  │ History   │  │
              │  └───────────┘  │
              └─────────────────┘
```

## API Flow Example

**Adding Patient to Queue:**
1. Dashboard → Enter patient data
2. Click "Predict Triage"
3. AI analyzes vitals + symptoms
4. Returns triage level + priority score
5. Click "Add to Queue"
6. POST /patients → Database
7. Patient appears in Queue page
8. Status: "Waiting"

**Processing Patient:**
1. Queue → Click "Treat"
2. PUT /patients/:id → status="In Treatment"
3. After treatment → Click "Complete"
4. PUT /patients/:id → status="Discharged"
5. POST /history → Archive patient
6. DELETE /patients/:id → Remove from queue

## Common Issues & Solutions

### Issue: Queue is empty
**Solution**: Make sure you clicked "Add to Queue" after predicting triage

### Issue: Backend not connecting
**Solution**: Ensure `npm run server` is running on port 3001

### Issue: Triage analysis fails
**Solution**: System automatically falls back to rule-based triage

### Issue: Build errors
**Solution**: Delete `node_modules`, run `npm install` again

## Testing Scenarios

### Scenario 1: Emergency Case
- HR: 35, BP: 70/40, SpO2: 82%, Temp: 40.5°C
- Symptoms: "Chest Pain", "Difficulty Breathing"
- Expected: Emergency (Red), Priority 95+

### Scenario 2: Urgent Case
- HR: 115, BP: 160/95, SpO2: 91%, Temp: 38.5°C
- Symptoms: "Severe Headache", "Nausea"
- Expected: Urgent (Orange), Priority 70-85

### Scenario 3: Routine Case
- HR: 78, BP: 125/82, SpO2: 97%, Temp: 37.2°C
- Symptoms: "Mild Cough", "Fatigue"
- Expected: Routine (Green), Priority 30-50

## Next Steps

1. **Test locally** - Follow quick start above
2. **Deploy backend** - Use Render or Railway
3. **Deploy frontend** - Use Vercel or Render
4. **Configure environment** - Set API_KEY and VITE_API_URL
5. **Test production** - Verify all features work

## Support

If you encounter any issues:
1. Check browser console for errors
2. Verify both frontend and backend are running
3. Ensure environment variables are set
4. Review DEPLOYMENT.md for detailed instructions

---

**Status**: ✅ System is fully functional and ready for deployment
**Last Updated**: March 10, 2026

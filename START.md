# How to Start the Application

## 🚀 Quick Start

### Step 1: Start the Backend Server
Open a terminal in the project directory and run:
```bash
npm run server
```

**You should see:**
```
JSON Server is running on port 3001
```

⚠️ **Keep this terminal running!** Don't close it.

---

### Step 2: Start the Frontend Development Server
Open a **SECOND** terminal in the project directory and run:
```bash
npm run dev
```

**You should see:**
```
VITE ready in X ms
Local: http://localhost:3000/
```

---

### Step 3: Open the Application
Open your browser and go to: **http://localhost:3000**

---

## 🧪 Testing the Application

### Test Patient Queue & History

1. **Login** with any credentials (authentication is simulated)
   - Username: Any name
   - Password: Any password

2. **Go to Dashboard** (first menu item)

3. **Fill in Patient Details:**
   - Name: Test Patient
   - Age: 30
   - Gender: Male
   - Blood Group: A+
   - Contact: 1234567890
   - Arrival Mode: Walk-in
   - Symptoms: Add some symptoms like "Fever", "Headache"
   - Fill in vital signs (Heart Rate, Blood Pressure, etc.)

4. **Click "Predict Triage"**
   - Wait for the AI analysis (or rule-based fallback)
   - You should see triage results

5. **Click "Add to Queue"**
   - Patient will be added to both Queue AND History

6. **Go to Queue Page** (second menu item)
   - You should see "Test Patient" in the queue
   - Patient status should be "Waiting"
   - Sorted by Emergency → Urgent → Routine

7. **Go to History Page** (third menu item)
   - You should see "Test Patient" in the history
   - All visit details should be displayed

---

## 🔍 Troubleshooting

### Queue or History is Empty?

**Open Browser DevTools (Press F12) → Console Tab**

Look for these console messages:

#### When Adding Patient:
✅ `Adding patient to queue: Test Patient Status: Waiting`
✅ `Patients array updated. Total patients: 1`
✅ `Adding patient to history: Test Patient`
✅ `History array updated. Total history records: 1`

#### When Viewing Queue:
✅ `Total patients: 1`
✅ `Filtered queue patients: 1`

#### When Viewing History:
✅ `History records: 1`

---

### If You See Console Messages BUT UI is Empty:

**The data is in state but not rendering!**

Try these steps:
1. Refresh the page (F5)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try a different browser
4. Check if there are any error messages in the console

---

### If You DON'T See Console Messages:

**The backend might not be running!**

1. Check Terminal 1 - Is `npm run server` still running?
2. Check Terminal 2 - Is `npm run dev` still running?
3. If either stopped, restart them

---

### Backend Not Starting?

**Error: `Port 3001 is already in use`**

Another process is using port 3001. Fix it:

**Windows:**
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

**Then restart:**
```bash
npm run server
```

---

### Frontend Not Starting?

**Error: `Port 3000 is already in use`**

Another process is using port 3000. Fix it:

**Windows:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

**Then restart:**
```bash
npm run dev
```

---

## 📋 Common Issues

### Issue: "Cannot find module"
**Solution:** Install dependencies
```bash
npm install
```

### Issue: API_KEY error
**Solution:** Check if `.env.development` exists with:
```
VITE_API_URL=http://localhost:3001
API_KEY=your-google-ai-api-key-here
```

### Issue: TypeScript errors
**Solution:** Rebuild TypeScript
```bash
npm run build
```

---

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Both terminals are running (`npm run server` and `npm run dev`)
- [ ] Browser is open at http://localhost:3000
- [ ] Browser DevTools Console is open (F12)
- [ ] No error messages in either terminal
- [ ] No error messages in browser console
- [ ] You see the console.log messages when adding patients
- [ ] You refreshed the page after adding patients

---

## 🆘 Still Not Working?

**Take a screenshot of:**
1. Browser DevTools Console (F12 → Console tab)
2. Terminal 1 (backend server)
3. Terminal 2 (frontend server)
4. The Queue or History page that's showing empty

**And provide:**
- What steps you followed
- What you expected to happen
- What actually happened
- Any error messages you see

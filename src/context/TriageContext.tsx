import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, AmbulanceAlert, TriageLevel, Vitals, TriageAnalysis } from '../types';
import { predictTriage } from '../services/aiService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface TriageContextType {
  patients: Patient[];
  history: Patient[];
  alerts: AmbulanceAlert[];
  analyzePatient: (
    name: string,
    age: number,
    arrivalMode: 'Walk-in' | 'Ambulance',
    vitals: Vitals,
    symptoms: string[]
  ) => Promise<TriageAnalysis>;
  addPatient: (
    name: string, 
    age: number, 
    gender: 'Male' | 'Female' | 'Other',
    bloodGroup: string,
    contactNumber: string,
    arrivalMode: 'Walk-in' | 'Ambulance', 
    vitals: Vitals, 
    symptoms: string[],
    analysis: TriageAnalysis
  ) => Patient;
  updatePatientStatus: (id: string, status: Patient['status'], outcome?: string, notes?: string) => void;
  addAlert: (alert: Omit<AmbulanceAlert, 'id' | 'timestamp'>) => void;
  removeAlert: (id: string) => void;
  updateAlertAnalysis: (id: string, analysis: TriageAnalysis) => void;
  savePatientToHistory: (patientId: string) => void;
  addPatientToHistory: (
    name: string, 
    age: number, 
    gender: 'Male' | 'Female' | 'Other',
    bloodGroup: string,
    contactNumber: string,
    arrivalMode: 'Walk-in' | 'Ambulance', 
    vitals: Vitals, 
    symptoms: string[],
    analysis: TriageAnalysis
  ) => void;
  currentAnalysis: TriageAnalysis | null;
  setCurrentAnalysis: (analysis: TriageAnalysis | null) => void;
  currentFormData: any | null;
  setCurrentFormData: (data: any | null) => void;
  loading: boolean;
}

const TriageContext = createContext<TriageContextType | undefined>(undefined);

export function TriageProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [history, setHistory] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<AmbulanceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<TriageAnalysis | null>(null);
  const [currentFormData, setCurrentFormData] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [patientsRes, historyRes, alertsRes] = await Promise.all([
          fetch(`${API_URL}/patients`).catch(() => null),
          fetch(`${API_URL}/history`).catch(() => null),
          fetch(`${API_URL}/alerts`).catch(() => null)
        ]);
        
        if (patientsRes && patientsRes.ok) {
          const patientsData = await patientsRes.json();
          console.log('Loaded patients from API:', patientsData.length);
          setPatients(patientsData);
        } else {
          console.warn('Backend unavailable - using local state only');
        }
        
        if (historyRes && historyRes.ok) {
          const historyData = await historyRes.json();
          console.log('Loaded history from API:', historyData.length);
          setHistory(historyData);
        } else {
          console.warn('Backend unavailable - using local state only');
        }
        
        if (alertsRes && alertsRes.ok) {
          const alertsData = await alertsRes.json();
          console.log('Loaded alerts from API:', alertsData.length);
          setAlerts(alertsData);
        } else {
          console.warn('Backend unavailable - using local state only');
        }
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        console.warn('System will work with local state only');
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if API_URL is configured and not localhost (or if we want to try anyway)
    fetchData();
  }, []);

  const analyzePatient = async (
    name: string,
    age: number,
    arrivalMode: 'Walk-in' | 'Ambulance',
    vitals: Vitals,
    symptoms: string[]
  ): Promise<TriageAnalysis> => {
    setLoading(true);
    try {
      const analysis = await predictTriage(name, age, arrivalMode, vitals, symptoms);
      return analysis;
    } catch (error) {
      console.error("Error analyzing patient:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addPatient = (
    name: string, 
    age: number, 
    gender: 'Male' | 'Female' | 'Other',
    bloodGroup: string,
    contactNumber: string,
    arrivalMode: 'Walk-in' | 'Ambulance', 
    vitals: Vitals, 
    symptoms: string[],
    analysis: TriageAnalysis
  ) => {
    const newPatient: Patient = {
      id: `P-${Date.now()}`,
      patientId: `PID-${String(patients.length + 1).padStart(4, '0')}`,
      name,
      age,
      gender,
      bloodGroup,
      contactNumber,
      arrivalMode,
      vitals,
      symptoms,
      triageLevel: analysis.triageLevel,
      analysis,
      timestamp: new Date().toISOString(),
      status: 'Waiting',
      medicalHistory: {
        chronicDiseases: [],
        allergies: [],
        medications: [],
        surgeries: [],
      },
    };
    
    console.log('Adding patient to queue:', newPatient.name, 'Status:', newPatient.status);
    
    // Immediately update local state
    setPatients(prev => {
      const updated = [...prev, newPatient];
      console.log('Patients array updated. Total patients:', updated.length);
      return updated;
    });
    
    // Then sync with backend
    fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPatient),
    })
    .then(res => res.json())
    .then(data => {
      console.log('Patient synced with backend:', data.name);
      // Update with server response if different
      setPatients(prev => prev.map(p => p.id === newPatient.id ? data : p));
    })
    .catch(error => {
      console.error('Failed to add patient to database:', error);
      console.log('Patient will remain in local state only');
    });

    return newPatient;
  };

  const updatePatientStatus = (id: string, status: Patient['status'], outcome?: string, notes?: string) => {
    const patientToUpdate = patients.find(p => p.id === id);
    if (patientToUpdate) {
      const updatedPatient = { ...patientToUpdate, status, outcome, doctorNotes: notes };
      
      // Update local state immediately
      setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
      
      // Then sync with backend
      fetch(`${API_URL}/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPatient),
      })
      .then(res => res.json())
      .then(data => {
        setPatients(prev => prev.map(p => p.id === id ? data : p));
      })
      .catch(error => {
        console.error('Failed to update patient status:', error);
      });
      
      if (status === 'Discharged' || status === 'Admitted' || status === 'Deceased') {
        savePatientToHistory(id);
      }
    }
  };

  const addAlert = (alertData: Omit<AmbulanceAlert, 'id' | 'timestamp'>) => {
    const newAlert: AmbulanceAlert = {
      id: `A-${Date.now()}`,
      ...alertData,
      timestamp: new Date().toISOString(),
    };

    // Immediately update local state
    setAlerts(prev => [...prev, newAlert]);
    
    // Then sync with backend
    fetch(`${API_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAlert),
    })
    .then(res => res.json())
    .then(data => {
      setAlerts(prev => prev.map(a => a.id === newAlert.id ? data : a));
    })
    .catch(error => {
      console.error('Failed to add alert to database:', error);
    });
  };

  const removeAlert = (id: string) => {
    // Immediately update local state
    setAlerts(prev => prev.filter(a => a.id !== id));
    
    // Then sync with backend
    fetch(`${API_URL}/alerts/${id}`, { method: 'DELETE' })
    .catch(error => {
      console.error('Failed to remove alert from database:', error);
    });
  };

  const updateAlertAnalysis = (id: string, analysis: TriageAnalysis) => {
    const alertToUpdate = alerts.find(a => a.id === id);
    if (alertToUpdate) {
      const updatedAlert = { ...alertToUpdate, analysis };
      
      fetch(`${API_URL}/alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAlert),
      })
      .then(res => res.json())
      .then(data => setAlerts(prev => prev.map(a => a.id === id ? data : a)));
    }
  };

  const savePatientToHistory = (patientId: string) => {
    const patientToSave = patients.find(p => p.id === patientId);
    if (patientToSave) {
      // Immediately add to history
      setHistory(prev => [...prev, patientToSave]);
      
      // Remove from active patients
      setPatients(prev => prev.filter(p => p.id !== patientId));
      
      // Sync with backend
      fetch(`${API_URL}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientToSave),
      })
      .then(res => res.json())
      .then(data => {
        setHistory(prev => prev.map(h => h.id === patientToSave.id ? data : h));
      })
      .catch(error => {
        console.error('Failed to save patient to history:', error);
      });
      
      // Delete from patients endpoint
      fetch(`${API_URL}/patients/${patientId}`, { method: 'DELETE' })
      .catch(error => {
        console.error('Failed to delete patient from active list:', error);
      });
    }
  };

  const addPatientToHistory = (
    name: string, 
    age: number, 
    gender: 'Male' | 'Female' | 'Other',
    bloodGroup: string,
    contactNumber: string,
    arrivalMode: 'Walk-in' | 'Ambulance', 
    vitals: Vitals, 
    symptoms: string[],
    analysis: TriageAnalysis
  ) => {
    const newHistoryPatient: Patient = {
      id: `H-${Date.now()}`,
      patientId: `PID-${String(history.length + 1).padStart(4, '0')}`,
      name,
      age,
      gender,
      bloodGroup,
      contactNumber,
      arrivalMode,
      vitals,
      symptoms,
      triageLevel: analysis.triageLevel,
      analysis,
      timestamp: new Date().toISOString(),
      status: 'Discharged',
      medicalHistory: {
        chronicDiseases: [],
        allergies: [],
        medications: [],
        surgeries: [],
      },
    };

    console.log('Adding patient to history:', newHistoryPatient.name);
    
    // Immediately update local state
    setHistory(prev => {
      const updated = [...prev, newHistoryPatient];
      console.log('History array updated. Total history records:', updated.length);
      return updated;
    });
    
    // Then sync with backend
    fetch(`${API_URL}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHistoryPatient),
    })
    .then(res => res.json())
    .then(data => {
      console.log('History synced with backend:', data.name);
      setHistory(prev => prev.map(h => h.id === newHistoryPatient.id ? data : h));
    })
    .catch(error => {
      console.error('Failed to add patient to history:', error);
      console.log('History record will remain in local state only');
    });
  };

  return (
    <TriageContext.Provider value={{ 
      patients, 
      history,
      alerts,
      analyzePatient, 
      addPatient, 
      updatePatientStatus,
      addAlert,
      removeAlert,
      updateAlertAnalysis,
      savePatientToHistory,
      addPatientToHistory,
      currentAnalysis,
      setCurrentAnalysis,
      currentFormData,
      setCurrentFormData,
      loading 
    }}>
      {children}
    </TriageContext.Provider>
  );
}

export function useTriage() {
  const context = useContext(TriageContext);
  if (context === undefined) {
    throw new Error('useTriage must be used within a TriageProvider');
  }
  return context;
}

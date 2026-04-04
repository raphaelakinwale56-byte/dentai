import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserCheck,
  CalendarDays,
  Stethoscope,
  Mail,
  Lock,
  ChevronRight,
  User,
  CalendarCheck,
  BellRing,
  UserPlus,
  Cpu,
  Send,
  Upload,
  FileText,
  XCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  FileSpreadsheet,
  Trash2,
  Edit2
} from 'lucide-react';
import { cn } from './lib/utils';
import { getChatResponse, parsePatientData, mapBulkImport } from './lib/gemini';
import Papa from 'papaparse';

// --- Components ---

const AddPatientModal = ({ isOpen, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    time: '',
    duration: '30',
    email: '',
    notes: '',
    service: 'General Consultation'
  });
  const [showMore, setShowMore] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const handleAiParse = async () => {
    if (!aiInput.trim()) return;
    setIsParsing(true);
    try {
      const parsed = await parsePatientData(aiInput);
      setFormData(prev => ({
        ...prev,
        patientName: parsed.patientName || prev.patientName,
        phone: parsed.phone || prev.phone,
        time: parsed.time || prev.time,
        duration: parsed.duration || prev.duration,
        email: parsed.email || prev.email,
        notes: parsed.notes || prev.notes,
        service: parsed.service || prev.service,
      }));
      if (parsed.email || parsed.notes) setShowMore(true);
    } catch (err) {
      console.error("AI Parse failed", err);
    } finally {
      setIsParsing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card w-full max-w-lg p-8 relative z-10 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-clinic-600" />
            Add New Patient
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* AI Input */}
          <div className="p-4 bg-clinic-50 border border-clinic-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-clinic-600 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                AI Smart Fill
              </label>
              {isParsing && <div className="w-3 h-3 border-2 border-clinic-600 border-t-transparent rounded-full animate-spin" />}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="e.g. John Doe, tomorrow at 10am, 555-0123"
                className="input-glass text-xs py-2"
                onKeyDown={(e) => e.key === 'Enter' && handleAiParse()}
              />
              <button 
                onClick={handleAiParse}
                disabled={isParsing}
                className="btn-glass py-2 px-4 text-xs whitespace-nowrap"
              >
                Parse
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                autoFocus
                type="text" 
                value={formData.patientName}
                onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                className="input-glass" 
                placeholder="Patient Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="input-glass" 
                placeholder="555-0000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Appointment Date</label>
              <input 
                type="datetime-local" 
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="input-glass text-xs" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Duration (Min)</label>
              <input 
                type="number" 
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="input-glass" 
                placeholder="30"
              />
            </div>
          </div>

          <button 
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors"
          >
            {showMore ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showMore ? 'Less details' : 'More details'}
          </button>

          {showMore && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pt-2"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-glass" 
                  placeholder="patient@email.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Notes / Procedure</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input-glass h-20 resize-none" 
                  placeholder="Special instructions or procedure details..."
                />
              </div>
            </motion.div>
          )}

          <div className="pt-4 flex gap-3">
            <button onClick={onClose} className="btn-glass flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200">Cancel</button>
            <button onClick={() => onSave(formData)} className="btn-glass flex-1">Save Patient</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const BulkImportSection = ({ onImport }: any) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isMapping, setIsMapping] = useState(false);

  const handleFileUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        setIsMapping(true);
        try {
          const mapped = await mapBulkImport(results.data);
          setPreviewData(mapped);
        } catch (err) {
          console.error("Mapping failed", err);
        } finally {
          setIsMapping(false);
        }
      }
    });
  };

  return (
    <div className="space-y-8">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
        className={cn(
          "border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all",
          isDragging ? "border-clinic-400 bg-clinic-50 scale-[0.99]" : "border-slate-200 hover:border-clinic-300"
        )}
      >
        <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
          <Upload className="w-10 h-10 text-slate-400" />
        </div>
        <h4 className="text-xl font-bold text-slate-900 mb-2">Import Patient Data</h4>
        <p className="text-sm text-slate-500 mb-8 text-center max-w-xs">
          Drag and drop your CSV or Excel file here. AI will automatically map and clean your data.
        </p>
        <label className="btn-glass cursor-pointer">
          Select File
          <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
        </label>
      </div>

      {isMapping && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-10 h-10 border-4 border-clinic-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-clinic-600 uppercase tracking-widest animate-pulse">AI Mapping Fields...</p>
        </div>
      )}

      {previewData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
              Detected Patients ({previewData.length})
            </h5>
            <button onClick={() => setPreviewData([])} className="text-xs font-bold text-rose-500 hover:underline uppercase tracking-widest">Clear</button>
          </div>
          
          <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-200 custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="p-4 font-bold text-slate-500 uppercase tracking-widest">Name</th>
                  <th className="p-4 font-bold text-slate-500 uppercase tracking-widest">Phone</th>
                  <th className="p-4 font-bold text-slate-500 uppercase tracking-widest">Appointment</th>
                  <th className="p-4 font-bold text-slate-500 uppercase tracking-widest">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewData.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-900 font-medium">{p.patientName}</td>
                    <td className="p-4 text-slate-500">{p.phone}</td>
                    <td className="p-4 text-slate-500">{p.time ? new Date(p.time).toLocaleString() : 'Not set'}</td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        value={p.duration || '30'} 
                        onChange={(e) => {
                          const newData = [...previewData];
                          newData[i].duration = e.target.value;
                          setPreviewData(newData);
                        }}
                        className="w-16 bg-transparent border-b border-slate-200 focus:border-clinic-500 outline-none text-slate-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button 
            onClick={() => { onImport(previewData); setPreviewData([]); }}
            className="btn-glass w-full flex items-center justify-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5" />
            Confirm Import
          </button>
        </motion.div>
      )}
    </div>
  );
};

const PatientCardStack = ({ patients, onComplete }: any) => {
  const [isSettling, setIsSettling] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSettling(true), 1500);
    const completeTimer = setTimeout(onComplete, 2200);
    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none">
      <AnimatePresence>
        {!isSettling && patients.map((p: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8, y: 100, rotate: -5 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: -i * 4, 
              x: i * 2,
              rotate: i * 1.5 - 2,
              transition: { 
                delay: i * 0.1, 
                type: 'spring', 
                damping: 20, 
                stiffness: 100 
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.2, 
              y: 400, 
              x: 200,
              rotate: 15,
              transition: { duration: 0.6, ease: [0.32, 0, 0.67, 0] }
            }}
            className="absolute w-72 h-44 glass-card p-6 border-clinic-200 shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex flex-col justify-between bg-white"
            style={{ zIndex: 100 - i }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-clinic-50 flex items-center justify-center border border-clinic-100">
                <User className="w-6 h-6 text-clinic-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 truncate">{p.patientName}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{p.service || 'General'}</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</p>
                <p className="text-xs font-mono text-slate-600">{p.phone}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            {/* Decorative Sparkle */}
            <div className="absolute top-2 right-2">
              <Sparkles className="w-4 h-4 text-clinic-600/20" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Settle Glow Effect */}
      <AnimatePresence>
        {isSettling && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.5 }}
            exit={{ opacity: 0 }}
            className="w-96 h-96 bg-clinic-500/10 rounded-full blur-[100px]"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Pages ---

const LoginPage = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [email, setEmail] = useState('admin@clinic.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      try {
  // ✅ Demo login (no backend needed)
  if (email && password) {
    onLogin({ email });
  } else {
    setError("Invalid credentials");
  }
} catch (err) {
  setError("Connection failed");
} finally {
  setLoading(false);
}
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="bg-animated" />
      
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-clinic-500/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-card w-full max-w-md p-10 relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-clinic-50 rounded-2xl flex items-center justify-center mb-6 border border-clinic-100 shadow-sm">
            <Stethoscope className="w-10 h-10 text-clinic-600" />
          </div>
          <h1 className="heading-os mb-2">DentAI</h1>
          <p className="text-slate-500 font-medium">Clinical Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 ml-1">Access ID</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass pl-12"
                placeholder="admin@clinic.os"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 ml-1">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass pl-12"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-glass w-full flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Initialize System
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({ booked: 24, reminders: 156, recovered: 12 });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportMode, setIsImportMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPatientsForAnimation, setNewPatientsForAnimation] = useState<any[]>([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch appointments');
    }
  };

  const handleAddPatient = async (formData: any) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const newPatient = await res.json();
        setIsAddModalOpen(false);
        setNewPatientsForAnimation([newPatient]);
      }
    } catch (err) {
      console.error("Add patient failed", err);
    }
  };

  const handleBulkImport = async (data: any[]) => {
    try {
      const res = await fetch('/api/appointments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setIsImportMode(false);
        setNewPatientsForAnimation(result.items);
      }
    } catch (err) {
      console.error("Bulk import failed", err);
    }
  };

  const onAnimationComplete = () => {
    setNewPatientsForAnimation([]);
    fetchAppointments();
  };

  const handleDeletePatient = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAppointments();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         apt.phone.includes(searchQuery);
    return matchesSearch;
  });

  const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
    <motion.div 
      whileHover={{ scale: 1.02, translateY: -5 }}
      className="glass-card p-6 flex items-center gap-3"
    >
      <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <Icon className={`w-8 h-8 text-${color}-600`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500 mb-1">{label}</p>
        <div className="flex items-baseline gap-3">
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen bg-slate-50 relative overflow-hidden">
      <div className="bg-animated" />
      
      <AddPatientModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddPatient} 
      />

      {newPatientsForAnimation.length > 0 && (
        <PatientCardStack 
          patients={newPatientsForAnimation} 
          onComplete={onAnimationComplete} 
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-72 glass-sidebar flex flex-col p-6 relative z-20"
      >
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="w-12 h-12 bg-clinic-50 rounded-xl flex items-center justify-center border border-clinic-100 shadow-sm">
            <Stethoscope className="w-6 h-6 text-clinic-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">DentAI</h2>
            <p className="text-[10px] font-bold text-clinic-600 tracking-[0.2em] uppercase">Operating System</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`nav-link w-full ${activeTab === 'overview' ? 'active' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </button>
          <button onClick={() => setActiveTab('chat')} className={`nav-link w-full ${activeTab === 'chat' ? 'active' : ''}`}>
            <MessageSquare className="w-5 h-5" />
            AI Assistant
          </button>
          <button onClick={() => setActiveTab('appointments')} className={`nav-link w-full ${activeTab === 'appointments' ? 'active' : ''}`}>
            <Calendar className="w-5 h-5" />
            Schedule
          </button>
          <button onClick={() => setActiveTab('settings')} className={`nav-link w-full ${activeTab === 'settings' ? 'active' : ''}`}>
            <Settings className="w-5 h-5" />
            System Config
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="glass-card p-4 flex items-center gap-3 mb-4 bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-clinic-50 flex items-center justify-center border border-clinic-100">
              <User className="w-5 h-5 text-clinic-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Admin OS</p>
              <p className="text-[10px] text-slate-500 truncate">System Administrator</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Terminate Session
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <header className="h-20 flex items-center justify-between px-10 border-b border-slate-200 backdrop-blur-md bg-white/50">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-900 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h2>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              System Online
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell className="w-6 h-6 text-slate-400 hover:text-slate-900 cursor-pointer transition-colors" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-clinic-500 rounded-full border-2 border-white" />
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Local Time</p>
              <p className="text-sm font-mono text-slate-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <StatCard icon={CalendarCheck} label="Appointments Booked" value={stats.booked} trend="+12%" color="clinic" />
                  <StatCard icon={BellRing} label="Reminders Dispatched" value={stats.reminders} trend="+8%" color="indigo" />
                  <StatCard icon={UserPlus} label="Patients Recovered" value={stats.recovered} trend="+5%" color="emerald" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass-card p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <Clock className="w-6 h-6 text-clinic-600" />
                        Today's Schedule
                      </h3>
                      <button onClick={() => setActiveTab('appointments')} className="text-xs font-bold text-clinic-600 hover:underline uppercase tracking-widest">View All</button>
                    </div>
                    <div className="space-y-4">
                      {appointments.filter(a => a.status === 'confirmed').slice(0, 4).map((apt) => (
                        <div key={apt.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-clinic-200 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-clinic-50 flex items-center justify-center text-clinic-600 font-bold border border-clinic-100">
                              {apt.patientName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover:text-clinic-600 transition-colors">{apt.patientName}</p>
                              <p className="text-xs text-slate-500 font-medium">{apt.service}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono text-slate-900">{new Date(apt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-rose-600" />
                        Recovery Queue
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {appointments.filter(a => a.status === 'missed').map((apt) => (
                        <div key={apt.id} className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100 hover:border-rose-200 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 font-bold border border-rose-100">
                              {apt.patientName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">{apt.patientName}</p>
                              <p className="text-xs text-slate-500 font-medium">Missed: {new Date(apt.time).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full"
              >
                <AIChatInterface onBookingComplete={fetchAppointments} />
              </motion.div>
            )}

            {activeTab === 'appointments' && (
              <motion.div 
                key="appointments"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="glass-card p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">Patient Ledger</h3>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Manage clinic schedule and patient data</p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsImportMode(!isImportMode)}
                        className="btn-glass py-2 text-xs flex items-center gap-2"
                      >
                        {isImportMode ? <LayoutDashboard className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        {isImportMode ? 'View List' : 'Bulk Import'}
                      </button>
                      <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn-glass py-2 text-xs flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Patient
                      </button>
                    </div>
                  </div>

                  {isImportMode ? (
                    <BulkImportSection onImport={handleBulkImport} />
                  ) : (
                    <div className="space-y-8">
                      {/* Search & Filter */}
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or phone..."
                            className="input-glass pl-12 py-2 text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button className="btn-glass py-2 px-4 bg-slate-50 border-slate-100">
                            <Filter className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-100">
                              <th className="pb-6 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Patient</th>
                              <th className="pb-6 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Procedure</th>
                              <th className="pb-6 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Duration</th>
                              <th className="pb-6 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredAppointments.map((apt) => (
                              <tr key={apt.id} className="group hover:bg-slate-50 transition-colors">
                                <td className="py-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-clinic-50 flex items-center justify-center text-clinic-600 font-bold text-sm border border-clinic-100">
                                      {apt.patientName[0]}
                                    </div>
                                    <div>
                                      <span className="font-bold text-slate-900 group-hover:text-clinic-600 transition-colors block">{apt.patientName}</span>
                                      <span className="text-[10px] text-slate-500 font-mono">{apt.phone}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-6 text-sm text-slate-500 font-medium">{apt.service}</td>
                                <td className="py-6 text-sm text-slate-500 font-mono">{apt.duration ? `${apt.duration}m` : '30m'}</td>
                                <td className="py-6 text-sm font-mono text-slate-600">
                                  {new Date(apt.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                              </tr>
                            ))}
                            {filteredAppointments.length === 0 && (
                              <tr>
                                <td colSpan={5} className="py-20 text-center">
                                  <div className="flex flex-col items-center gap-4 opacity-20">
                                    <Search className="w-12 h-12" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No patients found</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl space-y-8"
              >
                <div className="glass-card p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <Settings className="w-6 h-6 text-clinic-600" />
                    Clinic Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Clinic Name</label>
                      <input type="text" className="input-glass" defaultValue="Smile Design Studio" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Protocol</label>
                      <input type="text" className="input-glass" defaultValue="+1 (555) 012-3456" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Operational Directives</label>
                      <textarea className="input-glass h-32 resize-none" defaultValue="Focus on emergency triage and high-value orthodontic consultations. Maintain a warm but clinical tone." />
                    </div>
                  </div>
                  <div className="mt-10 flex justify-end">
                    <button className="btn-glass">Update System Config</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const AIChatInterface = ({ onBookingComplete }: any) => {
  const [messages, setMessages] = useState<any[]>([
    { role: 'ai', content: 'System initialized. I am your DentAI Front Desk Assistant. How can I assist with clinic operations today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const responseText = await getChatResponse(userMsg, messages);
      
      const bookingMatch = responseText.match(/BOOKING_DATA: ({.*})/);
      if (bookingMatch) {
        try {
          const bookingData = JSON.parse(bookingMatch[1]);
          await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData),
          });
          onBookingComplete();
        } catch (e) {
          console.error("Failed to parse booking data", e);
        }
      }

      const cleanText = responseText.replace(/BOOKING_DATA: {.*}/, '').trim();
      setMessages(prev => [...prev, { role: 'ai', content: cleanText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "I apologize, but I encountered a technical interruption. Please resubmit your request." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass-card overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-clinic-50 rounded-xl flex items-center justify-center border border-clinic-100">
            <Cpu className="w-5 h-5 text-clinic-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">DentAI Intelligence</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neural Link Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-clinic-400 rounded-full animate-pulse delay-75" />
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-5 rounded-2xl border ${
              msg.role === 'user' 
                ? 'bg-clinic-50 border-clinic-100 text-slate-900 rounded-tr-none' 
                : 'bg-slate-50 border-slate-100 text-slate-700 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Input command or query..."
            className="input-glass pr-16"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 p-2 bg-clinic-500 text-white rounded-lg hover:bg-clinic-600 transition-all shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-500 mt-4 font-bold uppercase tracking-[0.3em]">Neural Interface v2.0.4</p>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-clinic-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} 
        />
        <Route 
          path="/" 
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { PaymentStatusType, UserProfile } from "../types";
import { 
  Plus, 
  Trash2, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Save, 
  Percent, 
  LogOut, 
  Sparkles, 
  RefreshCw,
  FolderOpen,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  User,
  Database,
  Check,
  X,
  PlusCircle,
  ExternalLink,
  Clipboard,
  Eye,
  EyeOff,
  Clock3
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types matching the Supabase tables
export interface DBProject {
  id: string;
  created_at: string;
  title: string;
  client_email: string;
  price: string;
  progress: number;
  payment_status: PaymentStatusType;
  notes: string;
  delivery_date?: string;
}

export interface DBTimelineUpdate {
  id: string;
  created_at: string;
  project_id: string;
  title: string;
  content: string;
}

export interface DBWorkMoment {
  id: string;
  created_at: string;
  project_id: string;
  date: string; // YYYY-MM-DD
  description: string;
  type: 'werkmoment' | 'oplevering';
}

interface CustomerDashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

// Local mock/fallback data for demo & onboarding
const DEFAULT_LOCAL_PROJECTS: DBProject[] = [
  {
    id: "proj-1",
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    title: "Webdesign Portfolio - WebGen Professional",
    client_email: "stijnvanlier.rd@gmail.com",
    price: "€250",
    progress: 35,
    payment_status: "Betaald",
    notes: "Conceptfase afgerond. Momenteel bezig met het ontwerpen van de wireframes en kleurschema's.",
    delivery_date: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0]
  },
  {
    id: "proj-2",
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    title: "Schoonheidssalon Landing Page",
    client_email: "klant@voorbeeld.nl",
    price: "€310",
    progress: 75,
    payment_status: "In behandeling",
    notes: "AI chatbot geconfigureerd en aangesloten. Bezig met de laatste copywriting en sfeerbeelden.",
    delivery_date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0]
  }
];

const DEFAULT_LOCAL_TIMELINE: DBTimelineUpdate[] = [
  {
    id: "upd-1",
    created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    project_id: "proj-1",
    title: "Project Kickoff",
    content: "We hebben het intakegesprek succesvol afgerond en alle functionele eisen in kaart gebracht. Het designteam gaat aan de slag met wireframes."
  },
  {
    id: "upd-2",
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    project_id: "proj-1",
    title: "Concept en Kleurenpalet Goedgekeurd",
    content: "Het minimalistische designvoorstel is akkoord bevonden. We hebben de layout en lettertypen definitief vastgesteld."
  },
  {
    id: "upd-3",
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    project_id: "proj-2",
    title: "AI Chatbot Integratie",
    content: "De op maat gemaakte virtuele assistent is succesvol ingebouwd op de website en getraind met de behandelingsinformatie."
  }
];

const DEFAULT_LOCAL_WORK_MOMENTS: DBWorkMoment[] = [
  {
    id: "mom-1",
    created_at: new Date().toISOString(),
    project_id: "proj-1",
    date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
    description: "Layout verfijnen & Mobiele weergave",
    type: 'werkmoment'
  },
  {
    id: "mom-2",
    created_at: new Date().toISOString(),
    project_id: "proj-1",
    date: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
    description: "Definitieve oplevering website",
    type: 'oplevering'
  },
  {
    id: "mom-3",
    created_at: new Date().toISOString(),
    project_id: "proj-2",
    date: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
    description: "Teksten en foto's finetunen",
    type: 'werkmoment'
  },
  {
    id: "mom-4",
    created_at: new Date().toISOString(),
    project_id: "proj-2",
    date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    description: "Oplevering & online zetten",
    type: 'oplevering'
  }
];

export function CustomerDashboard({ user, onLogout }: CustomerDashboardProps) {
  // Determine if user has Management status
  const isManagementEmail = user.email?.endsWith("@webgen.nl") || user.email === "stijnvanlier.rd@gmail.com";
  const [viewAsKlant, setViewAsKlant] = useState(false);
  const isEffectiveManagement = isManagementEmail && !viewAsKlant;

  // Data States
  const [projects, setProjects] = useState<DBProject[]>([]);
  const [timelineUpdates, setTimelineUpdates] = useState<DBTimelineUpdate[]>([]);
  const [workMoments, setWorkMoments] = useState<DBWorkMoment[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active view states for management
  const [activeTab, setActiveTab] = useState<'projects' | 'calendar'>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // New project modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newPrice, setNewPrice] = useState("€250");
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatusType>("Nog niet betaald");
  const [newNotes, setNewNotes] = useState("");
  const [newDeliveryDate, setNewDeliveryDate] = useState("");

  // Timeline update form states
  const [newUpdateTitle, setNewUpdateTitle] = useState("");
  const [newUpdateContent, setNewUpdateContent] = useState("");

  // Calendar View states
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  
  // Quick schedule work moment states
  const [scheduleProjectId, setScheduleProjectId] = useState("");
  const [scheduleType, setScheduleType] = useState<'werkmoment' | 'oplevering'>('werkmoment');
  const [scheduleDesc, setScheduleDesc] = useState("");

  useEffect(() => {
    loadDatabase();
  }, []);

  // Save values to local storage if using fallback
  const syncLocalStorage = (projs: DBProject[], timeline: DBTimelineUpdate[], moments: DBWorkMoment[]) => {
    localStorage.setItem("webgen_projects", JSON.stringify(projs));
    localStorage.setItem("webgen_timeline_updates", JSON.stringify(timeline));
    localStorage.setItem("webgen_work_moments", JSON.stringify(moments));
  };

  const loadDatabase = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Projects
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*');

      if (projErr) throw projErr;

      // 2. Fetch Timeline Updates
      const { data: timelineData, error: timelineErr } = await supabase
        .from('timeline_updates')
        .select('*');

      if (timelineErr) throw timelineErr;

      // 3. Fetch Work Moments
      const { data: momentsData, error: momentsErr } = await supabase
        .from('work_moments')
        .select('*');

      if (momentsErr) throw momentsErr;

      // Successfully read from Supabase!
      setProjects(projData || []);
      setTimelineUpdates(timelineData || []);
      setWorkMoments(momentsData || []);
      setIsUsingFallback(false);
    } catch (err: any) {
      console.warn("Supabase tabellen nog niet aangemaakt of fout bij verbinding. Lokale fallback geactiveerd:", err);
      setIsUsingFallback(true);

      const localProj = localStorage.getItem("webgen_projects");
      const localTimeline = localStorage.getItem("webgen_timeline_updates");
      const localMoments = localStorage.getItem("webgen_work_moments");

      const p = localProj ? JSON.parse(localProj) : DEFAULT_LOCAL_PROJECTS;
      const t = localTimeline ? JSON.parse(localTimeline) : DEFAULT_LOCAL_TIMELINE;
      const m = localMoments ? JSON.parse(localMoments) : DEFAULT_LOCAL_WORK_MOMENTS;

      setProjects(p);
      setTimelineUpdates(t);
      setWorkMoments(m);
      syncLocalStorage(p, t, m);
    } finally {
      setLoading(false);
    }
  };

  // 1. PROJECT CREATION (MANAGEMENT ONLY)
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClientEmail.trim()) {
      setError("Vul alstublieft een titel en e-mailadres in.");
      return;
    }

    const projectId = "proj-" + Math.random().toString(36).substring(2, 11);
    const delDate = newDeliveryDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0];
    
    const newProjectItem: DBProject = {
      id: projectId,
      created_at: new Date().toISOString(),
      title: newTitle.trim(),
      client_email: newClientEmail.trim().toLowerCase(),
      price: newPrice,
      progress: 10,
      payment_status: newPaymentStatus,
      notes: newNotes.trim() || "Welkom bij uw nieuwe WebGen project! Hier verschijnen belangrijke opmerkingen.",
      delivery_date: delDate
    };

    const firstTimelineItem: DBTimelineUpdate = {
      id: "upd-" + Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString(),
      project_id: projectId,
      title: "Project Gestart",
      content: "Het project is succesvol geregistreerd in ons systeem. We gaan binnenkort van start met de designfase!"
    };

    const automaticDeliveryWorkMoment: DBWorkMoment = {
      id: "mom-" + Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString(),
      project_id: projectId,
      date: delDate,
      description: `Opleverdatum: ${newTitle}`,
      type: "oplevering"
    };

    try {
      if (!isUsingFallback) {
        const { error: projErr } = await supabase.from('projects').insert(newProjectItem);
        if (projErr) throw projErr;

        const { error: updErr } = await supabase.from('timeline_updates').insert(firstTimelineItem);
        if (updErr) throw updErr;

        const { error: momErr } = await supabase.from('work_moments').insert(automaticDeliveryWorkMoment);
        if (momErr) throw momErr;
      }

      // Update Local State
      const updatedProjs = [newProjectItem, ...projects];
      const updatedTimeline = [firstTimelineItem, ...timelineUpdates];
      const updatedMoments = [automaticDeliveryWorkMoment, ...workMoments];

      setProjects(updatedProjs);
      setTimelineUpdates(updatedTimeline);
      setWorkMoments(updatedMoments);
      syncLocalStorage(updatedProjs, updatedTimeline, updatedMoments);

      // Clear Form & Close
      setShowAddModal(false);
      setNewTitle("");
      setNewClientEmail("");
      setNewPrice("€250");
      setNewPaymentStatus("Nog niet betaald");
      setNewNotes("");
      setNewDeliveryDate("");
      setSelectedProjectId(projectId);
    } catch (err: any) {
      console.error("Error creating project in Supabase:", err);
      setError("Fout bij aanmaken in Supabase database. Probeer het via de demo modus.");
    }
  };

  // 2. TIMELINE UPDATE CREATION (MANAGEMENT ONLY)
  const handleAddTimelineUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newUpdateTitle.trim() || !newUpdateContent.trim()) return;

    const newUpdate: DBTimelineUpdate = {
      id: "upd-" + Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString(),
      project_id: selectedProjectId,
      title: newUpdateTitle.trim(),
      content: newUpdateContent.trim()
    };

    try {
      if (!isUsingFallback) {
        const { error: err } = await supabase.from('timeline_updates').insert(newUpdate);
        if (err) throw err;
      }

      const updated = [newUpdate, ...timelineUpdates];
      setTimelineUpdates(updated);
      syncLocalStorage(projects, updated, workMoments);

      setNewUpdateTitle("");
      setNewUpdateContent("");
    } catch (err) {
      console.error("Error adding update:", err);
      setError("Kon update niet opslaan.");
    }
  };

  // 3. CALENDAR WORK MOMENT SCHEDULING (MANAGEMENT ONLY)
  const handleScheduleMoment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCalendarDate || !scheduleProjectId || !scheduleDesc.trim()) return;

    const proj = projects.find(p => p.id === scheduleProjectId);
    const desc = scheduleType === "oplevering" 
      ? `Opleverdatum: ${proj?.title || "Project"}`
      : `Werkmoment aan ${proj?.title || "site"}: ${scheduleDesc.trim()}`;

    const newMoment: DBWorkMoment = {
      id: "mom-" + Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString(),
      project_id: scheduleProjectId,
      date: selectedCalendarDate,
      description: desc,
      type: scheduleType
    };

    try {
      if (!isUsingFallback) {
        const { error: err } = await supabase.from('work_moments').insert(newMoment);
        if (err) throw err;
      }

      // If it's an delivery date (oplevering), let's optionally update the project's own delivery date field too!
      if (scheduleType === "oplevering") {
        const updatedProjs = projects.map(p => p.id === scheduleProjectId ? { ...p, delivery_date: selectedCalendarDate } : p);
        setProjects(updatedProjs);
        if (!isUsingFallback) {
          await supabase.from('projects').update({ delivery_date: selectedCalendarDate }).eq('id', scheduleProjectId);
        }
        syncLocalStorage(updatedProjs, timelineUpdates, [...workMoments, newMoment]);
      }

      const updatedMoments = [...workMoments, newMoment];
      setWorkMoments(updatedMoments);
      syncLocalStorage(projects, timelineUpdates, updatedMoments);

      setScheduleDesc("");
    } catch (err) {
      console.error("Error scheduling moment:", err);
      setError("Kon planningsmoment niet opslaan.");
    }
  };

  // UPDATE PROJECT FIELDS (MANAGEMENT ONLY)
  const handleUpdateProgress = async (id: string, value: number) => {
    const updatedProjs = projects.map(p => p.id === id ? { ...p, progress: Math.min(100, Math.max(0, value)) } : p);
    setProjects(updatedProjs);
    syncLocalStorage(updatedProjs, timelineUpdates, workMoments);

    try {
      if (!isUsingFallback) {
        await supabase.from('projects').update({ progress: value }).eq('id', id);
      }
    } catch (err) {
      console.error("Error updating progress in Supabase:", err);
    }
  };

  const handleUpdatePaymentStatus = async (id: string, status: PaymentStatusType) => {
    const updatedProjs = projects.map(p => p.id === id ? { ...p, payment_status: status } : p);
    setProjects(updatedProjs);
    syncLocalStorage(updatedProjs, timelineUpdates, workMoments);

    try {
      if (!isUsingFallback) {
        await supabase.from('projects').update({ payment_status: status }).eq('id', id);
      }
    } catch (err) {
      console.error("Error updating status in Supabase:", err);
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    const updatedProjs = projects.map(p => p.id === id ? { ...p, notes } : p);
    setProjects(updatedProjs);
    syncLocalStorage(updatedProjs, timelineUpdates, workMoments);

    try {
      if (!isUsingFallback) {
        await supabase.from('projects').update({ notes }).eq('id', id);
      }
    } catch (err) {
      console.error("Error updating notes in Supabase:", err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Weet u zeker dat u dit project definitief wilt verwijderen? Dit wist ook alle tijdlijn-updates en werkmomenten.")) return;

    try {
      if (!isUsingFallback) {
        await supabase.from('projects').delete().eq('id', id);
      }
      const updatedProjs = projects.filter(p => p.id !== id);
      const updatedTimeline = timelineUpdates.filter(t => t.project_id !== id);
      const updatedMoments = workMoments.filter(m => m.project_id !== id);

      setProjects(updatedProjs);
      setTimelineUpdates(updatedTimeline);
      setWorkMoments(updatedMoments);
      syncLocalStorage(updatedProjs, updatedTimeline, updatedMoments);

      if (selectedProjectId === id) {
        setSelectedProjectId(null);
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Kon project niet verwijderen.");
    }
  };

  const handleDeleteMoment = async (id: string) => {
    try {
      if (!isUsingFallback) {
        await supabase.from('work_moments').delete().eq('id', id);
      }
      const updatedMoments = workMoments.filter(m => m.id !== id);
      setWorkMoments(updatedMoments);
      syncLocalStorage(projects, timelineUpdates, updatedMoments);
    } catch (err) {
      console.error("Error deleting work moment:", err);
    }
  };

  // Helper formats
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadgeColor = (status: PaymentStatusType) => {
    switch (status) {
      case "Betaald":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "In behandeling":
        return "bg-amber-500/10 text-amber-700 border-amber-200";
      default:
        return "bg-red-500/10 text-red-700 border-red-200";
    }
  };

  const getStatusIcon = (status: PaymentStatusType) => {
    switch (status) {
      case "Betaald":
        return <CheckCircle className="w-4 h-4" />;
      case "In behandeling":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // FILTERED PROJECTS FOR CLIENT
  // Client matches their user email with client_email in projects table.
  const clientProjects = projects.filter(p => p.client_email === user.email?.toLowerCase());

  // CALENDAR CALCULATION HELPERS
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Day index of the first day of the month (0 = Sunday, 1 = Monday, etc.)
    // We adjust to match Western European layout where Monday is the first column
    const firstDay = new Date(year, month, 1);
    const firstDayIndex = (firstDay.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    
    const daysInMonth = getDaysInMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);
    
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; key: string }[] = [];
    
    // Previous Month Padding Days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDay = prevMonthDays - i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: prevDay,
        isCurrentMonth: false,
        key: `prev-${prevDay}`
      });
    }
    
    // Current Month Days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: true,
        key: `curr-${i}`
      });
    }
    
    // Next Month Padding Days to fill grid rows (6 rows x 7 days = 42 cells)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        key: `next-${i}`
      });
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNamesNL = [
    "Januari", "Februari", "Maart", "April", "Mei", "Juni", 
    "Juli", "Augustus", "September", "Oktober", "November", "December"
  ];

  return (
    <div className="w-full px-8 md:px-16 py-12 space-y-10">
      
      {/* 1. Header with Role switcher for Testing */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/50 backdrop-blur-md p-8 rounded-[3rem] border border-white/50 shadow-xl">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-serif italic">
            {user.email?.charAt(0).toUpperCase() || "W"}
          </div>
          <div>
            <h2 className="text-2xl font-serif italic text-slate-800 leading-tight">
              Welkom terug, {user.displayName}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-xs px-3 py-1 font-bold rounded-full ${
                isManagementEmail ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}>
                Rol: {isManagementEmail ? "Medewerker (Management)" : "Klant"}
              </span>
              
              {isUsingFallback && (
                <span className="text-xs px-3 py-1 font-bold bg-amber-100 text-amber-700 border border-amber-200 rounded-full flex items-center gap-1">
                  <Database className="w-3 h-3" /> Demo Modus (Lokaal)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Manager mode preview switch */}
          {isManagementEmail && (
            <button
              onClick={() => {
                setViewAsKlant(!viewAsKlant);
                setSelectedProjectId(null);
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold rounded-full text-xs transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              {viewAsKlant ? (
                <>
                  <Eye className="w-4 h-4" /> Beheerdersmodus
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" /> Inkijken als Klant
                </>
              )}
            </button>
          )}

          <button
            onClick={onLogout}
            className="px-5 py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-100 font-bold rounded-full text-xs transition-all flex items-center gap-2 shadow-sm active:scale-95"
          >
            <LogOut className="w-4 h-4" /> Uitloggen
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="font-medium text-slate-500 text-sm">Supabase database synchroniseren...</p>
        </div>
      ) : (
        /* CORE CONTENT BLOCK */
        <div>
          {/* ========================================================================= */}
          {/* A. MANAGEMENT VIEWS                                                      */}
          {/* ========================================================================= */}
          {isEffectiveManagement ? (
            <div className="space-y-8">
              
              {/* Management Tabs Navigation */}
              <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
                <button
                  onClick={() => {
                    setActiveTab('projects');
                    setSelectedProjectId(null);
                  }}
                  className={`px-6 py-3 font-bold rounded-full text-sm transition-all flex items-center gap-2 ${
                    activeTab === 'projects' && !selectedProjectId
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-600 hover:bg-white/50"
                  }`}
                >
                  <FolderOpen className="w-4 h-4" /> Projecten & Klanten ({projects.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('calendar');
                    setSelectedProjectId(null);
                  }}
                  className={`px-6 py-3 font-bold rounded-full text-sm transition-all flex items-center gap-2 ${
                    activeTab === 'calendar'
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-600 hover:bg-white/50"
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" /> Maandagenda / Planning
                </button>
              </div>

              {/* TAB 1: PROJECTS LIST AND DETAIL */}
              {activeTab === 'projects' && (
                <div>
                  {!selectedProjectId ? (
                    /* Project Overview Grid */
                    <div className="space-y-6">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <h3 className="text-3xl font-serif italic text-slate-800">Projectbeheer</h3>
                          <p className="text-slate-600 text-sm font-medium mt-1">
                            Maak projecten aan voor klanten, pas de status aan en beheer hun updates.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer text-sm"
                        >
                          <Plus className="w-4 h-4" /> Nieuw Project Aanmaken
                        </button>
                      </div>

                      {projects.length === 0 ? (
                        <div className="bg-white/40 border border-dashed border-slate-300 p-12 rounded-[2rem] text-center space-y-3">
                          <FolderOpen className="w-12 h-12 text-slate-400 mx-auto" />
                          <h4 className="font-bold text-slate-700">Geen projecten gevonden</h4>
                          <p className="text-slate-500 text-sm">Maak direct uw eerste klantproject aan met de knop hierboven.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {projects.map((proj) => (
                            <div 
                              key={proj.id}
                              className="bg-white/70 backdrop-blur-sm border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex flex-col justify-between gap-6 relative group overflow-hidden"
                            >
                              <div className="space-y-4">
                                <div className="flex justify-between items-start gap-3">
                                  <div>
                                    <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase block mb-1">
                                      Klant: {proj.client_email}
                                    </span>
                                    <h4 className="text-xl font-serif italic text-slate-800 line-clamp-1">
                                      {proj.title}
                                    </h4>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 whitespace-nowrap ${getStatusBadgeColor(proj.payment_status)}`}>
                                    {getStatusIcon(proj.payment_status)} {proj.payment_status}
                                  </span>
                                </div>

                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-xs font-bold text-slate-500">
                                    <span>Voortgang</span>
                                    <span>{proj.progress}%</span>
                                  </div>
                                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                                      style={{ width: `${proj.progress}%` }}
                                    />
                                  </div>
                                </div>

                                <p className="text-slate-600 text-xs font-medium leading-relaxed line-clamp-2 italic bg-slate-50/50 p-3 rounded-xl border border-slate-100/40">
                                  "{proj.notes}"
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-slate-100/60 flex-wrap gap-3">
                                <div className="text-xs text-slate-500 font-bold">
                                  Prijs: <span className="text-slate-800 text-sm font-serif italic font-semibold">{proj.price}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setSelectedProjectId(proj.id)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-950 text-white font-bold rounded-full text-xs transition-all active:scale-95 shadow-sm"
                                  >
                                    Updates & Tijdlijn Beheren
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProject(proj.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-full transition-all active:scale-95"
                                    title="Verwijder Project"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Project Detail & Timeline updates authoring */
                    (() => {
                      const proj = projects.find(p => p.id === selectedProjectId);
                      if (!proj) return null;
                      const updates = timelineUpdates.filter(u => u.project_id === proj.id);

                      return (
                        <div className="space-y-8">
                          {/* Back Header */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-5 flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => setSelectedProjectId(null)}
                                className="w-10 h-10 bg-white hover:bg-slate-50 rounded-full border border-slate-200 flex items-center justify-center transition-all active:scale-95 shadow-sm text-slate-700"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <div>
                                <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">TERUG NAAR OVERZICHT</span>
                                <h3 className="text-2xl font-serif italic text-slate-800 leading-tight">{proj.title}</h3>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border">
                                Klant e-mail: {proj.client_email}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* LEFT SIDEBAR: Project Control Panel */}
                            <div className="bg-white/60 backdrop-blur-sm border border-slate-100 p-8 rounded-[2.5rem] space-y-6 shadow-sm h-fit">
                              <h4 className="text-lg font-serif italic text-slate-800 border-b pb-3">Project Status</h4>
                              
                              {/* Voortgang editor */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-600">
                                  <span>Voortgang regelen</span>
                                  <span className="text-blue-600 text-sm font-bold">{proj.progress}%</span>
                                </div>
                                <input 
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="5"
                                  value={proj.progress}
                                  onChange={(e) => handleUpdateProgress(proj.id, parseInt(e.target.value))}
                                  className="w-full accent-blue-600 cursor-ew-resize"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                  <span>Concept (10%)</span>
                                  <span>Oplevering (100%)</span>
                                </div>
                              </div>

                              {/* Betaalstatus select */}
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 block">Betaalstatus:</label>
                                <select
                                  value={proj.payment_status}
                                  onChange={(e) => handleUpdatePaymentStatus(proj.id, e.target.value as PaymentStatusType)}
                                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-gray-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-400"
                                >
                                  <option value="Nog niet betaald">Nog niet betaald</option>
                                  <option value="In behandeling">In behandeling</option>
                                  <option value="Betaald">Betaald</option>
                                </select>
                              </div>

                              {/* Richtprijs view */}
                              <div className="space-y-1">
                                <span className="text-xs font-bold text-slate-500 block">Schatting Prijs:</span>
                                <span className="text-lg font-serif italic text-slate-800 font-semibold">{proj.price}</span>
                              </div>

                              {/* Notes Editor */}
                              <div className="space-y-2 pt-2 border-t border-slate-100">
                                <label className="text-xs font-bold text-slate-600 block">Interne Opmerkingen / Notities:</label>
                                <textarea
                                  value={proj.notes}
                                  onChange={(e) => handleUpdateNotes(proj.id, e.target.value)}
                                  rows={4}
                                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  placeholder="Belangrijke afspraken of requirements..."
                                />
                                <p className="text-[10px] text-slate-400 italic">Wijzigingen worden direct live opgeslagen.</p>
                              </div>
                            </div>

                            {/* RIGHT CONTENT: timeline updates & write new update */}
                            <div className="lg:col-span-2 space-y-8">
                              
                              {/* Form to Write Update */}
                              <div className="bg-white/70 backdrop-blur-sm border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-4">
                                <h4 className="text-lg font-serif italic text-slate-800 flex items-center gap-2">
                                  <PlusCircle className="w-5 h-5 text-blue-600" /> Schrijf een Werkupdate op de Tijdlijn
                                </h4>
                                <form onSubmit={handleAddTimelineUpdate} className="space-y-3">
                                  <input 
                                    type="text"
                                    required
                                    value={newUpdateTitle}
                                    onChange={(e) => setNewUpdateTitle(e.target.value)}
                                    placeholder="Bijv. Wireframes opgeleverd, AI chatbot aangesloten..."
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  />
                                  <textarea
                                    required
                                    value={newUpdateContent}
                                    onChange={(e) => setNewUpdateContent(e.target.value)}
                                    placeholder="Beschrijf de verrichte werkzaamheden in detail voor de klant..."
                                    rows={3}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  />
                                  <button
                                    type="submit"
                                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Werkzaamheden Toevoegen
                                  </button>
                                </form>
                              </div>

                              {/* Visual Timeline updates */}
                              <div className="space-y-6">
                                <h4 className="text-xl font-serif italic text-slate-800">Project Tijdlijn</h4>
                                
                                {updates.length === 0 ? (
                                  <p className="text-slate-500 text-xs italic">Nog geen updates geplaatst op deze tijdlijn.</p>
                                ) : (
                                  <div className="relative border-l-2 border-blue-100/80 ml-4 pl-8 space-y-8">
                                    {updates.map((upd) => (
                                      <div key={upd.id} className="relative group">
                                        {/* Timeline node */}
                                        <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-blue-50 border-4 border-blue-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                        </div>
                                        
                                        {/* Timeline Content */}
                                        <div className="bg-white/50 backdrop-blur-sm border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow transition-all space-y-2">
                                          <div className="flex justify-between items-center flex-wrap gap-2">
                                            <h5 className="font-bold text-slate-800 text-sm">{upd.title}</h5>
                                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                              <Clock3 className="w-3 h-3 text-slate-300" /> {formatDate(upd.created_at)}
                                            </span>
                                          </div>
                                          <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                            {upd.content}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {/* TAB 2: INTERACTIVE CALENDAR AND PLANNING */}
              {activeTab === 'calendar' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-serif italic text-slate-800">Maandplanning & Agenda</h3>
                    <p className="text-slate-600 text-sm font-medium mt-1">
                      Beheer en plan opleverdatums en werkmomenten per site in op de kalender.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    
                    {/* CALENDAR RENDERING GRID (col-span-3) */}
                    <div className="xl:col-span-3 bg-white/60 backdrop-blur-sm border border-slate-100 p-8 rounded-[3rem] shadow-sm space-y-6">
                      
                      {/* Calendar Navigation header */}
                      <div className="flex items-center justify-between border-b pb-4">
                        <h4 className="text-xl font-serif italic text-slate-800 font-semibold">
                          {monthNamesNL[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handlePrevMonth}
                            className="w-10 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center transition-all active:scale-95"
                          >
                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => setCurrentMonth(new Date())}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-xs transition-all active:scale-95"
                          >
                            Vandaag
                          </button>
                          <button
                            onClick={handleNextMonth}
                            className="w-10 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center transition-all active:scale-95"
                          >
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>

                      {/* Day Labels */}
                      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                        <div>Ma</div>
                        <div>Di</div>
                        <div>Wo</div>
                        <div>Do</div>
                        <div>Vr</div>
                        <div>Za</div>
                        <div>Zo</div>
                      </div>

                      {/* Calendar cells */}
                      <div className="grid grid-cols-7 gap-2">
                        {getCalendarDays().map((day) => {
                          // Find scheduled items on this date
                          const itemsOnDay = workMoments.filter(m => m.date === day.dateStr);
                          const isToday = day.dateStr === new Date().toISOString().split('T')[0];
                          const isSelected = day.dateStr === selectedCalendarDate;

                          return (
                            <button
                              key={day.key}
                              onClick={() => setSelectedCalendarDate(day.dateStr)}
                              className={`min-h-[100px] p-2 rounded-2xl border text-left flex flex-col justify-between transition-all relative cursor-pointer ${
                                day.isCurrentMonth 
                                  ? "bg-white hover:bg-blue-50/40 border-slate-100/60" 
                                  : "bg-slate-50/40 text-slate-400 border-transparent hover:bg-slate-50"
                              } ${
                                isToday ? "ring-2 ring-blue-400 ring-offset-2" : ""
                              } ${
                                isSelected ? "bg-blue-50/50 border-blue-300" : ""
                              }`}
                            >
                              <span className={`text-xs font-bold ${
                                isToday ? "text-blue-600 font-extrabold" : "text-slate-700"
                              } ${!day.isCurrentMonth ? "text-slate-400/80" : ""}`}>
                                {day.dayNum}
                              </span>

                              {/* Badges list on day */}
                              <div className="space-y-1 mt-2 w-full overflow-hidden flex-1 flex flex-col justify-end">
                                {itemsOnDay.map((item) => (
                                  <div 
                                    key={item.id} 
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border leading-none truncate block w-full ${
                                      item.type === 'oplevering'
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    }`}
                                    title={item.description}
                                  >
                                    {item.type === 'oplevering' ? "🏁 " : "🛠️ "}
                                    {item.description}
                                  </div>
                                ))}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* PLANNING CONTROLS PANEL (col-span-1) */}
                    <div className="bg-white/60 backdrop-blur-sm border border-slate-100 p-8 rounded-[3rem] shadow-sm space-y-6">
                      <h4 className="text-lg font-serif italic text-slate-800 border-b pb-3">Inplannen & Details</h4>
                      
                      {selectedCalendarDate ? (
                        <div className="space-y-5 animate-fade-in">
                          <div className="p-3 bg-slate-50 rounded-2xl border">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GESELECTEERDE DATUM</span>
                            <span className="text-sm font-bold text-slate-800 block">
                              {new Date(selectedCalendarDate).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>

                          {/* List scheduled items on selected date */}
                          <div className="space-y-3">
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Geplande Taken ({workMoments.filter(m => m.date === selectedCalendarDate).length})</h5>
                            
                            {workMoments.filter(m => m.date === selectedCalendarDate).length === 0 ? (
                              <p className="text-slate-500 text-xs italic">Geen taken ingepland voor deze datum.</p>
                            ) : (
                              <div className="space-y-2">
                                {workMoments.filter(m => m.date === selectedCalendarDate).map((item) => (
                                  <div 
                                    key={item.id} 
                                    className={`p-3 rounded-xl border flex justify-between items-start gap-2 ${
                                      item.type === 'oplevering'
                                        ? "bg-emerald-50/50 text-emerald-800 border-emerald-100"
                                        : "bg-indigo-50/50 text-indigo-800 border-indigo-100"
                                    }`}
                                  >
                                    <div className="space-y-0.5 min-w-0">
                                      <span className="text-[9px] font-extrabold uppercase block tracking-wider">
                                        {item.type === 'oplevering' ? "🏁 OPLEVERING" : "🛠️ WERKMOMENT"}
                                      </span>
                                      <p className="text-xs font-medium leading-normal break-words">{item.description}</p>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteMoment(item.id)}
                                      className="text-red-500 hover:text-red-700 p-1 hover:bg-white rounded-full transition-colors active:scale-90 flex-shrink-0"
                                      title="Wissen van agenda"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Plan New Action Form */}
                          <div className="pt-4 border-t border-slate-100/60 space-y-3">
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Taak Toevoegen</h5>
                            
                            {projects.length === 0 ? (
                              <p className="text-slate-400 text-xs italic">Maak eerst een project aan om taken te kunnen inplannen.</p>
                            ) : (
                              <form onSubmit={handleScheduleMoment} className="space-y-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500">Project / Website:</label>
                                  <select
                                    required
                                    value={scheduleProjectId}
                                    onChange={(e) => setScheduleProjectId(e.target.value)}
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                                  >
                                    <option value="">-- Kies Project --</option>
                                    {projects.map(p => (
                                      <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500">Type Moment:</label>
                                  <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                                    <button
                                      type="button"
                                      onClick={() => setScheduleType('werkmoment')}
                                      className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                                        scheduleType === 'werkmoment' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"
                                      }`}
                                    >
                                      🛠️ Werkmoment
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setScheduleType('oplevering')}
                                      className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                                        scheduleType === 'oplevering' ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
                                      }`}
                                    >
                                      🏁 Oplevering
                                    </button>
                                  </div>
                                </div>

                                {scheduleType === 'werkmoment' && (
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500">Omschrijving:</label>
                                    <input 
                                      type="text"
                                      required
                                      value={scheduleDesc}
                                      onChange={(e) => setScheduleDesc(e.target.value)}
                                      placeholder="Bijv. CSS herstellen, SEO aanpassen..."
                                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
                                    />
                                  </div>
                                )}

                                <button
                                  type="submit"
                                  disabled={!scheduleProjectId}
                                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-bold text-xs shadow-sm transition-all active:scale-95"
                                >
                                  Taak Inplannen
                                </button>
                              </form>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 space-y-2">
                          <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto animate-bounce" />
                          <p className="text-slate-500 text-xs italic">Selecteer een datum op de kalender om werkzaamheden in te plannen.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ========================================================================= */
            /* B. CUSTOMER VIEW (FOR CLIENTS)                                            */
            /* ========================================================================= */
            <div className="space-y-8 animate-fade-in">
              <div>
                <h3 className="text-3xl font-serif italic text-slate-800">Mijn WebGen Projecten</h3>
                <p className="text-slate-600 text-sm font-medium mt-1">
                  Hieronder vindt u de live voortgang en werktijdlijnen van uw afgenomen diensten bij WebGen.
                </p>
              </div>

              {clientProjects.length === 0 ? (
                <div className="bg-white/40 border border-dashed border-slate-300 p-12 rounded-[2rem] text-center space-y-3 max-w-2xl mx-auto">
                  <FolderOpen className="w-12 h-12 text-slate-400 mx-auto animate-pulse" />
                  <h4 className="font-bold text-slate-700">Geen projecten gekoppeld</h4>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Er is momenteel geen lopend project gekoppeld aan het e-mailadres <strong>{user.email}</strong>. 
                    <br />Neem contact op met het WebGen team om uw project in de database te laten registeren.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* CLIENT SIDEBAR: Projects list select */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Selecteer Project</h4>
                    <div className="space-y-3">
                      {clientProjects.map((proj) => {
                        const isSelected = selectedProjectId === proj.id || (!selectedProjectId && clientProjects[0].id === proj.id);
                        if (!selectedProjectId && isSelected) {
                          // set first project as default selected in render flow
                          setTimeout(() => setSelectedProjectId(proj.id), 0);
                        }

                        return (
                          <button
                            key={proj.id}
                            onClick={() => setSelectedProjectId(proj.id)}
                            className={`w-full text-left p-6 rounded-[2rem] border transition-all cursor-pointer flex flex-col gap-3 ${
                              isSelected
                                ? "bg-white border-blue-200 shadow-md ring-1 ring-blue-50"
                                : "bg-white/50 hover:bg-white border-slate-100 shadow-sm"
                            }`}
                          >
                            <div>
                              <h5 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1">{proj.title}</h5>
                              <span className="text-[10px] text-slate-400 font-medium block mt-1">Prijs: {proj.price}</span>
                            </div>

                            <div className="space-y-1 w-full">
                              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                <span>Voortgang</span>
                                <span>{proj.progress}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 rounded-full transition-all duration-300" 
                                  style={{ width: `${proj.progress}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-100/60 text-[10px] font-bold">
                              <span className="text-slate-400">STATUS:</span>
                              <span className={`px-2 py-0.5 rounded-full border ${getStatusBadgeColor(proj.payment_status)}`}>
                                {proj.payment_status}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* CLIENT RIGHT SECTION: Timeline of active project */}
                  <div className="lg:col-span-2 space-y-6">
                    {(() => {
                      const activeProj = clientProjects.find(p => p.id === selectedProjectId) || clientProjects[0];
                      if (!activeProj) return null;
                      const updates = timelineUpdates.filter(u => u.project_id === activeProj.id);
                      const expectedDelivery = activeProj.delivery_date 
                        ? new Date(activeProj.delivery_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
                        : "Nader te bepalen";

                      return (
                        <div className="space-y-8 bg-white/60 backdrop-blur-sm border border-slate-100 p-8 md:p-10 rounded-[3rem] shadow-sm">
                          
                          {/* Project Header summary */}
                          <div className="space-y-4 border-b pb-6">
                            <div className="flex justify-between items-start gap-4 flex-wrap">
                              <div>
                                <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">LOPENDE PROJECT</span>
                                <h4 className="text-2xl font-serif italic text-slate-800 font-bold leading-tight">{activeProj.title}</h4>
                              </div>
                              <div className="p-3 bg-blue-50/50 rounded-2xl border text-right">
                                <span className="text-[9px] font-extrabold text-blue-600 uppercase block tracking-wider">Verwachte Oplevering</span>
                                <span className="text-xs font-bold text-slate-700 block">{expectedDelivery}</span>
                              </div>
                            </div>

                            <div className="space-y-2 max-w-xl">
                              <span className="text-[10px] font-bold text-slate-500 uppercase block">LAATSTE NOTITIES / STATUSUPDATE</span>
                              <p className="text-slate-600 text-xs font-semibold leading-relaxed bg-slate-50 p-4 rounded-2xl italic border">
                                "{activeProj.notes}"
                              </p>
                            </div>
                          </div>

                          {/* Customer timeline updates */}
                          <div className="space-y-6">
                            <h5 className="text-lg font-serif italic text-slate-800">Ontwikkelings Tijdlijn</h5>
                            
                            {updates.length === 0 ? (
                              <div className="text-center py-10 space-y-2 border border-dashed rounded-3xl">
                                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                                <p className="text-slate-500 text-xs italic">De tijdlijn is momenteel in voorbereiding.</p>
                              </div>
                            ) : (
                              <div className="relative border-l-2 border-blue-100/80 ml-4 pl-8 space-y-8">
                                {updates.map((upd) => (
                                  <div key={upd.id} className="relative group">
                                    {/* Timeline node */}
                                    <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-blue-50 border-4 border-blue-600 flex items-center justify-center shadow-sm">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                    </div>
                                    
                                    {/* Timeline Content */}
                                    <div className="bg-white/80 border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow transition-all space-y-2">
                                      <div className="flex justify-between items-center flex-wrap gap-2">
                                        <h6 className="font-bold text-slate-800 text-sm">{upd.title}</h6>
                                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                          <Clock3 className="w-3 h-3 text-slate-300" /> {formatDate(upd.created_at)}
                                        </span>
                                      </div>
                                      <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                        {upd.content}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* NEW PROJECT CREATION MODAL (MANAGEMENT ONLY) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#d0e1f9] rounded-[40px] shadow-3xl max-w-lg w-full p-8 md:p-10 border border-white/50 relative z-10 space-y-6 text-left"
            >
              <div className="space-y-2">
                <h4 className="text-3xl font-serif italic text-gray-950">Nieuw project aanmelden</h4>
                <p className="text-slate-700 text-xs font-medium">Vul de gegevens in om direct een nieuw webproject in Supabase te registreren.</p>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Project / Site Titel:</label>
                  <input 
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="E.g., Webshop voor Bloemenwinkel, Logo Ontwerp"
                    className="w-full p-4 bg-white rounded-2xl text-gray-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">E-mailadres van de klant:</label>
                  <input 
                    type="email"
                    required
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="klant@voorbeeld.nl"
                    className="w-full p-4 bg-white rounded-2xl text-gray-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <span className="text-[10px] text-slate-600 leading-normal block">
                    De klant kan met dit e-mailadres inloggen om zijn eigen tijdlijn in te zien.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Schatting Prijs:</label>
                    <select
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full p-4 bg-white rounded-2xl text-gray-800 text-xs font-semibold focus:outline-none"
                    >
                      <option value="€250">€250 (Basis Site)</option>
                      <option value="€310">€310 (Site + AI chatbot)</option>
                      <option value="€450">€450 (Webshop Pakket)</option>
                      <option value="€75">€75 (Logo Design)</option>
                      <option value="Op maat">Op maat</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Betaalstatus:</label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatusType)}
                      className="w-full p-4 bg-white rounded-2xl text-gray-800 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Nog niet betaald">Nog niet betaald</option>
                      <option value="In behandeling">In behandeling</option>
                      <option value="Betaald">Betaald</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Opleverdatum:</label>
                  <input 
                    type="date"
                    value={newDeliveryDate}
                    onChange={(e) => setNewDeliveryDate(e.target.value)}
                    className="w-full p-4 bg-white rounded-2xl text-gray-800 text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Notities / Briefing:</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Eventuele initiële wensen of kick-off afspraken..."
                    rows={2}
                    className="w-full p-4 bg-white rounded-2xl text-gray-800 text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg transition-all active:scale-95 text-xs"
                  >
                    Project Toevoegen & Opslaan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-4 bg-white text-gray-700 border border-gray-100 rounded-full font-bold shadow-sm hover:bg-gray-100 transition-all text-xs"
                  >
                    Annuleren
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

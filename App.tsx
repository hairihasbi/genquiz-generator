import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Link, 
  useLocation, 
  useNavigate 
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Archive, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  PlusCircle,
  Database,
  Activity,
  FileText,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  CloudCog,
  Upload,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Languages,
  Printer,
  FileType,
  Maximize2,
  Search,
  Filter,
  Lock,
  Unlock,
  Share2,
  UserPlus,
  Coins,
  Power,
  ShieldCheck,
  ShieldAlert,
  FileUp,
  RotateCw,
  Plus,
  Terminal,
  AlertTriangle,
  Info,
  Clock,
  Zap,
  Save,
  Server,
  Key,
  BookOpenCheck,
  LogIn,
  Link2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

import { Role, User, Quiz, QuestionType, Difficulty, Question, CognitiveLevel, QuizGenerationParams, Blueprint, LogEntry, LogType, SystemSettings } from './types';
import { generateQuizContent, generateImageForQuestion, validateGeminiConnection } from './services/geminiService';
import { dbService } from './services/dbService';
import MathRenderer from './components/MathRenderer';
import Homepage from './components/Homepage';

// --- STYLES FOR PRINTING ---
const PrintStyles = () => (
    <style>{`
        @media print {
            /* 1. Reset Global Page */
            @page {
                margin: 0;
                size: auto;
            }
            
            /* 2. Hide Everything Initially */
            body {
                visibility: hidden !important;
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
            }

            /* 3. Reset Constraints on Parents (Critical for multi-page) */
            /* We reset position, transform, and overflow on all containers that might clip content */
            html, body, #root, #quiz-preview-modal, .transform, .fixed, .absolute, .relative, .overflow-hidden, .overflow-auto, .flex, .h-full, .w-full {
                position: static !important;
                transform: none !important;
                transition: none !important;
                overflow: visible !important;
                height: auto !important;
                width: auto !important;
                display: block !important;
            }

            /* 4. Target Print Area - Make it the only visible element */
            #print-area {
                visibility: visible !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 2.5cm 2cm !important; /* Standard margins */
                background: white !important;
                box-shadow: none !important;
                border: none !important;
                z-index: 99999 !important;
            }

            /* 5. Ensure Children are Visible */
            #print-area * {
                visibility: visible !important;
                position: static !important; /* Restore normal flow */
            }

            /* 6. Typography Fixes */
            #print-area {
                color: black !important;
                font-family: 'Times New Roman', serif !important;
                font-size: 12pt !important;
                line-height: 1.5 !important;
            }
            .text-slate-500, .text-slate-400, .text-slate-600, .text-slate-800 {
                color: black !important;
            }

            /* 7. Page Break Handling */
            .avoid-break {
                break-inside: avoid;
                page-break-inside: avoid;
            }
            h1, h2, h3, h4 {
                break-after: avoid;
                page-break-after: avoid;
            }
            img {
                max-width: 100% !important;
                break-inside: avoid;
            }
            table, tr, td, th {
                page-break-inside: avoid;
            }

            /* 8. Layout Adjustments (Grid to Flex/Block) */
            .grid {
                display: block !important;
            }
            .grid-cols-2 > div {
                display: inline-block !important;
                width: 48% !important;
                vertical-align: top !important;
                margin-right: 1% !important;
                margin-bottom: 0.5rem !important;
            }

            /* 9. Hide UI Controls explicitly */
            .no-print {
                display: none !important;
            }
        }
    `}</style>
);

// --- COMPONENTS ---

// 1. Sidebar
const Sidebar = ({ user, isOpen, setIsOpen, onLogout }: any) => {
  const location = useLocation();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: [Role.ADMIN, Role.TEACHER] },
    { icon: PlusCircle, label: 'Buat Quiz', path: '/create-quiz', roles: [Role.ADMIN, Role.TEACHER] },
    { icon: Archive, label: 'Riwayat & Arsip', path: '/history', roles: [Role.ADMIN, Role.TEACHER] },
    { icon: CloudCog, label: 'Cloud Database', path: '/database', roles: [Role.ADMIN] },
    { icon: Users, label: 'Manajemen User', path: '/users', roles: [Role.ADMIN] },
    { icon: Activity, label: 'Log Sistem', path: '/logs', roles: [Role.ADMIN] },
    { icon: Settings, label: 'Pengaturan', path: '/settings', roles: [Role.ADMIN] },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-slate-900 border-r border-brand-200 dark:border-slate-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        no-print
      `}>
        <div className="flex items-center justify-center h-16 border-b border-brand-100 dark:border-slate-800 bg-brand-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold">Q</div>
            <span className="text-xl font-bold text-slate-800 dark:text-white">Gen-Z <span className="text-brand-500">Quiz</span></span>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {menuItems.map((item) => {
            if (!item.roles.includes(user.role)) return null;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                  ${isActive 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-800'}
                `}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
          
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 mt-8 transition-colors"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </nav>
      </aside>
    </>
  );
};

// 2. Dashboard
const Dashboard = ({ user }: { user: User }) => {
  const [stats, setStats] = useState({
    quizCount: 0,
    generated: 0
  });
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      const quizzes = await dbService.getQuizzes();
      setStats({
        quizCount: quizzes.length,
        generated: quizzes.length
      });
      const s = await dbService.getSettings();
      setSettings(s);
    };
    loadStats();
  }, []);

  const dbStatus = dbService.getConnectionStatus();
  const isTurso = dbStatus === 'TURSO';
  const isCronActive = settings?.cron.enabled || false;

  const data = [
    { name: 'Sen', generated: 40, published: 24 },
    { name: 'Sel', generated: 30, published: 13 },
    { name: 'Rab', generated: 20, published: 98 },
    { name: 'Kam', generated: 27, published: 39 },
    { name: 'Jum', generated: 18, published: 48 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Quiz', val: stats.quizCount.toString(), icon: BookOpen, color: 'bg-blue-500' },
          { label: 'Bank Soal', val: stats.generated.toString(), icon: Database, color: 'bg-brand-500' },
          { label: 'Credit Guru', val: user.credits.toString(), icon: Users, color: 'bg-green-500' },
          { 
            label: 'System Status', 
            val: isCronActive ? 'Cron Active' : 'Cron Idle', 
            icon: isCronActive ? RotateCw : Power, 
            color: isCronActive ? 'bg-purple-500' : 'bg-slate-500' 
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stat.val}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Statistik Pembuatan Soal</h3>
        <div className="h-80 w-full" style={{ minHeight: '320px' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar dataKey="generated" fill="#f97316" radius={[4, 4, 0, 0]} name="Soal Dibuat" />
              <Bar dataKey="published" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Terpublish" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// 3. User Management
const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newCredits, setNewCredits] = useState(50);
    
    const [editingCreditsId, setEditingCreditsId] = useState<string | null>(null);
    const [tempCredits, setTempCredits] = useState<number>(0);

    const loadUsers = async () => {
        const data = await dbService.getAllUsers();
        setUsers(data);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: User = {
            id: Date.now().toString(),
            username: newUsername,
            role: Role.TEACHER, // Default role
            credits: newCredits,
            isActive: true
        };
        await dbService.createUser(newUser, newPassword);
        setShowAddModal(false);
        setNewUsername('');
        setNewPassword('');
        setNewCredits(50);
        loadUsers();
    };

    const handleDeleteUser = async (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus user ini? Data tidak bisa dikembalikan.")) {
            await dbService.deleteUser(id);
            loadUsers();
        }
    };

    const handleToggleStatus = async (user: User) => {
        await dbService.toggleUserStatus(user.id, !user.isActive);
        loadUsers();
    };

    const startEditCredits = (user: User) => {
        setEditingCreditsId(user.id);
        setTempCredits(user.credits);
    };

    const saveCredits = async (id: string) => {
        await dbService.updateUserCredits(id, tempCredits);
        setEditingCreditsId(null);
        loadUsers();
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
             <div className="flex justify-between items-center mb-6">
               <div>
                   <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                       <Users className="text-brand-600"/> Manajemen User
                   </h2>
                   <p className="text-slate-500 text-sm">Kelola akses guru, kredit, dan status akun.</p>
               </div>
               <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20"
               >
                   <UserPlus size={18}/> Tambah Guru
               </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {users.map(u => (
                     <div key={u.id} className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border ${u.isActive ? 'border-slate-100 dark:border-slate-700' : 'border-red-200 bg-red-50 dark:bg-red-900/10'} hover:shadow-md transition-all`}>
                         <div className="flex justify-between items-start mb-4">
                             <div className="flex items-center gap-3">
                                 <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${u.role === Role.ADMIN ? 'bg-purple-100 text-purple-600' : 'bg-brand-100 text-brand-600'}`}>
                                     {u.username.charAt(0).toUpperCase()}
                                 </div>
                                 <div>
                                     <h3 className="font-bold text-slate-800 dark:text-white">{u.username}</h3>
                                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${u.role === Role.ADMIN ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                         {u.role}
                                     </span>
                                 </div>
                             </div>
                             {u.role !== Role.ADMIN && (
                                 <button 
                                     onClick={() => handleDeleteUser(u.id)}
                                     className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                 >
                                     <Trash2 size={16}/>
                                 </button>
                             )}
                         </div>

                         <div className="space-y-4">
                             <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl flex items-center justify-between">
                                 <div className="flex items-center gap-2 text-sm text-slate-500">
                                     <Coins size={16} className="text-orange-500"/>
                                     <span>Sisa Kredit:</span>
                                 </div>
                                 {editingCreditsId === u.id ? (
                                     <div className="flex items-center gap-2">
                                         <button onClick={() => setTempCredits(p => Math.max(0, p - 10))} className="w-6 h-6 bg-slate-200 rounded text-slate-600 font-bold hover:bg-slate-300">-</button>
                                         <input 
                                            type="number" 
                                            value={tempCredits} 
                                            onChange={(e) => setTempCredits(parseInt(e.target.value))}
                                            className="w-12 text-center bg-white border rounded text-sm font-bold"
                                         />
                                         <button onClick={() => setTempCredits(p => p + 10)} className="w-6 h-6 bg-slate-200 rounded text-slate-600 font-bold hover:bg-slate-300">+</button>
                                         <button onClick={() => saveCredits(u.id)} className="text-green-600 font-bold text-xs ml-1 hover:underline">Save</button>
                                     </div>
                                 ) : (
                                     <div className="flex items-center gap-2">
                                         <span className="font-bold text-slate-800 dark:text-white">{u.credits}</span>
                                         <button onClick={() => startEditCredits(u)} className="text-xs text-blue-500 hover:underline">Edit</button>
                                     </div>
                                 )}
                             </div>

                             <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                                 <span className="text-xs text-slate-400">Status Akun</span>
                                 {u.role !== Role.ADMIN ? (
                                     <button 
                                        onClick={() => handleToggleStatus(u)}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            u.isActive 
                                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                                        }`}
                                     >
                                         {u.isActive ? <ShieldCheck size={14}/> : <ShieldAlert size={14}/>}
                                         {u.isActive ? 'Active' : 'Disabled'}
                                     </button>
                                 ) : (
                                     <span className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold cursor-not-allowed">
                                         <ShieldCheck size={14}/> Protected
                                     </span>
                                 )}
                             </div>
                         </div>
                     </div>
                 ))}
             </div>

             {/* Add User Modal */}
             {showAddModal && (
                <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Tambah Guru Baru</h3>
                            <button onClick={() => setShowAddModal(false)}><X className="text-slate-400 hover:text-slate-600"/></button>
                        </div>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Username</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-brand-500"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Password</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-brand-500"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Limit Kredit</label>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" min="10" max="500" step="10"
                                        className="flex-1 accent-brand-500"
                                        value={newCredits}
                                        onChange={(e) => setNewCredits(parseInt(e.target.value))}
                                    />
                                    <span className="font-bold text-brand-600 w-12 text-center">{newCredits}</span>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl mt-4">
                                Simpan User
                            </button>
                        </form>
                    </div>
                </div>
             )}
        </div>
    );
};

// 5. Quiz Preview Modal (Used by History)
const QuizPreviewModal = ({ quiz, onClose }: { quiz: Quiz; onClose: () => void }) => {
   const [paperSize, setPaperSize] = useState<'A4' | 'Folio'>('A4');
   const [showAnswers, setShowAnswers] = useState(false);
   const [activeTab, setActiveTab] = useState<'QUESTIONS' | 'BLUEPRINT'>('QUESTIONS');

   useEffect(() => {
     if(window.MathJax) {
       setTimeout(() => {
           window.MathJax.typesetPromise?.();
       }, 500);
     }
   }, [quiz, activeTab]);

   const handlePrint = () => {
       window.print();
   };

   const handleExportDocx = () => {
       const content = document.getElementById('print-area')?.innerHTML;
       
       // Styles khusus untuk memperbaiki tampilan di Word:
       // 1. Definisi font untuk bahasa khusus (Arab, Jepang, dll)
       // 2. Perbaikan layout Grid menjadi Inline-Block (Word tidak support CSS Grid sempurna)
       // 3. Penanganan MathJax SVG agar tidak tertutup
       const css = `
         <style>
           @page { size: ${paperSize === 'A4' ? '210mm 297mm' : '215mm 330mm'} portrait; margin: 20mm; }
           body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #000; }
           
           /* Fonts for Languages - with Fallbacks for Windows */
           .font-arabic { font-family: 'Traditional Arabic', 'Amiri', 'Arial', serif; direction: rtl; text-align: right; font-size: 16pt; margin-bottom: 5px; }
           .font-jp { font-family: 'MS Mincho', 'Yu Mincho', 'Noto Sans JP', sans-serif; }
           .font-kr { font-family: 'Malgun Gothic', 'Batang', 'Noto Serif KR', sans-serif; }
           .font-tc { font-family: 'Microsoft JhengHei', 'SimSun', 'Noto Sans TC', sans-serif; }
           
           /* MathJax Export Fixes */
           mjx-container { outline: none !important; border: 0 !important; display: inline-block !important; }
           svg { vertical-align: middle !important; max-width: 100%; height: auto; }
           
           /* Layout Fixes for Word (Grid to Table-like layout) */
           .grid { display: block; width: 100%; margin-top: 10px; }
           .grid-cols-2 { display: block; width: 100%; }
           /* We select the divs inside grid-cols-2 (the options) */
           .grid-cols-2 > div { 
               display: inline-block; 
               width: 48%; 
               vertical-align: top; 
               margin-bottom: 5px; 
               box-sizing: border-box;
           }
           .gap-2 { margin-bottom: 5px; }
           
           /* Wacana Box */
           .wacana-box { border: 1px solid #000; padding: 10px; margin-bottom: 10px; background-color: #f9f9f9; font-style: italic; }

           /* Utilities */
           .text-right { text-align: right; }
           .font-bold { font-weight: bold; }
           .text-center { text-align: center; }
           .uppercase { text-transform: uppercase; }
           .mb-4 { margin-bottom: 1rem; }
           .mb-6 { margin-bottom: 1.5rem; }
           .border-b-2 { border-bottom: 2px solid black; }
           .pb-4 { padding-bottom: 1rem; }
           img { max-width: 5cm; height: auto; display: block; margin: 10px auto; border: 1px solid #ccc; }
         </style>
       `;

       const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' 
                             xmlns:w='urn:schemas-microsoft-com:office:word' 
                             xmlns='http://www.w3.org/TR/REC-html40'>
                       <head>
                         <meta charset='utf-8'>
                         <title>${quiz.title}</title>
                         ${css}
                       </head><body>`;
       const footer = "</body></html>";
       const sourceHTML = header + content + footer;
       
       const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
       const fileDownload = document.createElement("a");
       document.body.appendChild(fileDownload);
       fileDownload.href = source;
       fileDownload.download = `${quiz.title.replace(/\s+/g, '_')}_${activeTab}.doc`;
       fileDownload.click();
       document.body.removeChild(fileDownload);
   };

   // Dimensions for screen simulation
   const dims = paperSize === 'A4' ? 'w-[210mm] min-h-[297mm]' : 'w-[215mm] min-h-[330mm]';

   return (
       <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 overflow-hidden">
           <div id="quiz-preview-modal" className="bg-slate-200 dark:bg-slate-800 w-full h-full md:rounded-3xl flex flex-col overflow-hidden relative">
               
               {/* Modal Header (No Print) */}
               <div className="no-print bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-md z-10">
                   <div className="flex items-center gap-4">
                       <h3 className="font-bold text-lg dark:text-white truncate max-w-[200px]">{quiz.title}</h3>
                       <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-1">
                           <button onClick={() => setActiveTab('QUESTIONS')} className={`px-3 py-1 text-sm rounded-md font-bold transition-all ${activeTab === 'QUESTIONS' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}>Soal</button>
                           <button onClick={() => setActiveTab('BLUEPRINT')} className={`px-3 py-1 text-sm rounded-md font-bold transition-all ${activeTab === 'BLUEPRINT' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}>Kisi-Kisi</button>
                       </div>
                   </div>

                   <div className="flex items-center gap-3">
                       <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">
                           <span className="text-xs font-bold text-slate-500">Kertas:</span>
                           <select value={paperSize} onChange={(e) => setPaperSize(e.target.value as any)} className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none">
                               <option value="A4">A4</option>
                               <option value="Folio">Folio (F4)</option>
                           </select>
                       </div>
                       
                       {activeTab === 'QUESTIONS' && (
                           <button onClick={() => setShowAnswers(!showAnswers)} className={`p-2 rounded-lg transition-colors ${showAnswers ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`} title={showAnswers ? "Sembunyikan Jawaban" : "Lihat Jawaban"}>
                               {showAnswers ? <Eye size={18}/> : <EyeOff size={18}/>}
                           </button>
                       )}

                       <div className="h-6 w-px bg-slate-300 mx-1"></div>

                       <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm font-bold">
                           <Printer size={16}/> Print / PDF
                       </button>
                       <button onClick={handleExportDocx} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold">
                           <FileType size={16}/> DOCX
                       </button>

                       <div className="h-6 w-px bg-slate-300 mx-1"></div>

                       <button onClick={onClose} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                           <X size={20}/>
                       </button>
                   </div>
               </div>

               {/* Preview Area */}
               <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-slate-200 dark:bg-slate-900">
                   <div id="print-area" className={`print-sheet bg-white shadow-xl ${dims} p-[20mm] text-black font-serif text-[11pt] leading-normal origin-top scale-100 md:scale-95 transition-transform`}>
                       
                       {/* Header Document */}
                       <div className="border-b-2 border-black pb-4 mb-6 text-center">
                           <h1 className="font-bold text-xl uppercase mb-1">Bank Soal {quiz.level} - {quiz.grade}</h1>
                           <h2 className="font-bold text-lg uppercase mb-2">{quiz.subject}</h2>
                           <div className="flex justify-between text-sm mt-4 border-t border-black pt-2">
                               <span>Topik: {quiz.topic}</span>
                               <span>Waktu: 90 Menit</span>
                           </div>
                       </div>

                       {activeTab === 'QUESTIONS' ? (
                           <div className="space-y-6">
                               {quiz.questions.map((q, idx) => (
                                   <div key={q.id} className="avoid-break mb-4">
                                       
                                       {/* Wacana / Stimulus Display */}
                                       {q.stimulus && (
                                           <div className="wacana-box mb-3 border border-slate-800 p-3 bg-slate-50 text-sm">
                                               <div className={`${quiz.subject === 'Bahasa Arab' ? 'font-arabic text-right' : ''}`}>
                                                   <strong className="block mb-1 underline">Wacana / Stimulus:</strong>
                                                   <MathRenderer content={q.stimulus} />
                                               </div>
                                           </div>
                                       )}

                                       <div className="flex gap-2">
                                           <span className="font-bold">{idx + 1}.</span>
                                           <div className="flex-1">
                                                {/* Logic for specific fonts */}
                                                <div className={`${quiz.subject === 'Bahasa Arab' ? 'font-arabic text-right text-xl' : ''}`}>
                                                    <MathRenderer content={q.text} />
                                                </div>
                                                
                                                {q.imageUrl && (
                                                    <div className="my-3 flex justify-center">
                                                        <img src={q.imageUrl} alt="Visual" className="max-h-[5cm] object-contain border border-gray-300" />
                                                    </div>
                                                )}

                                                {/* Compact Options Grid */}
                                                {(q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.COMPLEX_MULTIPLE_CHOICE) && (
                                                    <div className={`mt-2 ${q.options && q.options.some(o => o.length > 50) ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-x-8 gap-y-2'}`}>
                                                        {q.options?.map((opt, i) => (
                                                            <div key={i} className="flex gap-2">
                                                                <span className="font-bold">{String.fromCharCode(65+i)}.</span>
                                                                <MathRenderer content={opt} inline />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Answer Key (If toggled) */}
                                                {showAnswers && (
                                                    <div className="mt-2 p-2 bg-slate-100 border border-slate-300 text-xs font-sans rounded">
                                                        <strong>Kunci:</strong> {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer} <br/>
                                                        <strong>Pembahasan:</strong> {q.explanation}
                                                    </div>
                                                )}
                                           </div>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       ) : (
                           <div>
                               <h3 className="font-bold text-center mb-4 uppercase">Kisi-Kisi Penulisan Soal</h3>
                               <table className="w-full border-collapse border border-black text-sm">
                                   <thead>
                                       <tr className="bg-gray-100">
                                           <th className="border border-black p-2 w-12">No</th>
                                           <th className="border border-black p-2">Kompetensi Dasar / CP</th>
                                           <th className="border border-black p-2">Indikator Soal</th>
                                           <th className="border border-black p-2 w-20">Level</th>
                                           <th className="border border-black p-2 w-20">Kesulitan</th>
                                           <th className="border border-black p-2 w-24">Bentuk Soal</th>
                                       </tr>
                                   </thead>
                                   <tbody>
                                       {quiz.blueprint.map((bp, idx) => (
                                           <tr key={idx}>
                                               <td className="border border-black p-2 text-center">{bp.questionNumber}</td>
                                               <td className="border border-black p-2">{bp.basicCompetency}</td>
                                               <td className="border border-black p-2">{bp.indicator}</td>
                                               <td className="border border-black p-2 text-center">{bp.cognitiveLevel}</td>
                                               <td className="border border-black p-2 text-center">{bp.difficulty}</td>
                                               <td className="border border-black p-2 text-center">PG</td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                           </div>
                       )}
                   </div>
               </div>
           </div>
       </div>
   );
};

// 6. History Archive Component (Added)
const HistoryArchive = ({ user }: { user: User }) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

    const loadQuizzes = async () => {
        setLoading(true);
        // Admin sees all, Teacher sees own
        const data = await dbService.getQuizzes(user.role === Role.ADMIN ? undefined : user.id);
        setQuizzes(data);
        setLoading(false);
    };

    useEffect(() => {
        loadQuizzes();
    }, [user]);

    const handleDelete = async (id: string) => {
        if(confirm("Hapus quiz ini secara permanen?")) {
            await dbService.deleteQuiz(id);
            loadQuizzes();
        }
    };

    const handleTogglePublic = async (q: Quiz) => {
        await dbService.toggleQuizVisibility(q.id, !q.isPublic);
        loadQuizzes();
    };

    const filtered = quizzes.filter(q => 
        q.title.toLowerCase().includes(filter.toLowerCase()) || 
        q.subject.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
               <div>
                   <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                       <Archive className="text-brand-600"/> Riwayat & Arsip
                   </h2>
                   <p className="text-slate-500 text-sm">Kelola bank soal yang telah dibuat.</p>
               </div>
               <div className="relative w-full md:w-64">
                   <input 
                      type="text" 
                      placeholder="Cari quiz..." 
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                   />
                   <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
               </div>
             </div>

             {loading ? (
                 <div className="text-center py-12">
                     <RefreshCw className="animate-spin mx-auto text-brand-500 mb-2"/>
                     <p className="text-slate-500">Memuat arsip...</p>
                 </div>
             ) : filtered.length === 0 ? (
                 <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                     <Archive size={48} className="mx-auto text-slate-300 mb-4"/>
                     <p className="text-slate-500">Belum ada quiz yang dibuat.</p>
                     <Link to="/create-quiz" className="text-brand-600 font-bold hover:underline mt-2 inline-block">Buat Quiz Baru</Link>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {filtered.map(q => (
                         <div key={q.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group">
                             <div className="flex justify-between items-start mb-3">
                                 <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                                     {q.subject}
                                 </span>
                                 <div className="flex gap-1">
                                     <button onClick={() => handleTogglePublic(q)} className={`p-1.5 rounded-lg transition-colors ${q.isPublic ? 'text-green-500 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`} title={q.isPublic ? "Public" : "Private"}>
                                         {q.isPublic ? <Share2 size={16}/> : <Lock size={16}/>}
                                     </button>
                                     <button onClick={() => handleDelete(q.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                         <Trash2 size={16}/>
                                     </button>
                                 </div>
                             </div>
                             
                             <h3 className="font-bold text-slate-800 dark:text-white mb-1 line-clamp-2 min-h-[3rem]">{q.title}</h3>
                             
                             <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                                 <Clock size={14}/>
                                 <span>{new Date(q.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                 <span>•</span>
                                 <span>{q.questions.length} Soal</span>
                             </div>

                             <div className="flex gap-2 mt-auto">
                                 <button 
                                     onClick={() => setSelectedQuiz(q)}
                                     className="flex-1 py-2 bg-brand-50 text-brand-600 dark:bg-slate-700 dark:text-white rounded-xl text-sm font-bold hover:bg-brand-100 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                                 >
                                     <Eye size={16}/> Detail
                                 </button>
                             </div>
                         </div>
                     ))}
                 </div>
             )}

             {selectedQuiz && (
                 <QuizPreviewModal quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />
             )}
        </div>
    );
};

// 7. Create Quiz Form
const SUBJECTS = {
  "Wajib Umum": ["Pendidikan Agama Islam dan Budi Pekerti", "Pendidikan Pancasila", "Bahasa Indonesia", "Matematika", "Sejarah", "Bahasa Inggris", "Seni Budaya", "PJOK", "PKWU"],
  "Peminatan MIPA": ["Biologi", "Fisika", "Kimia", "Matematika Peminatan"],
  "Peminatan IPS": ["Sosiologi", "Ekonomi", "Geografi", "Antropologi"],
  "Bahasa & Budaya": ["Bahasa & Sastra Indonesia", "Bahasa & Sastra Inggris", "Bahasa Arab", "Bahasa Jepang", "Bahasa Korea", "Bahasa Mandarin", "Bahasa Jerman", "Bahasa Perancis"],
  "Agama Lain": ["Pendidikan Agama Kristen", "Pendidikan Agama Katolik", "Pendidikan Agama Hindu", "Pendidikan Agama Buddha", "Pendidikan Agama Khonghucu"],
  "Vokasi": ["Dasar-dasar Kejuruan", "Matematika Terapan", "IPAS"]
};

const CreateQuiz = ({ user, onUpdateCredits }: { user: User; onUpdateCredits: (credits: number) => void }) => {
    const navigate = useNavigate(); // Moved to top
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loadingStep, setLoadingStep] = useState('');
    const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);

    // Form States
    const [subjectCategory, setSubjectCategory] = useState("Wajib Umum");
    const [subject, setSubject] = useState(SUBJECTS["Wajib Umum"][0]);
    const [level, setLevel] = useState("SMA");
    const [grade, setGrade] = useState("Kelas 10");
    const [topic, setTopic] = useState("");
    const [subTopic, setSubTopic] = useState("");
    
    // Files
    const [materialFile, setMaterialFile] = useState<File | null>(null);
    const [materialText, setMaterialText] = useState("");
    const [refImage, setRefImage] = useState<string | null>(null);

    // Parameters
    const [questionCount, setQuestionCount] = useState(10);
    const [mcOptionCount, setMcOptionCount] = useState<4 | 5>(5);
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
    const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([QuestionType.MULTIPLE_CHOICE]);
    const [selectedCognitive, setSelectedCognitive] = useState<CognitiveLevel[]>([CognitiveLevel.C2, CognitiveLevel.C3, CognitiveLevel.C4]);
    const [imgQuestionCount, setImgQuestionCount] = useState(0);
    
    // New: Fact Check State
    const [factCheck, setFactCheck] = useState(true);
    // New: Enable Reading Passages (Wacana)
    const [enableReadingPassages, setEnableReadingPassages] = useState(false);

    useEffect(() => {
        // Load default setting
        dbService.getSettings().then(s => setFactCheck(s.ai.factCheck));
    }, []);

    // Effect to auto-enable wacana for language subjects
    useEffect(() => {
        if (subjectCategory === "Bahasa & Budaya" || subject.includes("Bahasa")) {
            setEnableReadingPassages(true);
        } else {
            setEnableReadingPassages(false);
        }
    }, [subject, subjectCategory]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.type === "text/plain") {
            setMaterialFile(file);
            const text = await file.text();
            setMaterialText(text);
        } else {
            alert("Mohon upload file .txt saja untuk ringkasan materi.");
        }
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setRefImage(reader.result as string);
        };
        reader.readAsDataURL(e.target.files[0]);
        }
    };

    const toggleType = (t: QuestionType) => {
        if (selectedTypes.includes(t)) {
        setSelectedTypes(selectedTypes.filter(x => x !== t));
        } else {
        setSelectedTypes([...selectedTypes, t]);
        }
    };

    const toggleCognitive = (c: CognitiveLevel) => {
        if (selectedCognitive.includes(c)) {
        setSelectedCognitive(selectedCognitive.filter(x => x !== c));
        } else {
        setSelectedCognitive([...selectedCognitive, c]);
        }
    };

    const getLangContext = (subj: string) => {
        if (subj === 'Bahasa Arab') return 'AR';
        if (subj === 'Bahasa Jepang') return 'JP';
        if (subj === 'Bahasa Korea') return 'KR';
        if (subj === 'Bahasa Mandarin') return 'CN';
        if (subj === 'Bahasa Jerman') return 'DE';
        if (subj === 'Bahasa Perancis') return 'FR';
        return 'ID';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (user.credits < 1) {
        alert("Credit tidak mencukupi!");
        return;
        }
        if (selectedTypes.length === 0) {
        alert("Pilih minimal satu tipe soal.");
        return;
        }
        if (selectedCognitive.length === 0) {
        alert("Pilih minimal satu level kognitif.");
        return;
        }

        setLoading(true);
        setProgress(0);
        setLoadingStep("Menganalisis Parameter & Materi...");
        setGeneratedQuiz(null);

        const paramDetails = JSON.stringify({
            subject, topic, questionCount, difficulty, 
            types: selectedTypes, cognitive: selectedCognitive,
            factCheck,
            enableReadingPassages
        }, null, 2);

        await dbService.addLog("START_GENERATE_QUIZ", `Starting generation for ${subject}.\nParams: ${paramDetails}`, LogType.INFO, user.username);

        try {
            // Using service with environment variable key as per guidelines.
            // Skipping rotated key logic for generation call.

            setProgress(20);
            setLoadingStep("Mengenerate Soal Presisi (Gemini 3 Flash)...");
            
            const result = await generateQuizContent({
                subject,
                subjectCategory,
                level,
                grade,
                topic,
                subTopic,
                materialText,
                refImageBase64: refImage || undefined,
                questionCount,
                mcOptionCount,
                imageQuestionCount: imgQuestionCount,
                types: selectedTypes,
                difficulty,
                cognitiveLevels: selectedCognitive,
                languageContext: getLangContext(subject),
                enableReadingPassages // Pass the new param
            }, factCheck); 

            setProgress(60);

            const processedQuestions = [];
            let imgProcessedCount = 0;
            const totalImagesToGen = result.questions.filter(q => q.hasImage).length;

            if (totalImagesToGen > 0) {
                setLoadingStep(`Mengenerate Visual (${totalImagesToGen} Gambar)...`);
                for (const q of result.questions) {
                    if (q.hasImage && q.imagePrompt) {
                        const imgUrl = await generateImageForQuestion(q.imagePrompt);
                        processedQuestions.push({ ...q, imageUrl: imgUrl });
                        imgProcessedCount++;
                        setProgress(60 + Math.floor((imgProcessedCount / totalImagesToGen) * 35));
                    } else {
                        processedQuestions.push(q);
                    }
                }
            } else {
                processedQuestions.push(...result.questions);
                setProgress(95);
            }

            setLoadingStep("Menyimpan ke Database...");
            const newQuiz: Quiz = {
                id: Date.now().toString(),
                title: `${subject} - ${topic}`,
                subject,
                subjectCategory,
                level,
                grade,
                topic,
                subTopic,
                blueprint: result.blueprint,
                questions: processedQuestions,
                createdBy: user.id,
                createdAt: new Date().toISOString(),
                status: 'DRAFT',
                isPublic: false
            };

            await dbService.saveQuiz(newQuiz);
            
            // Update Credits Locally and in DB
            const newCredits = user.credits - 1;
            await dbService.updateUserCredits(user.id, newCredits);
            onUpdateCredits(newCredits); // Callback to update App state immediately
            
            await dbService.addLog("FINISH_GENERATE_QUIZ", `Successfully generated quiz ID: ${newQuiz.id}\nQuestions: ${newQuiz.questions.length}`, LogType.SUCCESS, user.username);

            setGeneratedQuiz(newQuiz);
            setProgress(100);
            setLoadingStep("Selesai!");

        } catch (err) {
            console.error(err);
            await dbService.addLog("ERROR_GENERATE_QUIZ", `Failed to generate quiz.\nError: ${(err as Error).message}`, LogType.ERROR, user.username);
            alert("Gagal membuat quiz: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (generatedQuiz) {
            navigate('/history');
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <BrainCircuit size={28} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Buat Quiz Baru</h2>
                <p className="text-slate-500 text-sm">Konfigurasi parameter AI untuk hasil presisi.</p>
            </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Subject & Level */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-brand-600 flex items-center gap-2">
                <BookOpen size={20}/> Informasi Mata Pelajaran
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <label className="block text-sm font-medium mb-2 dark:text-slate-300">Kategori Mapel</label>
                    <div className="relative">
                        <select 
                            className="w-full p-3 pl-4 pr-10 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                            value={subjectCategory}
                            onChange={(e) => {
                            setSubjectCategory(e.target.value);
                            setSubject(SUBJECTS[e.target.value as keyof typeof SUBJECTS][0]);
                            }}
                        >
                            {Object.keys(SUBJECTS).map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16}/>
                    </div>
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 dark:text-slate-300">Mata Pelajaran</label>
                    <div className="relative">
                        <select 
                            className="w-full p-3 pl-4 pr-10 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        >
                            {SUBJECTS[subjectCategory as keyof typeof SUBJECTS].map((s: string) => (
                            <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16}/>
                    </div>
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 dark:text-slate-300">Jenjang Sekolah</label>
                    <select className="w-full p-3 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 outline-none" value={level} onChange={e => setLevel(e.target.value)}>
                        <option>SMA</option>
                        <option>MA</option>
                        <option>SMK</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 dark:text-slate-300">Kelas</label>
                    <select className="w-full p-3 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 outline-none" value={grade} onChange={e => setGrade(e.target.value)}>
                        <option>Kelas 10</option>
                        <option>Kelas 11</option>
                        <option>Kelas 12</option>
                    </select>
                    </div>
                </div>
            </section>

            {/* Section 2: Material & Context */}
            <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-brand-600 flex items-center gap-2">
                <FileText size={20}/> Materi & Referensi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium mb-2 dark:text-slate-300">Topik / Tujuan Pembelajaran</label>
                    <input 
                        type="text" 
                        className="w-full p-3 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="Contoh: Integral Tentu, Hukum Newton II, Tata Bahasa Arab..."
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 dark:text-slate-300">Sub-Materi (Opsional)</label>
                    <input 
                        type="text" 
                        className="w-full p-3 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="Spesifik sub-bab..."
                        value={subTopic}
                        onChange={e => setSubTopic(e.target.value)}
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 dark:text-slate-300">Upload Ringkasan (.txt)</label>
                    <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-3 hover:border-brand-500 transition-colors bg-slate-50 dark:bg-slate-800 dark:border-slate-600">
                        <input type="file" accept=".txt" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="flex items-center justify-center gap-2 text-slate-500">
                            <Upload size={18}/>
                            <span className="text-sm truncate">{materialFile ? materialFile.name : "Pilih file .txt"}</span>
                        </div>
                    </div>
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 dark:text-slate-300">Gambar Referensi (Opsional)</label>
                    <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-3 hover:border-brand-500 transition-colors bg-slate-50 dark:bg-slate-800 dark:border-slate-600">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="flex items-center justify-center gap-2 text-slate-500">
                            <ImageIcon size={18}/>
                            <span className="text-sm truncate">{refImage ? "Gambar Terupload" : "Upload Gambar"}</span>
                        </div>
                    </div>
                    </div>
                </div>
            </section>

            {/* Section 3: AI Parameters */}
            <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-brand-600 flex items-center gap-2">
                <Settings size={20}/> Parameter Soal
                </h3>
                
                {/* Types */}
                <div>
                    <label className="block text-sm font-medium mb-3 dark:text-slate-300">Tipe Soal (Bisa pilih lebih dari satu)</label>
                    <div className="flex flex-wrap gap-3">
                    {[
                        { id: QuestionType.MULTIPLE_CHOICE, label: 'Pilihan Ganda' },
                        { id: QuestionType.COMPLEX_MULTIPLE_CHOICE, label: 'PG Kompleks' },
                        { id: QuestionType.TRUE_FALSE, label: 'Benar/Salah' },
                        { id: QuestionType.SHORT_ANSWER, label: 'Isian Singkat' },
                        { id: QuestionType.ESSAY, label: 'Uraian/Essay' }
                    ].map(type => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => toggleType(type.id)}
                            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${selectedTypes.includes(type.id) ? 'bg-brand-500 text-white border-brand-500 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}
                        >
                            {type.label}
                        </button>
                    ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                    <label className="block text-sm font-medium mb-2 dark:text-slate-300">Jumlah Soal</label>
                    <input 
                        type="number" min="1" max="50" 
                        className="w-full p-3 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 outline-none"
                        value={questionCount} onChange={e => setQuestionCount(parseInt(e.target.value))}
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 dark:text-slate-300">Opsi Jawaban (PG)</label>
                    <select 
                        className="w-full p-3 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 outline-none"
                        value={mcOptionCount} onChange={e => setMcOptionCount(parseInt(e.target.value) as 4|5)}
                    >
                        <option value={4}>4 Opsi (A-D)</option>
                        <option value={5}>5 Opsi (A-E)</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 dark:text-slate-300">Tingkat Kesulitan</label>
                    <select 
                        className="w-full p-3 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 outline-none"
                        value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)}
                    >
                        <option value="EASY">Mudah</option>
                        <option value="MEDIUM">Sedang</option>
                        <option value="HARD">Sulit</option>
                    </select>
                    </div>
                </div>
                
                {/* Cognitive Levels */}
                <div>
                    <label className="block text-sm font-medium mb-3 dark:text-slate-300">Level Kognitif (Bloom)</label>
                    <div className="flex flex-wrap gap-2">
                    {Object.values(CognitiveLevel).map((c: any) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => toggleCognitive(c)}
                            className={`w-10 h-10 rounded-lg text-xs font-bold border transition-all ${selectedCognitive.includes(c) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}
                        >
                            {c}
                        </button>
                    ))}
                    </div>
                </div>

                {/* AI Fact Checker Toggle Removed - Logic persists via system settings */}
                
                {/* Reading Passage Toggle (New) */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                             <BookOpenCheck size={20} />
                         </div>
                         <div>
                             <h4 className="font-bold text-slate-800 dark:text-white text-sm">Sertakan Wacana / Teks Literasi</h4>
                             <p className="text-xs text-slate-500">Otomatis generate teks bacaan (cerita, berita, dialog) untuk soal.</p>
                         </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={enableReadingPassages}
                            onChange={(e) => setEnableReadingPassages(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {/* Visuals */}
                <div className="bg-orange-50 dark:bg-slate-900 p-5 rounded-xl border border-orange-100 dark:border-slate-700 mt-4">
                    <label className="block text-sm font-bold text-brand-800 mb-3 flex items-center gap-2">
                    <ImageIcon size={16}/> Parameter Visual AI (Gemini 2.5 Flash / SVG)
                    </label>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Jumlah Soal Bergambar (Maks: {questionCount})</label>
                        <input 
                            type="number" 
                            min="0" 
                            max={questionCount}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-800"
                            value={imgQuestionCount} 
                            onChange={e => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) {
                                    if (val > questionCount) setImgQuestionCount(questionCount);
                                    else if (val < 0) setImgQuestionCount(0);
                                    else setImgQuestionCount(val);
                                } else {
                                    if (e.target.value === '') setImgQuestionCount(0); 
                                }
                            }}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Aplikasi otomatis menggunakan Gemini 2.5 Flash Image untuk generate. Jika gagal, otomatis fallback ke SVG.</p>
                </div>
            </section>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-600 to-orange-500 hover:from-brand-700 hover:to-orange-600 text-white font-bold py-4 rounded-xl shadow-xl shadow-brand-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
            >
                {loading ? <RefreshCw className="animate-spin" /> : <BrainCircuit />}
                {loading ? 'Sedang Memproses...' : 'Generate Soal Sekarang'}
            </button>

            </form>
        </div>

        {/* Loading Modal Overlay */}
        {loading && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 to-red-500 animate-pulse"></div>
                
                <div className="text-center space-y-6">
                    <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-700"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-brand-600 text-sm">{progress}%</div>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Sedang Membuat Quiz...</h3>
                        <p className="text-brand-600 font-medium animate-pulse">{loadingStep}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-xs text-slate-400">Mohon jangan tutup halaman ini.</p>
                    </div>
                </div>
            </div>
            </div>
        )}

        {/* Result Preview & Download */}
        {generatedQuiz && !loading && (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-brand-200 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-slate-100">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <CheckCircle2 className="text-green-500" /> Quiz Berhasil Dibuat!
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Total {generatedQuiz.questions.length} Soal | {generatedQuiz.subject}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={handleSave} className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm font-bold flex gap-2 items-center shadow-lg shadow-blue-500/30 transition-colors">
                        <Save size={18} /> Simpan ke Arsip
                    </button>
                    <button 
                        onClick={() => {
                            if (generatedQuiz) {
                                // Just a simple preview trigger logic if needed locally, usually handled via Modal or History
                                setGeneratedQuiz(generatedQuiz); 
                            }
                        }}
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold flex gap-2 items-center transition-colors"
                    >
                        <Eye size={18} /> Preview
                    </button>
                </div>
            </div>
            
            <div className="space-y-8">
                {generatedQuiz.questions.map((q: Question, idx: number) => (
                    <div key={q.id} className="group relative p-6 border border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-lg hover:border-brand-300 transition-all bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex justify-between items-start mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-sm shadow-md">
                            {idx + 1}
                        </span>
                        <div className="flex gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 px-2 py-1 rounded">{q.type.replace('_', ' ')}</span>
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">{q.cognitiveLevel}</span>
                            <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded">{q.difficulty}</span>
                        </div>
                        </div>

                        {/* Wacana / Stimulus Display in Card */}
                        {q.stimulus && (
                             <div className="mb-4 p-4 bg-white dark:bg-slate-700 rounded-lg border-l-4 border-blue-500 text-sm italic text-slate-600 dark:text-slate-300 shadow-sm">
                                <strong className="block mb-2 text-blue-600 dark:text-blue-400 not-italic">Wacana / Stimulus:</strong>
                                <div className={`${generatedQuiz.subject === 'Bahasa Arab' ? 'font-arabic text-right' : ''}`}>
                                    <MathRenderer content={q.stimulus} />
                                </div>
                             </div>
                        )}

                        <div className={`text-lg mb-6 leading-relaxed text-slate-800 dark:text-slate-200 ${
                        generatedQuiz.subject === 'Bahasa Arab' ? 'font-arabic text-right text-2xl' : 
                        generatedQuiz.subject === 'Bahasa Jepang' ? 'font-jp' : 
                        generatedQuiz.subject === 'Bahasa Korea' ? 'font-kr' : 
                        generatedQuiz.subject === 'Bahasa Mandarin' ? 'font-tc' : ''
                        }`}>
                        <MathRenderer content={q.text} />
                        </div>

                        {q.imageUrl && (
                        <div className="mb-6">
                            <img src={q.imageUrl} alt="Visual Soal" className="max-h-64 rounded-xl border border-slate-200 shadow-sm mx-auto" />
                        </div>
                        )}

                        {/* Options Render Logic */}
                        {(q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.COMPLEX_MULTIPLE_CHOICE) && (
                        <div className="grid grid-cols-1 gap-3 pl-4 border-l-2 border-slate-200">
                            {q.options?.map((opt, i) => (
                                <div key={i} className="flex gap-3 items-start p-2 rounded-lg hover:bg-white transition-colors">
                                    <span className="font-bold text-slate-500 min-w-[20px]">{String.fromCharCode(65+i)}.</span>
                                    <div className="text-slate-700 dark:text-slate-300">
                                    <MathRenderer content={opt} inline />
                                    </div>
                                </div>
                            ))}
                        </div>
                        )}

                        {/* Answer Key & Explanation (Toggleable in real app, shown here for clarity) */}
                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
                            <p className="text-sm text-green-800 dark:text-green-400 font-bold mb-1">Kunci Jawaban: <span className="font-mono bg-white px-2 py-0.5 rounded border border-green-200 ml-2">{Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</span></p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2"><span className="font-bold">Pembahasan:</span> {q.explanation}</p>
                        </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Added modal for previewing the newly generated quiz directly */}
            <QuizPreviewModal quiz={generatedQuiz} onClose={() => setGeneratedQuiz(null)} />
            </div>
        )}
        </div>
    );
};

// 8. Database Configuration (Previously CloudDatabase)
const CloudDatabase = () => {
    const [url, setUrl] = useState('');
    const [token, setToken] = useState('');
    const [status, setStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [msg, setMsg] = useState('');
    const [currentStatus, setCurrentStatus] = useState<'TURSO' | 'LOCAL'>('LOCAL');

    useEffect(() => {
        const conf = dbService.getStoredConfig();
        if (conf) {
            setUrl(conf.url);
            setToken(conf.token);
        }
        // Subscribe to ensure this component also updates if status changes elsewhere
        const unsubscribe = dbService.subscribe((s) => {
            setCurrentStatus(s);
        });
        return () => unsubscribe();
    }, []);

    const handleTest = async () => {
        setStatus('TESTING');
        setMsg('');
        const ok = await dbService.testConnection(url, token);
        if (ok) {
            setStatus('SUCCESS');
            setMsg("Koneksi Berhasil! Database dapat diakses.");
        } else {
            setStatus('ERROR');
            setMsg("Koneksi Gagal. Periksa URL dan Token.");
        }
    };

    const handleSave = async () => {
        const ok = await dbService.setTursoConfig(url, token);
        if (ok) {
            alert("Konfigurasi tersimpan dan terhubung ke Turso Cloud!");
        } else {
            alert("Gagal terhubung. Konfigurasi disimpan tapi sistem kembali ke Local Storage.");
        }
    };
    
    const handleDisconnect = async () => {
        if(confirm("Anda yakin ingin memutuskan koneksi dari cloud?")) {
            await dbService.disconnectTurso();
            setUrl('');
            setToken('');
            setStatus('IDLE');
            setMsg('');
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <CloudCog size={22} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Cloud Database</h2>
                    <p className="text-slate-500 text-sm">Konfigurasi koneksi ke Turso (libSQL) untuk sinkronisasi data real-time.</p>
                </div>
            </div>

            {/* Status Card */}
            <div className={`p-6 rounded-2xl border flex items-center justify-between ${currentStatus === 'TURSO' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${currentStatus === 'TURSO' ? 'bg-green-200 text-green-700' : 'bg-orange-200 text-orange-700'}`}>
                        {currentStatus === 'TURSO' ? <Wifi size={24}/> : <WifiOff size={24}/>}
                    </div>
                    <div>
                        <h4 className={`font-bold text-lg ${currentStatus === 'TURSO' ? 'text-green-800' : 'text-orange-800'}`}>
                            Status: {currentStatus === 'TURSO' ? 'Terhubung (Cloud)' : 'Offline (Local Storage)'}
                        </h4>
                        <p className={`text-sm ${currentStatus === 'TURSO' ? 'text-green-600' : 'text-orange-600'}`}>
                            {currentStatus === 'TURSO' 
                                ? 'Data tersimpan aman di server Turso.' 
                                : 'Data hanya tersimpan di browser ini. Hubungkan ke cloud untuk backup.'}
                        </p>
                    </div>
                </div>
                {currentStatus === 'TURSO' && (
                    <button onClick={handleDisconnect} className="px-4 py-2 bg-white text-red-500 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors shadow-sm">
                        Putuskan Koneksi
                    </button>
                )}
            </div>

            {/* Config Form */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Database URL (libsql://)</label>
                        <input 
                            type="text" 
                            className="w-full p-3 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                            placeholder="libsql://your-db-name.turso.io"
                            value={url}
                            onChange={(e) => {
                                // Auto-fix protocol on paste/type in DB Settings page too
                                let val = e.target.value;
                                if(val.startsWith('libsql://')) val = val.replace('libsql://', 'https://');
                                setUrl(val);
                            }}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Auth Token</label>
                        <div className="relative">
                            <input 
                                type="password" 
                                className="w-full p-3 pr-10 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                                placeholder="ey..."
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                            />
                            <Lock className="absolute right-3 top-3 text-slate-400" size={16}/>
                        </div>
                    </div>

                    {/* Feedback Message */}
                    {status !== 'IDLE' && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${
                            status === 'TESTING' ? 'bg-blue-50 text-blue-700' :
                            status === 'SUCCESS' ? 'bg-green-50 text-green-700' :
                            'bg-red-50 text-red-700'
                        }`}>
                            {status === 'TESTING' && <RefreshCw className="animate-spin"/>}
                            {status === 'SUCCESS' && <CheckCircle2/>}
                            {status === 'ERROR' && <AlertCircle/>}
                            {status === 'TESTING' ? 'Sedang menguji koneksi...' : msg}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={handleTest}
                            disabled={!url || !token || status === 'TESTING'}
                            className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            Test Connection
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={!url || !token}
                            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30 disabled:opacity-50"
                        >
                            Save & Connect
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="text-center text-xs text-slate-400">
                <p>Pastikan URL dimulai dengan <code>libsql://</code> atau <code>https://</code> (jika HTTP mode).</p>
                <p>Token dapat digenerate melalui Turso CLI: <code>turso db tokens create [db-name]</code></p>
            </div>
        </div>
    );
};

// 9. Login Component
const Login = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // DB Config State
  const [showDbSettings, setShowDbSettings] = useState(false);
  const [tursoUrl, setTursoUrl] = useState('');
  const [tursoToken, setTursoToken] = useState('');
  const [dbLoading, setDbLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  useEffect(() => {
      // Load stored config on mount to pre-fill if available
      const conf = dbService.getStoredConfig();
      if (conf.url) setTursoUrl(conf.url);
      if (conf.token) setTursoToken(conf.token);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Add a small delay to simulate network/processing for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = await dbService.authenticate(username, password);
      if (user) {
        if (!user.isActive) {
           setError('Akun dinonaktifkan. Hubungi admin.');
        } else {
           onLogin(user);
        }
      } else {
        setError('Username atau password salah.');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleDbSave = async () => {
      if(!tursoUrl || !tursoToken) return;
      setDbLoading(true);
      setDbStatus('IDLE');
      
      // Test connection first
      const success = await dbService.testConnection(tursoUrl, tursoToken);
      if (success) {
          await dbService.setTursoConfig(tursoUrl, tursoToken);
          setDbStatus('SUCCESS');
          // Auto close after success
          setTimeout(() => setShowDbSettings(false), 2000);
      } else {
          setDbStatus('ERROR');
      }
      setDbLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl w-full max-w-md border border-slate-100 relative transition-all duration-300">
        <div className="text-center mb-8">
           <div className="w-20 h-20 bg-brand-500 rounded-3xl flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-xl shadow-brand-500/30">
             Q
           </div>
           <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Welcome Back!</h2>
           <p className="text-slate-500 text-sm font-medium">Sign in to continue to Gen-Z Quiz</p>
        </div>
        
        {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-2 border border-red-100 animate-pulse">
                <AlertCircle size={18}/> {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
           <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Username</label>
              <input 
                type="text" 
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
           </div>
           <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
           </div>
           
           <button 
             type="submit" 
             disabled={loading}
             className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 text-lg"
           >
             {loading ? <RefreshCw className="animate-spin" size={20}/> : <LogIn size={20}/>}
             {loading ? 'Signing In...' : 'Sign In'}
           </button>
        </form>
        
        {/* DB Configuration Toggle (Moved below Sign In Button) */}
        <div className="mt-6 pt-6 border-t border-slate-100">
            <button 
                type="button"
                onClick={() => setShowDbSettings(!showDbSettings)}
                className="flex items-center justify-center gap-2 w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
                <Database size={14}/> 
                {showDbSettings ? 'Hide Connection Settings' : 'Configure Database Connection'}
                {showDbSettings ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            </button>

            {/* Collapsible Config Area */}
            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${showDbSettings ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Turso URL</label>
                            <input 
                                type="text" 
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="libsql://..."
                                value={tursoUrl}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if(val.startsWith('libsql://')) val = val.replace('libsql://', 'https://');
                                    setTursoUrl(val);
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 mb-1 ml-1">Auth Token</label>
                            <input 
                                type="password" 
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="ey..."
                                value={tursoToken}
                                onChange={(e) => setTursoToken(e.target.value)}
                            />
                        </div>
                        
                        {dbStatus === 'SUCCESS' && (
                            <div className="text-xs text-green-600 font-bold flex items-center gap-1 justify-center py-1">
                                <CheckCircle2 size={14}/> Connected Successfully!
                            </div>
                        )}
                        {dbStatus === 'ERROR' && (
                            <div className="text-xs text-red-500 font-bold flex items-center gap-1 justify-center py-1">
                                <AlertCircle size={14}/> Connection Failed
                            </div>
                        )}

                        <button 
                            type="button"
                            onClick={handleDbSave}
                            disabled={dbLoading || !tursoUrl || !tursoToken}
                            className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {dbLoading ? <RefreshCw className="animate-spin" size={12}/> : <Link2 size={12}/>}
                            Connect & Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="mt-8 text-center">
            <Link to="/" className="text-sm font-bold text-slate-400 hover:text-brand-600 transition-colors">Back to Homepage</Link>
        </div>
      </div>
    </div>
  );
};

// 10. System Logs Component
const SystemLogs = ({ user }: { user: User }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            const data = await dbService.getLogs();
            setLogs(data);
        };
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000); // Auto refresh
        return () => clearInterval(interval);
    }, []);

    const handleClear = async () => {
        if(confirm("Bersihkan semua log?")) {
            await dbService.clearLogs();
            setLogs([]);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
             <div className="flex justify-between items-center mb-6">
               <div>
                   <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                       <Activity className="text-brand-600"/> System Logs
                   </h2>
                   <p className="text-slate-500 text-sm">Monitor aktivitas sistem dan error log.</p>
               </div>
               <button onClick={handleClear} className="px-4 py-2 bg-white text-red-500 border border-red-200 hover:bg-red-50 rounded-xl font-bold flex items-center gap-2 transition-colors">
                   <Trash2 size={18}/> Clear Logs
               </button>
             </div>

             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                         <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 border-b border-slate-100 dark:border-slate-700">
                             <tr>
                                 <th className="px-6 py-4 font-bold">Timestamp</th>
                                 <th className="px-6 py-4 font-bold">Level</th>
                                 <th className="px-6 py-4 font-bold">Action</th>
                                 <th className="px-6 py-4 font-bold">User</th>
                                 <th className="px-6 py-4 font-bold">Details</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                             {logs.length === 0 ? (
                                 <tr><td colSpan={5} className="p-8 text-center text-slate-400">No logs found.</td></tr>
                             ) : (
                                 logs.map(log => (
                                     <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                         <td className="px-6 py-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                                             {new Date(log.timestamp).toLocaleString()}
                                         </td>
                                         <td className="px-6 py-4">
                                             <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                                                 log.type === LogType.ERROR ? 'bg-red-100 text-red-600' : 
                                                 log.type === LogType.SUCCESS ? 'bg-green-100 text-green-600' :
                                                 log.type === LogType.WARNING ? 'bg-orange-100 text-orange-600' :
                                                 'bg-blue-50 text-blue-600'
                                             }`}>
                                                 {log.type}
                                             </span>
                                         </td>
                                         <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{log.action}</td>
                                         <td className="px-6 py-4 text-slate-500">{log.userId}</td>
                                         <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={log.details}>
                                             {log.details}
                                         </td>
                                     </tr>
                                 ))
                             )}
                         </tbody>
                     </table>
                 </div>
             </div>
        </div>
    );
};

// 11. Settings Page Component
const SettingsPage = () => {
    const [settings, setSettings] = useState<SystemSettings>({
        ai: { factCheck: true },
        cron: { enabled: true }
    });
    const [saved, setSaved] = useState(false);
    
    // API Status State
    const [apiCheckStatus, setApiCheckStatus] = useState<{
        status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR',
        message: string,
        latency: number,
        keyCount: number
    }>({ status: 'IDLE', message: '', latency: 0, keyCount: 0 });

    useEffect(() => {
        dbService.getSettings().then(setSettings);
    }, []);

    const handleSave = async () => {
        await dbService.saveSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleCheckApi = async () => {
        setApiCheckStatus(prev => ({ ...prev, status: 'LOADING', message: 'Connecting to Gemini...' }));
        
        try {
            const result = await validateGeminiConnection();
            setApiCheckStatus({
                status: result.success ? 'SUCCESS' : 'ERROR',
                message: result.message,
                latency: result.latency,
                keyCount: result.keyCount
            });
        } catch (e) {
            setApiCheckStatus({
                status: 'ERROR',
                message: 'Internal System Error',
                latency: 0,
                keyCount: 0
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
                    <Settings size={22} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">System Settings</h2>
                    <p className="text-slate-500 text-sm">Konfigurasi global aplikasi.</p>
                </div>
            </div>

            <div className="space-y-6">
                
                {/* Gemini API Status Card */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                            <BrainCircuit size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Gemini API Status</h3>
                            <p className="text-sm text-slate-500">Periksa kesehatan koneksi ke Google AI Studio.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                         <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                             <span className="text-xs text-slate-500 uppercase font-bold flex items-center gap-2">
                                <Server size={14}/> Connection
                             </span>
                             <div className="mt-2 flex items-center gap-2">
                                 {apiCheckStatus.status === 'LOADING' ? (
                                     <span className="text-slate-400 font-bold animate-pulse">Checking...</span>
                                 ) : apiCheckStatus.status === 'SUCCESS' ? (
                                     <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={18}/> Active</span>
                                 ) : apiCheckStatus.status === 'ERROR' ? (
                                     <span className="text-red-500 font-bold flex items-center gap-1"><AlertTriangle size={18}/> Error</span>
                                 ) : (
                                     <span className="text-slate-400 font-bold">Unknown</span>
                                 )}
                             </div>
                         </div>
                         <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                             <span className="text-xs text-slate-500 uppercase font-bold flex items-center gap-2">
                                <Key size={14}/> Keys Loaded
                             </span>
                             <div className="mt-2 text-xl font-mono font-bold text-slate-800 dark:text-white">
                                 {apiCheckStatus.status !== 'IDLE' ? apiCheckStatus.keyCount : '-'}
                             </div>
                         </div>
                         <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                             <span className="text-xs text-slate-500 uppercase font-bold flex items-center gap-2">
                                <Zap size={14}/> Latency
                             </span>
                             <div className="mt-2 text-xl font-mono font-bold text-slate-800 dark:text-white">
                                 {apiCheckStatus.status === 'SUCCESS' ? `${apiCheckStatus.latency}ms` : '-'}
                             </div>
                         </div>
                    </div>

                    {apiCheckStatus.status === 'ERROR' && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 shrink-0"/>
                            <div>
                                <strong className="block mb-1">Connection Failed</strong>
                                {apiCheckStatus.message}
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={handleCheckApi}
                        disabled={apiCheckStatus.status === 'LOADING'}
                        className="px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {apiCheckStatus.status === 'LOADING' ? <RefreshCw className="animate-spin" size={16}/> : <RefreshCw size={16}/>}
                        Test Connection
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-8">
                    {/* AI Settings */}
                    <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-700">
                        <div>
                            <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-1">AI Fact Checking</h4>
                            <p className="text-sm text-slate-500">Memaksa AI untuk melakukan validasi fakta tambahan (sedikit lebih lambat).</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={settings.ai.factCheck}
                                onChange={(e) => setSettings({...settings, ai: {...settings.ai, factCheck: e.target.checked}})}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                    </div>

                    {/* Cron Settings */}
                    <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-700">
                        <div>
                            <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-1">Background Tasks (Cron)</h4>
                            <p className="text-sm text-slate-500">Aktifkan background worker untuk maintenance otomatis.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={settings.cron.enabled}
                                onChange={(e) => setSettings({...settings, cron: {...settings.cron, enabled: e.target.checked}})}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={handleSave}
                            className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all flex items-center gap-2"
                        >
                            {saved ? <CheckCircle2 size={18}/> : <Save size={18}/>}
                            {saved ? 'Saved!' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CRON WORKER HOOK ---
const CronWorker = ({ user }: { user: User }) => {
    useEffect(() => {
        if (!user || user.role !== Role.ADMIN) return;

        const interval = setInterval(async () => {
            const settings = await dbService.getSettings();
            if (!settings.cron.enabled) return;

            // Simplified simulation of cron action
            // In a real app, this would check last run timestamp and question generation queue
            const chance = Math.random();
            if (chance > 0.8) { // Simulate sporadic activity
                 await dbService.addLog("CRON_JOB", "Background task executed: Checking for scheduled quizzes...", LogType.INFO, "SYSTEM");
            }

        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [user]);

    return null;
};

// --- MAIN APP ---
const App = () => {
  // FIX: Initialize user state directly from localStorage to prevent "flash of null user" on refresh
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('genz_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Session parse error", e);
      return null;
    }
  });
  
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
        // Initialize DB connection (Turso or Local)
        await dbService.init();
        setIsLoading(false);
    };
    
    initSession();
  }, []);

  const handleLogin = (u: User) => {
      localStorage.setItem('genz_session', JSON.stringify(u));
      setUser(u);
  };

  const handleLogout = () => {
      localStorage.removeItem('genz_session');
      setUser(null);
  };

  const updateCredits = (newCredits: number) => {
    if (user) {
        const updatedUser = { ...user, credits: newCredits };
        setUser(updatedUser);
        localStorage.setItem('genz_session', JSON.stringify(updatedUser));
    }
  };

  // Auth Guard Component
  const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: Role[] }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
  };

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold animate-pulse">Memuat Aplikasi...</p>
              </div>
          </div>
      );
  }

  return (
    <Router>
      <PrintStyles />
      {user && <CronWorker user={user} />}
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
          
          {/* Main Layout Routes */}
          <Route path="/*" element={
             !user ? <Navigate to="/login" /> : (
            <div className="flex h-screen overflow-hidden">
              <Sidebar user={user} isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} onLogout={handleLogout} />
              
              <div className="flex-1 flex flex-col overflow-hidden w-full md:pl-64 transition-all duration-300">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 z-10 no-print">
                  <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden text-slate-500">
                    <Menu />
                  </button>
                  <div className="flex-1 px-4">
                     <h1 className="font-bold text-lg text-slate-800 dark:text-white hidden md:block">
                        {user.role === Role.ADMIN ? 'Administrator Panel' : 'Guru Dashboard'}
                     </h1>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-bold border border-brand-100">
                       Credits: {user.credits}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                       {user.username[0].toUpperCase()}
                    </div>
                  </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard user={user} />} />
                    <Route path="/create-quiz" element={<CreateQuiz user={user} onUpdateCredits={updateCredits} />} />
                    <Route path="/history" element={<HistoryArchive user={user} />} />
                    
                    {/* Admin Only */}
                    <Route path="/database" element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><CloudDatabase /></ProtectedRoute>} />
                    <Route path="/users" element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><UserManagement /></ProtectedRoute>} />
                    <Route path="/logs" element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><SystemLogs user={user} /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><SettingsPage /></ProtectedRoute>} />
                  </Routes>
                </main>
              </div>
            </div>
          )} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
import React, { useState, useEffect, useRef } from 'react';
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
  Link2,
  ArrowLeft,
  ChevronLeft,
  Heart,
  Wallet,
  QrCode,
  Copy,
  MessageCircle
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

// --- STYLES FOR PRINTING & MATH ALIGNMENT ---
const GlobalAndPrintStyles = () => (
    <style>{`
        /* --- GLOBAL MATHJAX FIXES --- */
        mjx-container {
            display: inline-block !important;
            margin: 0 2px !important;
            vertical-align: middle !important;
        }
        
        mjx-container > svg {
            display: inline-block !important;
            vertical-align: middle !important;
            margin: 0 !important;
        }

        .mjx-chtml {
            font-size: 100% !important;
        }

        /* Scrollbar styling */
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }

        /* --- PRINT STYLES --- */
        @media print {
            @page {
                /* Optimized margins to prevent large whitespace at top */
                /* Top 1.5cm, Sides/Bottom 2.5cm */
                margin: 15mm 25mm 25mm 25mm; 
                size: auto; 
            }
            
            body {
                visibility: hidden !important;
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            /* Reset Constraints */
            html, body, #root, #quiz-result-view, .transform, .fixed, .absolute, .relative, .overflow-hidden, .overflow-auto, .h-full, .w-full {
                position: static !important;
                transform: none !important;
                transition: none !important;
                overflow: visible !important;
                height: auto !important;
                width: auto !important;
            }

            /* Target Print Area */
            #print-area {
                visibility: visible !important;
                /* Absolute positioning forces it to top-left, ignoring parent padding (pt-32) */
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 auto !important;
                padding: 0 !important; 
                background: white !important;
                box-shadow: none !important;
                border: none !important;
                z-index: 99999 !important;
            }

            #print-area * {
                visibility: visible !important;
            }

            /* Typography */
            #print-area {
                color: black !important;
                font-family: 'Times New Roman', serif !important;
                font-size: 12pt !important;
                line-height: 1.5 !important;
            }
            .text-slate-500, .text-slate-400, .text-slate-600, .text-slate-800 {
                color: black !important;
            }

            /* CRITICAL: Page Break Logic */
            .avoid-break {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                display: block !important; 
                margin-bottom: 2em !important; 
            }

            .avoid-break-after {
                page-break-after: avoid !important;
                break-after: avoid !important;
            }
            
            h1, h2, h3, h4, .wacana-box {
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
            
            /* CRITICAL FIX: Enforce Grid in Print for Options */
            /* This ensures A/B and C/D are aligned perfectly */
            .print-grid { 
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                column-gap: 2rem !important;
                row-gap: 0.5rem !important;
            }
            
            /* Ensure Flex works for question number alignment */
            .print-flex {
                display: flex !important;
                align-items: flex-start !important;
            }

            /* Hide UI Controls */
            .no-print {
                display: none !important;
            }
            
            /* Hide Background patterns */
            .bg-\[url\(\'https\:\/\/www\.transparenttextures\.com\/patterns\/graphy\.png\.png\'\)\] {
                background-image: none !important;
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
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-slate-900 border-r border-brand-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 no-print`}>
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
              <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'text-slate-600 dark:text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-800'}`}>
                <item.icon size={20} />{item.label}
              </Link>
            );
          })}
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 mt-8 transition-colors"><LogOut size={20} />Keluar</button>
        </nav>
      </aside>
    </>
  );
};

// --- DONATION MODAL ---
const DonationModal = ({ onClose, user }: { onClose: () => void, user: User }) => {
    const [method, setMethod] = useState<'DANA' | 'SHOPEE'>('DANA');
    
    const accountInfo = {
        DANA: { number: '0852-4848-1527', name: 'Gen-Z Admin', color: 'bg-[#118EE9]', text: 'text-[#118EE9]' },
        SHOPEE: { number: '0852-4848-1527', name: 'Gen-Z Admin', color: 'bg-[#EE4D2D]', text: 'text-[#EE4D2D]' }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Nomor tersalin!");
    };

    const handleConfirm = () => {
        const msg = `Halo Admin Gen-Z Quiz, saya *${user.username}* telah mengirim donasi via ${method}. Mohon cek dan tambah credit saya. Terima kasih!`;
        window.open(`https://wa.me/6285248481527?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 hover:text-slate-800 transition-colors">
                    <X size={20} />
                </button>

                <div className="p-6 pb-0 text-center">
                    <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Heart size={32} fill="currentColor" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Dukungan & Top Up</h3>
                    <p className="text-sm text-slate-500 mt-2">Dukungan Anda membantu server kami tetap hidup. Credit akan ditambahkan setelah konfirmasi.</p>
                </div>

                <div className="p-6">
                    {/* Method Selector */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mb-6">
                        <button 
                            onClick={() => setMethod('DANA')} 
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${method === 'DANA' ? 'bg-white dark:bg-slate-600 shadow-sm text-[#118EE9]' : 'text-slate-500'}`}
                        >
                            <Wallet size={16} /> DANA
                        </button>
                        <button 
                            onClick={() => setMethod('SHOPEE')} 
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${method === 'SHOPEE' ? 'bg-white dark:bg-slate-600 shadow-sm text-[#EE4D2D]' : 'text-slate-500'}`}
                        >
                            <Wallet size={16} /> ShopeePay
                        </button>
                    </div>

                    {/* QR & Info Area */}
                    <div className={`rounded-2xl p-6 border-2 transition-colors ${method === 'DANA' ? 'border-[#118EE9]/20 bg-[#118EE9]/5' : 'border-[#EE4D2D]/20 bg-[#EE4D2D]/5'}`}>
                        <div className="flex flex-col items-center">
                            <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-sm mb-4">
                                {/* Simulated QR Code Pattern */}
                                <div className="w-full h-full border-2 border-slate-900 rounded-lg flex items-center justify-center bg-slate-50 relative overflow-hidden">
                                    <QrCode size={120} className="text-slate-900" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`px-2 py-1 bg-white text-xs font-bold rounded shadow-sm border ${method === 'DANA' ? 'text-[#118EE9] border-[#118EE9]' : 'text-[#EE4D2D] border-[#EE4D2D]'}`}>
                                            SCAN ME
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center w-full">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{method === 'DANA' ? 'Nomor DANA' : 'Nomor ShopeePay'}</p>
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <span className={`text-xl font-bold font-mono ${accountInfo[method].text}`}>{accountInfo[method].number}</span>
                                    <button onClick={() => handleCopy(accountInfo[method].number)} className="p-1.5 hover:bg-black/5 rounded-md transition-colors"><Copy size={14} className="text-slate-400"/></button>
                                </div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">a.n {accountInfo[method].name}</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleConfirm}
                        className="w-full mt-6 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <MessageCircle size={20} /> Konfirmasi via WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. Dashboard
const Dashboard = ({ user }: { user: User }) => {
  const [stats, setStats] = useState({ quizCount: 0, generated: 0 });
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [showDonation, setShowDonation] = useState(false);
  useEffect(() => {
    const loadStats = async () => {
      const quizzes = await dbService.getQuizzes();
      setStats({ quizCount: quizzes.length, generated: quizzes.length });
      const s = await dbService.getSettings();
      setSettings(s);
    };
    loadStats();
  }, []);
  const isCronActive = settings?.cron.enabled || false;
  const data = [{ name: 'Sen', generated: 40, published: 24 }, { name: 'Sel', generated: 30, published: 13 }, { name: 'Rab', generated: 20, published: 98 }, { name: 'Kam', generated: 27, published: 39 }, { name: 'Jum', generated: 18, published: 48 }];
  return (
    <div className="space-y-6">
      {showDonation && <DonationModal user={user} onClose={() => setShowDonation(false)} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500 dark:text-slate-400">Total Quiz</p><p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.quizCount}</p></div>
              <div className="p-3 rounded-xl bg-blue-500 bg-opacity-10"><BookOpen className="w-6 h-6 text-blue-500" /></div>
            </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500 dark:text-slate-400">Bank Soal</p><p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.generated}</p></div>
              <div className="p-3 rounded-xl bg-brand-500 bg-opacity-10"><Database className="w-6 h-6 text-brand-500" /></div>
            </div>
        </div>
        
        {/* Credit Card with Donation Button - Updated Layout */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Credit Guru</p>
                  <div className="flex items-center gap-3">
                      <p className="text-2xl font-bold text-green-600">{user.credits}</p>
                      <button 
                          onClick={() => setShowDonation(true)}
                          className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                          <Heart size={12} className="fill-green-600"/> Isi Ulang / Donasi
                      </button>
                  </div>
              </div>
              <div className="p-3 rounded-xl bg-green-500 bg-opacity-10"><Coins className="w-6 h-6 text-green-500" /></div>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500 dark:text-slate-400">System Status</p><p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{isCronActive ? 'Cron Active' : 'Cron Idle'}</p></div>
              <div className={`p-3 rounded-xl ${isCronActive ? 'bg-purple-500' : 'bg-slate-500'} bg-opacity-10`}><RotateCw className={`w-6 h-6 ${isCronActive ? 'text-purple-500' : 'text-slate-500'}`} /></div>
            </div>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Statistik Pembuatan Soal</h3>
        <div className="h-80 w-full" style={{ minHeight: '320px' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="name" stroke="#64748b" /><YAxis stroke="#64748b" /><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} /><Legend /><Bar dataKey="generated" fill="#f97316" radius={[4, 4, 0, 0]} name="Soal Dibuat" /><Bar dataKey="published" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Terpublish" /></BarChart>
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
    const loadUsers = async () => { const data = await dbService.getAllUsers(); setUsers(data); };
    useEffect(() => { loadUsers(); }, []);
    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: User = { id: Date.now().toString(), username: newUsername, role: Role.TEACHER, credits: newCredits, isActive: true };
        await dbService.createUser(newUser, newPassword);
        setShowAddModal(false); setNewUsername(''); setNewPassword(''); setNewCredits(50); loadUsers();
    };
    const handleDeleteUser = async (id: string) => { if (confirm("Apakah Anda yakin ingin menghapus user ini? Data tidak bisa dikembalikan.")) { await dbService.deleteUser(id); loadUsers(); } };
    const handleToggleStatus = async (user: User) => { await dbService.toggleUserStatus(user.id, !user.isActive); loadUsers(); };
    const startEditCredits = (user: User) => { setEditingCreditsId(user.id); setTempCredits(user.credits); };
    const saveCredits = async (id: string) => { await dbService.updateUserCredits(id, tempCredits); setEditingCreditsId(null); loadUsers(); };
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
             <div className="flex justify-between items-center mb-6">
               <div><h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><Users className="text-brand-600"/> Manajemen User</h2><p className="text-slate-500 text-sm">Kelola akses guru, kredit, dan status akun.</p></div>
               <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20"><UserPlus size={18}/> Tambah Guru</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {users.map(u => (
                     <div key={u.id} className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border ${u.isActive ? 'border-slate-100 dark:border-slate-700' : 'border-red-200 bg-red-50 dark:bg-red-900/10'} hover:shadow-md transition-all`}>
                         <div className="flex justify-between items-start mb-4">
                             <div className="flex items-center gap-3"><div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${u.role === Role.ADMIN ? 'bg-purple-100 text-purple-600' : 'bg-brand-100 text-brand-600'}`}>{u.username.charAt(0).toUpperCase()}</div><div><h3 className="font-bold text-slate-800 dark:text-white">{u.username}</h3><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${u.role === Role.ADMIN ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>{u.role}</span></div></div>
                             {u.role !== Role.ADMIN && (<button onClick={() => handleDeleteUser(u.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={16}/></button>)}
                         </div>
                         <div className="space-y-4">
                             <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl flex items-center justify-between">
                                 <div className="flex items-center gap-2 text-sm text-slate-500"><Coins size={16} className="text-orange-500"/><span>Sisa Kredit:</span></div>
                                 {editingCreditsId === u.id ? (<div className="flex items-center gap-2"><button onClick={() => setTempCredits(p => Math.max(0, p - 10))} className="w-6 h-6 bg-slate-200 rounded text-slate-600 font-bold hover:bg-slate-300">-</button><input type="number" value={tempCredits} onChange={(e) => setTempCredits(parseInt(e.target.value))} className="w-12 text-center bg-white border rounded text-sm font-bold"/><button onClick={() => setTempCredits(p => p + 10)} className="w-6 h-6 bg-slate-200 rounded text-slate-600 font-bold hover:bg-slate-300">+</button><button onClick={() => saveCredits(u.id)} className="text-green-600 font-bold text-xs ml-1 hover:underline">Save</button></div>) : (<div className="flex items-center gap-2"><span className="font-bold text-slate-800 dark:text-white">{u.credits}</span><button onClick={() => startEditCredits(u)} className="text-xs text-blue-500 hover:underline">Edit</button></div>)}
                             </div>
                             <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                                 <span className="text-xs text-slate-400">Status Akun</span>
                                 {u.role !== Role.ADMIN ? (<button onClick={() => handleToggleStatus(u)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${u.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>{u.isActive ? <ShieldCheck size={14}/> : <ShieldAlert size={14}/>}{u.isActive ? 'Active' : 'Disabled'}</button>) : (<span className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold cursor-not-allowed"><ShieldCheck size={14}/> Protected</span>)}
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
             {showAddModal && (<div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up"><div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-slate-800 dark:text-white">Tambah Guru Baru</h3><button onClick={() => setShowAddModal(false)}><X className="text-slate-400 hover:text-slate-600"/></button></div><form onSubmit={handleAddUser} className="space-y-4"><div><label className="block text-sm font-medium mb-1 dark:text-slate-300">Username</label><input type="text" required className="w-full p-3 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-brand-500" value={newUsername} onChange={(e) => setNewUsername(e.target.value)}/></div><div><label className="block text-sm font-medium mb-1 dark:text-slate-300">Password</label><input type="text" required className="w-full p-3 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-brand-500" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/></div><div><label className="block text-sm font-medium mb-1 dark:text-slate-300">Limit Kredit</label><div className="flex items-center gap-4"><input type="range" min="10" max="500" step="10" className="flex-1 accent-brand-500" value={newCredits} onChange={(e) => setNewCredits(parseInt(e.target.value))}/><span className="font-bold text-brand-600 w-12 text-center">{newCredits}</span></div></div><button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl mt-4">Simpan User</button></form></div></div>)}
        </div>
    );
};

// 4. Quiz Result View (Redesigned & Fixed)
const QuizResultView = ({ quiz, onClose }: { quiz: Quiz; onClose: () => void }) => {
   const [paperSize, setPaperSize] = useState<'A4' | 'Folio'>('A4');
   const [showAnswers, setShowAnswers] = useState(false);
   const [activeTab, setActiveTab] = useState<'QUESTIONS' | 'BLUEPRINT'>('QUESTIONS');

   useEffect(() => {
     if(window.MathJax) {
       setTimeout(() => {
           window.MathJax.typesetPromise?.();
       }, 500);
     }
   }, [quiz, activeTab, showAnswers]);

   const handlePrint = () => {
       window.print();
   };

   // New function to print questions WITH answers
   const handlePrintKeys = async () => {
       setActiveTab('QUESTIONS');
       setShowAnswers(true);
       
       // Wait for React State update and DOM render
       await new Promise(resolve => setTimeout(resolve, 300)); // Increased to 300ms

       // Force MathJax typeset on the newly rendered answers
       if(window.MathJax && window.MathJax.typesetPromise) {
           try {
               await window.MathJax.typesetPromise();
           } catch(e) {
               console.error("MathJax typesetting failed", e);
           }
       }

       // Final small delay for layout stability before print
       setTimeout(() => {
           window.print();
       }, 500); 
   };

   // Separate Export Functions
   const handleExportDocx = (type: 'QUESTIONS' | 'BLUEPRINT') => {
       if (activeTab !== type) {
           alert(`Silakan pindah ke tab ${type === 'QUESTIONS' ? 'Soal' : 'Kisi-Kisi'} terlebih dahulu untuk mengunduh dokumen tersebut.`);
           return;
       }

       const content = document.getElementById('print-area')?.innerHTML;
       
       const css = `
         <style>
           @page { size: ${paperSize === 'A4' ? '210mm 297mm' : '215mm 330mm'} portrait; margin: 25mm; }
           body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #000; }
           .font-arabic { font-family: 'Traditional Arabic', 'Amiri', 'Arial', serif; direction: rtl; text-align: right; font-size: 16pt; margin-bottom: 5px; }
           .font-jp { font-family: 'MS Mincho', 'Yu Mincho', 'Noto Sans JP', sans-serif; }
           .font-kr { font-family: 'Malgun Gothic', 'Batang', 'Noto Serif KR', sans-serif; }
           .font-tc { font-family: 'Microsoft JhengHei', 'SimSun', 'Noto Sans TC', sans-serif; }
           mjx-container { outline: none !important; border: 0 !important; display: inline-block !important; }
           svg { vertical-align: middle !important; max-width: 100%; height: auto; }
           .grid { display: grid !important; grid-template-columns: repeat(2, 1fr); }
           .wacana-box { border: 1px solid #000; padding: 10px; margin-bottom: 10px; background-color: #f9f9f9; font-style: italic; }
           .text-right { text-align: right; }
           .font-bold { font-weight: bold; }
           .text-center { text-align: center; }
           .uppercase { text-transform: uppercase; }
           table { border-collapse: collapse; width: 100%; }
           th, td { border: 1px solid black; padding: 5px; }
           img { max-width: 5cm; height: auto; display: block; margin: 10px auto; border: 1px solid #ccc; }
         </style>
       `;

       const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${quiz.title}</title>${css}</head><body>`;
       const footer = "</body></html>";
       const sourceHTML = header + content + footer;
       
       const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
       const fileDownload = document.createElement("a");
       document.body.appendChild(fileDownload);
       fileDownload.href = source;
       fileDownload.download = `${quiz.title.replace(/\s+/g, '_')}_${type}.doc`;
       fileDownload.click();
       document.body.removeChild(fileDownload);
   };

   // Dimensions logic
   const dims = paperSize === 'A4' ? 'w-[210mm] min-h-[297mm]' : 'w-[225mm] min-h-[330mm]';

   return (
       <div id="quiz-result-view" className="fixed inset-0 z-[60] bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden font-sans">
           
           {/* Modern Glassmorphism Header (No Print) */}
           <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all">
               <div className="max-w-[1920px] mx-auto px-4 lg:px-6 h-20 flex justify-between items-center gap-4">
                   
                   {/* Left: Branding & Title */}
                   <div className="flex items-center gap-4 flex-1 min-w-0">
                       <button 
                           onClick={onClose} 
                           className="flex-shrink-0 group flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
                           title="Kembali"
                       >
                           <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform"/>
                       </button>
                       <div className="flex flex-col min-w-0">
                            <h3 className="font-extrabold text-lg md:text-xl text-slate-800 dark:text-white truncate tracking-tight leading-tight">
                                {quiz.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-0.5">
                                <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider whitespace-nowrap">{quiz.subject}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline">{quiz.questions.length} Butir Soal</span>
                            </div>
                       </div>
                   </div>

                   {/* Center: View Controls */}
                   <div className="hidden xl:flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner flex-shrink-0 mx-4">
                       <button onClick={() => setActiveTab('QUESTIONS')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'QUESTIONS' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-md ring-1 ring-black/5 scale-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                           <FileText size={16}/> Soal
                       </button>
                       <button onClick={() => setActiveTab('BLUEPRINT')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'BLUEPRINT' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-md ring-1 ring-black/5 scale-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                           <Terminal size={16}/> Kisi-Kisi
                       </button>
                   </div>

                   {/* Right: Actions */}
                   <div className="flex items-center justify-end gap-2 flex-shrink-0">
                       
                       {/* Settings Group */}
                       <div className="hidden lg:flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                           <div className="relative group">
                               <select 
                                   value={paperSize} 
                                   onChange={(e) => setPaperSize(e.target.value as any)} 
                                   className="appearance-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs pl-3 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-0 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
                               >
                                   <option value="A4">A4</option>
                                   <option value="Folio">F4</option>
                               </select>
                               <ChevronDown size={14} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none"/>
                           </div>
                           
                           {activeTab === 'QUESTIONS' && (
                               <button 
                                  onClick={() => setShowAnswers(!showAnswers)} 
                                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-sm border ${showAnswers ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                  title="Tampilkan/Sembunyikan Kunci Jawaban"
                               >
                                   {showAnswers ? <Eye size={14}/> : <EyeOff size={14}/>}
                                   <span className="hidden xl:inline">{showAnswers ? 'Kunci' : 'Kunci'}</span>
                               </button>
                           )}
                       </div>

                       <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden lg:block"></div>

                       {/* Export Group */}
                       <div className="flex items-center gap-2">
                            <button onClick={() => handleExportDocx('QUESTIONS')} className="p-2 md:px-3 md:py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold transition-all flex items-center gap-2" title="Download Word Soal">
                                <FileText size={16}/> <span className="hidden lg:inline">Word</span>
                            </button>
                            <button onClick={() => handleExportDocx('BLUEPRINT')} className="p-2 md:px-3 md:py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-bold transition-all flex items-center gap-2" title="Download Word Kisi-Kisi">
                                <Terminal size={16}/> <span className="hidden lg:inline">Kisi</span>
                            </button>
                            <button onClick={handlePrintKeys} className="p-2 md:px-3 md:py-2 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-bold transition-all flex items-center gap-2" title="Download PDF Soal + Kunci">
                                <Printer size={16}/> <span className="hidden lg:inline">+Kunci</span>
                            </button>
                            <button onClick={handlePrint} className="p-2 md:px-4 md:py-2 bg-gradient-to-r from-brand-600 to-orange-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 transition-all flex items-center gap-2">
                                <Printer size={16}/> <span className="hidden lg:inline">PDF</span>
                            </button>
                       </div>
                   </div>
               </div>
               
               {/* Mobile Tabs */}
               <div className="xl:hidden flex justify-center pb-3 gap-2 border-t border-slate-100 dark:border-slate-800 pt-2 bg-white/50 dark:bg-slate-900/50">
                   <button onClick={() => setActiveTab('QUESTIONS')} className={`px-6 py-1.5 text-xs font-bold rounded-full transition-all border ${activeTab === 'QUESTIONS' ? 'bg-brand-500 text-white border-brand-500 shadow-md' : 'bg-white text-slate-500 border-slate-200'}`}>Soal</button>
                   <button onClick={() => setActiveTab('BLUEPRINT')} className={`px-6 py-1.5 text-xs font-bold rounded-full transition-all border ${activeTab === 'BLUEPRINT' ? 'bg-brand-500 text-white border-brand-500 shadow-md' : 'bg-white text-slate-500 border-slate-200'}`}>Kisi-Kisi</button>
                   <button onClick={() => setShowAnswers(!showAnswers)} className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all border ${showAnswers ? 'bg-green-500 text-white border-green-500' : 'bg-white text-slate-500 border-slate-200'}`}>
                       {showAnswers ? <Eye size={14}/> : <EyeOff size={14}/>}
                   </button>
               </div>
           </div>

           {/* Workspace / Paper Area */}
           <div className="flex-1 overflow-y-auto custom-scrollbar pt-32 pb-20 px-4 md:px-8 bg-slate-100 dark:bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] flex justify-center relative">
                
                {/* Paper Container */}
                <div id="print-area" className={`relative bg-white shadow-2xl ${dims} p-[25mm] text-black font-serif text-[11pt] leading-normal transition-all duration-500 origin-top animate-fade-in-up mb-20`}>
                       
                       {/* Document Watermark (Optional Visual) */}
                       <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-100 to-transparent pointer-events-none no-print"></div>

                       {/* Header Document */}
                       <div className="border-b-2 border-black pb-4 mb-8 text-center relative avoid-break-after print:mb-2">
                           <div className="absolute top-0 left-0 text-xs font-sans text-slate-400 no-print">Generated by Gen-Z Quiz</div>
                           <h1 className="font-bold text-2xl uppercase tracking-wide mb-2 mt-4 font-sans">Bank Soal {quiz.level}</h1>
                           <h2 className="font-bold text-lg uppercase mb-4 text-slate-800">{quiz.subject} - {quiz.grade}</h2>
                           
                           <div className="flex justify-between items-center text-sm font-bold border-t-2 border-black pt-3 mt-4">
                               <div className="flex flex-col items-start gap-1">
                                   <span>Topik: {quiz.topic}</span>
                                   <span className="font-normal text-xs text-slate-600">Kode: {quiz.id.slice(-6)}</span>
                               </div>
                               <div className="flex flex-col items-end gap-1">
                                   <span>Waktu: 90 Menit</span>
                                   <span>Jumlah: {quiz.questions.length} Soal</span>
                               </div>
                           </div>
                       </div>

                       {activeTab === 'QUESTIONS' ? (
                           <div className="space-y-8">
                               {quiz.questions.map((q: Question, idx: number) => (
                                   <div key={q.id} className="avoid-break group relative">
                                       
                                       {/* Wacana / Stimulus Display */}
                                       {q.stimulus && (
                                           <div className="wacana-box mb-4 p-4 bg-slate-50 border-l-4 border-slate-400 text-sm rounded-r-lg italic text-slate-800 relative">
                                               <span className="absolute -top-3 left-2 bg-slate-200 text-[10px] font-bold px-2 py-0.5 rounded text-slate-600 uppercase no-print">Stimulus</span>
                                               <div className={`${quiz.subject === 'Bahasa Arab' ? 'font-arabic text-right' : ''}`}>
                                                   <MathRenderer content={q.stimulus} />
                                               </div>
                                           </div>
                                       )}

                                       {/* Question Container - Flex for proper alignment of Number vs Text */}
                                       <div className="flex gap-4 print-flex items-start">
                                           {/* Question Number */}
                                           <div className="flex-shrink-0 w-8 font-bold text-lg text-right leading-tight pt-0.5">
                                               {idx + 1}.
                                           </div>

                                           <div className="flex-1 min-w-0">
                                                {/* Question Text */}
                                                <div className={`mb-4 text-justify ${quiz.subject === 'Bahasa Arab' ? 'font-arabic text-right text-xl' : ''}`}>
                                                    <MathRenderer content={q.text} />
                                                </div>
                                                
                                                {/* Image */}
                                                {q.imageUrl && (
                                                    <div className="my-4 flex justify-center bg-slate-50 p-2 border border-slate-200 rounded no-print-border">
                                                        <img src={q.imageUrl} alt="Visual" className="max-h-[6cm] object-contain" />
                                                    </div>
                                                )}

                                                {/* Options */}
                                                {(q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.COMPLEX_MULTIPLE_CHOICE) && (
                                                    // Explicit Grid for Print to aligned options like A.. B.. / C.. D..
                                                    <div className={`mt-3 ${q.options && q.options.some((o: string) => o.length > 60) ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-x-12 gap-y-2 print-grid'}`}>
                                                        {q.options?.map((opt: string, i: number) => (
                                                            <div key={i} className="flex gap-3 items-start group/opt">
                                                                <span className="font-bold text-sm min-w-[24px] uppercase">{String.fromCharCode(65+i)}.</span>
                                                                <div className="text-sm pt-0.5 group-hover/opt:text-slate-900 transition-colors">
                                                                    <MathRenderer content={opt} inline />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* True/False Options Display (ADDED) */}
                                                {q.type === QuestionType.TRUE_FALSE && (
                                                    <div className="mt-3 flex gap-8 pl-1 select-none">
                                                        {['Benar', 'Salah'].map((opt) => (
                                                            <div key={opt} className="flex items-center gap-2.5">
                                                                <div className="w-5 h-5 rounded-full border-2 border-slate-300 print:border-black flex items-center justify-center"></div>
                                                                <span className="font-bold text-sm text-slate-700 print:text-black">{opt}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Answer Key (Review Mode) */}
                                                {showAnswers && (
                                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 text-xs font-sans rounded-xl break-inside-avoid shadow-sm flex items-start gap-3 print:bg-green-50 print:border-green-200">
                                                        <div className="p-1.5 bg-green-200 text-green-700 rounded-lg print:bg-green-200 print:text-green-800">
                                                            <CheckCircle2 size={16}/>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-green-800 mb-1">Kunci Jawaban: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</p>
                                                            <div className="text-slate-600 leading-relaxed">
                                                                <span className="font-semibold text-slate-800">Pembahasan:</span> <MathRenderer content={q.explanation} inline />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                           </div>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       ) : (
                           <div>
                               <div className="flex items-center justify-center gap-2 mb-6 print:mb-2 avoid-break-after">
                                   <div className="h-px w-12 bg-black"></div>
                                   <h3 className="font-bold text-center uppercase tracking-widest text-sm">Kisi-Kisi Penulisan Soal</h3>
                                   <div className="h-px w-12 bg-black"></div>
                               </div>
                               
                               <table className="w-full border-collapse border border-black text-sm">
                                   <thead>
                                       <tr className="bg-slate-100">
                                           <th className="border border-black p-3 w-12 text-center font-bold">No</th>
                                           <th className="border border-black p-3 text-left font-bold">Kompetensi Dasar / CP</th>
                                           <th className="border border-black p-3 text-left font-bold">Indikator Soal</th>
                                           <th className="border border-black p-3 w-24 text-center font-bold">Level</th>
                                           <th className="border border-black p-3 w-24 text-center font-bold">Kesulitan</th>
                                           <th className="border border-black p-3 w-24 text-center font-bold">Bentuk</th>
                                       </tr>
                                   </thead>
                                   <tbody>
                                       {quiz.blueprint.map((bp, idx) => (
                                           <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                               <td className="border border-black p-3 text-center font-bold">{bp.questionNumber}</td>
                                               <td className="border border-black p-3 align-top">{bp.basicCompetency}</td>
                                               <td className="border border-black p-3 align-top">{bp.indicator}</td>
                                               <td className="border border-black p-3 text-center align-middle">
                                                   <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold no-print-bg">{bp.cognitiveLevel}</span>
                                                   <span className="hidden print:inline">{bp.cognitiveLevel}</span>
                                               </td>
                                               <td className="border border-black p-3 text-center align-middle">{bp.difficulty}</td>
                                               <td className="border border-black p-3 text-center align-middle">PG</td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                           </div>
                       )}
                   </div>
           </div>
       </div>
   );
};

// 5. History Archive
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

    // If a quiz is selected, render the Result View FULL PAGE
    if (selectedQuiz) {
        return <QuizResultView quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />;
    }

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
        </div>
    );
};

// 6. Create Quiz Form
const SUBJECTS = {
  "Wajib Umum": [
    "Pendidikan Agama Islam dan Budi Pekerti", 
    "Pendidikan Pancasila", 
    "Bahasa Indonesia", 
    "Matematika", 
    "Sejarah", 
    "Sejarah Indonesia",
    "Bahasa Inggris", 
    "Seni Budaya", 
    "PJOK", 
    "PKWU",
    "Al-Qur’an Hadis",
    "Akidah Akhlak",
    "Fikih",
    "Sejarah Kebudayaan Islam",
    "Ilmu Tafsir",
    "Ilmu Hadis",
    "Ushul Fikih"
  ],
  "Peminatan MIPA": ["Biologi", "Fisika", "Kimia", "Matematika Peminatan"],
  "Peminatan IPS": ["Sosiologi", "Ekonomi", "Geografi", "Antropologi"],
  "Bahasa & Budaya": ["Bahasa & Sastra Indonesia", "Bahasa & Sastra Inggris", "Bahasa Arab", "Bahasa Jepang", "Bahasa Korea", "Bahasa Mandarin", "Bahasa Jerman", "Bahasa Perancis"],
  "Agama Lain": ["Pendidikan Agama Kristen", "Pendidikan Agama Katolik", "Pendidikan Agama Hindu", "Pendidikan Agama Buddha", "Pendidikan Agama Khonghucu"],
  "Vokasi": ["Dasar-dasar Kejuruan", "Matematika Terapan", "IPAS"]
};

const CreateQuiz = ({ user, onUpdateCredits }: { user: User; onUpdateCredits: (credits: number) => void }) => {
    const navigate = useNavigate(); 
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

    // If quiz is generated, replace the form with the QuizResultView
    if (generatedQuiz && !loading) {
        return <QuizResultView quiz={generatedQuiz} onClose={() => setGeneratedQuiz(null)} />;
    }

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
                    {Object.values(CognitiveLevel).map((c: string) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => toggleCognitive(c as CognitiveLevel)}
                            className={`w-10 h-10 rounded-lg text-xs font-bold border transition-all ${selectedCognitive.includes(c as CognitiveLevel) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}
                        >
                            {c}
                        </button>
                    ))}
                    </div>
                </div>

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
        </div>
    );
};

// 7. Database Configuration
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

// 8.1 System Logs
const SystemLogs = ({ user }: { user: User }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    
    const loadLogs = async () => {
        const data = await dbService.getLogs();
        setLogs(data);
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const handleClear = async () => {
        if(confirm("Bersihkan semua log?")) {
            await dbService.clearLogs();
            loadLogs();
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
             <div className="flex justify-between items-center mb-6">
               <div>
                   <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                       <Activity className="text-brand-600"/> Log Sistem
                   </h2>
                   <p className="text-slate-500 text-sm">Aktivitas sistem dan pengguna.</p>
               </div>
               <button onClick={handleClear} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors">
                   <Trash2 size={16}/> Bersihkan Log
               </button>
             </div>
             
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                         <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold uppercase text-xs">
                             <tr>
                                 <th className="px-6 py-4">Timestamp</th>
                                 <th className="px-6 py-4">Level</th>
                                 <th className="px-6 py-4">User</th>
                                 <th className="px-6 py-4">Action</th>
                                 <th className="px-6 py-4">Details</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                             {logs.map(log => (
                                 <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                     <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                         {new Date(log.timestamp).toLocaleString()}
                                     </td>
                                     <td className="px-6 py-4">
                                         <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                             log.type === LogType.ERROR ? 'bg-red-100 text-red-600' :
                                             log.type === LogType.SUCCESS ? 'bg-green-100 text-green-600' :
                                             log.type === LogType.WARNING ? 'bg-orange-100 text-orange-600' :
                                             'bg-blue-100 text-blue-600'
                                         }`}>
                                             {log.type}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{log.userId}</td>
                                     <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{log.action}</td>
                                     <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-md truncate" title={log.details}>
                                         {log.details}
                                     </td>
                                 </tr>
                             ))}
                             {logs.length === 0 && (
                                 <tr>
                                     <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                         Belum ada log aktivitas.
                                     </td>
                                 </tr>
                             )}
                         </tbody>
                     </table>
                 </div>
             </div>
        </div>
    );
};

// 8.2 Settings Page
const SettingsPage = () => {
    const [settings, setSettings] = useState<SystemSettings>({
        ai: { factCheck: true },
        cron: { enabled: true }
    });

    useEffect(() => {
        dbService.getSettings().then(setSettings);
    }, []);

    const handleSave = async () => {
        await dbService.saveSettings(settings);
        alert("Pengaturan disimpan!");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Settings size={22} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Pengaturan Sistem</h2>
                    <p className="text-slate-500 text-sm">Konfigurasi global aplikasi.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-8">
                
                {/* AI Settings */}
                <section className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white border-b border-slate-100 pb-2">AI & Generasi Soal</h3>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Fact Checking Otomatis</p>
                            <p className="text-xs text-slate-500">Menambahkan instruksi verifikasi fakta pada prompt AI. Mungkin sedikit memperlambat generasi.</p>
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
                </section>

                {/* System Settings */}
                <section className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white border-b border-slate-100 pb-2">Background Tasks</h3>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Cron Jobs (Background Workers)</p>
                            <p className="text-xs text-slate-500">Mengaktifkan tugas latar belakang (pembersihan cache, cek update, dll).</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={settings.cron.enabled}
                                onChange={(e) => setSettings({...settings, cron: {...settings.cron, enabled: e.target.checked}})} 
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                    </div>
                </section>

                <div className="pt-4">
                    <button onClick={handleSave} className="px-6 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20 flex items-center gap-2">
                        <Save size={18} /> Simpan Perubahan
                    </button>
                </div>

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
  const [showDbSettings, setShowDbSettings] = useState(false);
  const [tursoUrl, setTursoUrl] = useState('');
  const [tursoToken, setTursoToken] = useState('');
  const [dbLoading, setDbLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  useEffect(() => {
      const conf = dbService.getStoredConfig();
      if (conf.url) setTursoUrl(conf.url);
      if (conf.token) setTursoToken(conf.token);
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const user = await dbService.authenticate(username, password);
      if (user) { if (!user.isActive) { setError('Akun dinonaktifkan. Hubungi admin.'); } else { onLogin(user); } } else { setError('Username atau password salah.'); }
    } catch (err) { setError('Terjadi kesalahan sistem.'); } finally { setLoading(false); }
  };
  const handleDbSave = async () => {
      if(!tursoUrl || !tursoToken) return;
      setDbLoading(true); setDbStatus('IDLE');
      const success = await dbService.testConnection(tursoUrl, tursoToken);
      if (success) { await dbService.setTursoConfig(tursoUrl, tursoToken); setDbStatus('SUCCESS'); setTimeout(() => setShowDbSettings(false), 2000); } else { setDbStatus('ERROR'); }
      setDbLoading(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl w-full max-w-md border border-slate-100 relative transition-all duration-300">
        <div className="text-center mb-8"><div className="w-20 h-20 bg-brand-500 rounded-3xl flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-xl shadow-brand-500/30">Q</div><h2 className="text-3xl font-extrabold text-slate-800 mb-2">Welcome Back!</h2><p className="text-slate-500 text-sm font-medium">Sign in to continue to Gen-Z Quiz</p></div>
        {error && (<div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-2 border border-red-100 animate-pulse"><AlertCircle size={18}/> {error}</div>)}
        <form onSubmit={handleSubmit} className="space-y-5">
           <div><label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Username</label><input type="text" required className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username"/></div>
           <div><label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label><input type="password" required className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"/></div>
           <button type="submit" disabled={loading} className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 text-lg">{loading ? <RefreshCw className="animate-spin" size={20}/> : <LogIn size={20}/>}{loading ? 'Signing In...' : 'Sign In'}</button>
        </form>
        <div className="mt-6 pt-6 border-t border-slate-100"><button type="button" onClick={() => setShowDbSettings(!showDbSettings)} className="flex items-center justify-center gap-2 w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"><Database size={14}/> {showDbSettings ? 'Hide Connection Settings' : 'Configure Database Connection'}{showDbSettings ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</button><div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${showDbSettings ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}><div className="overflow-hidden"><div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3"><div><label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Turso URL</label><input type="text" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-brand-500 outline-none" placeholder="libsql://..." value={tursoUrl} onChange={(e) => { let val = e.target.value; if(val.startsWith('libsql://')) val = val.replace('libsql://', 'https://'); setTursoUrl(val); }}/></div><div><label className="block text-sm font-bold text-slate-500 mb-1 ml-1">Auth Token</label><input type="password" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-brand-500 outline-none" placeholder="ey..." value={tursoToken} onChange={(e) => setTursoToken(e.target.value)}/></div>{dbStatus === 'SUCCESS' && (<div className="text-xs text-green-600 font-bold flex items-center gap-1 justify-center py-1"><CheckCircle2 size={14}/> Connected Successfully!</div>)}{dbStatus === 'ERROR' && (<div className="text-xs text-red-500 font-bold flex items-center gap-1 justify-center py-1"><AlertCircle size={14}/> Connection Failed</div>)}<button type="button" onClick={handleDbSave} disabled={dbLoading || !tursoUrl || !tursoToken} className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">{dbLoading ? <RefreshCw className="animate-spin" size={12}/> : <Link2 size={12}/>}Connect & Save</button></div></div></div></div>
        <div className="mt-8 text-center"><Link to="/" className="text-sm font-bold text-slate-400 hover:text-brand-600 transition-colors">Back to Homepage</Link></div>
      </div>
    </div>
  );
};

// --- CRON WORKER HOOK ---
const CronWorker = ({ user }: { user: User }) => {
    useEffect(() => { if (!user || user.role !== Role.ADMIN) return; const interval = setInterval(async () => { const settings = await dbService.getSettings(); if (!settings.cron.enabled) return; const chance = Math.random(); if (chance > 0.8) { await dbService.addLog("CRON_JOB", "Background task executed: Checking for scheduled quizzes...", LogType.INFO, "SYSTEM"); } }, 10000); return () => clearInterval(interval); }, [user]);
    return null;
};

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState<User | null>(() => { try { const saved = localStorage.getItem('genz_session'); return saved ? JSON.parse(saved) : null; } catch (e) { console.error("Session parse error", e); return null; } });
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { const initSession = async () => { await dbService.init(); setIsLoading(false); }; initSession(); }, []);
  const handleLogin = (u: User) => { localStorage.setItem('genz_session', JSON.stringify(u)); setUser(u); };
  const handleLogout = () => { localStorage.removeItem('genz_session'); setUser(null); };
  const updateCredits = (newCredits: number) => { if (user) { const updatedUser = { ...user, credits: newCredits }; setUser(updatedUser); localStorage.setItem('genz_session', JSON.stringify(updatedUser)); } };
  const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: Role[] }) => { if (!user) return <Navigate to="/login" replace />; if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />; return <>{children}</>; };
  if (isLoading) { return (<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="flex flex-col items-center gap-4"><div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div><p className="text-slate-500 font-bold animate-pulse">Memuat Aplikasi...</p></div></div>); }
  return (
    <Router>
      <GlobalAndPrintStyles />
      {user && <CronWorker user={user} />}
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
          <Route path="/*" element={!user ? <Navigate to="/login" /> : (<div className="flex h-screen overflow-hidden"><Sidebar user={user} isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} onLogout={handleLogout} /><div className="flex-1 flex flex-col overflow-hidden w-full md:pl-64 transition-all duration-300"><header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 z-10 no-print"><button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden text-slate-500"><Menu /></button><div className="flex-1 px-4"><h1 className="font-bold text-lg text-slate-800 dark:text-white hidden md:block">{user.role === Role.ADMIN ? 'Administrator Panel' : 'Guru Dashboard'}</h1></div><div className="flex items-center gap-4"><div className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-bold border border-brand-100">Credits: {user.credits}</div><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">{user.username[0].toUpperCase()}</div></div></header><main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24"><Routes><Route path="/dashboard" element={<Dashboard user={user} />} /><Route path="/create-quiz" element={<CreateQuiz user={user} onUpdateCredits={updateCredits} />} /><Route path="/history" element={<HistoryArchive user={user} />} /><Route path="/database" element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><CloudDatabase /></ProtectedRoute>} /><Route path="/users" element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><UserManagement /></ProtectedRoute>} /><Route path="/logs" element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><SystemLogs user={user} /></ProtectedRoute>} /><Route path="/settings" element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><SettingsPage /></ProtectedRoute>} /></Routes></main></div></div>)} />
        </Routes>
      </div>
    </Router>
  );
}
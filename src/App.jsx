import React, { useState, createContext, useContext, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from 'react-router-dom';
import {
  Users,
  Book,
  Calendar,
  ArrowLeft,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  ChevronRight,
  Atom,
  Briefcase,
  Globe,
  Terminal,
  Cpu,
  Sigma,
  Beaker,
  BookOpen,
  Github,
  Code,
  Settings,
  TrendingUp,
  PieChart,
  Target,
  UserCheck,
  Map,
  Languages,
  BarChart3,
  Info,
  Clock,
  Sparkles,
  Sun,
  Moon,
  ShieldAlert,
} from 'lucide-react';

// --- DATA CONSTANTS ---
const DRIVE_IDS = {
  AIUB: {
    'CSE Courses': '13CD0p7QQSVrIkgtD3nFZP-qC_q6MjpJI',
    'Math Courses': '1QIa83q8V6N5_6wPBUVAabxggJvX-XIWE',
    'Physics Courses': '1bmkMWA_4ltSa5-82cdb1vlOzjP3XAmyK',
    'English Courses': '1J_AzNhJJ72ZetadsYVmUvj41ig4xUaC0',
    'Bangladesh Studies': '1K2gLQ1AbYKyfAQtE1m2Ppe11b1VKTopo',
    Accounting: '1WygQm7nIKivT0Sxtm0HZ1dixf1dAIWpO',
    Economics: '1G8pvlejpISirDpWJITBXDXgvo_aGEArJ',
    Ethics: '1Vqv4_P4eUsqXGYihunODSxGhbjWgbK1c',
  },
};

// --- CONTEXT ---
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [uni, setUni] = useState('AIUB');
  const [theme, setTheme] = useState('dark');

  const themes = {
    dark: 'bg-[#020617] text-gray-300',
    light: 'bg-white text-gray-600',
  };

  const getBrandColor = () => {
    if (uni === 'AIUB') return 'text-blue-500';
    if (uni === 'NSU') return 'text-emerald-500';
    return 'text-amber-500';
  };

  const getBrandBg = () => {
    if (uni === 'AIUB') return 'bg-blue-600';
    if (uni === 'NSU') return 'bg-emerald-600';
    return 'bg-amber-500';
  };

  const getBrandBorder = () => {
    if (uni === 'AIUB') return 'hover:border-blue-500/30';
    if (uni === 'NSU') return 'hover:border-emerald-500/30';
    return 'hover:border-amber-500/30';
  };

  return (
    <AppContext.Provider
      value={{
        uni,
        setUni,
        theme,
        setTheme,
        themes,
        getBrandColor,
        getBrandBg,
        getBrandBorder,
      }}
    >
      <div
        className={`min-h-screen transition-all duration-700 font-sans ${themes[theme]} flex flex-col`}
      >
        {children}
      </div>
    </AppContext.Provider>
  );
};

const useApp = () => useContext(AppContext);

// --- DRIVE VIEWER COMPONENT ---
const DriveViewer = ({ folderId, title, onBack }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [folderStack, setFolderStack] = useState([
    { id: folderId, name: title },
  ]);

  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const currentFolder = folderStack[folderStack.length - 1];

  const fetchFiles = async (targetFolderId) => {
    setLoading(true);
    setErrorStatus(null);
    try {
      // Use URLSearchParams for clean, reliable encoding
      const params = new URLSearchParams({
        q: `'${targetFolderId}' in parents and trashed = false`,
        fields: 'files(id,name,mimeType,size)',
        key: API_KEY,
      });

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch from Google');
      }

      const sortedFiles = (data.files || []).sort((a, b) => {
        const isFolderA = a.mimeType === 'application/vnd.google-apps.folder';
        const isFolderB = b.mimeType === 'application/vnd.google-apps.folder';
        return isFolderB - isFolderA;
      });
      setFiles(sortedFiles);
    } catch (error) {
      console.error('Vault access error:', error);
      setErrorStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentFolder.id);
  }, [currentFolder.id]);

  const handleFolderClick = (id, name) => {
    setFolderStack([...folderStack, { id, name }]);
  };

  const handleBack = () => {
    if (folderStack.length > 1) {
      setFolderStack(folderStack.slice(0, -1));
    } else {
      onBack();
    }
  };

  return (
    <div className="w-full animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
            {currentFolder.name}
          </h3>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.2em]">
            Sector: {folderStack.map((f) => f.name).join(' / ')}
          </p>
        </div>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg text-xs font-bold border border-red-500/20 hover:bg-red-500/30 transition-all"
        >
          {folderStack.length > 1 ? 'Go Back' : 'Close Vault'}
        </button>
      </div>

      <div className="rounded-[2.5rem] p-6 border border-white/10 shadow-2xl min-h-[400px] bg-black/40 backdrop-blur-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
              Scanning Directory...
            </p>
          </div>
        ) : errorStatus ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShieldAlert className="text-red-500 mb-4" size={48} />
            <p className="text-red-400 font-bold uppercase tracking-widest text-xs">
              Access Refused
            </p>
            <p className="text-[10px] text-gray-500 mt-2 font-mono max-w-xs">
              {errorStatus}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {files.length > 0 ? (
              files.map((file) => {
                const isFolder =
                  file.mimeType === 'application/vnd.google-apps.folder';

                return (
                  <div
                    key={file.id}
                    className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all group"
                  >
                    <div
                      className="flex items-center gap-4 flex-grow cursor-pointer"
                      onClick={() =>
                        isFolder && handleFolderClick(file.id, file.name)
                      }
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          isFolder
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-blue-500/10 text-blue-500'
                        }`}
                      >
                        {isFolder ? '📁' : '📄'}
                      </div>
                      <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                        {file.name}
                      </span>
                    </div>

                    {!isFolder && (
                      <div className="flex gap-2 ml-4">
                        <a
                          href={`https://drive.google.com/file/d/${file.id}/preview`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-black uppercase bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl border border-white/10 transition-all"
                        >
                          View
                        </a>
                        <a
                          href={`https://drive.google.com/uc?id=${file.id}&export=download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-black uppercase bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                        >
                          Get
                        </a>
                      </div>
                    )}

                    {isFolder && (
                      <ChevronRight
                        size={16}
                        className="text-gray-600 group-hover:text-amber-500"
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">
                  This directory is empty.
                </p>
                <p className="text-[9px] text-gray-700 mt-2 uppercase">
                  Ensure Drive folder is set to 'Public'
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- NAVBAR ---
const Navbar = () => {
  const { uni, setUni, getBrandColor, getBrandBg, theme, setTheme } = useApp();
  const [showContact, setShowContact] = React.useState(false);

  return (
    <>
      <nav
        className={`flex flex-col md:flex-row justify-between items-center p-6 max-w-7xl mx-auto w-full sticky top-0 z-50 backdrop-blur-md border-b border-white/5 gap-4 ${
          theme === 'dark' ? 'bg-[#020617]/80' : 'bg-white/80'
        }`}
      >
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className={`${getBrandBg()} p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-lg`}
          >
            <LayoutDashboard className="text-white" size={20} />
          </div>
          <span
            className={`text-xl font-black tracking-tighter uppercase ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Campus<span className={getBrandColor()}>Core</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-yellow-400" />
            ) : (
              <Moon size={18} className="text-blue-600" />
            )}
          </button>

          <Link
            to="/about"
            className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
              theme === 'dark' ? 'hover:text-white' : 'hover:text-black'
            }`}
          >
            About
          </Link>

          <button
            onClick={() => setShowContact(true)}
            className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
              theme === 'dark' ? 'hover:text-white' : 'hover:text-black'
            }`}
          >
            Contact
          </button>

          <div
            className={`flex flex-col gap-1 p-1 rounded-2xl border border-white/10 shadow-inner ${
              theme === 'dark' ? 'bg-black/40' : 'bg-gray-100'
            }`}
          >
            <div className="flex gap-1">
              {['AIUB', 'NSU'].map((u) => (
                <button
                  key={u}
                  onClick={() => setUni(u)}
                  className={`w-14 py-1.5 rounded-lg text-[9px] font-black transition-all ${
                    uni === u
                      ? (u === 'AIUB' ? 'bg-blue-600' : 'bg-emerald-600') +
                        ' text-white shadow-lg'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setUni('IUB')}
                className={`w-14 py-1.5 rounded-lg text-[9px] font-black transition-all ${
                  uni === 'IUB'
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                IUB
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-xs rounded-[2.5rem] border p-8 shadow-2xl relative transition-all animate-slide-up ${
              theme === 'dark'
                ? 'bg-[#0f172a] border-white/10'
                : 'bg-white border-gray-200'
            }`}
          >
            <button
              onClick={() => setShowContact(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-red-500 transition-colors"
            >
              ✕
            </button>
            <h3
              className={`text-2xl font-black uppercase tracking-tighter mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Get in <span className={getBrandColor()}>Touch</span>
            </h3>
            <div className="space-y-4">
              <a
                href="https://github.com/Lonerhermit"
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/5 hover:bg-white/10'
                    : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                }`}
              >
                <Github size={20} className={getBrandColor()} />
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${
                    theme === 'dark'
                      ? 'text-gray-300 group-hover:text-white'
                      : 'text-gray-600'
                  }`}
                >
                  Lonerhermit
                </span>
              </a>
              <a
                href="mailto:arefinalmahi@gmail.com"
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/5 hover:bg-white/10'
                    : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                }`}
              >
                <Code size={20} className={getBrandColor()} />
                <span
                  className={`text-[10px] font-bold uppercase tracking-tight ${
                    theme === 'dark'
                      ? 'text-gray-300 group-hover:text-white'
                      : 'text-gray-600'
                  }`}
                >
                  arefinalmahi@gmail.com
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- COURSE CARD ---
const CourseCard = ({ title, onClick }) => {
  const { theme: appTheme } = useApp();
  const getTheme = () => {
    const t = title.toUpperCase();
    if (t.includes('CSE') || t.includes('CSC'))
      return { icon: <Terminal size={24} />, color: 'bg-blue-500' };
    if (t.includes('EEE'))
      return { icon: <Cpu size={24} />, color: 'bg-purple-500' };
    if (t.includes('MATH'))
      return { icon: <Sigma size={24} />, color: 'bg-emerald-500' };
    if (t.includes('PHYSICS'))
      return { icon: <Beaker size={24} />, color: 'bg-indigo-500' };
    if (t.includes('ACCOUNTING'))
      return { icon: <PieChart size={24} />, color: 'bg-amber-500' };
    if (t.includes('ECONOMICS'))
      return { icon: <BarChart3 size={24} />, color: 'bg-amber-600' };
    if (t.includes('FINANCE'))
      return { icon: <TrendingUp size={24} />, color: 'bg-green-500' };
    if (t.includes('MARKETING'))
      return { icon: <Target size={24} />, color: 'bg-rose-500' };
    if (t.includes('MANAGEMENT'))
      return { icon: <UserCheck size={24} />, color: 'bg-indigo-600' };
    if (t.includes('BANGLADESH'))
      return { icon: <Map size={24} />, color: 'bg-emerald-600' };
    if (t.includes('ENGLISH'))
      return { icon: <Languages size={24} />, color: 'bg-pink-500' };
    return { icon: <BookOpen size={24} />, color: 'bg-gray-500' };
  };
  const cardTheme = getTheme();
  return (
    <button
      onClick={onClick}
      className={`group p-6 rounded-2xl border transition-all text-center flex flex-col items-center shadow-lg hover:bg-white/10 ${
        appTheme === 'dark'
          ? 'bg-white/5 border-white/5 hover:border-white/20'
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }`}
    >
      <div
        className={`w-14 h-14 ${cardTheme.color} rounded-2xl mb-4 flex items-center justify-center text-black group-hover:scale-110 transition-all shadow-lg`}
      >
        {cardTheme.icon}
      </div>
      <span
        className={`text-sm font-bold tracking-tight ${
          appTheme === 'dark'
            ? 'text-gray-200 group-hover:text-white'
            : 'text-gray-700 group-hover:text-black'
        }`}
      >
        {title}
      </span>
    </button>
  );
};

const Materials = () => {
  const { uni, getBrandColor, getBrandBg, theme } = useApp();
  const [selectedDept, setSelectedDept] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);
  const navigate = useNavigate();

  const getDepts = () => {
    if (uni === 'AIUB')
      return [
        { id: 'FST', name: 'Science & Tech', icon: Atom },
        { id: 'FE', name: 'Engineering', icon: Settings },
        { id: 'FBA', name: 'Business', icon: Briefcase },
        { id: 'FASS', name: 'Arts & Social Science', icon: Globe },
      ];
    if (uni === 'NSU')
      return [
        { id: 'SEPS', name: 'Engineering & Phys Sc', icon: Settings },
        { id: 'SBE', name: 'Business & Econ', icon: Briefcase },
        { id: 'SHLS', name: 'Health & Life Sc', icon: Beaker },
        { id: 'SHSS', name: 'Humanities & Social Sc', icon: Globe },
      ];
    return [
      { id: 'SETS', name: 'Eng. Tech & Sciences', icon: Settings },
      { id: 'SBE', name: 'Business & Economics', icon: Briefcase },
      { id: 'SLASS', name: 'Liberal Arts & Social Sc', icon: Globe },
      { id: 'SPH', name: 'Public Health', icon: Beaker },
    ];
  };

  const getCourses = (deptId) => {
    if (deptId === 'FBA' || deptId === 'SBE')
      return [
        'Accounting',
        'Management',
        'Marketing',
        'Finance',
        'Economics',
        'English Courses',
        'Bangladesh Studies',
      ];
    if (deptId === 'FASS' || deptId === 'SHSS' || deptId === 'SLASS')
      return ['English Courses', 'Bangladesh Studies'];
    return [
      'CSE Courses',
      'EEE Courses',
      'Math Courses',
      'Physics Courses',
      'English Courses',
      'Bangladesh Studies',
      'Ethics',
    ];
  };

  const depts = getDepts();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-slide-up flex-grow w-full">
      <button
        onClick={() =>
          activeFolder
            ? setActiveFolder(null)
            : selectedDept
            ? setSelectedDept(null)
            : navigate('/')
        }
        className={`inline-flex items-center gap-2 ${getBrandColor()} mb-4 font-black text-[10px] uppercase tracking-widest`}
      >
        <ArrowLeft size={16} />{' '}
        {activeFolder
          ? 'Back to Courses'
          : selectedDept
          ? 'Back to Depts'
          : 'Back Home'}
      </button>

      {activeFolder ? (
        <DriveViewer
          folderId={activeFolder.id}
          title={activeFolder.title}
          onBack={() => setActiveFolder(null)}
        />
      ) : !selectedDept ? (
        <>
          <h2
            className={`text-4xl font-black uppercase tracking-tight mb-12 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {uni} Vault
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {depts.map((dept) => (
              <button
                key={dept.id}
                onClick={() => {
                  setSelectedDept(dept.id);
                }}
                className={`p-8 rounded-[2rem] border-2 transition-all text-left group shadow-2xl ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/5 hover:border-white/10'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-300'
                }`}
              >
                <div
                  className={`w-12 h-12 ${getBrandBg()} rounded-xl mb-6 flex items-center justify-center text-white`}
                >
                  <dept.icon size={24} />
                </div>
                <h3
                  className={`text-xl font-bold mb-1 uppercase tracking-tighter ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {dept.id}
                </h3>
                <p className="text-[10px] text-gray-400 mb-6 uppercase tracking-widest font-bold">
                  {dept.name}
                </p>
                <div
                  className={`text-[10px] font-black ${getBrandColor()} uppercase flex items-center gap-2`}
                >
                  {uni === 'AIUB' ? 'Browse Folder' : 'Enter Vault'}{' '}
                  <ChevronRight size={12} />
                </div>
              </button>
            ))}
          </div>
        </>
      ) : uni === 'AIUB' && selectedDept !== 'FASS' && DRIVE_IDS[uni] ? (
        <div
          className={`p-10 border-2 border-dashed rounded-[3.5rem] ${
            theme === 'dark'
              ? 'border-white/10 bg-white/[0.02]'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {getCourses(selectedDept).map((course, i) => (
              <CourseCard
                key={i}
                title={course}
                onClick={() => {
                  const folderId = DRIVE_IDS[uni]
                    ? DRIVE_IDS[uni][course]
                    : null;
                  if (folderId) {
                    setActiveFolder({ id: folderId, title: course });
                  } else {
                    alert('Vault not configured for this sector.');
                  }
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`text-center py-24 border-2 border-dashed rounded-[3rem] ${
            uni === 'NSU'
              ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
              : 'border-amber-500/20 bg-amber-500/[0.02]'
          }`}
        >
          <ShieldAlert
            className={`mx-auto mb-4 ${getBrandColor()} opacity-20`}
            size={64}
          />
          <p
            className={`${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            } font-black uppercase tracking-widest`}
          >
            {selectedDept} VAULT WILL BE AVAILABLE SOON
          </p>
        </div>
      )}
    </div>
  );
};

const CalendarPage = () => {
  const { uni, getBrandColor, getBrandBorder, theme } = useApp();

  const getCalendars = () => {
    if (uni === 'AIUB')
      return [
        {
          title: 'Central Spring 2026',
          desc: 'General Programs',
          link: 'https://www.aiub.edu/academic-calendar-spring-2025-26-except-llb--bpharm',
        },
        {
          title: 'Law & Pharmacy',
          desc: 'Professional Programs',
          link: 'https://www.aiub.edu/academic-calendar-spring-2025-26-bpharm--llb-hon',
        },
      ];
    if (uni === 'NSU')
      return [
        {
          title: 'Central Calendar',
          desc: 'General Undergraduate Programs',
          link: 'https://www.northsouth.edu/newassets/images/Registrs%20Office/academic-calendar-spring-2026-28-jan-2026-updated.pdf',
        },
        {
          title: 'Professional Programs',
          desc: 'B.Pharm, M.Pharm & LL.B., LL.M.',
          link: 'https://www.northsouth.edu/newassets/images/law/academic-calendar-for-bpharm-mpharm-and-llb,llm-programs-of-spring-2026-for-approval.pdf',
        },
      ];
    return [
      {
        title: 'Academic Calendar 2026',
        desc: 'Official Central Calendar (Tentative)',
        link: 'https://iub.ac.bd/document/tentative-academic-calendar-year-2026-0e76f6da-8acb-47e2-a29f-8b18e193efac.pdf',
      },
    ];
  };

  const calendars = getCalendars();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-slide-up flex-grow">
      <Link
        to="/"
        className={`inline-flex items-center gap-2 ${getBrandColor()} mb-10 font-black text-[10px] uppercase tracking-widest`}
      >
        <ArrowLeft size={16} /> Back Home
      </Link>
      <h2
        className={`text-4xl font-black mb-12 uppercase tracking-tight ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}
      >
        {uni} Schedules
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {calendars.map((cal, i) => (
          <a
            key={i}
            href={cal.link}
            target="_blank"
            rel="noreferrer"
            className={`group p-10 rounded-[2.5rem] border-2 ${getBrandBorder()} transition-all flex flex-col items-center shadow-2xl ${
              theme === 'dark'
                ? 'bg-white/5 border-white/5'
                : 'bg-gray-50 border-gray-200 hover:bg-white'
            }`}
          >
            <div
              className={`p-5 rounded-2xl bg-white/5 ${getBrandColor()} mb-6 group-hover:scale-110 transition-transform`}
            >
              <Calendar size={48} />
            </div>
            <h3
              className={`text-xl font-bold mb-2 uppercase tracking-tighter text-center ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {cal.title}
            </h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6 text-center">
              {cal.desc}
            </p>
            <div
              className={`mt-auto text-[10px] font-black ${getBrandColor()} uppercase bg-white/5 px-6 py-2 rounded-lg border border-current opacity-70 group-hover:opacity-100 transition-opacity`}
            >
              View PDF Document
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

const FacultyPage = () => {
  const { uni, getBrandColor, getBrandBorder, theme } = useApp();
  const getDepts = () => {
    if (uni === 'AIUB')
      return [
        {
          name: 'Science & Technology',
          link: 'https://www.aiub.edu/faculty-list/faculty-of-science--technology',
        },
        {
          name: 'Engineering',
          link: 'https://www.aiub.edu/faculty-list/faculty-of-engineering',
        },
        {
          name: 'Business Administration',
          link: 'https://www.aiub.edu/faculty-list/faculty-of-business-administration',
        },
        {
          name: 'Arts & Social Sciences',
          link: 'https://www.aiub.edu/faculty-list/faculty-of-arts-and-social-sciences',
        },
      ];
    if (uni === 'NSU')
      return [
        {
          name: 'SEPS (Engineering)',
          link: 'https://www.northsouth.edu/faculty-members/seps/',
        },
        {
          name: 'SBE (Business)',
          link: 'https://www.northsouth.edu/faculty-members/sbe/',
        },
        {
          name: 'SHLS (Health)',
          link: 'https://www.northsouth.edu/faculty-members/shls/',
        },
        {
          name: 'SHSS (Humanities)',
          link: 'https://www.northsouth.edu/faculty-members/shss/',
        },
      ];
    return [
      { name: 'SETS (Eng. & Tech)', link: 'http://sets.iub.edu.bd/' },
      { name: 'SBE (Business)', link: 'http://sbe.iub.edu.bd/' },
      { name: 'SLASS (Liberal Arts)', link: 'http://slass.iub.edu.bd/' },
      { name: 'SPH (Public Health)', link: 'http://sph.iub.edu.bd/' },
    ];
  };
  const depts = getDepts();
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex-grow animate-slide-up">
      <Link
        to="/"
        className={`inline-flex items-center gap-2 ${getBrandColor()} mb-10 font-black text-[10px] uppercase tracking-widest`}
      >
        <ArrowLeft size={16} /> Back Home
      </Link>
      <h2
        className={`text-4xl font-black mb-8 uppercase tracking-tight ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}
      >
        {uni} Directories
      </h2>
      <div className="grid gap-4">
        {depts.map((dept, i) => (
          <a
            key={i}
            href={dept.link}
            target="_blank"
            rel="noreferrer"
            className={`flex justify-between items-center p-6 rounded-2xl border ${getBrandBorder()} transition-all group ${
              theme === 'dark'
                ? 'bg-white/5 border-white/5'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <span
              className={`font-bold text-lg uppercase tracking-tight transition-colors ${
                theme === 'dark'
                  ? 'group-hover:text-white'
                  : 'text-gray-700 group-hover:text-black'
              }`}
            >
              {dept.name}
            </span>
            <ExternalLink size={18} />
          </a>
        ))}
      </div>
    </div>
  );
};

const FeatureCard = ({ to, icon: Icon, title, desc, color, isExternal }) => {
  const { getBrandBorder, getBrandColor, theme } = useApp();
  const CardWrapper = isExternal ? 'a' : Link;
  const wrapperProps = isExternal
    ? { href: to, target: '_blank', rel: 'noreferrer' }
    : { to };
  return (
    <CardWrapper
      {...wrapperProps}
      className={`group p-10 rounded-[2.5rem] border-2 ${getBrandBorder()} transition-all flex flex-col items-center text-center shadow-xl h-full relative cursor-pointer ${
        theme === 'dark'
          ? 'bg-white/5 border-white/5'
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }`}
    >
      {isExternal && (
        <Sparkles
          size={16}
          className="absolute top-6 right-6 text-yellow-500 animate-pulse"
        />
      )}
      <div
        className={`mb-8 p-5 rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}
      >
        <Icon size={48} />
      </div>
      <h2
        className={`text-2xl font-bold mb-4 tracking-tight uppercase ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}
      >
        {title}
      </h2>
      <p className="text-xs text-gray-500 mb-8">{desc}</p>
      <div
        className={`mt-auto text-[10px] font-black ${getBrandColor()} uppercase flex items-center gap-2`}
      >
        {isExternal ? 'Launch Tool' : 'Explore'} <ChevronRight size={12} />
      </div>
    </CardWrapper>
  );
};

const Home = () => {
  const { uni, getBrandColor, theme } = useApp();
  const [shuffledIubColors, setShuffledIubColors] = useState([]);

  const iubWarmPalette = [
    'text-amber-400',
    'text-orange-500',
    'text-yellow-400',
    'text-amber-600',
    'text-orange-400',
    'text-yellow-500',
    'text-orange-600',
    'text-amber-300',
  ];

  useEffect(() => {
    if (uni === 'IUB') {
      const shuffled = [...iubWarmPalette].sort(() => 0.5 - Math.random());
      setShuffledIubColors(shuffled.slice(0, 4));
    }
  }, [uni]);

  const getIconColor = (type, index) => {
    if (uni === 'AIUB') {
      return type === 'materials'
        ? 'text-orange-400'
        : type === 'calendar'
        ? 'text-yellow-500'
        : type === 'planner'
        ? 'text-pink-500'
        : getBrandColor();
    }
    if (uni === 'NSU') {
      return type === 'faculty'
        ? 'text-emerald-500'
        : type === 'materials'
        ? 'text-cyan-400'
        : type === 'calendar'
        ? 'text-violet-400'
        : 'text-amber-400';
    }
    return shuffledIubColors[index] || 'text-amber-500';
  };

  const features = [
    {
      to: '/faculty',
      icon: Users,
      title: uni === 'AIUB' ? 'Faculty' : 'Schools',
      desc: 'Official directories & hubs.',
      type: 'faculty',
    },
    {
      to: '/materials',
      icon: Book,
      title: 'Materials',
      desc: 'Course vaults & resources.',
      type: 'materials',
    },
    {
      to: '/calendar',
      icon: Calendar,
      title: 'Calendar',
      desc: 'Schedules & holidays.',
      type: 'calendar',
      isExternal: false,
    },
    {
      to: 'https://ultimate-planner-zeta.vercel.app/',
      icon: Clock,
      title: 'Planner',
      desc: 'The ultimate routine builder.',
      type: 'planner',
      isExternal: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 animate-fade-in flex-grow w-full">
      <header className="text-center mb-20">
        <div className="flex items-center justify-center gap-3 mb-6">
          <GraduationCap className={getBrandColor()} size={56} />
          <h1
            className={`text-5xl md:text-6xl font-black uppercase tracking-tighter ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Campus <span className={getBrandColor()}>Core</span>
          </h1>
        </div>
        <p className="text-gray-500 text-sm font-medium tracking-wide">
          Digital Gateway for{' '}
          <span className={`${getBrandColor()} font-bold`}>{uni}</span>
        </p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <FeatureCard
            key={i}
            to={f.to}
            icon={f.icon}
            title={f.title}
            desc={f.desc}
            isExternal={f.isExternal}
            color={getIconColor(f.type, i)}
          />
        ))}
      </div>
    </div>
  );
};

const AboutPage = () => {
  const { uni, getBrandColor, theme } = useApp();
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 flex-grow flex items-center justify-center">
      <div
        className={`border p-12 rounded-[3.5rem] shadow-2xl relative text-center ${
          theme === 'dark'
            ? 'bg-[#0a0a0a] border-white/10'
            : 'bg-white border-gray-200'
        }`}
      >
        <Link
          to="/"
          className={`absolute top-10 left-10 text-gray-500 transition-colors ${
            theme === 'dark' ? 'hover:text-white' : 'hover:text-black'
          }`}
        >
          <ArrowLeft size={24} />
        </Link>
        <h2
          className={`text-5xl font-black uppercase tracking-tighter mb-10 mt-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          About <span className={getBrandColor()}>Core</span>
        </h2>
        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5">
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em] leading-relaxed">
            CampusCore is an open-access platform designed to streamline {uni}{' '}
            student life.
          </p>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  const { getBrandColor, theme } = useApp();
  return (
    <footer className="border-t border-white/5 bg-black/20 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 text-left">
          <div>
            <h4
              className={`font-black text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              <Info size={14} className={getBrandColor()} /> Navigation
            </h4>
            <ul className="space-y-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              <li>01. Switch University at top right</li>
              <li>02. Access folders in Materials</li>
              <li>03. Use Planner to Plan Courses </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/faculty" element={<FacultyPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
        <Footer />
      </Router>
    </AppProvider>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import {
  Folder,
  FileText,
  Download,
  ExternalLink,
  Loader2,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const Materials = ({ useApp, initialDept }) => {
  const { uni, getBrandColor, theme, getBrandBg } = useApp();

  // Track path exactly as it exists in Drive to avoid case-sensitivity issues
  const [currentPath, setCurrentPath] = useState([
    uni.toUpperCase(),
    initialDept.toUpperCase(),
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = `https://campus-vault-api.arefinalmahi.workers.dev`;

  // Logic to check if we are in the locked AIUB FASS sector
  const isFassLocked =
    currentPath.includes('AIUB') && currentPath.includes('FASS');

  const fetchDriveData = useCallback(async () => {
    // If the sector is locked, don't bother fetching
    if (isFassLocked) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const pathString = currentPath
        .map((seg) => encodeURIComponent(seg.trim()))
        .join('/');

      const response = await fetch(`${API_URL}/${pathString}`);
      if (!response.ok)
        throw new Error(`Worker responded with ${response.status}`);

      const data = await response.json();

      const sortedItems = (data.files || []).sort((a, b) => {
        const isFolderA = a.mimeType === 'application/vnd.google-apps.folder';
        const isFolderB = b.mimeType === 'application/vnd.google-apps.folder';
        if (isFolderA && !isFolderB) return -1;
        if (!isFolderA && isFolderB) return 1;
        return a.name.localeCompare(b.name);
      });

      setItems(sortedItems);
    } catch (error) {
      console.error('Fetch error:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [currentPath, API_URL, isFassLocked]);

  useEffect(() => {
    fetchDriveData();
  }, [fetchDriveData]);

  const handleFolderClick = (folderName) => {
    // We keep the folder name exactly as provided by the API (case sensitive)
    setCurrentPath([...currentPath, folderName]);
  };

  const handleBack = () => {
    if (currentPath.length > 2) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const getSafeViewLink = (id) => `https://drive.google.com/file/d/${id}/view`;
  const getSafeDownloadLink = (id) =>
    `https://drive.google.com/u/0/uc?id=${id}&export=download`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className={`animate-spin ${getBrandColor()}`} size={48} />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
          Accessing Vault...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
          {currentPath.map((seg, i) => (
            <React.Fragment key={i}>
              <span
                className={
                  i === currentPath.length - 1
                    ? getBrandColor()
                    : 'text-gray-500'
                }
              >
                {seg}
              </span>
              {i < currentPath.length - 1 && (
                <ChevronRight size={10} className="text-gray-700" />
              )}
            </React.Fragment>
          ))}
        </nav>
        {currentPath.length > 2 && (
          <button
            onClick={handleBack}
            className="text-[10px] font-black uppercase bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 transition-all"
          >
            Back
          </button>
        )}
      </div>

      {/* RENDER LOGIC */}
      {isFassLocked ? (
        <div className="text-center py-24 border-2 border-dashed border-blue-500/20 rounded-[3rem] bg-blue-500/[0.02] flex flex-col items-center">
          <div className="relative mb-6">
            <ShieldCheck className={`text-blue-500 opacity-20`} size={80} />
            <Loader2
              className="absolute top-1/4 left-1/4 animate-spin text-blue-500/40"
              size={40}
            />
          </div>
          <h3 className="text-white font-black uppercase tracking-tighter text-xl mb-2">
            Sector Restricted
          </h3>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500/60 max-w-xs mx-auto px-6">
            FASS VAULT WILL BE AVAILABLE SOON
          </p>
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const isFolder =
              item.mimeType === 'application/vnd.google-apps.folder';
            return (
              <div
                key={item.id}
                onClick={() => isFolder && handleFolderClick(item.name)}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/5 hover:border-blue-500/50 hover:bg-white/10'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
                      isFolder ? getBrandBg() : 'bg-gray-700'
                    } text-white`}
                  >
                    {isFolder ? <Folder size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="truncate">
                    <p
                      className={`text-sm font-bold truncate ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {item.name}
                    </p>
                    <p className="text-[9px] uppercase font-black text-gray-500 tracking-tighter">
                      {isFolder ? 'Folder' : 'Document'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 ml-2">
                  {isFolder ? (
                    <ChevronRight
                      size={18}
                      className={`${getBrandColor()} opacity-50 group-hover:opacity-100`}
                    />
                  ) : (
                    <>
                      <a
                        href={getSafeViewLink(item.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <a
                        href={getSafeDownloadLink(item.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${getBrandColor()}`}
                      >
                        <Download size={16} />
                      </a>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
          <ShieldCheck
            className={`mx-auto mb-4 ${getBrandColor()} opacity-20`}
            size={64}
          />
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500">
            Vault Sector Empty
          </p>
        </div>
      )}
    </div>
  );
};

export default Materials;

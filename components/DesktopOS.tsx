'use client';

import { useState } from 'react';
import IDEInterface from './IDEInterface';
import EmailCaptureOverlay from './EmailCaptureOverlay';
import { Code, Database, FileText, Settings, BarChart3, Plug } from 'lucide-react';

interface DesktopOSProps {
  companyUrl: string;
}

interface AppWindow {
  id: string;
  name: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
}

export default function DesktopOS({ companyUrl }: DesktopOSProps) {
  const [windows, setWindows] = useState<AppWindow[]>([
    { id: 'ide', name: 'Membrane IDE', isOpen: true, isMinimized: false, zIndex: 1 }, // Auto-open IDE
  ]);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [openingApp, setOpeningApp] = useState<string | null>(null); // Track opening animation

  const companyName = companyUrl.split('.')[0];
  const capitalizedName = companyName.charAt(0).toUpperCase() + companyName.slice(1);

  // Desktop apps
  const apps = [
    { id: 'ide', name: 'Membrane IDE', icon: Code, color: 'from-blue-500 to-blue-600' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'from-purple-500 to-purple-600' },
    { id: 'api', name: 'API Explorer', icon: Plug, color: 'from-green-500 to-green-600' },
    { id: 'data', name: 'Data Mapper', icon: Database, color: 'from-orange-500 to-orange-600' },
    { id: 'docs', name: 'Documentation', icon: FileText, color: 'from-pink-500 to-pink-600' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'from-gray-500 to-gray-600' },
  ];

  const handleAppClick = (appId: string) => {
    if (appId === 'ide') {
      setOpeningApp(appId); // Start opening animation

      // Delay window opening to allow animation
      setTimeout(() => {
        setWindows((prev) =>
          prev.map((w) =>
            w.id === appId
              ? { ...w, isOpen: true, isMinimized: false, zIndex: maxZIndex + 1 }
              : w
          )
        );
        setMaxZIndex((prev) => prev + 1);

        // Clear opening animation after window opens
        setTimeout(() => setOpeningApp(null), 300);
      }, 100);
    } else {
      // Placeholder for other apps
      alert(`${apps.find((a) => a.id === appId)?.name} coming soon!`);
    }
  };

  const handleCloseWindow = (appId: string) => {
    setWindows((prev) => prev.map((w) => (w.id === appId ? { ...w, isOpen: false } : w)));
  };

  const handleEmailSubmit = async (email: string) => {
    console.log('Email captured:', email, 'for company:', companyUrl);
    setEmailSubmitted(true);
    setShowEmailCapture(false);
  };

  const handleEmailSkip = () => {
    setShowEmailCapture(false);
    setTimeout(() => {
      if (!emailSubmitted) {
        setShowEmailCapture(true);
      }
    }, 120000);
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0a0a1f] overflow-hidden relative">
      <style jsx global>{`
        @keyframes windowOpen {
          0% {
            transform: scale(0);
            opacity: 0;
            transform-origin: top left;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes iconPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
      `}</style>
      {/* Background Image */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('/membrane.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Email capture overlay */}
      {showEmailCapture && (
        <EmailCaptureOverlay onSubmit={handleEmailSubmit} onSkip={handleEmailSkip} />
      )}

      {/* macOS Menu Bar */}
      <div className="h-7 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center px-4 relative z-50">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            viewBox="0 0 180 225"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M177.996 55.3189C178.991 55.8951 179.604 56.9578 179.604 58.1076V164.277C179.604 166.264 177.452 167.504 175.733 166.508L153.939 153.886C153.143 153.425 152.653 152.575 152.653 151.655V77.9606C152.653 76.8108 152.04 75.7481 151.045 75.1718L83.7567 36.2047C82.9606 35.7437 82.4705 34.8936 82.4705 33.9737V4.47239C82.4705 2.48618 84.6222 1.24596 86.3411 2.24139L177.996 55.3189Z"
              fill="white"
            />
            <path
              d="M0 60.7224C0 58.7362 2.15168 57.496 3.8706 58.4914L95.5256 111.569C96.5207 112.145 97.1333 113.208 97.1333 114.358V220.527C97.1333 222.514 94.9817 223.754 93.2627 222.758L1.28618 169.495C0.490121 169.034 0 168.184 0 167.264V60.7224Z"
              fill="white"
            />
            <path
              d="M136.761 83.4439C137.756 84.0201 138.368 85.0828 138.368 86.2326V192.402C138.368 194.389 136.217 195.629 134.498 194.633L112.703 182.011C111.907 181.55 111.417 180.7 111.417 179.78V106.086C111.417 104.936 110.805 103.873 109.81 103.297L42.5214 64.3297C41.7254 63.8687 41.2353 63.0186 41.2353 62.0987V32.5974C41.2353 30.6112 43.3869 29.371 45.1059 30.3664L136.761 83.4439Z"
              fill="white"
            />
          </svg>
          <span className="text-white text-xs font-semibold">Membrane OS</span>
        </div>
        <div className="ml-auto text-xs text-white/70">
          {capitalizedName} Integration Platform
        </div>
      </div>

      {/* Desktop Area */}
      <div className="h-[calc(100vh-1.75rem)] p-6 relative flex items-start">
        {/* App Column - Positioned on the left side, vertical */}
        <div className="flex flex-col gap-3 pl-4 pt-4">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => handleAppClick(app.id)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-all group"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform border border-white/10`}
                  style={{
                    animation: openingApp === app.id ? 'iconPulse 0.3s ease-in-out' : 'none'
                  }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-white text-[10px] text-center font-medium max-w-[60px] leading-tight">
                  {app.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* IDE Window */}
        {windows.find((w) => w.id === 'ide')?.isOpen && (
          <div
            className={`absolute left-32 right-12 top-12 bottom-12 bg-[#1E1E1E] rounded-lg shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
              openingApp === 'ide' ? 'scale-0 opacity-0 origin-top-left' : 'scale-100 opacity-100'
            }`}
            style={{
              zIndex: windows.find((w) => w.id === 'ide')?.zIndex,
              animation: openingApp === null && windows.find((w) => w.id === 'ide')?.isOpen ? 'windowOpen 0.3s ease-out' : 'none'
            }}
          >
            {/* Window Title Bar */}
            <div className="h-8 bg-[#2D2D2D] flex items-center px-4 justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCloseWindow('ide')}
                  className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600"
                ></button>
                <button className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600"></button>
                <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600"></button>
              </div>
              <span className="text-white text-xs font-medium">Membrane IDE</span>
              <div className="w-16"></div>
            </div>

            {/* IDE Content */}
            <div className="flex-1 overflow-hidden">
              <IDEInterface companyUrl={companyUrl} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

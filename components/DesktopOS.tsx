'use client';

import { useState, useEffect } from 'react';
import IDEInterface from './IDEInterface';
import EmailCaptureOverlay from './EmailCaptureOverlay';
import MembraneConsole from './MembraneConsole';
import SafariBrowser from './SafariBrowser';
import IntegrationRushGame from './IntegrationRushGame';

interface DesktopOSProps {
  companyUrl: string;
}

interface AppWindow {
  id: string;
  name: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
}

export default function DesktopOS({ companyUrl }: DesktopOSProps) {
  const [currentTime, setCurrentTime] = useState('');

  // Default initial state (same for server and client to avoid hydration mismatch)
  const getDefaultWindows = (): AppWindow[] => [
    {
      id: 'console',
      name: 'Membrane Console',
      isOpen: true,
      isMinimized: false,
      zIndex: 10,
      position: { x: 0, y: 0 },
    },
    {
      id: 'ide',
      name: 'Your IDE',
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 160, y: 80 },
    },
    {
      id: 'safari',
      name: 'Safari',
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 100, y: 50 },
    },
    {
      id: 'game',
      name: 'Integration Rush',
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 120, y: 60 },
    },
  ];

  const [windows, setWindows] = useState<AppWindow[]>(getDefaultWindows);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setCurrentTime(`${dateStr} ${timeStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Default state (same for server and client to avoid hydration mismatch)
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [maxZIndex, setMaxZIndex] = useState(10);
  const [consoleReady, setConsoleReady] = useState(false);
  const [integrationData, setIntegrationData] = useState<{
    name: string;
    description: string;
    url?: string;
    files: { name: string; content: string }[];
  } | null>(null);
  const [consoleClosing, setConsoleClosing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from localStorage after mount (client-side only)
  useEffect(() => {
    const savedWindows = localStorage.getItem('membrane-windows-state');
    if (savedWindows) {
      try {
        const parsedWindows = JSON.parse(savedWindows);
        // Ensure console window is always open on initial load
        const updatedWindows = parsedWindows.map((w: AppWindow) =>
          w.id === 'console' ? { ...w, isOpen: true } : w
        );
        setWindows(updatedWindows);
      } catch (e) {
        console.error('Failed to parse saved windows state:', e);
      }
    }

    const savedEmailSubmitted = localStorage.getItem('membrane-email-submitted');
    if (savedEmailSubmitted === 'true') {
      setEmailSubmitted(true);
    }

    const savedMaxZIndex = localStorage.getItem('membrane-max-zindex');
    if (savedMaxZIndex) {
      setMaxZIndex(parseInt(savedMaxZIndex, 10));
    }

    const savedIntegrationData = localStorage.getItem('membrane-integration-data');
    if (savedIntegrationData) {
      try {
        setIntegrationData(JSON.parse(savedIntegrationData));
      } catch (e) {
        console.error('Failed to parse integration data:', e);
      }
    }

    // Mark as hydrated after loading from localStorage
    setIsHydrated(true);
  }, []);

  // Save state to localStorage whenever it changes (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('membrane-windows-state', JSON.stringify(windows));
    }
  }, [windows, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('membrane-email-submitted', emailSubmitted.toString());
    }
  }, [emailSubmitted, isHydrated]);

  useEffect(() => {
    if (isHydrated && integrationData) {
      localStorage.setItem('membrane-integration-data', JSON.stringify(integrationData));
    }
  }, [integrationData, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('membrane-max-zindex', maxZIndex.toString());
    }
  }, [maxZIndex, isHydrated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!emailSubmitted) {
        setShowEmailCapture(true);
      }
    }, 120000); // 2 minutes

    return () => clearTimeout(timer);
  }, [emailSubmitted]);

  // Only center console on first visit (when no saved state exists)
  useEffect(() => {
    const savedWindows = localStorage.getItem('membrane-windows-state');

    // Only center if there's no saved state
    if (!savedWindows) {
      const centerX = (window.innerWidth - 1100) / 2;
      const centerY = (window.innerHeight - 700) / 2 - 22; // -22 for menu bar

      setWindows((prev) =>
        prev.map((w) => (w.id === 'console' ? { ...w, position: { x: centerX, y: centerY } } : w))
      );
    }

    // Smooth popup animation on load
    setTimeout(() => {
      setConsoleReady(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }, 100);
  }, []);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCloseWindow = (appId: string) => {
    setWindows((prev) => prev.map((w) => (w.id === appId ? { ...w, isOpen: false } : w)));
  };

  const handleMinimizeWindow = (appId: string) => {
    setWindows((prev) => prev.map((w) => (w.id === appId ? { ...w, isMinimized: true } : w)));
  };

  const handleDockClick = (appId: string) => {
    setIsAnimating(true);
    setWindows((prev) => {
      const window = prev.find((w) => w.id === appId);
      if (!window) return prev;

      const newZIndex = maxZIndex + 1;
      setMaxZIndex(newZIndex);

      return prev.map((w) =>
        w.id === appId ? { ...w, isOpen: true, isMinimized: false, zIndex: newZIndex } : w
      );
    });

    setTimeout(() => setIsAnimating(false), 500);
  };

  const bringToFront = (appId: string) => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    setWindows((prev) => prev.map((w) => (w.id === appId ? { ...w, zIndex: newZIndex } : w)));
  };

  const handleMouseDown = (e: React.MouseEvent, appId: string) => {
    const target = e.target as HTMLElement;
    if (target.closest('.window-drag-handle')) {
      const window = windows.find((w) => w.id === appId);
      if (window) {
        setDragging(appId);
        setDragOffset({
          x: e.clientX - window.position.x,
          y: e.clientY - window.position.y,
        });
        bringToFront(appId);
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        setWindows((prev) =>
          prev.map((w) =>
            w.id === dragging
              ? { ...w, position: { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } }
              : w
          )
        );
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
    };

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset]);

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


  const handlePushToProduction = () => {
    setWindows((prev) => prev.map((w) => (w.id === 'ide' ? { ...w, isOpen: false } : w)));

    setTimeout(() => {
      const centerX = (window.innerWidth - 1000) / 2;
      const centerY = (window.innerHeight - 700) / 2 - 22;

      setIsAnimating(true);
      const newZIndex = maxZIndex + 1;
      setMaxZIndex(newZIndex);

      setWindows((prev) =>
        prev.map((w) =>
          w.id === 'safari'
            ? {
                ...w,
                isOpen: true,
                isMinimized: false,
                zIndex: newZIndex,
                position: { x: centerX, y: centerY },
              }
            : w
        )
      );

      setTimeout(() => setIsAnimating(false), 500);
    }, 300);

    // Show email capture overlay after 4 seconds
    setTimeout(() => {
      if (!emailSubmitted) {
        setShowEmailCapture(true);
      }
    }, 4000); // 4 seconds
  };

  const handleAddToIDE = (data: {
    name: string;
    description: string;
    url?: string;
    files: { name: string; content: string }[];
  }) => {
    setIntegrationData(data);
    setConsoleClosing(true);

    setTimeout(() => {
      setWindows((prev) => prev.map((w) => (w.id === 'console' ? { ...w, isOpen: false } : w)));
      setConsoleClosing(false);

      const centerX = (window.innerWidth - 1000) / 2;
      const centerY = (window.innerHeight - 650) / 2 - 22; // -22 for menu bar

      setIsAnimating(true);
      const newZIndex = maxZIndex + 1;
      setMaxZIndex(newZIndex);

      setWindows((prev) =>
        prev.map((w) =>
          w.id === 'ide'
            ? {
                ...w,
                isOpen: true,
                isMinimized: false,
                zIndex: newZIndex,
                position: { x: centerX, y: centerY },
              }
            : w
        )
      );

      setTimeout(() => setIsAnimating(false), 500);
    }, 300);
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative select-none">
      <div
        className="absolute inset-0 bg-[#F7F9FB]"
        style={{
          backgroundImage: `url('/membrane.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div>

      {showEmailCapture && (
        <div className="fixed inset-0 z-[9999]">
          <EmailCaptureOverlay onSubmit={handleEmailSubmit} onSkip={handleEmailSkip} />
        </div>
      )}

      <div className="h-11 bg-white/30 backdrop-blur-xl flex items-center px-6 relative z-50 text-base font-medium text-black/80 shadow-sm">
        <div className="flex items-center gap-6">
          <svg
            className="w-6 h-6"
            viewBox="0 0 180 225"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M177.996 55.3189C178.991 55.8951 179.604 56.9578 179.604 58.1076V164.277C179.604 166.264 177.452 167.504 175.733 166.508L153.939 153.886C153.143 153.425 152.653 152.575 152.653 151.655V77.9606C152.653 76.8108 152.04 75.7481 151.045 75.1718L83.7567 36.2047C82.9606 35.7437 82.4705 34.8936 82.4705 33.9737V4.47239C82.4705 2.48618 84.6222 1.24596 86.3411 2.24139L177.996 55.3189Z"
              fill="currentColor"
            />
            <path
              d="M0 60.7224C0 58.7362 2.15168 57.496 3.8706 58.4914L95.5256 111.569C96.5207 112.145 97.1333 113.208 97.1333 114.358V220.527C97.1333 222.514 94.9817 223.754 93.2627 222.758L1.28618 169.495C0.490121 169.034 0 168.184 0 167.264V60.7224Z"
              fill="currentColor"
            />
            <path
              d="M136.761 83.4439C137.756 84.0201 138.368 85.0828 138.368 86.2326V192.402C138.368 194.389 136.217 195.629 134.498 194.633L112.703 182.011C111.907 181.55 111.417 180.7 111.417 179.78V106.086C111.417 104.936 110.805 103.873 109.81 103.297L42.5214 64.3297C41.7254 63.8687 41.2353 63.0186 41.2353 62.0987V32.5974C41.2353 30.6112 43.3869 29.371 45.1059 30.3664L136.761 83.4439Z"
              fill="currentColor"
            />
          </svg>

          <span className="font-bold cursor-default">Membrane OS</span>
          <span className="hidden sm:inline cursor-pointer hover:bg-white/30 px-2 rounded transition">
            File
          </span>
          <span className="hidden sm:inline cursor-pointer hover:bg-white/30 px-2 rounded transition">
            Edit
          </span>
          <span className="hidden sm:inline cursor-pointer hover:bg-white/30 px-2 rounded transition">
            View
          </span>
          <span className="hidden sm:inline cursor-pointer hover:bg-white/30 px-2 rounded transition">
            Go
          </span>
          <span className="hidden sm:inline cursor-pointer hover:bg-white/30 px-2 rounded transition">
            Window
          </span>
          <span className="hidden sm:inline cursor-pointer hover:bg-white/30 px-2 rounded transition">
            Help
          </span>
        </div>

        <div className="ml-auto flex items-center gap-5">
          <span className="text-sm cursor-default font-semibold">{currentTime || ' '}</span>
        </div>
      </div>

      <div className="h-[calc(100vh-7.75rem)] relative">
        {windows.find((w) => w.id === 'console' && w.isOpen && !w.isMinimized) &&
          (() => {
            const window = windows.find((w) => w.id === 'console')!;
            return (
              <div
                onMouseDown={(e) => handleMouseDown(e, 'console')}
                className={`absolute w-[1100px] h-[700px] bg-white backdrop-blur-xl rounded-xl flex flex-col overflow-hidden border border-white/40 shadow-2xl ${
                  isAnimating ? 'animate-popup' : ''
                }`}
                style={{
                  left: `${window.position.x}px`,
                  top: `${window.position.y}px`,
                  zIndex: window.zIndex,
                  transform: consoleClosing
                    ? 'scale(0.95)'
                    : window.isMinimized
                      ? 'scale(0.9)'
                      : consoleReady
                        ? 'scale(1)'
                        : 'scale(0.9)',
                  opacity: consoleClosing ? 0 : consoleReady ? 1 : 0,
                  transition: consoleClosing
                    ? 'all 0.3s ease-out'
                    : 'opacity 0.4s ease-out, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <div className="window-drag-handle h-10 bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 flex items-center px-4 cursor-move">
                  <div className="flex items-center gap-2 group">
                    <button
                      type="button"
                      onClick={() => handleCloseWindow('console')}
                      className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF3B30] border border-[#E0443E] flex items-center justify-center text-[8px] text-black"
                      suppressHydrationWarning
                    ></button>
                    <button
                      type="button"
                      onClick={() => handleMinimizeWindow('console')}
                      className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFB400] border border-[#DEA123]"
                      suppressHydrationWarning
                    ></button>
                    <button
                      type="button"
                      className="w-3 h-3 rounded-full bg-[#28CA42] hover:bg-[#1AAD34] border border-[#24A93D]"
                      suppressHydrationWarning
                    ></button>
                  </div>
                  <div className="flex-1 text-center text-gray-700 text-sm font-medium">
                    Membrane Console
                  </div>
                  <div className="w-14"></div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <MembraneConsole
                    companyUrl={companyUrl}
                    onClose={() => handleCloseWindow('console')}
                    onAddToIDE={handleAddToIDE}
                  />
                </div>
              </div>
            );
          })()}

        {windows.find((w) => w.id === 'ide' && w.isOpen && !w.isMinimized) &&
          (() => {
            const window = windows.find((w) => w.id === 'ide')!;
            return (
              <div
                onMouseDown={(e) => handleMouseDown(e, 'ide')}
                className={`absolute w-[1000px] h-[650px] bg-white/80 backdrop-blur-xl rounded-xl flex flex-col overflow-hidden border border-white/40 shadow-2xl ${
                  isAnimating ? 'animate-popup' : 'transition-transform'
                }`}
                style={{
                  left: `${window.position.x}px`,
                  top: `${window.position.y}px`,
                  zIndex: window.zIndex,
                  transform: window.isMinimized ? 'scale(0.9)' : 'scale(1)',
                  opacity: window.isMinimized ? 0 : 1,
                }}
              >
                <div className="window-drag-handle h-10 bg-[#252526] border-b border-[#3E3E42] flex items-center px-4 cursor-move">
                  <div className="flex items-center gap-2 group">
                    <button
                      type="button"
                      onClick={() => handleCloseWindow('ide')}
                      className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF3B30] border border-[#E0443E] flex items-center justify-center text-[8px] text-black"
                      suppressHydrationWarning
                    ></button>
                    <button
                      type="button"
                      onClick={() => handleMinimizeWindow('ide')}
                      className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFB400] border border-[#DEA123]"
                      suppressHydrationWarning
                    ></button>
                    <button
                      type="button"
                      className="w-3 h-3 rounded-full bg-[#28CA42] hover:bg-[#1AAD34] border border-[#24A93D]"
                      suppressHydrationWarning
                    ></button>
                  </div>
                  <div className="flex-1 text-center text-gray-300 text-sm font-medium">
                    Your IDE
                  </div>
                  <div className="w-14"></div>
                </div>

                <div className="flex-1 overflow-hidden bg-[#1E1E1E]">
                  <IDEInterface
                    companyUrl={companyUrl}
                    integrationData={integrationData}
                    onPushToProduction={handlePushToProduction}
                  />
                </div>
              </div>
            );
          })()}

        {windows.find((w) => w.id === 'safari' && w.isOpen && !w.isMinimized) &&
          (() => {
            const window = windows.find((w) => w.id === 'safari')!;
            const integrationName = integrationData?.name || companyUrl.split('.')[0];
            const integrationUrl = integrationData?.url || companyUrl;
            const integrationDescription =
              integrationData?.description || `Production-ready integration for ${integrationName}`;

            return (
              <div
                onMouseDown={(e) => handleMouseDown(e, 'safari')}
                className={`absolute w-[1000px] h-[700px] bg-white backdrop-blur-xl rounded-xl flex flex-col overflow-hidden border border-white/40 shadow-2xl ${
                  isAnimating ? 'animate-popup' : 'transition-transform'
                }`}
                style={{
                  left: `${window.position.x}px`,
                  top: `${window.position.y}px`,
                  zIndex: window.zIndex,
                  transform: window.isMinimized ? 'scale(0.9)' : 'scale(1)',
                  opacity: window.isMinimized ? 0 : 1,
                }}
              >
                <div className="window-drag-handle h-10 bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 flex items-center px-4 cursor-move">
                  <div className="flex items-center gap-2 group">
                    <button
                      onClick={() => handleCloseWindow('safari')}
                      className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF3B30] border border-[#E0443E] flex items-center justify-center text-[8px] text-black"
                    ></button>
                    <button
                      onClick={() => handleMinimizeWindow('safari')}
                      className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFB400] border border-[#DEA123]"
                    ></button>
                    <button className="w-3 h-3 rounded-full bg-[#28CA42] hover:bg-[#1AAD34] border border-[#24A93D]"></button>
                  </div>
                  <div className="flex-1 text-center text-gray-700 text-sm font-medium">Safari</div>
                  <div className="w-14"></div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <SafariBrowser
                    companyUrl={companyUrl}
                    integrationName={integrationName}
                    integrationUrl={integrationUrl}
                    integrationDescription={integrationDescription}
                  />
                </div>
              </div>
            );
          })()}

        {windows.find((w) => w.id === 'game' && w.isOpen && !w.isMinimized) &&
          (() => {
            const window = windows.find((w) => w.id === 'game')!;
            return (
              <div
                onMouseDown={(e) => handleMouseDown(e, 'game')}
                className={`fixed inset-4 bg-white backdrop-blur-xl rounded-xl flex flex-col overflow-hidden border border-white/40 shadow-2xl ${
                  isAnimating ? 'animate-popup' : 'transition-transform'
                }`}
                style={{
                  zIndex: window.zIndex,
                  transform: window.isMinimized ? 'scale(0.9)' : 'scale(1)',
                  opacity: window.isMinimized ? 0 : 1,
                  top: '46px',
                }}
              >
                <div className="window-drag-handle h-10 bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 flex items-center px-4 cursor-move">
                  <div className="flex items-center gap-2 group">
                    <button
                      onClick={() => handleCloseWindow('game')}
                      className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF3B30] border border-[#E0443E] flex items-center justify-center text-[8px] text-black"
                    ></button>
                    <button
                      onClick={() => handleMinimizeWindow('game')}
                      className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFB400] border border-[#DEA123]"
                    ></button>
                    <button className="w-3 h-3 rounded-full bg-[#28CA42] hover:bg-[#1AAD34] border border-[#24A93D]"></button>
                  </div>
                  <div className="flex-1 text-center text-gray-700 text-sm font-medium">
                    🎮 Integration Rush
                  </div>
                  <div className="w-14"></div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <IntegrationRushGame />
                </div>
              </div>
            );
          })()}
      </div>

      <div className="fixed bottom-2 w-full flex justify-center z-50">
        <div className="bg-white/25 backdrop-blur-xl border border-white/20 flex items-end space-x-2 px-4 pb-2 pt-2 rounded-2xl h-16 shadow-2xl">
          <div
            onClick={() => handleDockClick('console')}
            className="w-12 h-12 bg-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110 hover:-translate-y-2 relative group"
          >
            {windows.find((w) => w.id === 'console' && w.isOpen && !w.isMinimized) && (
              <div className="absolute -bottom-1 w-1 h-1 bg-gray-400 rounded-full"></div>
            )}
            <svg width="24" height="30" viewBox="0 0 180 225" fill="none">
              <path
                d="M177.996 55.3189C178.991 55.8951 179.604 56.9578 179.604 58.1076V164.277C179.604 166.264 177.452 167.504 175.733 166.508L153.939 153.886C153.143 153.425 152.653 152.575 152.653 151.655V77.9606C152.653 76.8108 152.04 75.7481 151.045 75.1718L83.7567 36.2047C82.9606 35.7437 82.4705 34.8936 82.4705 33.9737V4.47239C82.4705 2.48618 84.6222 1.24596 86.3411 2.24139L177.996 55.3189Z"
                fill="#03030D"
              />
              <path
                d="M0 60.7224C0 58.7362 2.15168 57.496 3.8706 58.4914L95.5256 111.569C96.5207 112.145 97.1333 113.208 97.1333 114.358V220.527C97.1333 222.514 94.9817 223.754 93.2627 222.758L1.28618 169.495C0.490121 169.034 0 168.184 0 167.264V60.7224Z"
                fill="#03030D"
              />
              <path
                d="M136.761 83.4439C137.756 84.0201 138.368 85.0828 138.368 86.2326V192.402C138.368 194.389 136.217 195.629 134.498 194.633L112.703 182.011C111.907 181.55 111.417 180.7 111.417 179.78V106.086C111.417 104.936 110.805 103.873 109.81 103.297L42.5214 64.3297C41.7254 63.8687 41.2353 63.0186 41.2353 62.0987V32.5974C41.2353 30.6112 43.3869 29.371 45.1059 30.3664L136.761 83.4439Z"
                fill="#03030D"
              />
            </svg>
          </div>

          <div
            onClick={() => handleDockClick('ide')}
            className="w-12 h-12 bg-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110 hover:-translate-y-2 relative group"
          >
            {windows.find((w) => w.id === 'ide' && w.isOpen && !w.isMinimized) && (
              <div className="absolute -bottom-1 w-1 h-1 bg-gray-400 rounded-full"></div>
            )}
            <span className="text-2xl font-mono text-blue-600">&lt;/&gt;</span>
          </div>

          <div
            onClick={() => handleDockClick('safari')}
            className="w-12 h-12 bg-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110 hover:-translate-y-2 relative group"
          >
            {windows.find((w) => w.id === 'safari' && w.isOpen && !w.isMinimized) && (
              <div className="absolute -bottom-1 w-1 h-1 bg-gray-400 rounded-full"></div>
            )}
            <svg className="w-full h-full p-2" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="url(#safari-gradient)" />
              <circle
                cx="16"
                cy="16"
                r="13"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                opacity="0.3"
              />
              <g transform="translate(16, 16)">
                <circle cx="0" cy="0" r="1.5" fill="white" />
                <path d="M 0,-10 L -1,8 L 1,8 Z" fill="white" />
                <path d="M 0,-10 L -1,8 L 1,8 Z" fill="red" transform="rotate(180)" />
              </g>
              <defs>
                <linearGradient id="safari-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#85D7FF" />
                  <stop offset="100%" stopColor="#0A7AFF" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div
            onClick={() => handleDockClick('game')}
            className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110 hover:-translate-y-2 relative group"
          >
            {windows.find((w) => w.id === 'game' && w.isOpen && !w.isMinimized) && (
              <div className="absolute -bottom-1 w-1 h-1 bg-gray-400 rounded-full"></div>
            )}
            <span className="text-2xl">🎮</span>
          </div>
        </div>
      </div>
    </div>
  );
}

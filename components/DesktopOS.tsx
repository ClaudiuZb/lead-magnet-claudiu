'use client';

import { useState, useRef, useEffect } from 'react';
import IDEInterface from './IDEInterface';
import EmailCaptureOverlay from './EmailCaptureOverlay';
import FavoritesPanel from './FavoritesPanel';
import IntegrationSimulator from './IntegrationSimulator';
import IntegrationDebtCalculator from './IntegrationDebtCalculator';

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
  const [windows, setWindows] = useState<AppWindow[]>([
    { id: 'ide', name: 'Membrane IDE', isOpen: false, isMinimized: false, zIndex: 10, position: { x: 160, y: 80 } },
    { id: 'simulator', name: 'Integration Weight', isOpen: false, isMinimized: false, zIndex: 10, position: { x: 250, y: 120 } },
    { id: 'debt-calculator', name: 'Debt Calculator', isOpen: false, isMinimized: false, zIndex: 10, position: { x: 200, y: 100 } },
  ]);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [maxZIndex, setMaxZIndex] = useState(10);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  const companyName = companyUrl.split('.')[0];
  const capitalizedName = companyName.charAt(0).toUpperCase() + companyName.slice(1);

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
        w.id === appId
          ? { ...w, isOpen: true, isMinimized: false, zIndex: newZIndex }
          : w
      );
    });

    // Reset animation state after animation completes
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

  const handleFavoriteClick = (itemId: string) => {
    if (itemId === 'membrane-ide') {
      handleDockClick('ide');
    } else if (itemId === 'integration-simulator') {
      handleDockClick('simulator');
    } else if (itemId === 'debt-calculator') {
      handleDockClick('debt-calculator');
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative select-none">
      {/* Background Image */}
      <div
        className="absolute inset-0"
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
      <div className="h-11 bg-white/30 backdrop-blur-xl flex items-center px-6 relative z-50 text-base font-medium text-black/80 shadow-sm">
        <div className="flex items-center gap-6">
          {/* Membrane Logo */}
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
          <span className="hidden sm:inline cursor-pointer hover:bg-white/30 px-2 rounded transition">File</span>
          <span className="hidden sm:inline cursor-pointer hover:bg-white/30 px-2 rounded transition">Edit</span>
          <span className="hidden sm:inline cursor-pointer hover:bg-white/30 px-2 rounded transition">View</span>
          <span className="hidden sm:inline cursor-pointer hover:bg-white/30 px-2 rounded transition">Go</span>
          <span className="hidden sm:inline cursor-pointer hover:bg-white/30 px-2 rounded transition">Window</span>
          <span className="hidden sm:inline cursor-pointer hover:bg-white/30 px-2 rounded transition">Help</span>
        </div>

        {/* Right side - time/status */}
        <div className="ml-auto flex items-center gap-5">
          <span className="text-sm cursor-default font-semibold">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Desktop Area with Desktop Icons */}
      <div className="h-[calc(100vh-7.75rem)] relative">
        {/* Favorites Panel - Always visible */}
        <FavoritesPanel onItemClick={handleFavoriteClick} />

        {/* Desktop Icons (Right Side) */}
        <div className="absolute top-10 right-4 flex flex-col items-end space-y-6 z-0">
          {/* Membrane IDE Icon */}
          <div
            onClick={() => handleDockClick('ide')}
            className="group flex flex-col items-center cursor-pointer w-20 transition-transform hover:scale-105"
          >
            <div className="w-14 h-14 bg-white/90 rounded-lg shadow-lg border-2 border-white/50 flex items-center justify-center mb-1 backdrop-blur-sm">
              <svg className="w-8 h-8" viewBox="0 0 180 225" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M177.996 55.3189C178.991 55.8951 179.604 56.9578 179.604 58.1076V164.277C179.604 166.264 177.452 167.504 175.733 166.508L153.939 153.886C153.143 153.425 152.653 152.575 152.653 151.655V77.9606C152.653 76.8108 152.04 75.7481 151.045 75.1718L83.7567 36.2047C82.9606 35.7437 82.4705 34.8936 82.4705 33.9737V4.47239C82.4705 2.48618 84.6222 1.24596 86.3411 2.24139L177.996 55.3189Z"
                  fill="#000"
                />
                <path
                  d="M0 60.7224C0 58.7362 2.15168 57.496 3.8706 58.4914L95.5256 111.569C96.5207 112.145 97.1333 113.208 97.1333 114.358V220.527C97.1333 222.514 94.9817 223.754 93.2627 222.758L1.28618 169.495C0.490121 169.034 0 168.184 0 167.264V60.7224Z"
                  fill="#000"
                />
                <path
                  d="M136.761 83.4439C137.756 84.0201 138.368 85.0828 138.368 86.2326V192.402C138.368 194.389 136.217 195.629 134.498 194.633L112.703 182.011C111.907 181.55 111.417 180.7 111.417 179.78V106.086C111.417 104.936 110.805 103.873 109.81 103.297L42.5214 64.3297C41.7254 63.8687 41.2353 63.0186 41.2353 62.0987V32.5974C41.2353 30.6112 43.3869 29.371 45.1059 30.3664L136.761 83.4439Z"
                  fill="#000"
                />
              </svg>
            </div>
            <span className="text-gray-800 text-xs font-bold drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] bg-white/40 px-2 rounded-full">Membrane IDE</span>
          </div>

          {/* Integration Weight Icon */}
          <div
            onClick={() => handleDockClick('simulator')}
            className="group flex flex-col items-center cursor-pointer w-20 transition-transform hover:scale-105"
          >
            <div className="w-14 h-14 bg-white/90 rounded-lg shadow-lg border-2 border-white/50 flex items-center justify-center mb-1 backdrop-blur-sm">
              <span className="text-3xl">⚓</span>
            </div>
            <span className="text-gray-800 text-xs font-bold drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] bg-white/40 px-2 rounded-full">Weight</span>
          </div>

          {/* Debt Calculator Icon */}
          <div
            onClick={() => handleDockClick('debt-calculator')}
            className="group flex flex-col items-center cursor-pointer w-20 transition-transform hover:scale-105"
          >
            <div className="w-14 h-14 bg-white/90 rounded-lg shadow-lg border-2 border-white/50 flex items-center justify-center mb-1 backdrop-blur-sm">
              <span className="text-3xl">💰</span>
            </div>
            <span className="text-gray-800 text-xs font-bold drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] bg-white/40 px-2 rounded-full">Calculator</span>
          </div>

          {/* Integrations Folder */}
          <div className="group flex flex-col items-center cursor-pointer w-20 transition-transform hover:scale-105">
            <div className="w-14 h-14 bg-white/90 rounded-lg shadow-lg border-2 border-white/50 flex items-center justify-center mb-1 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <span className="text-gray-800 text-xs font-bold drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] bg-white/40 px-2 rounded-full">Integrations</span>
          </div>

          {/* README.md File */}
          <div className="group flex flex-col items-center cursor-pointer w-20 transition-transform hover:scale-105">
            <div className="w-14 h-14 bg-white/90 rounded-lg shadow-lg border-2 border-white/50 flex items-center justify-center mb-1 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-gray-800 text-xs font-bold drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] bg-white/40 px-2 rounded-full">README.md</span>
          </div>
        </div>

        {/* IDE Window */}
        {windows.find((w) => w.id === 'ide' && w.isOpen && !w.isMinimized) && (() => {
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
              {/* Window Title Bar */}
              <div className="window-drag-handle h-10 bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 flex items-center px-4 cursor-move">
                <div className="flex items-center gap-2 group">
                  <button
                    onClick={() => handleCloseWindow('ide')}
                    className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF3B30] border border-[#E0443E] flex items-center justify-center text-[8px] text-black"
                  ></button>
                  <button
                    onClick={() => handleMinimizeWindow('ide')}
                    className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFB400] border border-[#DEA123]"
                  ></button>
                  <button className="w-3 h-3 rounded-full bg-[#28CA42] hover:bg-[#1AAD34] border border-[#24A93D]"></button>
                </div>
                <div className="flex-1 text-center text-gray-700 text-sm font-medium">Membrane IDE</div>
                <div className="w-14"></div>
              </div>

              {/* Window Content */}
              <div className="flex-1 overflow-hidden bg-[#1E1E1E]">
                <IDEInterface companyUrl={companyUrl} />
              </div>
            </div>
          );
        })()}

        {/* Integration Weight Simulator Window */}
        {windows.find((w) => w.id === 'simulator' && w.isOpen && !w.isMinimized) && (() => {
          const window = windows.find((w) => w.id === 'simulator')!;
          return (
            <div
              onMouseDown={(e) => handleMouseDown(e, 'simulator')}
              className={`absolute w-[800px] h-[600px] bg-white/80 backdrop-blur-xl rounded-xl flex flex-col overflow-hidden border border-white/40 shadow-2xl ${
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
              {/* Window Title Bar */}
              <div className="window-drag-handle h-10 bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 flex items-center px-4 cursor-move">
                <div className="flex items-center gap-2 group">
                  <button
                    onClick={() => handleCloseWindow('simulator')}
                    className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF3B30] border border-[#E0443E] flex items-center justify-center text-[8px] text-black"
                  ></button>
                  <button
                    onClick={() => handleMinimizeWindow('simulator')}
                    className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFB400] border border-[#DEA123]"
                  ></button>
                  <button className="w-3 h-3 rounded-full bg-[#28CA42] hover:bg-[#1AAD34] border border-[#24A93D]"></button>
                </div>
                <div className="flex-1 text-center text-gray-700 text-sm font-medium">Integration Weight</div>
                <div className="w-14"></div>
              </div>

              {/* Window Content */}
              <div className="flex-1 overflow-hidden bg-white">
                <IntegrationSimulator onClose={() => handleCloseWindow('simulator')} />
              </div>
            </div>
          );
        })()}

        {/* Debt Calculator Window */}
        {windows.find((w) => w.id === 'debt-calculator' && w.isOpen && !w.isMinimized) && (() => {
          const window = windows.find((w) => w.id === 'debt-calculator')!;
          return (
            <div
              onMouseDown={(e) => handleMouseDown(e, 'debt-calculator')}
              className={`absolute w-[900px] h-[700px] bg-white/80 backdrop-blur-xl rounded-xl flex flex-col overflow-hidden border border-white/40 shadow-2xl ${
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
              {/* Window Title Bar */}
              <div className="window-drag-handle h-10 bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 flex items-center px-4 cursor-move">
                <div className="flex items-center gap-2 group">
                  <button
                    onClick={() => handleCloseWindow('debt-calculator')}
                    className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF3B30] border border-[#E0443E] flex items-center justify-center text-[8px] text-black"
                  ></button>
                  <button
                    onClick={() => handleMinimizeWindow('debt-calculator')}
                    className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFB400] border border-[#DEA123]"
                  ></button>
                  <button className="w-3 h-3 rounded-full bg-[#28CA42] hover:bg-[#1AAD34] border border-[#24A93D]"></button>
                </div>
                <div className="flex-1 text-center text-gray-700 text-sm font-medium">Debt Calculator</div>
                <div className="w-14"></div>
              </div>

              {/* Window Content */}
              <div className="flex-1 overflow-hidden bg-white">
                <IntegrationDebtCalculator onClose={() => handleCloseWindow('debt-calculator')} />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Dock */}
      <div className="fixed bottom-2 w-full flex justify-center z-50">
        <div className="bg-white/25 backdrop-blur-xl border border-white/20 flex items-end space-x-2 px-4 pb-2 pt-2 rounded-2xl h-16 shadow-2xl">
          {/* Membrane IDE Icon */}
          <div
            onClick={() => handleDockClick('ide')}
            className="w-12 h-12 bg-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110 hover:-translate-y-2 relative group"
          >
            {windows.find((w) => w.id === 'ide' && w.isOpen && !w.isMinimized) && (
              <div className="absolute -bottom-1 w-1 h-1 bg-gray-400 rounded-full"></div>
            )}
            <svg
              className="w-8 h-8"
              viewBox="0 0 180 225"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M177.996 55.3189C178.991 55.8951 179.604 56.9578 179.604 58.1076V164.277C179.604 166.264 177.452 167.504 175.733 166.508L153.939 153.886C153.143 153.425 152.653 152.575 152.653 151.655V77.9606C152.653 76.8108 152.04 75.7481 151.045 75.1718L83.7567 36.2047C82.9606 35.7437 82.4705 34.8936 82.4705 33.9737V4.47239C82.4705 2.48618 84.6222 1.24596 86.3411 2.24139L177.996 55.3189Z"
                fill="#000"
              />
              <path
                d="M0 60.7224C0 58.7362 2.15168 57.496 3.8706 58.4914L95.5256 111.569C96.5207 112.145 97.1333 113.208 97.1333 114.358V220.527C97.1333 222.514 94.9817 223.754 93.2627 222.758L1.28618 169.495C0.490121 169.034 0 168.184 0 167.264V60.7224Z"
                fill="#000"
              />
              <path
                d="M136.761 83.4439C137.756 84.0201 138.368 85.0828 138.368 86.2326V192.402C138.368 194.389 136.217 195.629 134.498 194.633L112.703 182.011C111.907 181.55 111.417 180.7 111.417 179.78V106.086C111.417 104.936 110.805 103.873 109.81 103.297L42.5214 64.3297C41.7254 63.8687 41.2353 63.0186 41.2353 62.0987V32.5974C41.2353 30.6112 43.3869 29.371 45.1059 30.3664L136.761 83.4439Z"
                fill="#000"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

interface FavoritesPanelProps {
  onItemClick?: (itemId: string) => void;
  onClose?: () => void;
}

export default function FavoritesPanel({ onItemClick, onClose }: FavoritesPanelProps) {
  const handleClick = (itemId: string) => {
    if (onItemClick) {
      onItemClick(itemId);
    }
  };

  return (
    <div className="absolute top-20 left-20 w-[800px] h-[500px]">
      <div className="bg-white/80 backdrop-blur-xl rounded-xl flex flex-col overflow-hidden border border-white/40 shadow-2xl h-full">
        <div className="flex h-full">
          <div className="w-48 bg-gray-100/50 backdrop-blur-md border-r border-gray-300/50 flex-shrink-0 p-3">
            <div className="flex space-x-2 mb-6 px-1">
              <div
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] cursor-pointer hover:bg-[#FF3B30] transition-colors"
              ></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] cursor-pointer hover:bg-[#FFB300] transition-colors"></div>
              <div className="w-3 h-3 rounded-full bg-[#28CA42] border border-[#24A93D] cursor-pointer hover:bg-[#1FA935] transition-colors"></div>
            </div>

            <div className="text-xs font-bold text-gray-400 mb-2 pl-2">Favorites</div>
            <ul className="space-y-1">
              <li
                onClick={() => handleClick('membrane-console')}
                className="flex items-center text-sm text-gray-700 p-1 rounded cursor-pointer hover:bg-gray-300/70 transition bg-gray-300/50"
              >
                <svg
                  width="16"
                  height="20"
                  viewBox="0 0 180 225"
                  fill="none"
                  className="mr-2 flex-shrink-0"
                >
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
                Membrane Console
              </li>
              <li
                onClick={() => handleClick('membrane-ide')}
                className="flex items-center text-sm text-gray-700 p-1 rounded cursor-pointer hover:bg-gray-300/70 transition"
              >
                <span className="text-base font-mono mr-2 text-blue-600">&lt;/&gt;</span>
                Your IDE
              </li>
              <li
                onClick={() => handleClick('safari')}
                className="flex items-center text-sm text-gray-700 p-1 rounded cursor-pointer hover:bg-gray-300/70 transition"
              >
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none" className="mr-2">
                  <circle cx="16" cy="16" r="14" fill="url(#safari-gradient-small)" />
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
                    <linearGradient id="safari-gradient-small" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#85D7FF" />
                      <stop offset="100%" stopColor="#0A7AFF" />
                    </linearGradient>
                  </defs>
                </svg>
                Safari
              </li>
              <li className="flex items-center text-sm text-gray-500 p-1 rounded cursor-not-allowed opacity-50">
                <svg
                  className="w-4 h-4 mr-2 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Recents
              </li>
              <li className="flex items-center text-sm text-gray-500 p-1 rounded cursor-not-allowed opacity-50">
                <svg
                  className="w-4 h-4 mr-2 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  ></path>
                </svg>
                Integrations
              </li>
              <li className="flex items-center text-sm text-gray-500 p-1 rounded cursor-not-allowed opacity-50">
                <svg
                  className="w-4 h-4 mr-2 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                Documentation
              </li>
              <li className="flex items-center text-sm text-gray-500 p-1 rounded cursor-not-allowed opacity-50">
                <svg
                  className="w-4 h-4 mr-2 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
                Downloads
              </li>
            </ul>
          </div>

          <div className="flex-1 flex flex-col bg-white/40">
            <div className="h-12 bg-gray-50/50 border-b border-gray-200 flex items-center justify-between px-4">
              <div className="flex items-center space-x-4">
                <div className="text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    ></path>
                  </svg>
                </div>
                <div className="text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </div>
                <span className="font-bold text-sm text-gray-700">Favorites</span>
              </div>
              <div className="flex space-x-3 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  ></path>
                </svg>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  ></path>
                </svg>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
              <div className="mb-6 text-6xl">⚡</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Select an item from Favorites
              </h3>
              <p className="text-sm text-gray-500">Choose from the sidebar to get started</p>
            </div>

            <div className="h-6 bg-white/40 border-t border-gray-200 flex items-center px-3 text-[10px] text-gray-500">
              <span>Ready to integrate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

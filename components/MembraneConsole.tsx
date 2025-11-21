'use client';

import { useState, useEffect, useRef } from 'react';
import CodePanel from './CodePanel';
import ChatPanel from './ChatPanel';

interface MembraneConsoleProps {
  onClose?: () => void;
  companyUrl: string;
  onAddToIDE?: (integrationData: {
    name: string;
    description: string;
    url?: string;
    files: { name: string; content: string }[];
  }) => void;
}

interface CompanyAnalysis {
  companyName: string;
  productTagline: string;
  productDescription: string;
  suggestedUseCases: string[];
}

export default function MembraneConsole({ companyUrl, onAddToIDE }: MembraneConsoleProps) {
  const [inputValue, setInputValue] = useState('');
  const [activeNav, setActiveNav] = useState<
    'dashboard' | 'apps' | 'builder' | 'tenants' | 'activity'
  >('dashboard');
  const [activeTab, setActiveTab] = useState<'your-app' | 'membrane' | 'external-apps'>('membrane');
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [companyAnalysis, setCompanyAnalysis] = useState<CompanyAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isAICoding, setIsAICoding] = useState(false);
  const [generatedFileContents, setGeneratedFileContents] = useState<Map<string, string>>(
    new Map()
  );
  const [typingFile, setTypingFile] = useState<{
    name: string;
    content: string;
  } | null>(null);
  const [aiThinking, setAiThinking] = useState<string>('');

  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const path3Ref = useRef<SVGPathElement>(null);

  const handleCodingStateChange = (isCoding: boolean) => {
    setIsAICoding(isCoding);
    if (isCoding) {
      setShowCodeEditor(true);
    }
  };

  useEffect(() => {
    const analyzeCompany = async () => {
      try {
        const response = await fetch('/api/analyze-company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: companyUrl }),
        });

        if (response.ok) {
          const data = await response.json();
          setCompanyAnalysis(data);
        }
      } catch (error) {
        console.error('Failed to analyze company:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeCompany();
  }, [companyUrl]);

  const handleNewFile = (fileName: string, fileContent: string) => {
    setGeneratedFileContents((prev) => new Map(prev).set(`generated/${fileName}`, fileContent));
    setSelectedFile(`generated/${fileName}`);
  };

  const handleFileTyping = (fileName: string, content: string, isComplete: boolean) => {
    if (!isComplete) {
      setTypingFile({ name: `generated/${fileName}`, content });
      setSelectedFile(`generated/${fileName}`);
    } else {
      setGeneratedFileContents((prev) => {
        const newMap = new Map(prev);
        newMap.set(`generated/${fileName}`, content);
        return newMap;
      });
      setTypingFile(null);
    }
  };

  useEffect(() => {
    if (path1Ref.current && path2Ref.current && path3Ref.current) {
      const length1 = path1Ref.current.getTotalLength();
      const length2 = path2Ref.current.getTotalLength();
      const length3 = path3Ref.current.getTotalLength();

      [
        { ref: path1Ref, length: length1 },
        { ref: path2Ref, length: length2 },
        { ref: path3Ref, length: length3 },
      ].forEach(({ ref, length }) => {
        if (ref.current) {
          ref.current.style.strokeDasharray = `${length}`;
          ref.current.style.strokeDashoffset = `${length}`;
        }
      });
    }
  }, []);

  return (
    <div
      className="flex h-full bg-[#F8F9FA]"
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div className="w-[100px] bg-[#03030D] flex flex-col justify-between items-center py-5 px-0">
        <div className="flex flex-col justify-center items-center gap-[5px] w-full">
          <div className="w-[36.75px] h-[36.75px] flex justify-center items-center">
            <svg width="20.21" height="20.21" viewBox="0 0 180 225" fill="none">
              <path
                d="M177.996 55.3189C178.991 55.8951 179.604 56.9578 179.604 58.1076V164.277C179.604 166.264 177.452 167.504 175.733 166.508L153.939 153.886C153.143 153.425 152.653 152.575 152.653 151.655V77.9606C152.653 76.8108 152.04 75.7481 151.045 75.1718L83.7567 36.2047C82.9606 35.7437 82.4705 34.8936 82.4705 33.9737V4.47239C82.4705 2.48618 84.6222 1.24596 86.3411 2.24139L177.996 55.3189Z"
                fill="#FFFFFF"
              />
              <path
                d="M0 60.7224C0 58.7362 2.15168 57.496 3.8706 58.4914L95.5256 111.569C96.5207 112.145 97.1333 113.208 97.1333 114.358V220.527C97.1333 222.514 94.9817 223.754 93.2627 222.758L1.28618 169.495C0.490121 169.034 0 168.184 0 167.264V60.7224Z"
                fill="#FFFFFF"
              />
              <path
                d="M136.761 83.4439C137.756 84.0201 138.368 85.0828 138.368 86.2326V192.402C138.368 194.389 136.217 195.629 134.498 194.633L112.703 182.011C111.907 181.55 111.417 180.7 111.417 179.78V106.086C111.417 104.936 110.805 103.873 109.81 103.297L42.5214 64.3297C41.7254 63.8687 41.2353 63.0186 41.2353 62.0987V32.5974C41.2353 30.6112 43.3869 29.371 45.1059 30.3664L136.761 83.4439Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>
          <span className="text-[9px] font-semibold text-[#B9BBC6] text-center tracking-tight">
            Membrane
          </span>
        </div>

        <div className="flex flex-col justify-center items-center gap-6 w-full">
          <button className="w-[29.4px] h-[29.4px] bg-[rgba(243,245,247,0.1)] rounded-[5.51px] flex justify-center items-center relative">
            <svg width="12.86" height="12.86" fill="none" stroke="#F3F5F7" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="absolute bottom-0.5 right-0.5 text-[8px] text-[#B9BBC6]">/</span>
          </button>

          <div className="flex flex-col items-center gap-1 w-full">
            <div
              onClick={() => setActiveNav('dashboard')}
              className={`flex flex-col justify-center items-center py-[7.35px] px-2 gap-[3px] w-full rounded-[2.76px] cursor-pointer transition ${
                activeNav === 'dashboard' ? 'bg-[rgba(243,245,247,0.08)]' : ''
              }`}
            >
              <div
                className={`flex justify-center items-center w-[29.4px] h-[29.4px] rounded-[5.51px] ${
                  activeNav === 'dashboard' ? 'bg-[rgba(220,255,0,0.2)]' : ''
                }`}
              >
                <svg width="18.37" height="18.37" fill="none" viewBox="0 0 30 30">
                  <path
                    d="M15.8098 14.3551L17.3793 12.7856M13.1685 15.4653C13.1685 15.8714 13.3298 16.2608 13.6169 16.548C13.9041 16.8351 14.2936 16.9965 14.6997 16.9965C15.1058 16.9965 15.4952 16.8351 15.7824 16.548C16.0696 16.2608 16.2309 15.8714 16.2309 15.4653C16.2309 15.0591 16.0696 14.6697 15.7824 14.3825C15.4952 14.0954 15.1058 13.934 14.6997 13.934C14.2936 13.934 13.9041 14.0954 13.6169 14.3825C13.3298 14.6697 13.1685 15.0591 13.1685 15.4653ZM10.4123 20.8245C9.29306 19.9349 8.47828 18.7192 8.08082 17.3459C7.68337 15.9726 7.72294 14.5097 8.19403 13.1599C8.66513 11.81 9.54443 10.6402 10.7101 9.8124C11.8757 8.98461 13.27 8.53991 14.6997 8.53991C16.1293 8.53991 17.5236 8.98461 18.6893 9.8124C19.8549 10.6402 20.7342 11.81 21.2053 13.1599C21.6764 14.5097 21.716 15.9726 21.3185 17.3459C20.921 18.7192 20.1063 19.9349 18.9871 20.8245H10.4123Z"
                    stroke={activeNav === 'dashboard' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className={`text-[9px] font-semibold text-center tracking-tight leading-[1.2] ${
                  activeNav === 'dashboard' ? 'text-[#F3F5F7]' : 'text-[#B9BBC6]'
                }`}
              >
                Dashboard
              </span>
            </div>

            <div
              onClick={() => setActiveNav('apps')}
              className={`flex flex-col justify-center items-center py-[7.35px] px-2 gap-[3px] w-full rounded-[2.76px] cursor-pointer transition ${
                activeNav === 'apps' ? 'bg-[rgba(243,245,247,0.08)]' : ''
              }`}
            >
              <div
                className={`flex justify-center items-center w-[29.4px] h-[29.4px] rounded-[5.51px] ${
                  activeNav === 'apps' ? 'bg-[rgba(220,255,0,0.2)]' : ''
                }`}
              >
                <svg width="18.37" height="18.37" fill="none" viewBox="0 0 24 24">
                  <rect
                    x="3"
                    y="3"
                    width="8"
                    height="8"
                    rx="2"
                    stroke={activeNav === 'apps' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                  />
                  <rect
                    x="3"
                    y="13"
                    width="8"
                    height="8"
                    rx="2"
                    stroke={activeNav === 'apps' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                  />
                  <rect
                    x="13"
                    y="13"
                    width="8"
                    height="8"
                    rx="2"
                    stroke={activeNav === 'apps' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                  />
                  <line
                    x1="17"
                    y1="4"
                    x2="17"
                    y2="10"
                    stroke={activeNav === 'apps' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                  />
                  <line
                    x1="14"
                    y1="7"
                    x2="20"
                    y2="7"
                    stroke={activeNav === 'apps' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span
                className={`text-[9px] font-semibold text-center tracking-tight leading-[1.2] ${
                  activeNav === 'apps' ? 'text-[#F3F5F7]' : 'text-[#B9BBC6]'
                }`}
              >
                Apps
              </span>
            </div>

            <div
              onClick={() => setActiveNav('builder')}
              className={`flex flex-col justify-center items-center py-[7.35px] px-2 gap-[3px] w-full rounded-[2.76px] cursor-pointer transition ${
                activeNav === 'builder' ? 'bg-[rgba(243,245,247,0.08)]' : ''
              }`}
            >
              <div
                className={`flex justify-center items-center w-[29.4px] h-[29.4px] rounded-[5.51px] ${
                  activeNav === 'builder' ? 'bg-[rgba(220,255,0,0.2)]' : ''
                }`}
              >
                <svg width="18.37" height="18.37" fill="none" viewBox="0 0 19 19">
                  <path
                    d="M5.53661 16.5369L5.53661 5.43565H1.83618L1.83618 16.5369H12.9375V12.8365H1.83618"
                    stroke={activeNav === 'builder' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.23705 16.5369V9.13608H1.83618"
                    stroke={activeNav === 'builder' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.0764 2.29666L8.67555 2.29666L8.67555 5.99709L16.0764 5.99709"
                    stroke={activeNav === 'builder' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.0764 2.29588V9.69673"
                    stroke={activeNav === 'builder' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                  />
                  <path
                    d="M12.376 2.29666L12.376 9.69752L16.0764 9.69752"
                    stroke={activeNav === 'builder' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className={`text-[9px] font-semibold text-center tracking-tight leading-[1.2] ${
                  activeNav === 'builder' ? 'text-[#F3F5F7]' : 'text-[#B9BBC6]'
                }`}
              >
                Integration
                <br />
                Builder
              </span>
            </div>

            <div
              onClick={() => setActiveNav('tenants')}
              className={`flex flex-col justify-center items-center py-[7.35px] px-2 gap-[3px] w-full rounded-[2.76px] cursor-pointer transition ${
                activeNav === 'tenants' ? 'bg-[rgba(243,245,247,0.08)]' : ''
              }`}
            >
              <div
                className={`flex justify-center items-center w-[29.4px] h-[29.4px] rounded-[5.51px] ${
                  activeNav === 'tenants' ? 'bg-[rgba(220,255,0,0.2)]' : ''
                }`}
              >
                <svg width="18.37" height="18.37" fill="none" viewBox="0 0 19 19">
                  <path
                    d="M3.8288 5.35933C3.8288 6.17154 4.15144 6.95048 4.72576 7.52479C5.30008 8.09911 6.07902 8.42176 6.89122 8.42176C7.70343 8.42176 8.48237 8.09911 9.05669 7.52479C9.631 6.95048 9.95365 6.17154 9.95365 5.35933C9.95365 4.54713 9.631 3.76819 9.05669 3.19387C8.48237 2.61955 7.70343 2.29691 6.89122 2.29691C6.07902 2.29691 5.30008 2.61955 4.72576 3.19387C4.15144 3.76819 3.8288 4.54713 3.8288 5.35933Z"
                    stroke={activeNav === 'tenants' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.29639 16.0778V14.5466C2.29639 13.7344 2.61903 12.9554 3.19335 12.3811C3.76767 11.8068 4.54661 11.4842 5.35881 11.4842H8.42124C9.23345 11.4842 10.0124 11.8068 10.5867 12.3811C11.161 12.9554 11.4837 13.7344 11.4837 14.5466V16.0778"
                    stroke={activeNav === 'tenants' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.248 2.39737C12.9068 2.56603 13.4907 2.94914 13.9076 3.4863C14.3246 4.02346 14.5509 4.68411 14.5509 5.36409C14.5509 6.04408 14.3246 6.70473 13.9076 7.24189C13.4907 7.77905 12.9068 8.16216 12.248 8.33082"
                    stroke={activeNav === 'tenants' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.0773 16.0778V14.5466C16.0734 13.8707 15.846 13.2151 15.4305 12.6819C15.0151 12.1487 14.4349 11.768 13.7805 11.599"
                    stroke={activeNav === 'tenants' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className={`text-[9px] font-semibold text-center tracking-tight leading-[1.2] ${
                  activeNav === 'tenants' ? 'text-[#F3F5F7]' : 'text-[#B9BBC6]'
                }`}
              >
                Tenants
              </span>
            </div>

            <div
              onClick={() => setActiveNav('activity')}
              className={`flex flex-col justify-center items-center py-[7.35px] px-2 gap-[3px] w-full rounded-[2.76px] cursor-pointer transition ${
                activeNav === 'activity' ? 'bg-[rgba(243,245,247,0.08)]' : ''
              }`}
            >
              <div
                className={`flex justify-center items-center w-[29.4px] h-[29.4px] rounded-[5.51px] ${
                  activeNav === 'activity' ? 'bg-[rgba(220,255,0,0.2)]' : ''
                }`}
              >
                <svg width="18.37" height="18.37" fill="none" viewBox="0 0 19 19">
                  <path
                    d="M9.18726 6.12485V9.18727L10.7185 10.7185"
                    stroke={activeNav === 'activity' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.33514 8.42166C2.50671 6.73737 3.29235 5.17519 4.54218 4.03317C5.79201 2.89116 7.41854 2.24925 9.11143 2.22991C10.8043 2.21058 12.4451 2.81517 13.7207 3.92834C14.9963 5.04151 15.8174 6.58533 16.0274 8.26526C16.2374 9.9452 15.8215 11.6436 14.8592 13.0366C13.8969 14.4295 12.4554 15.4193 10.8099 15.8173C9.16429 16.2153 7.4298 15.9935 5.93732 15.1943C4.44484 14.395 3.29883 13.0743 2.71795 11.4841M2.33514 15.3121V11.4841H6.16318"
                    stroke={activeNav === 'activity' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className={`text-[9px] font-semibold text-center tracking-tight leading-[1.2] ${
                  activeNav === 'activity' ? 'text-[#F3F5F7]' : 'text-[#B9BBC6]'
                }`}
              >
                Activity
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-[9.19px] w-full">
          <div className="flex flex-col items-center gap-1 w-full">
            <div className="flex flex-col justify-center items-center py-[7.35px] px-2 gap-[3px] w-full rounded-[2.76px] cursor-pointer">
              <div className="flex justify-center items-center w-[29.4px] h-[29.4px] rounded-[5.51px]">
                <svg width="18.37" height="18.37" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
                    stroke="#F3F5F7"
                    strokeWidth="1.38"
                  />
                  <circle cx="9" cy="10" r="0.5" fill="#F3F5F7" />
                  <circle cx="12" cy="10" r="0.5" fill="#F3F5F7" />
                  <circle cx="15" cy="10" r="0.5" fill="#F3F5F7" />
                </svg>
              </div>
              <span className="text-[9px] font-semibold text-[#B9BBC6] text-center tracking-tight leading-[1.2]">
                Help
              </span>
            </div>

            <div className="flex flex-col justify-center items-center py-[7.35px] px-2 gap-[3px] w-full rounded-[2.76px] cursor-pointer">
              <div className="flex justify-center items-center w-[29.4px] h-[29.4px] rounded-[5.51px]">
                <svg width="18.37" height="18.37" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" stroke="#F3F5F7" strokeWidth="1.38" />
                  <path
                    d="M12 1v3m0 16v3M5.64 5.64l2.12 2.12m8.48 8.48l2.12 2.12M1 12h3m16 0h3M5.64 18.36l2.12-2.12m8.48-8.48l2.12-2.12"
                    stroke="#F3F5F7"
                    strokeWidth="1.38"
                  />
                </svg>
              </div>
              <span className="text-[9px] font-semibold text-[#B9BBC6] text-center tracking-tight leading-[1.2]">
                Manage
                <br />
                Workspace
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-[#E5E7EB] px-8 py-3 flex items-center justify-between">
          <div className="flex gap-6 items-center">
            <div
              onClick={() => setActiveTab('your-app')}
              className={`flex items-center gap-2 text-sm cursor-pointer py-2 border-b-2 transition ${
                activeTab === 'your-app'
                  ? 'text-[#1F2937] border-[#DCFF00]'
                  : 'text-[#9CA3AF] border-transparent'
              }`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" />
              </svg>
              Your App
            </div>
            <div
              onClick={() => setActiveTab('membrane')}
              className={`flex items-center gap-2 text-sm cursor-pointer py-2 border-b-2 transition ${
                activeTab === 'membrane'
                  ? 'text-[#1F2937] border-[#DCFF00]'
                  : 'text-[#9CA3AF] border-transparent'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 180 225" fill="none">
                <path
                  d="M136.761 83.4439C137.756 84.0201 138.368 85.0828 138.368 86.2326V192.402C138.368 194.389 136.217 195.629 134.498 194.633L112.703 182.011C111.907 181.55 111.417 180.7 111.417 179.78V106.086C111.417 104.936 110.805 103.873 109.81 103.297L42.5214 64.3297C41.7254 63.8687 41.2353 63.0186 41.2353 62.0987V32.5974C41.2353 30.6112 43.3869 29.371 45.1059 30.3664L136.761 83.4439Z"
                  fill="currentColor"
                />
              </svg>
              Membrane
            </div>
            <div
              onClick={() => setActiveTab('external-apps')}
              className={`flex items-center gap-2 text-sm cursor-pointer py-2 border-b-2 transition ${
                activeTab === 'external-apps'
                  ? 'text-[#1F2937] border-[#DCFF00]'
                  : 'text-[#9CA3AF] border-transparent'
              }`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" />
                <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2" />
                <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2" />
                <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2" />
              </svg>
              External Apps
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {!showCodeEditor ? (
              <div className="flex-1 overflow-hidden bg-[#F8F9FA] flex items-center justify-center">
                <div
                  className="relative"
                  style={{
                    width: '600px',
                    height: '350px',
                    marginTop: '110px',
                  }}
                >
                  <svg
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 0 }}
                    viewBox="0 0 600 350"
                  >
                    <path
                      ref={path1Ref}
                      id="path1"
                      d="M 200 169 H 210 C 230 169, 230 60, 250 60 L 320 60"
                      stroke="#DEDFE3"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      className="animate-draw-line-1"
                    />
                    <circle r="4" fill="#4F46E5" className="animate-dot-1">
                      <animateMotion dur="1.2s" begin="0.6s" fill="freeze">
                        <mpath href="#path1" />
                      </animateMotion>
                    </circle>

                    <path
                      ref={path2Ref}
                      id="path2"
                      d="M 200 169 H 210 C 240 169, 250 169, 320 169"
                      stroke="#DEDFE3"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      className="animate-draw-line-2"
                    />
                    <circle r="4" fill="#4F46E5" className="animate-dot-2">
                      <animateMotion dur="1.2s" begin="1.5s" fill="freeze">
                        <mpath href="#path2" />
                      </animateMotion>
                    </circle>

                    <path
                      ref={path3Ref}
                      id="path3"
                      d="M 200 169 H 210 C 230 169, 230 270, 250 270 L 320 270"
                      stroke="#DEDFE3"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      className="animate-draw-line-3"
                    />
                    <circle r="4" fill="#4F46E5" className="animate-dot-3">
                      <animateMotion dur="1.2s" begin="2.4s" fill="freeze">
                        <mpath href="#path3" />
                      </animateMotion>
                    </circle>
                  </svg>

                  <style jsx>{`
                    @keyframes drawLine {
                      to {
                        stroke-dashoffset: 0;
                      }
                    }

                    @keyframes fadeInUp {
                      from {
                        opacity: 0;
                        transform: translateY(20px);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }

                    @keyframes fadeInDot {
                      from {
                        opacity: 0;
                      }
                      to {
                        opacity: 1;
                      }
                    }

                    .animate-draw-line-1 {
                      animation: drawLine 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards;
                    }

                    .animate-draw-line-2 {
                      animation: drawLine 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1.5s forwards;
                    }

                    .animate-draw-line-3 {
                      animation: drawLine 0.8s cubic-bezier(0.4, 0, 0.2, 1) 2.4s forwards;
                    }

                    .animate-dot-1 {
                      opacity: 0;
                      animation: fadeInDot 0.2s 0.6s forwards;
                    }

                    .animate-dot-2 {
                      opacity: 0;
                      animation: fadeInDot 0.2s 1.5s forwards;
                    }

                    .animate-dot-3 {
                      opacity: 0;
                      animation: fadeInDot 0.2s 2.4s forwards;
                    }

                    .card-fade-in-0 {
                      animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards;
                      opacity: 0;
                    }

                    .card-fade-in-1 {
                      animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.9s forwards;
                      opacity: 0;
                    }

                    .card-fade-in-2 {
                      animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 1.8s forwards;
                      opacity: 0;
                    }

                    .card-fade-in-3 {
                      animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 2.7s forwards;
                      opacity: 0;
                    }
                  `}</style>

                  <div
                    className="absolute left-[0px] top-[90px] w-[200px] bg-white rounded-lg p-3 shadow-sm card-fade-in-0"
                    style={{ zIndex: 1 }}
                  >
                    <h3 className="text-xs font-semibold text-[#1F2937] mb-2">Your App</h3>
                    <div className="flex items-center gap-1 py-1.5 px-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-[10px] text-[#4B5563] mb-1.5 cursor-pointer hover:bg-[#F3F4F6] transition">
                      <svg
                        width="10"
                        height="10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                      <span className="text-[10px] whitespace-nowrap overflow-hidden text-ellipsis">
                        Connect Dev Environment
                      </span>
                    </div>
                    <div className="flex items-center gap-1 py-1.5 px-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-[10px] text-[#4B5563] mb-1.5 cursor-pointer hover:bg-[#F3F4F6] transition">
                      <svg
                        width="10"
                        height="10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
                        />
                      </svg>
                      <span className="text-[10px] whitespace-nowrap overflow-hidden text-ellipsis">
                        Create First Connection
                      </span>
                    </div>
                    <div className="flex items-center gap-1 py-1.5 px-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-[10px] text-[#4B5563] cursor-pointer hover:bg-[#F3F4F6] transition">
                      <svg
                        width="10"
                        height="10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span className="text-[10px] whitespace-nowrap overflow-hidden text-ellipsis">
                        Generate Integration Code
                      </span>
                    </div>
                  </div>

                  <div
                    className="absolute left-[320px] top-[10px] w-[200px] bg-white rounded-lg p-3 shadow-sm card-fade-in-1"
                    style={{ zIndex: 1 }}
                  >
                    <div className="flex items-center gap-0.5 mb-1.5 flex-wrap">
                      <div className="w-5 h-5 rounded bg-[#00A1E0] flex items-center justify-center text-white text-xs">
                        ☁
                      </div>
                      <div className="w-5 h-5 rounded bg-[#FF7A59] flex items-center justify-center text-white text-xs">
                        ⚙
                      </div>
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-[#0078D4] to-[#50E6FF] flex items-center justify-center text-white text-[10px]">
                        ▶
                      </div>
                      <div className="w-5 h-5 rounded bg-[#C8242B] flex items-center justify-center text-white text-xs font-bold">
                        Z
                      </div>
                      <div className="w-5 h-5 rounded bg-[#000] flex items-center justify-center text-white text-xs font-bold">
                        P
                      </div>
                      <div className="w-5 h-5 rounded bg-[#6161FF] flex items-center justify-center text-white text-xs">
                        ▤
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#F3F4F6] rounded text-[10px] font-semibold text-[#6B7280]">
                        +13
                      </span>
                    </div>
                    <div className="flex gap-1 mb-1.5">
                      <div className="w-4 h-4 rounded bg-[#E5E7EB]"></div>
                      <div className="w-4 h-4 rounded bg-[#E5E7EB]"></div>
                      <div className="w-4 h-4 rounded bg-[#E5E7EB]"></div>
                      <span className="px-1.5 py-0.5 bg-[#F3F4F6] rounded text-[10px] font-semibold text-[#6B7280]">
                        4
                      </span>
                    </div>
                    <h3 className="text-xs font-semibold text-[#1F2937]">Users Unified API</h3>
                  </div>

                  <div
                    className="absolute left-[320px] top-[115px] w-[200px] bg-white rounded-lg p-3 shadow-sm card-fade-in-2"
                    style={{ zIndex: 1 }}
                  >
                    <div className="flex items-center gap-0.5 mb-1.5 flex-wrap">
                      <div className="w-5 h-5 rounded bg-[#00A1E0] flex items-center justify-center text-white text-xs">
                        ☁
                      </div>
                      <div className="w-5 h-5 rounded bg-[#FF7A59] flex items-center justify-center text-white text-xs">
                        ⚙
                      </div>
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-[#0078D4] to-[#50E6FF] flex items-center justify-center text-white text-[10px]">
                        ▶
                      </div>
                      <div className="w-5 h-5 rounded bg-[#000] flex items-center justify-center text-white text-xs font-bold">
                        P
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#F3F4F6] rounded text-[10px] font-semibold text-[#6B7280]">
                        +1
                      </span>
                    </div>
                    <div className="flex gap-1 mb-1.5">
                      <div className="w-4 h-4 rounded bg-[#E5E7EB]"></div>
                      <div className="w-4 h-4 rounded bg-[#E5E7EB]"></div>
                      <span className="px-1.5 py-0.5 bg-[#F3F4F6] rounded text-[10px] font-semibold text-[#6B7280]">
                        2
                      </span>
                    </div>
                    <h3 className="text-xs font-semibold text-[#1F2937]">
                      Create Incoming Payment
                    </h3>
                  </div>

                  <div
                    className="absolute left-[320px] top-[220px] w-[200px] bg-white rounded-lg p-3 shadow-sm card-fade-in-3"
                    style={{ zIndex: 1 }}
                  >
                    <div className="w-5 h-5 rounded bg-[#74C947] flex items-center justify-center text-white text-xs font-bold mb-1.5">
                      K
                    </div>
                    <div className="flex gap-1 mb-1">
                      <div className="w-4 h-4 rounded bg-[#E5E7EB]"></div>
                      <span className="px-1.5 py-0.5 bg-[#F3F4F6] rounded text-[10px] font-semibold text-[#6B7280]">
                        1
                      </span>
                    </div>
                    <h3 className="text-[11px] font-semibold text-[#1F2937]">Create Bill</h3>
                  </div>
                </div>
              </div>
            ) : (
              <CodePanel
                selectedFile={selectedFile}
                companyUrl={companyUrl}
                companyAnalysis={companyAnalysis || undefined}
                isAICoding={isAICoding}
                generatedFileContents={generatedFileContents}
                typingFile={typingFile}
                aiThinking={aiThinking}
              />
            )}
          </div>

          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <ChatPanel
              companyUrl={companyUrl}
              onCodingStateChange={handleCodingStateChange}
              onNewFile={handleNewFile}
              onFileTyping={handleFileTyping}
              onAiThinking={setAiThinking}
              companyAnalysis={companyAnalysis || undefined}
              isAnalyzing={isAnalyzing}
              onAddToIDE={onAddToIDE}
            />
          </div>
        </div>

        <div className="hidden flex-1 overflow-y-auto p-6 relative">
          <div className="max-w-[500px] mx-auto mb-8 relative">
            <svg
              className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="What integration you want to build today?"
              className="w-full py-3 px-4 pl-10 bg-white border border-[#E5E7EB] rounded-[10px] text-sm text-[#6B7280] shadow-sm focus:outline-none focus:border-[#9CA3AF]"
            />
          </div>

          <div className="max-w-[1000px] mx-auto relative min-h-[500px]">
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 0 }}
            >
              <path
                d="M 220 130 C 290 130, 330 90, 400 65"
                stroke="#D1D5DB"
                strokeWidth="1.5"
                fill="none"
                opacity="0.5"
              />

              <path
                d="M 220 150 C 290 150, 330 200, 400 215"
                stroke="#D1D5DB"
                strokeWidth="1.5"
                fill="none"
                opacity="0.5"
              />

              <path
                d="M 220 170 C 280 240, 330 310, 400 360"
                stroke="#D1D5DB"
                strokeWidth="1.5"
                fill="none"
                opacity="0.5"
              />
            </svg>

            <div
              className="absolute left-0 top-[90px] w-[220px] bg-white rounded-xl p-4 shadow-sm"
              style={{ zIndex: 1 }}
            >
              <h3 className="text-sm font-semibold text-[#1F2937] mb-3">Your App</h3>
              <div className="flex items-center gap-[6px] py-2 px-[10px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-xs text-[#4B5563] mb-[6px] cursor-pointer hover:bg-[#F3F4F6] transition">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                Connect Dev Environment
              </div>
              <div className="flex items-center gap-[6px] py-2 px-[10px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-xs text-[#4B5563] mb-[6px] cursor-pointer hover:bg-[#F3F4F6] transition">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
                  />
                </svg>
                Create First Connection
              </div>
              <div className="flex items-center gap-[6px] py-2 px-[10px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-xs text-[#4B5563] cursor-pointer hover:bg-[#F3F4F6] transition">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate Integration Code
              </div>
            </div>

            <div
              className="absolute left-[400px] top-0 w-[280px] bg-white rounded-xl p-4 shadow-sm"
              style={{ zIndex: 1 }}
            >
              <div className="flex items-center gap-1 mb-2">
                <div className="w-7 h-7 rounded-md bg-[#00A1E0] flex items-center justify-center text-white text-xl">
                  ☁
                </div>
                <div className="w-7 h-7 rounded-md bg-[#FF7A59] flex items-center justify-center text-white text-lg">
                  ⚙
                </div>
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#0078D4] to-[#50E6FF] flex items-center justify-center text-white text-base">
                  ▶
                </div>
                <div className="w-7 h-7 rounded-md bg-[#C8242B] flex items-center justify-center text-white text-lg font-bold">
                  Z
                </div>
                <div className="w-7 h-7 rounded-md bg-[#000] flex items-center justify-center text-white text-lg font-bold">
                  P
                </div>
                <div className="w-7 h-7 rounded-md bg-[#6161FF] flex items-center justify-center text-white text-lg">
                  ▤
                </div>
                <div className="w-7 h-7 rounded-md bg-[#FFB900] flex items-center justify-center text-white text-xl font-bold">
                  ↓
                </div>
                <span className="px-2 py-0.5 bg-[#F3F4F6] rounded-[10px] text-xs font-semibold text-[#6B7280]">
                  19
                </span>
              </div>
              <div className="flex gap-2 mb-[10px]">
                <div className="flex flex-col gap-[3px]">
                  <div className="w-5 h-5 rounded-[5px] bg-[#E5E7EB]"></div>
                  <div className="w-5 h-5 rounded-[5px] bg-[#E5E7EB]"></div>
                </div>
                <div className="flex flex-col gap-[3px]">
                  <div className="w-5 h-5 rounded-[5px] bg-[#E5E7EB]"></div>
                  <div className="w-5 h-5 rounded-[5px] bg-[#E5E7EB]"></div>
                </div>
                <span className="px-2 py-0.5 bg-[#F3F4F6] rounded-[10px] text-xs font-semibold text-[#6B7280]">
                  4
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#1F2937]">Users Unified API</h3>
            </div>

            <div
              className="absolute left-[400px] top-[180px] w-[280px] bg-white rounded-xl p-4 shadow-sm"
              style={{ zIndex: 1 }}
            >
              <div className="flex items-center gap-1 mb-2">
                <div className="w-7 h-7 rounded-md bg-[#00A1E0] flex items-center justify-center text-white text-xl">
                  ☁
                </div>
                <div className="w-7 h-7 rounded-md bg-[#FF7A59] flex items-center justify-center text-white text-lg">
                  ⚙
                </div>
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#0078D4] to-[#50E6FF] flex items-center justify-center text-white text-base">
                  ▶
                </div>
                <div className="w-7 h-7 rounded-md bg-[#000] flex items-center justify-center text-white text-lg font-bold">
                  P
                </div>
                <div className="w-7 h-7 rounded-md bg-[#FFB900] flex items-center justify-center text-white text-xl font-bold">
                  ↓
                </div>
                <span className="px-2 py-0.5 bg-[#F3F4F6] rounded-[10px] text-xs font-semibold text-[#6B7280]">
                  5
                </span>
              </div>
              <div className="flex gap-2 mb-[10px]">
                <div className="w-5 h-5 rounded-[5px] bg-[#E5E7EB]"></div>
                <div className="w-5 h-5 rounded-[5px] bg-[#E5E7EB]"></div>
                <div className="w-5 h-5 rounded-[5px] bg-[#E5E7EB]"></div>
                <span className="px-2 py-0.5 bg-[#F3F4F6] rounded-[10px] text-xs font-semibold text-[#6B7280]">
                  3
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#1F2937]">Create Incoming Payment</h3>
            </div>

            <div
              className="absolute left-[400px] top-[330px] w-[180px] bg-white rounded-xl p-4 shadow-sm"
              style={{ zIndex: 1 }}
            >
              <div className="w-7 h-7 rounded-md bg-[#74C947] flex items-center justify-center text-white text-lg font-bold mb-2">
                K
              </div>
              <div className="flex gap-[6px] mb-2">
                <div className="w-5 h-5 rounded-[5px] bg-[#E5E7EB]"></div>
                <span className="px-2 py-0.5 bg-[#F3F4F6] rounded-[10px] text-[11px] font-semibold text-[#6B7280]">
                  1
                </span>
              </div>
              <div className="flex gap-[6px] mb-2">
                <div className="w-5 h-5 rounded-[5px] bg-[#E5E7EB]"></div>
                <span className="px-2 py-0.5 bg-[#F3F4F6] rounded-[10px] text-[11px] font-semibold text-[#6B7280]">
                  1
                </span>
              </div>
              <h3 className="text-[13px] font-semibold text-[#1F2937]">Create Bill</h3>
            </div>
          </div>

          <div className="fixed right-6 top-[150px] flex flex-col gap-[6px]">
            <div className="w-9 h-9 rounded-lg bg-[#00A1E0] flex items-center justify-center text-white text-xl shadow cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition">
              ☁
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#FF7A59] flex items-center justify-center text-white text-lg shadow cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition">
              ⚙
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#000] flex items-center justify-center text-white text-lg font-bold shadow cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition">
              P
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#74C947] flex items-center justify-center text-white text-lg font-bold shadow cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition">
              K
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#0F9D58] flex items-center justify-center text-white text-lg shadow cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition">
              ▦
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#FFE01B] flex items-center justify-center text-black text-lg shadow cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition">
              🐵
            </div>
            <div className="w-9 h-9 rounded-lg bg-white border-2 border-dashed border-[#D1D5DB] flex items-center justify-center text-lg text-[#9CA3AF] cursor-pointer">
              +
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

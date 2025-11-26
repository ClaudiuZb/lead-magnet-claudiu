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
    'dashboard' | 'apps' | 'builder' | 'customers' | 'activity'
  >('dashboard');
  const [activeTab, setActiveTab] = useState<'your-app' | 'membrane' | 'external-apps'>('membrane');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState('');

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

  const handleInitialSubmit = (prompt: string) => {
    setInitialPrompt(prompt);
    setShowChat(true);
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
              onClick={() => setActiveNav('customers')}
              className={`flex flex-col justify-center items-center py-[7.35px] px-2 gap-[3px] w-full rounded-[2.76px] cursor-pointer transition ${
                activeNav === 'customers' ? 'bg-[rgba(243,245,247,0.08)]' : ''
              }`}
            >
              <div
                className={`flex justify-center items-center w-[29.4px] h-[29.4px] rounded-[5.51px] ${
                  activeNav === 'customers' ? 'bg-[rgba(220,255,0,0.2)]' : ''
                }`}
              >
                <svg width="18.37" height="18.37" fill="none" viewBox="0 0 19 19">
                  <path
                    d="M3.8288 5.35933C3.8288 6.17154 4.15144 6.95048 4.72576 7.52479C5.30008 8.09911 6.07902 8.42176 6.89122 8.42176C7.70343 8.42176 8.48237 8.09911 9.05669 7.52479C9.631 6.95048 9.95365 6.17154 9.95365 5.35933C9.95365 4.54713 9.631 3.76819 9.05669 3.19387C8.48237 2.61955 7.70343 2.29691 6.89122 2.29691C6.07902 2.29691 5.30008 2.61955 4.72576 3.19387C4.15144 3.76819 3.8288 4.54713 3.8288 5.35933Z"
                    stroke={activeNav === 'customers' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.29639 16.0778V14.5466C2.29639 13.7344 2.61903 12.9554 3.19335 12.3811C3.76767 11.8068 4.54661 11.4842 5.35881 11.4842H8.42124C9.23345 11.4842 10.0124 11.8068 10.5867 12.3811C11.161 12.9554 11.4837 13.7344 11.4837 14.5466V16.0778"
                    stroke={activeNav === 'customers' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.248 2.39737C12.9068 2.56603 13.4907 2.94914 13.9076 3.4863C14.3246 4.02346 14.5509 4.68411 14.5509 5.36409C14.5509 6.04408 14.3246 6.70473 13.9076 7.24189C13.4907 7.77905 12.9068 8.16216 12.248 8.33082"
                    stroke={activeNav === 'customers' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.0773 16.0778V14.5466C16.0734 13.8707 15.846 13.2151 15.4305 12.6819C15.0151 12.1487 14.4349 11.768 13.7805 11.599"
                    stroke={activeNav === 'customers' ? '#DCFF00' : '#F3F5F7'}
                    strokeWidth="1.38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className={`text-[9px] font-semibold text-center tracking-tight leading-[1.2] ${
                  activeNav === 'customers' ? 'text-[#F3F5F7]' : 'text-[#B9BBC6]'
                }`}
              >
                Customers
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
            <div
              onClick={() => window.open('https://docs.getmembrane.com/docs/Overview', '_blank')}
              className="flex flex-col justify-center items-center py-[7.35px] px-2 gap-[3px] w-full rounded-[2.76px] cursor-pointer hover:bg-[rgba(243,245,247,0.05)] transition"
            >
              <div className="flex justify-center items-center w-[29.4px] h-[29.4px] rounded-[5.51px]">
                <svg width="18.37" height="18.37" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528"
                    stroke="#F3F5F7"
                    strokeWidth="1.38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-[9px] font-semibold text-[#B9BBC6] text-center tracking-tight leading-[1.2]">
                Docs
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
          {activeNav === 'customers' ? (
            <div className="flex-1 flex overflow-hidden bg-gray-50">
              {/* Left Sidebar */}
              <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
                <div className="p-4">
                  <h2 className="text-xs font-semibold text-gray-900 mb-3">Customers</h2>
                  <nav className="space-y-1">
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 bg-gray-100 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      Customers
                    </a>
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                      </svg>
                      Connections
                    </a>
                  </nav>
                </div>

                <div className="px-4 pb-4">
                  <h3 className="text-xs font-semibold text-gray-900 mb-3">Integration Logic</h3>
                  <nav className="space-y-1">
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                      Actions
                    </a>
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                      </svg>
                      Flows
                    </a>
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                      </svg>
                      External Event Sub...
                    </a>
                  </nav>
                </div>

                <div className="px-4 pb-4">
                  <h3 className="text-xs font-semibold text-gray-900 mb-3">State and Config</h3>
                  <nav className="space-y-1">
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>
                      </svg>
                      Data Sources
                    </a>
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                      Field Mappings
                    </a>
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                      </svg>
                      Data Link Tables
                    </a>
                  </nav>
                </div>

                <div className="px-4 pb-4">
                  <h3 className="text-xs font-semibold text-gray-900 mb-3">Internal Interfaces</h3>
                  <nav className="space-y-1">
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
                      </svg>
                      App Data Schemas
                    </a>
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                      </svg>
                      App Event Subscriptions
                    </a>
                  </nav>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto bg-white p-6">
                <div className="max-w-6xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-xl font-semibold text-gray-900 mb-1">Customers</h1>
                  </div>

                  {/* Search and Filter Bar */}
                  <div className="mb-4 flex items-center gap-3">
                    <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                      Create a customer
                    </button>
                    <div className="flex-1 relative">
                      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                      <input
                        type="text"
                        placeholder="Type to search"
                        className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Customers List */}
                  <div className="space-y-1.5">
                  {[
                    { name: 'Acme Corporation', id: '668e4397d65c1b8c8d988b99', tags: ['test'] },
                    { name: 'TechFlow Solutions', id: 'techflow-solutions', tags: ['active customer'] },
                    { name: 'Global Dynamics Inc', id: '6183c5690ff1e5ee388ab853', tags: ['test'] },
                    { name: 'BlueWave Systems', id: 'bluewave-systems', tags: ['active customer'] },
                    { name: 'NextGen Industries', id: 'nextgen-industries', tags: [] },
                    { name: 'sarah.johnson@techcorp.com', id: '671674be849cd7352c44c62e', tags: ['test'] },
                    { name: 'michael.chen@startup.io', id: '677fd3f3c71dc8424346c89a', tags: [] },
                    { name: 'emma.davis@enterprise.com', id: '677fe589c71dc8424346c909', tags: [] },
                    { name: 'james.wilson@company.net', id: '67859d604537f1c2a1638cd5', tags: [] },
                    { name: 'olivia.martinez@bizapp.com', id: '678a3d1dec7e27526e02f02c', tags: [] },
                    { name: 'noah.anderson@platform.io', id: '678a3ff3ec7e27526e02f042', tags: [] },
                    { name: 'sophia.taylor@digital.com', id: '678a400cec7e27526e02f04a', tags: ['active customer'] },
                    { name: 'liam.brown@solutions.net', id: '678a40736884cc2f0eb1f647', tags: ['active customer'] },
                    { name: 'ava.garcia@systems.io', id: '6789199fd45231cb2992f42d', tags: [] },
                  ].map((customer, index) => (
                    <div key={index} className="flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 rounded-md hover:border-gray-300 transition-colors group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 min-w-[180px]">{customer.name}</div>
                        <div className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded flex-1">{customer.id}</div>
                        <div className="flex gap-1.5">
                          {customer.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className={`px-2 py-0.5 text-xs rounded ${
                                tag === 'test'
                                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                  : 'bg-green-100 text-green-700 border border-green-200'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            </div>
          ) : activeNav === 'apps' ? (
            <div className="flex-1 overflow-y-auto bg-white p-8">
              <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">External Apps</h1>
                  <p className="text-sm text-gray-500">Manage your connected applications and integrations</p>
                </div>

                {/* Search and Filter Bar */}
                <div className="mb-6 flex items-center gap-4">
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Add Integrations
                  </button>
                  <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Type to search apps by keyword"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" className="rounded border-gray-300"/>
                    include archived
                  </label>
                </div>

                {/* Apps List */}
                <div className="space-y-2">
                  {[
                    { name: 'Gmail', key: 'gmail', logo: 'https://logo.clearbit.com/google.com' },
                    { name: 'Salesforce', key: 'salesforce', logo: 'https://logo.clearbit.com/salesforce.com' },
                    { name: 'Slack (Membrane AI Assistant)', key: 'slack-membrane-ai-assistant', logo: 'https://logo.clearbit.com/slack.com' },
                    { name: 'HubSpot', key: 'hubspot', logo: 'https://logo.clearbit.com/hubspot.com' },
                    { name: 'Slack (Membrane Copilot)', key: 'slack-membrane-copilot', logo: 'https://logo.clearbit.com/slack.com' },
                    { name: 'AWS Lambda', key: 'aws-lambda', logo: 'https://logo.clearbit.com/aws.amazon.com' },
                    { name: 'Anthropic', key: 'anthropic', logo: 'https://logo.clearbit.com/anthropic.com' },
                    { name: 'Linear (Claude)', key: 'linear-claude', logo: 'https://logo.clearbit.com/linear.app' },
                    { name: 'Discourse', key: 'discourse', logo: 'https://logo.clearbit.com/discourse.org' },
                    { name: 'Gitpod', key: 'gitpod', logo: 'https://logo.clearbit.com/gitpod.io' },
                    { name: 'Linear (Pathfinder)', key: 'linear-pathfinder', logo: 'https://logo.clearbit.com/linear.app' },
                    { name: 'Google Drive', key: 'google-drive', logo: 'https://logo.clearbit.com/drive.google.com' },
                  ].map((app, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                          <img
                            src={app.logo}
                            alt={app.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="w-8 h-8 hidden items-center justify-center bg-gray-100 rounded text-xs font-semibold text-gray-600">
                            {app.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{app.name}</div>
                          <div className="text-sm text-gray-500 font-mono">{app.key}</div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeNav === 'activity' ? (
            <div className="flex-1 flex overflow-hidden bg-gray-50">
              {/* Left Sidebar */}
              <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
                <div className="p-4">
                  <h2 className="text-xs font-semibold text-gray-900 mb-3">Activity</h2>
                  <nav className="space-y-1">
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 bg-gray-100 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                      Dashboard
                    </a>
                  </nav>
                </div>

                <div className="px-4 pb-4">
                  <h3 className="text-xs font-semibold text-gray-900 mb-3">Logs</h3>
                  <nav className="space-y-1">
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      Flow Runs
                    </a>
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                      Action Runs
                    </a>
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                      </svg>
                      External API
                    </a>
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                      </svg>
                      External Webhooks
                    </a>
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                      </svg>
                      External Events
                    </a>
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      External Event Pulls
                    </a>
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                      App Events
                    </a>
                    <a className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                      Agent Sessions
                    </a>
                  </nav>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto bg-white p-4">
                <div className="max-w-6xl mx-auto">
                  {/* Monitoring Section */}
                  <div className="mb-4">
                    <h1 className="text-base font-semibold text-gray-900 mb-1">Monitoring</h1>
                    <div className="flex items-center gap-2 text-xs mb-3">
                      <span className="text-blue-600">Alert</span>
                      <a href="#" className="text-blue-600 hover:underline">See log</a>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200 mb-4">
                      <p className="text-xs text-gray-600">No ongoing alerts</p>
                    </div>
                  </div>

                  {/* Activity Logs Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-semibold text-gray-900">Activity Logs</h2>
                      <select className="text-xs border border-gray-300 rounded-md px-2 py-1">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                      </select>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-white border border-gray-200 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                          </svg>
                          <span className="text-xs font-medium text-gray-700">External API</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            641512
                          </span>
                          <span className="flex items-center gap-1 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            1220
                          </span>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                          </svg>
                          <span className="text-xs font-medium text-gray-700">External Events</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            102883
                          </span>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                          </svg>
                          <span className="text-xs font-medium text-gray-700">Flow Runs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            67729
                          </span>
                          <span className="flex items-center gap-1 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            32
                          </span>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                          <span className="text-xs font-medium text-gray-700">App Events</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            64254
                          </span>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                          </svg>
                          <span className="text-xs font-medium text-gray-700">External Webhooks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            4759
                          </span>
                          <span className="flex items-center gap-1 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            131
                          </span>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                          <span className="text-xs font-medium text-gray-700">Action Runs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            1006
                          </span>
                          <span className="flex items-center gap-1 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            42
                          </span>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                          </svg>
                          <span className="text-xs font-medium text-gray-700">External Event Pulls</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">0</span>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                          </svg>
                          <span className="text-xs font-medium text-gray-700">Agent Sessions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">4</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        </div>
                      </div>
                    </div>

                    {/* Task Queue Section */}
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">Task Queue</h3>
                        <a href="#" className="text-xs text-blue-600 hover:underline">See details</a>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-600">Task type</th>
                              <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-600">Queued</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-100">
                              <td className="px-3 py-2 text-xs text-gray-900">Flow Runs</td>
                              <td className="px-3 py-2 text-xs text-gray-600">0</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="px-3 py-2 text-xs text-gray-900">External Event Processing</td>
                              <td className="px-3 py-2 text-xs text-gray-600">0</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-xs text-gray-900">External Event Pulls</td>
                              <td className="px-3 py-2 text-xs text-gray-600">0</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : !showChat ? (
            <div className="flex-1 overflow-hidden bg-[#F8F9FA] flex flex-col">
              <div className="flex items-center justify-center pt-12 pb-8">
                <div className="w-full max-w-lg px-8">
                  <div className="relative">
                    <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && inputValue.trim()) {
                          handleInitialSubmit(inputValue.trim());
                        }
                      }}
                      placeholder="What integration you want to build today?"
                      className="w-full py-3 px-12 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    />
                  </div>

                  {!isAnalyzing && companyAnalysis && companyAnalysis.suggestedUseCases.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {companyAnalysis.suggestedUseCases.slice(0, 3).map((useCase, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            handleInitialSubmit(useCase);
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-left text-gray-600 text-xs hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center gap-2 group animate-fade-in-up"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <svg
                            className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="line-clamp-1">{useCase}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

                <div className="flex-1 flex items-center justify-center">
                  <div
                    className="relative"
                    style={{
                      width: '600px',
                      height: '350px',
                    }}
                  >
                    <svg
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 0 }}
                    viewBox="0 0 600 350"
                  >
                    {/* Line to Users Unified API */}
                    <path
                      ref={path1Ref}
                      id="path1"
                      d="M 200 169 H 230 C 260 169, 270 60, 300 60 L 320 60"
                      stroke="#E5E7EB"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      className="animate-draw-line-1"
                    />
                    {/* Line to Create Incoming Payment */}
                    <path
                      ref={path2Ref}
                      id="path2"
                      d="M 200 169 H 240 C 270 169, 280 169, 320 169"
                      stroke="#E5E7EB"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      className="animate-draw-line-2"
                    />

                    {/* Line to Create Bill */}
                    <path
                      ref={path3Ref}
                      id="path3"
                      d="M 200 169 H 230 C 260 169, 270 270, 300 270 L 320 270"
                      stroke="#E5E7EB"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      className="animate-draw-line-3"
                    />

                    {/* Lines from integration cards to right-side icons */}
                    {/* From Users Unified API to icons */}
                    <path
                      id="path4"
                      d="M 520 60 H 540 C 560 60, 560 80, 575 80"
                      stroke="#E5E7EB"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      className="animate-draw-line-1"
                      opacity="0.7"
                    />

                    {/* From Create Incoming Payment to icons */}
                    <path
                      id="path5"
                      d="M 520 169 H 540 C 560 169, 560 180, 575 180"
                      stroke="#E5E7EB"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      className="animate-draw-line-2"
                      opacity="0.7"
                    />

                    {/* From Create Bill to icons */}
                    <path
                      id="path6"
                      d="M 520 270 H 540 C 560 270, 560 260, 575 260"
                      stroke="#E5E7EB"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      className="animate-draw-line-3"
                      opacity="0.7"
                    />
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

                    .card-fade-in-4 {
                      animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 3.6s forwards;
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
                      <div className="w-5 h-5 rounded bg-[#FF7A59] flex items-center justify-center text-white text-xs">
                        ⚙
                      </div>
                      <div className="w-5 h-5 rounded bg-[#00A1E0] flex items-center justify-center text-white text-xs">
                        ☁
                      </div>
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-[#0078D4] to-[#50E6FF] flex items-center justify-center text-white text-[10px]">
                        ▶
                      </div>
                      <div className="w-5 h-5 rounded bg-[#000] flex items-center justify-center text-white text-xs font-bold">
                        P
                      </div>
                      <div className="w-5 h-5 rounded bg-[#74C947] flex items-center justify-center text-white text-xs font-bold">
                        K
                      </div>
                      <div className="w-5 h-5 rounded bg-[#C8242B] flex items-center justify-center text-white text-xs font-bold">
                        Z
                      </div>
                      <div className="w-5 h-5 rounded bg-[#FFB900] flex items-center justify-center text-white text-xs font-bold">
                        ↓
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#F3F4F6] rounded text-[10px] font-semibold text-[#6B7280]">
                        19
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
                      <div className="w-5 h-5 rounded bg-[#FF7A59] flex items-center justify-center text-white text-xs">
                        ⚙
                      </div>
                      <div className="w-5 h-5 rounded bg-[#00A1E0] flex items-center justify-center text-white text-xs">
                        ☁
                      </div>
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-[#0078D4] to-[#50E6FF] flex items-center justify-center text-white text-[10px]">
                        ▶
                      </div>
                      <div className="w-5 h-5 rounded bg-[#000] flex items-center justify-center text-white text-xs font-bold">
                        P
                      </div>
                      <div className="w-5 h-5 rounded bg-[#FFB900] flex items-center justify-center text-white text-xs font-bold">
                        ↓
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#F3F4F6] rounded text-[10px] font-semibold text-[#6B7280]">
                        5
                      </span>
                    </div>
                    <div className="flex gap-1 mb-1.5">
                      <div className="w-4 h-4 rounded bg-[#E5E7EB]"></div>
                      <div className="w-4 h-4 rounded bg-[#E5E7EB]"></div>
                      <span className="px-1.5 py-0.5 bg-[#F3F4F6] rounded text-[10px] font-semibold text-[#6B7280]">
                        3
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

                  {/* Right side app icons */}
                  <div
                    className="absolute right-[10px] top-[20px] flex flex-col gap-1.5 card-fade-in-4"
                    style={{ zIndex: 2 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FF7A59] flex items-center justify-center text-white text-sm shadow-sm cursor-pointer hover:scale-110 transition-transform">
                      ⚙
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#00A1E0] flex items-center justify-center text-white text-sm shadow-sm cursor-pointer hover:scale-110 transition-transform">
                      ☁
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0078D4] to-[#50E6FF] flex items-center justify-center text-white text-xs shadow-sm cursor-pointer hover:scale-110 transition-transform">
                      ▶
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#000] flex items-center justify-center text-white text-sm font-bold shadow-sm cursor-pointer hover:scale-110 transition-transform">
                      P
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#74C947] flex items-center justify-center text-white text-sm font-bold shadow-sm cursor-pointer hover:scale-110 transition-transform">
                      K
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#C8242B] flex items-center justify-center text-white text-sm font-bold shadow-sm cursor-pointer hover:scale-110 transition-transform">
                      Z
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#FFB900] flex items-center justify-center text-white text-sm font-bold shadow-sm cursor-pointer hover:scale-110 transition-transform">
                      ↓
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white border-2 border-dashed border-[#D1D5DB] flex items-center justify-center text-sm text-[#9CA3AF] cursor-pointer hover:border-[#9CA3AF] transition-colors">
                      +
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden animate-chat-slide-in bg-white">
              {/* Left Panel - Integration Package Details */}
              <div className="flex-1 overflow-y-auto p-6 border-r border-gray-200">
                <div className="max-w-4xl mx-auto">
                  {/* Package Header */}
                  <div className="mb-6">
                    <h1 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                      </svg>
                      {initialPrompt || 'Integration Package'}
                    </h1>
                  </div>

                  {/* Code Panel - Embedded */}
                  <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <div className="h-[300px]">
                      <CodePanel
                        selectedFile={selectedFile}
                        companyUrl={companyUrl}
                        companyAnalysis={companyAnalysis || undefined}
                        isAICoding={isAICoding}
                        generatedFileContents={generatedFileContents}
                        typingFile={typingFile}
                        aiThinking={aiThinking}
                      />
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-400">
                        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01"/>
                      </svg>
                      <h2 className="text-base font-semibold text-gray-900">Description</h2>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        This package will automatically {initialPrompt.toLowerCase()} for {companyAnalysis?.companyName || 'your application'}.
                        Membrane sets up a continuous pipeline that fetches, synchronizes, and updates your data in real time.
                      </p>
                    </div>
                  </div>

                  {/* Basic Info Section */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-400">
                        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01"/>
                      </svg>
                      <h2 className="text-base font-semibold text-gray-900">Basic info</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start border-b border-gray-100 pb-4">
                        <div className="w-32 text-sm font-medium text-gray-600">Key</div>
                        <div className="flex-1 text-sm text-gray-900 font-mono">
                          {initialPrompt.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-32 text-sm font-medium text-gray-600">Name</div>
                        <div className="flex-1 text-sm text-gray-900">
                          {initialPrompt}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Schema Section */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>
                      </svg>
                      <h2 className="text-base font-semibold text-gray-900">Input Schema</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Schema of the input provided when running this action</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">source:</span>
                          <span className="text-sm text-green-600 font-mono">string</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="2"/>
                              <circle cx="12" cy="5" r="2"/>
                              <circle cx="12" cy="19" r="2"/>
                            </svg>
                          </button>
                          <button className="text-gray-400 hover:text-red-600 p-1">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">destination:</span>
                          <span className="text-sm text-green-600 font-mono">string</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="2"/>
                              <circle cx="12" cy="5" r="2"/>
                              <circle cx="12" cy="19" r="2"/>
                            </svg>
                          </button>
                          <button className="text-gray-400 hover:text-red-600 p-1">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-2">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Add Field
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Membrane Agent Chat */}
              <div className="w-[450px] bg-white flex flex-col shadow-lg">
                <ChatPanel
                  companyUrl={companyUrl}
                  onCodingStateChange={handleCodingStateChange}
                  onNewFile={handleNewFile}
                  onFileTyping={handleFileTyping}
                  onAiThinking={setAiThinking}
                  companyAnalysis={companyAnalysis || undefined}
                  isAnalyzing={isAnalyzing}
                  onAddToIDE={onAddToIDE}
                  initialMessage={initialPrompt}
                />
              </div>
            </div>
          )}
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

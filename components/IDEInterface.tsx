'use client';

import { useState, useEffect } from 'react';
import FileTree, { FileNode } from './FileTree';
import CodePanel from './CodePanel';
import ChatPanel from './ChatPanel';
import EmailCaptureOverlay from './EmailCaptureOverlay';

interface IDEInterfaceProps {
  companyUrl: string;
}

interface CompanyAnalysis {
  companyName: string;
  productTagline: string;
  productDescription: string;
  suggestedUseCases: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export default function IDEInterface({ companyUrl }: IDEInterfaceProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>('packages/crm-sync.yaml');
  const [companyAnalysis, setCompanyAnalysis] = useState<CompanyAnalysis | null>(null);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isAICoding, setIsAICoding] = useState(false);
  const [dynamicFiles, setDynamicFiles] = useState<FileNode[]>([]);
  const [generatedFileContents, setGeneratedFileContents] = useState<Map<string, string>>(new Map());
  const [typingFile, setTypingFile] = useState<{ name: string; content: string } | null>(null);
  const [aiThinking, setAiThinking] = useState<string>('');

  // Analyze company on load
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

  // Show email capture after 45 seconds if not submitted
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!emailSubmitted) {
        setShowEmailCapture(true);
      }
    }, 45000); // 45 seconds

    return () => clearTimeout(timer);
  }, [emailSubmitted]);

  const handleEmailSubmit = async (email: string) => {
    console.log('Email captured:', email, 'for company:', companyUrl);
    // TODO: Send to your CRM/database
    setEmailSubmitted(true);
    setShowEmailCapture(false);
  };

  const handleEmailSkip = () => {
    setShowEmailCapture(false);
    // Show again after 2 minutes if they skip
    setTimeout(() => {
      if (!emailSubmitted) {
        setShowEmailCapture(true);
      }
    }, 120000);
  };

  // Handle adding new generated files
  const handleNewFile = (fileName: string, fileContent: string) => {
    const newFile: FileNode = {
      name: fileName,
      type: 'file',
      path: `generated/${fileName}`,
    };

    setDynamicFiles((prev) => [...prev, newFile]);
    setGeneratedFileContents((prev) => new Map(prev).set(`generated/${fileName}`, fileContent));
    setSelectedFile(`generated/${fileName}`);
  };

  // Handle file typing animation - called MANY times as content grows
  const handleFileTyping = (fileName: string, content: string, isComplete: boolean) => {
    if (!isComplete) {
      // Still typing - update content in REAL-TIME
      setTypingFile({ name: `generated/${fileName}`, content });
      setSelectedFile(`generated/${fileName}`);
    } else {
      // Typing complete - move to permanent storage and clear typing state
      setGeneratedFileContents((prev) => {
        const newMap = new Map(prev);
        newMap.set(`generated/${fileName}`, content);
        return newMap;
      });
      setTypingFile(null);
    }
  };

  return (
    <div className="flex h-screen bg-[#1E1E1E] text-white overflow-hidden">
      {/* Email capture overlay */}
      {showEmailCapture && (
        <EmailCaptureOverlay onSubmit={handleEmailSubmit} onSkip={handleEmailSkip} />
      )}

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-[#181818] border-b border-[#2D2D2D] flex items-center px-4 z-10">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5"
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
          <span className="text-sm font-medium">Membrane</span>
          <span className="text-[#666]">|</span>
          <span className="text-sm text-[#999]">Integration IDE</span>
        </div>
        <div className="ml-auto text-xs text-[#999]">
          Project:{' '}
          <span className="text-[#CCCCCC]">
            {companyAnalysis?.companyName || companyUrl}-integration-layer
          </span>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col md:flex-row w-full pt-12">
        {/* Left sidebar - File tree (hidden on mobile) */}
        <div className="hidden md:block md:w-60 bg-[#252526] border-r border-[#2D2D2D] overflow-y-auto">
          <FileTree
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
            companyUrl={companyUrl}
            dynamicFiles={dynamicFiles}
          />
        </div>

        {/* Center - Code panel (hidden on mobile, shown on tablet+) */}
        <div className="hidden lg:block flex-1 overflow-hidden">
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

        {/* Right sidebar - Chat panel (full width on mobile, fixed width on desktop) */}
        <div className="flex-1 lg:w-96 bg-[#1E1E1E] border-l border-[#2D2D2D] flex flex-col">
          <ChatPanel
            companyUrl={companyUrl}
            onCodingStateChange={setIsAICoding}
            onNewFile={handleNewFile}
            onFileTyping={handleFileTyping}
            onAiThinking={setAiThinking}
            companyAnalysis={companyAnalysis || undefined}
            isAnalyzing={isAnalyzing}
          />
        </div>
      </div>
    </div>
  );
}

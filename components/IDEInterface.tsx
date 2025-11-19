'use client';

import { useState, useEffect } from 'react';
import IDEFileTree, { FileNode } from './IDEFileTree';
import IDECodePanel from './IDECodePanel';
import IDEChatPanel from './IDEChatPanel';

interface IDEInterfaceProps {
  companyUrl: string;
  integrationData?: { name: string; description: string; files: { name: string; content: string }[] } | null;
  onPushToProduction?: () => void;
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

export default function IDEInterface({ companyUrl, integrationData, onPushToProduction }: IDEInterfaceProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>('packages/crm-sync.yaml');
  const [companyAnalysis, setCompanyAnalysis] = useState<CompanyAnalysis | null>(null);
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

  // Handle adding new generated files with dynamic folder structure
  const handleNewFile = (filePath: string, fileContent: string) => {
    // Parse the file path (e.g., "src/integrations/clearbit-client.ts")
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];

    // Store file content with full path
    setGeneratedFileContents((prev) => new Map(prev).set(filePath, fileContent));
    setSelectedFile(filePath);

    // Auto-expand folders in the path
    const pathParts: string[] = [];
    for (let i = 0; i < parts.length - 1; i++) {
      pathParts.push(parts[i]);
      const folderPath = pathParts.join('/');
      setExpandedFolders((prev) => new Set(prev).add(folderPath));
    }
  };

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));

  // Handle file typing animation - called MANY times as content grows
  const handleFileTyping = (filePath: string, content: string, isComplete: boolean) => {
    if (!isComplete) {
      // Still typing - update content in REAL-TIME
      setTypingFile({ name: filePath, content });
      setSelectedFile(filePath);
    } else {
      // Typing complete - move to permanent storage and clear typing state
      setGeneratedFileContents((prev) => {
        const newMap = new Map(prev);
        newMap.set(filePath, content);
        return newMap;
      });
      setTypingFile(null);
    }
  };

  return (
    <div className="flex h-full bg-[#1E1E1E] text-gray-100 overflow-hidden">
      {/* Top bar - Hidden when inside DesktopOS window */}
      <div className="hidden fixed top-0 left-0 right-0 h-12 bg-[#252526] border-b border-[#3E3E42] items-center px-4 z-10">
        <div className="flex items-center gap-3">
          <span className="text-lg font-mono text-[#569CD6]">&lt;/&gt;</span>
          <span className="text-sm font-medium text-gray-300">Your IDE</span>
        </div>
        <div className="ml-auto text-xs text-[#999]">
          Project:{' '}
          <span className="text-[#CCCCCC]">
            {companyAnalysis?.companyName || companyUrl}-integration-layer
          </span>
        </div>
      </div>

      {/* Main content area - VS Code Layout */}
      <div className="flex w-full h-full">
        {/* Left sidebar - File tree (compact, 200px like VS Code) */}
        <div className="w-[200px] bg-[#252526] border-r border-[#3E3E42] flex flex-col">
          <IDEFileTree
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
            companyUrl={companyUrl}
            generatedFileContents={generatedFileContents}
            expandedFolders={expandedFolders}
            onToggleFolder={(path) => {
              setExpandedFolders((prev) => {
                const next = new Set(prev);
                if (next.has(path)) {
                  next.delete(path);
                } else {
                  next.add(path);
                }
                return next;
              });
            }}
          />
        </div>

        {/* Center - Code panel (always visible, responsive) */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#1E1E1E]">
          <IDECodePanel
            selectedFile={selectedFile}
            companyUrl={companyUrl}
            companyAnalysis={companyAnalysis || undefined}
            isAICoding={isAICoding}
            generatedFileContents={generatedFileContents}
            typingFile={typingFile}
            aiThinking={aiThinking}
          />
        </div>

        {/* Right sidebar - Chat panel (320px compact) */}
        <div className="w-[320px] border-l border-[#3E3E42] flex flex-col">
          <IDEChatPanel
            companyUrl={companyUrl}
            onCodingStateChange={setIsAICoding}
            onNewFile={handleNewFile}
            onFileTyping={handleFileTyping}
            onAiThinking={setAiThinking}
            companyAnalysis={companyAnalysis || undefined}
            isAnalyzing={isAnalyzing}
            integrationData={integrationData}
            onPushToProduction={onPushToProduction}
          />
        </div>
      </div>
    </div>
  );
}

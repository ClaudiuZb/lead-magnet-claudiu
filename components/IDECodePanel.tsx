'use client';

import { useRef, useEffect } from 'react';

interface IDECodePanelProps {
  selectedFile: string | null;
  companyUrl: string;
  companyAnalysis?: {
    companyName: string;
    productDescription: string;
    suggestedUseCases: string[];
  };
  isAICoding?: boolean;
  generatedFileContents?: Map<string, string>;
  typingFile?: { name: string; content: string } | null;
  aiThinking?: string;
}

export default function IDECodePanel({
  selectedFile,
  companyUrl,
  companyAnalysis,
  isAICoding,
  generatedFileContents,
  typingFile,
  aiThinking,
}: IDECodePanelProps) {
  const companyName = companyUrl.split('.')[0];
  const capitalizedName =
    companyAnalysis?.companyName || companyName.charAt(0).toUpperCase() + companyName.slice(1);

  const codeScrollRef = useRef<HTMLDivElement>(null);

  const showingTypingFile = typingFile && selectedFile === typingFile.name;

  // Auto-scroll when typing file content changes
  useEffect(() => {
    if (showingTypingFile && codeScrollRef.current) {
      codeScrollRef.current.scrollTop = codeScrollRef.current.scrollHeight;
    }
  }, [typingFile?.content, showingTypingFile]);
  const isGeneratedFile = selectedFile && generatedFileContents?.has(selectedFile);
  const generatedContent = showingTypingFile
    ? typingFile.content
    : isGeneratedFile && selectedFile
      ? generatedFileContents?.get(selectedFile)
      : null;

  const renderWithSyntax = (code: string, fileType: string) => {
    if (fileType === 'typescript' || fileType === 'javascript') {
      return code.split('\n').map((line, i) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
          return (
            <div key={i} className="text-[#6A9955]">
              {line}
            </div>
          );
        }

        if (
          /^\s*(import|export|const|let|var|function|class|interface|type|async|await|return|if|else|for|while|new|try|catch|throw)\s/.test(
            line
          )
        ) {
          return (
            <div key={i} className="text-[#569CD6]">
              {line}
            </div>
          );
        }

        if (trimmed.includes('"') || trimmed.includes("'") || trimmed.includes('`')) {
          return (
            <div key={i} className="text-[#CE9178]">
              {line}
            </div>
          );
        }

        return (
          <div key={i} className="text-[#D4D4D4]">
            {line || '\u00A0'}
          </div>
        );
      });
    }

    if (fileType === 'yaml') {
      return code.split('\n').map((line, i) => {
        if (line.trim().startsWith('#')) {
          return (
            <div key={i} className="text-[#6A9955]">
              {line}
            </div>
          );
        }
        if (line.includes(':') && !line.trim().startsWith('-')) {
          const [key, ...rest] = line.split(':');
          return (
            <div key={i}>
              <span className="text-[#9CDCFE] font-medium">{key}</span>
              <span className="text-gray-400">:</span>
              <span className="text-[#CE9178]">{rest.join(':')}</span>
            </div>
          );
        }
        if (line.trim().startsWith('-')) {
          return (
            <div key={i} className="text-gray-300">
              {line}
            </div>
          );
        }
        return (
          <div key={i} className="text-gray-300">
            {line}
          </div>
        );
      });
    }

    if (fileType === 'json') {
      return code.split('\n').map((line, i) => {
        if (line.includes('"') && line.includes(':')) {
          const parts = line.split(':');
          const key = parts[0];
          const value = parts.slice(1).join(':');
          return (
            <div key={i}>
              <span className="text-gray-400">{key.replace(/"([^"]+)"/, '')}</span>
              <span className="text-[#9CDCFE]">
                &quot;{key.match(/"([^"]+)"/)?.[1] || ''}&quot;
              </span>
              <span className="text-gray-400">: </span>
              <span className="text-[#CE9178]">{value}</span>
            </div>
          );
        }
        return (
          <div key={i} className="text-gray-300">
            {line}
          </div>
        );
      });
    }

    return <div className="text-gray-300 whitespace-pre-wrap">{code}</div>;
  };

  const getFileContent = () => {
    if (!selectedFile) {
      return {
        content: `// Welcome to Your IDE\n\n// Start building your integration by selecting a file from the explorer\n// or let the AI agent generate implementation code for you.`,
        type: 'typescript',
      };
    }

    if (isGeneratedFile && generatedContent) {
      const fileExt = selectedFile.split('.').pop() || '';
      const fileType =
        fileExt === 'yaml' || fileExt === 'yml'
          ? 'yaml'
          : fileExt === 'json'
            ? 'json'
            : fileExt === 'ts' || fileExt === 'js'
              ? 'typescript'
              : 'markdown';
      return {
        content: generatedContent,
        type: fileType,
      };
    }

    return {
      content: `# ${selectedFile}\n\n# Implementation code will appear here...`,
      type: 'markdown',
    };
  };

  const { content, type } = getFileContent();

  return (
    <div className="h-full flex flex-col bg-[#1E1E1E]">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
        .custom-scrollbar-y-only::-webkit-scrollbar:horizontal {
          display: none;
        }
        .custom-scrollbar-y-only {
          overflow-x: hidden;
        }
      `}</style>
      {selectedFile && (
        <div className="bg-[#252526] border-b border-[#3E3E42] px-4 py-1.5 flex items-center">
          <span className="text-[13px] text-gray-300 font-normal">{selectedFile}</span>
        </div>
      )}

      <div ref={codeScrollRef} className="flex-1 overflow-y-auto custom-scrollbar custom-scrollbar-y-only bg-[#1E1E1E] p-4 relative">
        <pre className="text-[13px] font-mono leading-relaxed">
          {renderWithSyntax(content, type)}
        </pre>
      </div>

      <div className="h-32 bg-[#1E1E1E] border-t border-[#3E3E42] overflow-y-auto custom-scrollbar custom-scrollbar-y-only font-mono text-[11px]">
        <div className="sticky top-0 bg-[#252526] px-3 py-1.5 border-b border-[#3E3E42] flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${isAICoding ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}
          ></div>
          <span className="text-gray-400 text-[11px]">
            your@ide:~/{capitalizedName}-integration$
          </span>
        </div>
        <div className="p-3 text-[#4EC9B0] whitespace-pre-wrap">
          {aiThinking || 'Ready to implement...'}
        </div>
      </div>
    </div>
  );
}

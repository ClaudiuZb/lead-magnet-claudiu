'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

interface IDEChatPanelProps {
  companyUrl: string;
  companyAnalysis?: {
    companyName: string;
    productDescription: string;
    productTagline: string;
    suggestedUseCases: string[];
  };
  isAnalyzing: boolean;
  onCodingStateChange?: (isCoding: boolean) => void;
  onNewFile?: (fileName: string, fileContent: string) => void;
  onFileTyping?: (fileName: string, content: string, isComplete: boolean) => void;
  onAiThinking?: (thinking: string) => void;
  integrationData?: { name: string; description: string; files: { name: string; content: string }[] } | null;
  onPushToProduction?: () => void;
}

export default function IDEChatPanel({
  companyUrl,
  companyAnalysis,
  isAnalyzing,
  onCodingStateChange,
  onNewFile,
  onFileTyping,
  onAiThinking,
  integrationData,
  onPushToProduction
}: IDEChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showPushButton, setShowPushButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initializedRef = useRef(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  // Handle integration data from Console - START CODING IMMEDIATELY
  useEffect(() => {
    if (integrationData && !initializedRef.current) {
      console.log('[IDEChatPanel] Received integration data:', integrationData);
      initializedRef.current = true;

      // Show handoff message briefly
      setMessages([
        {
          role: 'assistant',
          content: `I've received the integration schema from Membrane Console. Now I'll generate the actual TypeScript implementation code with API clients, error handling, and production-ready logic...`,
        },
      ]);

      // IMMEDIATELY start implementing the code
      setTimeout(() => {
        const implementationRequest = `You are a senior software engineer implementing the "${integrationData.name}" integration.

CRITICAL INSTRUCTIONS:
- Generate ONLY TypeScript/JavaScript implementation code (.ts, .js files)
- DO NOT create YAML or JSON config files
- Create real API client classes with proper authentication
- Include error handling, retries, and logging
- Use modern async/await patterns
- Add TypeScript types and interfaces
- Follow production-ready code standards

REQUIRED FILES TO CREATE:
1. Main integration client class (src/integrations/[integration-name].ts)
2. Type definitions (src/types/[integration-name]-types.ts)
3. Error handling utilities (src/utils/[integration-name]-errors.ts)
4. API request/response handlers with retry logic

Each file should be production-ready, well-documented, and follow best practices.`;

        console.log('[IDEChatPanel] Starting implementation request:', implementationRequest);

        // Add user message
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: implementationRequest },
          { role: 'assistant', content: '...' }
        ]);

        // Start AI coding
        if (onCodingStateChange) {
          onCodingStateChange(true);
        }

        // Call API to start implementation
        console.log('[IDEChatPanel] Calling API...');
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'assistant', content: `I've received the integration definition from Membrane Console. Let me implement this in your code...` },
              { role: 'user', content: implementationRequest }
            ],
            companyUrl,
          }),
        })
          .then(response => {
            console.log('[IDEChatPanel] API response received:', response.status);
            if (!response.ok) {
              throw new Error(`API returned ${response.status}`);
            }
            return response.body?.getReader();
          })
          .then(reader => {
            if (reader) {
              console.log('[IDEChatPanel] Starting stream processing...');
              processStreamingResponse(reader, integrationData.name, implementationRequest);
            } else {
              console.error('[IDEChatPanel] No reader available');
            }
          })
          .catch(error => {
            console.error('[IDEChatPanel] Error:', error);
            setMessages((prev) => [
              ...prev.filter(m => m.content !== '...'),
              {
                role: 'assistant',
                content: `Error: ${error.message}. Please try again.`,
              },
            ]);
            if (onCodingStateChange) onCodingStateChange(false);
          });
      }, 1000);
    }
  }, [integrationData, companyUrl, onCodingStateChange]);

  // Helper function to process streaming response
  const processStreamingResponse = async (reader: ReadableStreamDefaultReader<Uint8Array>, integrationName: string, userRequest: string) => {
    const decoder = new TextDecoder();
    let assistantMessage = '';
    let displayedText = '';
    const processedFiles = new Set<string>();
    const createdFiles: { name: string; content: string }[] = [];
    let terminalOutput = 'Analyzing integration schema...\n';
    terminalOutput += 'Generating TypeScript implementation...\n';

    // Show initial terminal output
    if (onAiThinking) {
      onAiThinking(terminalOutput);
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.content || '';
              if (!content) continue;

              assistantMessage += content;
              console.log('[IDEChatPanel] Received content chunk, total length:', assistantMessage.length);

              // LIVE UPDATE: Show reasoning as it streams, hide file markers AND code blocks
              const textBeforeFile = assistantMessage.split('[FILE:')[0].split('```')[0].trim();
              if (textBeforeFile !== displayedText && textBeforeFile.length > 0) {
                displayedText = textBeforeFile;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = displayedText;
                  return newMessages;
                });
              }

              // REAL-TIME FILE DETECTION: Check for files using [FILE: filename]...[/FILE] format
              const fileRegex = /\[FILE:\s*([^\]]+)\]([\s\S]*?)(\[\/FILE\]|$)/g;
              let match;
              while ((match = fileRegex.exec(assistantMessage)) !== null) {
                const fileName = match[1].trim();
                const fileContent = match[2].trim();
                const isComplete = match[3] === '[/FILE]';

                console.log('[IDEChatPanel] Found file:', fileName, 'Complete:', isComplete, 'Content length:', fileContent.length);

                // First time seeing this file - create it immediately
                if (!processedFiles.has(fileName)) {
                  processedFiles.add(fileName);
                  console.log('[IDEChatPanel] Processing new file:', fileName);

                  // Update terminal output
                  terminalOutput += `→ Writing ${fileName}...\n`;
                  if (onAiThinking) {
                    onAiThinking(terminalOutput);
                  }

                  // IMMEDIATELY add file to tree
                  if (onNewFile) {
                    console.log('[IDEChatPanel] Calling onNewFile for:', fileName);
                    onNewFile(fileName, '');
                  }

                  // Update chat message - clean status only, no code
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const cleanText = textBeforeFile || 'Implementing integration';
                    newMessages[newMessages.length - 1].content = `${cleanText}\n\n📝 Creating ${fileName}...`;
                    return newMessages;
                  });
                }

                // Update file content EVERY chunk (whether complete or not)
                if (fileContent.length > 0) {
                  if (onFileTyping) {
                    onFileTyping(fileName, fileContent, isComplete);
                  }
                }

                // File just completed - update terminal
                if (isComplete) {
                  terminalOutput += `✓ ${fileName} created successfully (${fileContent.length} chars)\n`;
                  if (onAiThinking) {
                    onAiThinking(terminalOutput);
                  }

                  // Store completed file data
                  createdFiles.push({ name: fileName, content: fileContent });

                  // Update chat message - clean status only, no code
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const cleanText = textBeforeFile || 'Implementing integration';
                    newMessages[newMessages.length - 1].content = `${cleanText}\n\n✅ Created ${fileName}`;
                    return newMessages;
                  });
                }
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }

      // Final updates
      if (onCodingStateChange) {
        onCodingStateChange(false);
      }

      // Extract clean text without any code blocks or file markers
      const textBeforeFiles = assistantMessage.split('[FILE:')[0].split('```')[0].trim();

      if (processedFiles.size > 0) {
        terminalOutput += `\n✓ Implementation complete!\n`;
        terminalOutput += `✓ Generated ${processedFiles.size} TypeScript file${processedFiles.size > 1 ? 's' : ''}\n`;
        terminalOutput += `Ready for production deployment.\n`;
        if (onAiThinking) {
          onAiThinking(terminalOutput);
        }

        // Show clean final message - just status, no code
        const cleanText = textBeforeFiles || 'Implementation complete';
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = `✅ ${cleanText}\n\nGenerated ${processedFiles.size} production-ready TypeScript file${processedFiles.size > 1 ? 's' : ''}.`;
          return newMessages;
        });

        // SHOW PUSH TO PRODUCTION BUTTON
        setShowPushButton(true);
      } else {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = textBeforeFiles || 'Done!';
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Stream processing error:', error);
      if (onCodingStateChange) {
        onCodingStateChange(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    // Add typing indicator
    setMessages((prev) => [...prev, { role: 'assistant', content: '...', isTyping: true }]);

    // Start coding state
    if (onCodingStateChange) {
      onCodingStateChange(true);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          companyUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();

      if (reader) {
        // Remove typing indicator
        setMessages((prev) => prev.filter(m => !m.isTyping));
        // Add placeholder for streaming content
        setMessages((prev) => [...prev, { role: 'assistant', content: '...' }]);
        await processStreamingResponse(reader, userMessage, userMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev.filter(m => !m.isTyping),
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
      if (onCodingStateChange) {
        onCodingStateChange(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header - Dark theme */}
      <div className="border-b px-4 py-3 flex items-center gap-2 bg-[#252526] border-[#3E3E42]">
        <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
        <span className="text-sm font-medium text-gray-300">Your IDE Agent</span>
      </div>

      {/* Messages - Dark theme */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#1E1E1E]">
        {messages.map((message, index) => (
          <div key={index}>
            <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded flex-shrink-0 flex items-center justify-center text-xs ${
                  message.role === 'assistant'
                    ? 'bg-[#252526] text-gray-300'
                    : 'bg-blue-700 text-blue-200'
                }`}
              >
                {message.role === 'assistant' ? <Bot className="w-4 h-4" /> : '👤'}
              </div>

              {/* Message bubble */}
              <div
                className={`flex-1 rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === 'assistant'
                    ? 'bg-[#252526] text-gray-300 border border-[#3E3E42]'
                    : 'bg-blue-700 text-white'
                }`}
              >
                {message.isTyping ? (
                  <div className="flex gap-1 items-center py-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                ) : (
                  message.content.replace(/\[SERVICE:[^\]]+\]/g, '').trim()
                )}
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Push to Production Button - Shows when AI finishes */}
      {showPushButton && (
        <div className="border-t border-[#3E3E42] bg-[#252526] p-3">
          <button
            onClick={() => {
              setShowPushButton(false);
              if (onPushToProduction) {
                onPushToProduction();
              }
            }}
            className="w-full px-4 py-2 bg-[#0E639C] hover:bg-[#1177BB] text-white text-sm font-medium rounded transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Deploy to Production
          </button>
        </div>
      )}

      {/* Input area - Dark theme */}
      {!showPushButton && (
        <div className="border-t p-4 border-[#3E3E42] bg-[#252526]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to modify the implementation..."
              className="w-full text-sm rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 resize-none min-h-[60px] max-h-[200px] bg-[#1E1E1E] text-gray-300 border-[#3E3E42] focus:border-blue-600 focus:ring-blue-900 placeholder:text-gray-500"
              rows={2}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="self-end px-4 py-1.5 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium bg-blue-700 text-white hover:bg-blue-600"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

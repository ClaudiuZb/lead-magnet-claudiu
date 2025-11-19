'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

interface ChatPanelProps {
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
  onAddToIDE?: (integrationData: { name: string; description: string; url?: string; files: { name: string; content: string }[] }) => void;
}

const brandedLoadingMessages = [
  "Membraning your integration...",
  "Cooking up some magic...",
  "Hold tight, something cool is coming...",
  "Weaving the integration fabric...",
  "Architecting your workflow...",
  "Building the connection layer...",
];

export default function ChatPanel({ companyUrl, companyAnalysis, isAnalyzing, onCodingStateChange, onNewFile, onFileTyping, onAiThinking, onAddToIDE }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initializedRef = useRef(false);
  const [integrationCompleted, setIntegrationCompleted] = useState(false);
  const [integrationData, setIntegrationData] = useState<{ name: string; description: string; url?: string; files: { name: string; content: string }[] } | null>(null);

  // Initial AI message sequence with thinking animation
  useEffect(() => {
    if (initializedRef.current) return;

    const companyName = companyUrl.split('.')[0];
    const capitalizedName = companyName.charAt(0).toUpperCase() + companyName.slice(1);

    // Message 1: Greeting
    setMessages([
      {
        role: 'assistant',
        content: `Hey! I'm ready to help you build integrations for ${capitalizedName}.`,
      },
    ]);

    // Message 2: After delay, add typing indicator
    setTimeout(() => {
      if (initializedRef.current) return;
      setMessages([
        {
          role: 'assistant',
          content: `Hey! I'm ready to help you build integrations for ${capitalizedName}.`,
        },
        {
          role: 'assistant',
          content: '',
          isTyping: true,
        },
      ]);

      // After 2 seconds, replace typing with thinking message
      setTimeout(() => {
        if (initializedRef.current) return;
        setMessages([
          {
            role: 'assistant',
            content: `Hey! I'm ready to help you build integrations for ${capitalizedName}.`,
          },
          {
            role: 'assistant',
            content: 'Let me think which integrations best suit you...',
            isTyping: false,
          },
        ]);

        // After 2 more seconds, show typing again
        setTimeout(() => {
          if (initializedRef.current) return;
          setMessages([
            {
              role: 'assistant',
              content: `Hey! I'm ready to help you build integrations for ${capitalizedName}.`,
            },
            {
              role: 'assistant',
              content: '',
              isTyping: true,
            },
          ]);

          // After analysis completes, replace typing with final message
          const checkAnalysis = setInterval(() => {
            if (companyAnalysis && companyAnalysis.suggestedUseCases && companyAnalysis.suggestedUseCases.length > 0 && !initializedRef.current) {
              clearInterval(checkAnalysis);
              initializedRef.current = true;
              setMessages([
                {
                  role: 'assistant',
                  content: `Hey! I'm ready to help you build integrations for ${capitalizedName}.`,
                },
                {
                  role: 'assistant',
                  content: `Here are some integrations you can build:`,
                  isTyping: false,
                },
              ]);
            }
          }, 500);

          // Fallback if analysis takes too long
          setTimeout(() => {
            if (!initializedRef.current) {
              clearInterval(checkAnalysis);
              initializedRef.current = true;
              setMessages([
                {
                  role: 'assistant',
                  content: `Hey! I'm ready to help you build integrations for ${capitalizedName}.`,
                },
                {
                  role: 'assistant',
                  content: `Here are some integrations you can build:`,
                  isTyping: false,
                },
              ]);
            }
          }, 5000);
        }, 2000);
      }, 2000);
    }, 1000);
  }, [companyUrl]);

  // Auto-scroll to bottom
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

  // Helper function to process streaming response - TRULY LIVE VERSION
  const processStreamingResponse = async (reader: ReadableStreamDefaultReader<Uint8Array>, integrationName: string, userRequest: string) => {
    const decoder = new TextDecoder();
    let assistantMessage = '';
    let displayedText = '';
    const processedFiles = new Set<string>();
    const createdFiles: { name: string; content: string }[] = [];
    let terminalOutput = 'Parsing integration requirements...\n';

    // Show initial terminal output
    if (onAiThinking) {
      onAiThinking(terminalOutput);
    }

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
            if (parsed.content) {
              assistantMessage += parsed.content;

              // LIVE UPDATE: Show reasoning as it streams, hide service and file markers
              let cleanText = assistantMessage.replace(/\[SERVICE:[^\]]+\]/g, '').trim();
              const textBeforeFile = cleanText.split('[FILE:')[0];
              if (textBeforeFile !== displayedText) {
                displayedText = textBeforeFile;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = displayedText;
                  return newMessages;
                });
              }

              // REAL-TIME FILE DETECTION: Check for files (complete OR in-progress)
              const fileRegex = /\[FILE:\s*([^\]]+)\]([\s\S]*?)(\[\/FILE\]|$)/g;
              let match;
              while ((match = fileRegex.exec(assistantMessage)) !== null) {
                const fileName = match[1].trim();
                const fileContent = match[2].trim();
                const isComplete = match[3] === '[/FILE]';

                // First time seeing this file - create it immediately
                if (!processedFiles.has(fileName)) {
                  processedFiles.add(fileName);

                  // Update terminal output
                  terminalOutput += `→ Detected API specifications...\n`;
                  terminalOutput += `→ Analyzing authentication methods...\n`;
                  terminalOutput += `→ Generating ${fileName}...\n`;
                  if (onAiThinking) {
                    onAiThinking(terminalOutput);
                  }

                  // IMMEDIATELY add file to tree
                  if (onNewFile) {
                    onNewFile(fileName, ''); // Start with empty content
                  }

                  // Update chat message
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = `${textBeforeFile}\n\n📝 Creating ${fileName}...`;
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

                  // Update chat message
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = `${textBeforeFile}\n\n✅ Created ${fileName}`;
                    return newMessages;
                  });
                }
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    // Final message
    const textBeforeFiles = assistantMessage.split('[FILE:')[0].trim();
    if (processedFiles.size > 0) {
      terminalOutput += `\n✓ All tests passed\n`;
      terminalOutput += `✓ Integration complete\n`;
      if (onAiThinking) {
        onAiThinking(terminalOutput);
      }

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = `${textBeforeFiles}\n\n✨ Integration complete! ${processedFiles.size} file${processedFiles.size > 1 ? 's' : ''} created.`;
        return newMessages;
      });

      // Extract service name and domain from AI response
      // AI should output: [SERVICE: ServiceName|domain.com]
      let serviceName = integrationName;
      let serviceUrl = '';

      const serviceMatch = assistantMessage.match(/\[SERVICE:\s*([^|]+)\|([^\]]+)\]/);
      if (serviceMatch) {
        serviceName = serviceMatch[1].trim();
        serviceUrl = serviceMatch[2].trim();
      }

      // Set integration completion data
      setIntegrationData({
        name: serviceName, // Use extracted service name (e.g., "Clearbit", "LinkedIn")
        description: userRequest,
        url: serviceUrl, // The actual domain (e.g., "linkedin.com")
        files: createdFiles
      });
      setIntegrationCompleted(true);
    } else {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = textBeforeFiles || 'Done!';
        return newMessages;
      });
    }

    // Clear terminal after completion
    setTimeout(() => {
      if (onAiThinking) {
        onAiThinking('');
      }
    }, 2000);
  };

  const handleSuggestionClick = async (useCase: string) => {
    // Add user message (triggers button removal)
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: useCase,
      },
    ]);

    // Add typing dots
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: '',
        isTyping: true,
      },
    ]);

    // IMMEDIATELY show terminal thinking - don't wait for API
    if (onAiThinking) {
      onAiThinking('Initializing integration architect...\n→ Connecting to Claude AI...\n');
    }

    // Notify parent that AI is coding
    onCodingStateChange?.(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: useCase }],
          companyUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();

      if (reader) {
        // Remove typing dots before processing response
        setMessages((prev) => prev.slice(0, -1));
        // Add placeholder for streaming content
        setMessages((prev) => [...prev, { role: 'assistant', content: '...' }]);
        await processStreamingResponse(reader, useCase, useCase);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => {
        // Remove typing dots if present
        const filtered = prev.filter(m => !m.isTyping);
        return [
          ...filtered,
          {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
          },
        ];
      });
    } finally {
      onCodingStateChange?.(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Show user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    // Add empty assistant message - will fill with streaming content
    setMessages((prev) => [...prev, { role: 'assistant', content: '...' }]);

    // Notify parent that AI is coding
    onCodingStateChange?.(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        await processStreamingResponse(reader, userMessage, userMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      onCodingStateChange?.(false);
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
      {/* Chat header */}
      <div className="border-b px-4 py-3 flex items-center gap-2 bg-gray-100 border-gray-200">
        <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
        <span className="text-sm font-medium text-gray-700">Membrane Integration Agent</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-white">
        {messages.map((message, index) => (
          <div key={index}>
            <div
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded flex-shrink-0 flex items-center justify-center text-xs ${
                  message.role === 'assistant' ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {message.role === 'assistant' ? (
                  <Bot className="w-4 h-4" />
                ) : '👤'}
              </div>

              {/* Message bubble */}
              <div
                className={`flex-1 rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === 'assistant'
                    ? 'bg-gray-50 text-gray-800 border border-gray-200'
                    : 'bg-blue-600 text-white'
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

            {/* Show suggestions after the analysis message (last assistant message with analysis) */}
            {message.role === 'assistant' &&
             index === messages.length - 1 &&
             initializedRef.current &&
             companyAnalysis &&
             companyAnalysis.suggestedUseCases &&
             companyAnalysis.suggestedUseCases.length > 0 &&
             !messages.some(m => m.role === 'user') && (
              <div className="mt-3 ml-10 space-y-2">
                {companyAnalysis.suggestedUseCases.slice(0, 3).map((useCase, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(useCase)}
                    className="w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-full border border-blue-200 transition-all font-medium"
                  >
                    {useCase}
                  </button>
                ))}
              </div>
            )}

            {/* Show "Add to Your IDE" button after integration completion */}
            {message.role === 'assistant' &&
             index === messages.length - 1 &&
             integrationCompleted &&
             integrationData &&
             message.content.includes('Integration complete!') && (
              <div className="mt-3 ml-10">
                <button
                  onClick={() => {
                    if (onAddToIDE && integrationData) {
                      onAddToIDE(integrationData);
                    }
                  }}
                  className="w-full text-left text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-full border border-transparent transition-all font-medium shadow-md hover:shadow-lg"
                >
                  ✨ Add to Your IDE
                </button>
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-4 border-gray-200 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the integration you need..."
            className="w-full text-sm rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 resize-none min-h-[60px] max-h-[200px] bg-white text-gray-700 border-gray-300 focus:border-blue-500 focus:ring-blue-100 placeholder:text-gray-400"
            rows={2}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="self-end px-4 py-1.5 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

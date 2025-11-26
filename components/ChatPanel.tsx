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
  onAddToIDE?: (integrationData: {
    name: string;
    description: string;
    url?: string;
    files: { name: string; content: string }[];
  }) => void;
  initialMessage?: string;
}

export default function ChatPanel({
  companyUrl,
  companyAnalysis,
  isAnalyzing,
  onCodingStateChange,
  onNewFile,
  onFileTyping,
  onAiThinking,
  onAddToIDE,
  initialMessage,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initializedRef = useRef(false);
  const [integrationCompleted, setIntegrationCompleted] = useState(false);
  const [integrationData, setIntegrationData] = useState<{
    name: string;
    description: string;
    url?: string;
    files: { name: string; content: string }[];
  } | null>(null);
  const hasProcessedInitialMessage = useRef(false);

  useEffect(() => {
    if (initialMessage && !hasProcessedInitialMessage.current) {
      hasProcessedInitialMessage.current = true;
      initializedRef.current = true;

      const companyName = companyUrl.split('.')[0];
      const capitalizedName = companyName.charAt(0).toUpperCase() + companyName.slice(1);

      setMessages([
        {
          role: 'assistant',
          content: `Hey! I'm ready to help you build integrations for ${capitalizedName}.`,
        },
      ]);

      setTimeout(() => {
        handleSuggestionClick(initialMessage);
      }, 500);
    }
  }, [initialMessage]);

  useEffect(() => {
    if (initializedRef.current) return;
    if (initialMessage) return;

    const companyName = companyUrl.split('.')[0];
    const capitalizedName = companyName.charAt(0).toUpperCase() + companyName.slice(1);

    setMessages([
      {
        role: 'assistant',
        content: `Hey! I'm ready to help you build integrations for ${capitalizedName}.`,
      },
    ]);

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

      setTimeout(() => {
        if (initializedRef.current) return;
        setMessages([
          {
            role: 'assistant',
            content: `Hey! I'm ready to help you build integrations for ${capitalizedName}.`,
          },
          {
            role: 'assistant',
            content: 'Analyzing your website...',
            isTyping: false,
          },
        ]);

        setTimeout(() => {
          if (initializedRef.current) return;
          setMessages([
            {
              role: 'assistant',
              content: `Hey! I'm ready to help you build integrations for ${capitalizedName}.`,
            },
            {
              role: 'assistant',
              content: 'Reading product documentation and API specs...',
              isTyping: false,
            },
          ]);

          setTimeout(() => {
            if (initializedRef.current) return;
            setMessages([
              {
                role: 'assistant',
                content: `Hey! I'm ready to help you build integrations for ${capitalizedName}.`,
              },
              {
                role: 'assistant',
                content: 'Identifying integration opportunities...',
                isTyping: false,
              },
            ]);

            const checkAnalysis = setInterval(() => {
              if (
                companyAnalysis &&
                companyAnalysis.suggestedUseCases &&
                companyAnalysis.suggestedUseCases.length > 0 &&
                !initializedRef.current
              ) {
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
          }, 1500);
        }, 1500);
      }, 2000);
    }, 1000);
  }, [companyUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const processStreamingResponse = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    integrationName: string,
    userRequest: string
  ) => {
    const decoder = new TextDecoder();
    let assistantMessage = '';
    let displayedText = '';
    const processedFiles = new Set<string>();
    const createdFiles: { name: string; content: string }[] = [];
    let terminalOutput = 'Parsing integration requirements...\n';

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

              const fileRegex = /\[FILE:\s*([^\]]+)\]([\s\S]*?)(\[\/FILE\]|$)/g;
              let match;
              while ((match = fileRegex.exec(assistantMessage)) !== null) {
                const fileName = match[1].trim();
                const fileContent = match[2].trim();
                const isComplete = match[3] === '[/FILE]';

                if (!processedFiles.has(fileName)) {
                  processedFiles.add(fileName);

                  terminalOutput += `→ Detected API specifications...\n`;
                  terminalOutput += `→ Analyzing authentication methods...\n`;
                  terminalOutput += `→ Generating ${fileName}...\n`;
                  if (onAiThinking) {
                    onAiThinking(terminalOutput);
                  }

                  if (onNewFile) {
                    onNewFile(fileName, '');
                  }

                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content =
                      `${textBeforeFile}\n\n📝 Creating ${fileName}...`;
                    return newMessages;
                  });
                }

                if (fileContent.length > 0) {
                  if (onFileTyping) {
                    onFileTyping(fileName, fileContent, isComplete);
                  }
                }

                if (isComplete) {
                  terminalOutput += `✓ ${fileName} created successfully (${fileContent.length} chars)\n`;
                  if (onAiThinking) {
                    onAiThinking(terminalOutput);
                  }

                  createdFiles.push({ name: fileName, content: fileContent });

                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content =
                      `${textBeforeFile}\n\n✅ Created ${fileName}`;
                    return newMessages;
                  });
                }
              }
            }
          } catch (e) {
            console.error('Error parsing stream data:', e);
          }
        }
      }
    }

    const textBeforeFiles = assistantMessage.split('[FILE:')[0].trim();
    if (processedFiles.size > 0) {
      terminalOutput += `\n✓ All tests passed\n`;
      terminalOutput += `✓ Integration complete\n`;
      if (onAiThinking) {
        onAiThinking(terminalOutput);
      }

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content =
          `${textBeforeFiles}\n\n✨ Integration complete! ${processedFiles.size} file${processedFiles.size > 1 ? 's' : ''} created.`;
        return newMessages;
      });

      let serviceName = integrationName;
      let serviceUrl = '';

      const serviceMatch = assistantMessage.match(/\[SERVICE:\s*([^|]+)\|([^\]]+)\]/);
      if (serviceMatch) {
        serviceName = serviceMatch[1].trim();
        serviceUrl = serviceMatch[2].trim();
      }

      setIntegrationData({
        name: serviceName,
        description: userRequest,
        url: serviceUrl,
        files: createdFiles,
      });
      setIntegrationCompleted(true);
    } else {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = textBeforeFiles || 'Done!';
        return newMessages;
      });
    }

    setTimeout(() => {
      if (onAiThinking) {
        onAiThinking('');
      }
    }, 2000);
  };

  const handleSuggestionClick = async (useCase: string) => {
    // Don't show the recommendation as a user message in chat
    // Just start showing the assistant's typing indicator
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: '',
        isTyping: true,
      },
    ]);

    if (onAiThinking) {
      onAiThinking('Initializing integration architect...\n→ Connecting to Claude AI...\n');
    }

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
        setMessages((prev) => prev.slice(0, -1));
        setMessages((prev) => [...prev, { role: 'assistant', content: '...' }]);
        await processStreamingResponse(reader, useCase, useCase);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isTyping);
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

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setMessages((prev) => [...prev, { role: 'assistant', content: '...' }]);

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

  const getTimeStamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="border-b px-5 py-4 flex items-center gap-3 bg-white border-gray-200">
        <button className="text-gray-400 hover:text-gray-600">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
        </button>
        <h2 className="text-base font-semibold text-gray-900">Membrane Agent</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 bg-white">
        {messages.map((message, index) => (
          <div key={index}>
            {message.role === 'assistant' && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">Agent</span>
                    <span className="text-xs text-gray-400">{getTimeStamp()}</span>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {message.isTyping ? (
                      <div className="flex gap-1 items-center py-1">
                        <span
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        ></span>
                        <span
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        ></span>
                        <span
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        ></span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap break-words">
                        {message.content.replace(/\[SERVICE:[^\]]+\]/g, '').trim()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {message.role === 'user' && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                  <span className="text-sm">👤</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">You</span>
                    <span className="text-xs text-gray-400">{getTimeStamp()}</span>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                </div>
              </div>
            )}

            {message.role === 'assistant' &&
              index === messages.length - 1 &&
              integrationCompleted &&
              integrationData &&
              message.content.includes('Integration complete!') && (
                <div className="mt-4 ml-11">
                  <button
                    type="button"
                    onClick={() => {
                      if (onAddToIDE && integrationData) {
                        onAddToIDE(integrationData);
                      }
                    }}
                    className="w-full text-center text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-lg border border-transparent transition-all font-medium shadow-sm hover:shadow-md"
                  >
                    ✨ Add to Your IDE
                  </button>
                </div>
              )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 border-gray-200 bg-white">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full text-sm rounded-lg px-4 py-3 pr-12 border focus:outline-none focus:ring-2 resize-none min-h-[48px] max-h-[150px] bg-white text-gray-700 border-gray-300 focus:border-blue-500 focus:ring-blue-100 placeholder:text-gray-400"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 bottom-2 p-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

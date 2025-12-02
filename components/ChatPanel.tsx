'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';

interface ToolCall {
  name: string;
  status: 'running' | 'complete';
  icon?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
  plan?: string[];
  tools?: ToolCall[];
}

interface ChatPanelProps {
  companyUrl: string;
  companyAnalysis?: {
    companyName: string;
    productDescription: string;
    productTagline: string;
    suggestedUseCases: string[];
  };
  onAddToIDE?: (integrationData: {
    name: string;
    description: string;
    url?: string;
    files: { name: string; content: string }[];
  }) => void;
  initialMessage?: string;
}

const getToolIcon = (iconName?: string) => {
  const className = 'w-4 h-4';

  switch (iconName) {
    case 'lightbulb':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      );
    case 'search':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      );
    case 'plug':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      );
    case 'globe':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      );
    case 'grid':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      );
    case 'link':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      );
    case 'zap':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      );
    case 'file':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    case 'code':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      );
    case 'text':
      return null; // Text messages don't need icons
    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      );
  }
};

export default function ChatPanel({
  companyUrl,
  companyAnalysis,
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

                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content =
                      `${textBeforeFile}\n\n Creating ${fileName}...`;
                    return newMessages;
                  });
                }

                if (isComplete) {
                  createdFiles.push({ name: fileName, content: fileContent });

                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content =
                      `${textBeforeFile}\n\n Created ${fileName}`;
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
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content =
          `${textBeforeFiles}\n\n Integration complete! ${processedFiles.size} file${processedFiles.size > 1 ? 's' : ''} created.`;
        return newMessages;
      });

      const serviceMatch = assistantMessage.match(/\[SERVICE:\s*([^|]+)\|([^\]]+)\]/);

      if (serviceMatch) {
        const serviceName = serviceMatch[1].trim();
        const serviceUrl = serviceMatch[2].trim();

        setIntegrationData({
          name: serviceName,
          description: userRequest,
          url: serviceUrl,
          files: createdFiles,
        });
      } else {
        setIntegrationData({
          name: integrationName,
          description: userRequest,
          url: '',
          files: createdFiles,
        });
      }
      setIntegrationCompleted(true);
    } else {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = textBeforeFiles || 'Done!';
        return newMessages;
      });
    }
  };

  const handleSuggestionClick = async (useCase: string) => {
    const integrationName = useCase.split(' ').slice(0, 3).join(' ');

    // Add initial message with reasoning structure
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `I'll help you ${useCase.toLowerCase()}. Let me first understand what we're working with and then load the relevant knowledge.`,
        plan: [
          'Load skills about building integrations and actions in Membrane',
          `Check if there's an existing ${integrationName} integration`,
          `Create or configure the necessary elements to ${useCase.toLowerCase()}`,
        ],
        tools: [],
      },
    ]);

    // Simulate tool calls
    await new Promise((resolve) => setTimeout(resolve, 800));

    const toolCalls: ToolCall[] = [
      { name: 'Tool: load-skill', status: 'running', icon: 'lightbulb' },
    ];

    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1].tools = [...toolCalls];
      return newMessages;
    });

    await new Promise((resolve) => setTimeout(resolve, 600));
    toolCalls[0].status = 'complete';
    toolCalls.push({ name: 'Tool: load-skill', status: 'running', icon: 'lightbulb' });
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1].tools = [...toolCalls];
      return newMessages;
    });

    await new Promise((resolve) => setTimeout(resolve, 600));
    toolCalls[1].status = 'complete';
    toolCalls.push({ name: 'Tool: load-skill', status: 'running', icon: 'lightbulb' });
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1].tools = [...toolCalls];
      return newMessages;
    });

    await new Promise((resolve) => setTimeout(resolve, 600));
    toolCalls[2].status = 'complete';
    toolCalls.push({ name: 'Membrane: List Integrations', status: 'running', icon: 'search' });
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1].tools = [...toolCalls];
      newMessages[newMessages.length - 1].content =
        `I'll help you ${useCase.toLowerCase()}. Let me first understand what we're working with and then load the relevant knowledge.\n\nLet me start by loading the necessary skills and checking the current state:`;
      return newMessages;
    });

    await new Promise((resolve) => setTimeout(resolve, 800));
    toolCalls[3].status = 'complete';
    toolCalls.push({
      name: `Now let me search for information about ${integrationName} and check if there are any existing connectors:`,
      status: 'complete',
      icon: 'text',
    });
    toolCalls.push({ name: 'Membrane: List Connectors', status: 'running', icon: 'plug' });
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1].tools = [...toolCalls];
      return newMessages;
    });

    await new Promise((resolve) => setTimeout(resolve, 700));
    toolCalls[5].status = 'complete';
    toolCalls.push({ name: 'Membrane: Websearch', status: 'running', icon: 'globe' });
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1].tools = [...toolCalls];
      return newMessages;
    });

    await new Promise((resolve) => setTimeout(resolve, 800));
    toolCalls[6].status = 'complete';
    toolCalls.push({
      name: `Good! Now let me check if there are any apps for ${integrationName} and get more details about the API:`,
      status: 'complete',
      icon: 'text',
    });
    toolCalls.push({ name: 'Membrane: List Apps', status: 'running', icon: 'grid' });
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1].tools = [...toolCalls];
      return newMessages;
    });

    await new Promise((resolve) => setTimeout(resolve, 700));
    toolCalls[8].status = 'complete';
    toolCalls.push({ name: 'Tool: load-skill', status: 'running', icon: 'lightbulb' });
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1].tools = [...toolCalls];
      return newMessages;
    });

    await new Promise((resolve) => setTimeout(resolve, 600));
    toolCalls[9].status = 'complete';
    toolCalls.push({
      name: `Perfect! I can see that ${integrationName} app already exists and has a default connector. Let me check the existing connector and then create an integration:`,
      status: 'complete',
      icon: 'text',
    });
    toolCalls.push({ name: 'Membrane: Get Connector', status: 'running', icon: 'link' });
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1].tools = [...toolCalls];
      return newMessages;
    });

    await new Promise((resolve) => setTimeout(resolve, 800));
    toolCalls[11].status = 'complete';
    toolCalls.push({
      name: `Great! Now I understand the setup. Let me create an integration for ${integrationName} and then build the necessary elements to ${useCase.toLowerCase()}. Let me also load the skill about internal data schemas since we'll likely need to work with contact data:`,
      status: 'complete',
      icon: 'text',
    });
    toolCalls.push({ name: 'Tool: load-skill', status: 'running', icon: 'lightbulb' });
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1].tools = [...toolCalls];
      return newMessages;
    });

    await new Promise((resolve) => setTimeout(resolve, 600));
    toolCalls[13].status = 'complete';
    toolCalls.push({ name: 'Membrane: Create Integration', status: 'running', icon: 'zap' });
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1].tools = [...toolCalls];
      return newMessages;
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
    toolCalls[14].status = 'complete';
    toolCalls.push({
      name: `Perfect! The integration has been created. Now let me create an action that will ${useCase.toLowerCase()}. Based on the web search results, I know the API endpoint we need to use. Let me create an action for this:`,
      status: 'complete',
      icon: 'text',
    });
    toolCalls.push({ name: 'Tool: load-skill', status: 'running', icon: 'lightbulb' });
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1].tools = [...toolCalls];
      return newMessages;
    });

    await new Promise((resolve) => setTimeout(resolve, 600));
    toolCalls[16].status = 'complete';
    toolCalls.push({
      name: "Now let me read the documentation for the api-request-to-external-app function type since that's what we'll need:",
      status: 'complete',
      icon: 'text',
    });
    toolCalls.push({ name: 'Tool: read-documentation', status: 'running', icon: 'file' });
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1].tools = [...toolCalls];
      return newMessages;
    });

    await new Promise((resolve) => setTimeout(resolve, 800));
    toolCalls[18].status = 'complete';
    toolCalls.push({
      name: `Perfect! Now let me create an action to ${useCase.toLowerCase()}:`,
      status: 'complete',
      icon: 'text',
    });
    toolCalls.push({ name: 'Membrane: Create Action', status: 'running', icon: 'code' });
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1].tools = [...toolCalls];
      return newMessages;
    });

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
        toolCalls[20].status = 'complete';
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].tools = [...toolCalls];
          return newMessages;
        });

        await new Promise((resolve) => setTimeout(resolve, 500));
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setMessages((prev) => [...prev, { role: 'assistant', content: '...' }]);

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
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="border-b px-5 py-4 flex items-center gap-3 bg-white border-gray-200">
        <button className="text-gray-400 hover:text-gray-600">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h2 className="text-base font-semibold text-gray-900">Membrane Agent</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white flex justify-center">
        <div className="w-full max-w-3xl px-8 py-6 pb-8 space-y-6">
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
                        <>
                          <div className="whitespace-pre-wrap break-words">
                            {message.content.replace(/\[SERVICE:[^\]]+\]/g, '').trim()}
                          </div>

                          {/* Plan Section */}
                          {message.plan && message.plan.length > 0 && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="font-medium text-gray-900 mb-2">Plan:</div>
                              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                {message.plan.map((step, i) => (
                                  <li key={i} className="text-sm">
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {/* Tool Calls Section */}
                          {message.tools && message.tools.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {message.tools.map((tool, i) => (
                                <details
                                  key={i}
                                  className="group"
                                  open={
                                    tool.name.includes('Now let me') ||
                                    tool.name.includes('Good!') ||
                                    tool.name.includes('Perfect!') ||
                                    tool.name.includes('Great!')
                                  }
                                >
                                  <summary className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors list-none">
                                    {getToolIcon(tool.icon)}
                                    <span className="flex-1 text-sm font-medium text-gray-700">
                                      {tool.name}
                                    </span>
                                    {tool.status === 'running' ? (
                                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                    ) : (
                                      <svg
                                        className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M19 9l-7 7-7-7"
                                        />
                                      </svg>
                                    )}
                                  </summary>
                                  {tool.status === 'complete' &&
                                    !tool.name.includes('Now let me') &&
                                    !tool.name.includes('Good!') &&
                                    !tool.name.includes('Perfect!') &&
                                    !tool.name.includes('Great!') && (
                                      <div className="px-3 py-2 text-xs text-gray-600 bg-gray-50/50">
                                        ✓ Complete
                                      </div>
                                    )}
                                </details>
                              ))}
                            </div>
                          )}
                        </>
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
                  <div className="mt-4 ml-11 mb-8">
                    <button
                      type="button"
                      onClick={() => {
                        if (onAddToIDE && integrationData) {
                          onAddToIDE(integrationData);
                        }
                      }}
                      className="inline-flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg border border-blue-600 transition-colors font-medium"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add to Open Membrane OS
                    </button>
                  </div>
                )}
            </div>
          ))}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white flex justify-center">
        <div className="w-full max-w-3xl px-8 py-4">
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

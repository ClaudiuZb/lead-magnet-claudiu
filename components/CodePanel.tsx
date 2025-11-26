'use client';

interface CodePanelProps {
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

export default function CodePanel({
  selectedFile,
  companyUrl,
  companyAnalysis,
  isAICoding,
  generatedFileContents,
  typingFile,
  aiThinking,
}: CodePanelProps) {
  const companyName = companyUrl.split('.')[0];
  const capitalizedName =
    companyAnalysis?.companyName || companyName.charAt(0).toUpperCase() + companyName.slice(1);

  const showingTypingFile = typingFile && selectedFile === typingFile.name;
  const isGeneratedFile = selectedFile?.startsWith('generated/');
  const generatedContent = showingTypingFile
    ? typingFile.content
    : isGeneratedFile && selectedFile
      ? generatedFileContents?.get(selectedFile)
      : null;

  const renderWithSyntax = (code: string, fileType: string) => {
    if (fileType === 'yaml') {
      return code.split('\n').map((line, i) => {
        // Comments
        if (line.trim().startsWith('#')) {
          return (
            <div key={i} className="text-green-600">
              {line}
            </div>
          );
        }
        // Key-value pairs
        if (line.includes(':') && !line.trim().startsWith('-')) {
          const colonIndex = line.indexOf(':');
          const beforeColon = line.substring(0, colonIndex);
          const afterColon = line.substring(colonIndex + 1);

          // Check if value contains variables like $.input
          const hasVar = afterColon.includes('$.');

          return (
            <div key={i}>
              <span className="text-[#0070C1]">{beforeColon}</span>
              <span className="text-gray-700">:</span>
              {hasVar ? (
                <span className="text-[#0070C1]">{afterColon}</span>
              ) : (
                <span className="text-gray-700">{afterColon}</span>
              )}
            </div>
          );
        }
        // List items
        if (line.trim().startsWith('-')) {
          return (
            <div key={i} className="text-gray-700">
              {line}
            </div>
          );
        }
        return (
          <div key={i} className="text-gray-700">
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
              <span className="text-gray-700">{key.replace(/"([^"]+)"/, '')}</span>
              <span className="text-[#0070C1]">&quot;{key.match(/"([^"]+)"/)?.[1] || ''}&quot;</span>
              <span className="text-gray-700">: </span>
              <span className="text-[#A31515]">{value}</span>
            </div>
          );
        }
        return (
          <div key={i} className="text-gray-700">
            {line}
          </div>
        );
      });
    }

    return <div className="text-gray-700 whitespace-pre-wrap">{code}</div>;
  };

  const getFileContent = () => {
    if (!selectedFile) {
      return {
        content: `# Welcome to ${capitalizedName} Integration Layer\n\n${companyAnalysis?.productDescription || 'Select a file from the left panel to view its contents.'}`,
        type: 'markdown',
      };
    }

    if (selectedFile === 'packages/crm-sync.yaml') {
      return {
        content: `package: crm-sync
description: >
  Sync customers between ${capitalizedName} and HubSpot
  for unified customer data

apps:
  - HubSpot
  - ${capitalizedName}

objects:
  - name: customer
    source: HubSpot.Contact
    target: ${capitalizedName}.Customer
    key: email

mappings:
  - field: email
    from: HubSpot.Contact.email
    to: ${capitalizedName}.Customer.email
  - field: name
    from: HubSpot.Contact.full_name
    to: ${capitalizedName}.Customer.name
  - field: company
    from: HubSpot.Contact.company
    to: ${capitalizedName}.Customer.company_id`,
        type: 'yaml',
      };
    }

    if (selectedFile === 'config/apps.json') {
      return {
        content: `{
  "apps": [
    {
      "name": "HubSpot",
      "type": "crm",
      "auth": "oauth2",
      "endpoints": {
        "contacts": "/crm/v3/objects/contacts",
        "companies": "/crm/v3/objects/companies"
      }
    },
    {
      "name": "${capitalizedName}",
      "type": "custom",
      "auth": "api_key",
      "base_url": "https://api.${companyUrl}",
      "endpoints": {
        "customers": "/v1/customers",
        "deals": "/v1/deals"
      }
    }
  ]
}`,
        type: 'json',
      };
    }

    if (selectedFile === 'schemas/customer.schema.json') {
      return {
        content: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Customer",
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique customer identifier"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "name": {
      "type": "string"
    },
    "company_id": {
      "type": "string"
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": ["email", "name"]
}`,
        type: 'json',
      };
    }

    if (selectedFile === 'flows/customer_created.flow') {
      return {
        content: `flow: customer_created
trigger:
  source: HubSpot
  event: contact.created

actions:
  - name: Create ${capitalizedName} customer
    app: ${capitalizedName}
    action: customers.create
    mapping:
      email: trigger.data.email
      name: trigger.data.full_name
      company_id: trigger.data.company

  - name: Send welcome email
    app: SendGrid
    action: email.send
    condition: customer.email_verified
    template: welcome_email`,
        type: 'yaml',
      };
    }

    if (isGeneratedFile && generatedContent) {
      const fileExt = selectedFile.split('.').pop() || '';
      const fileType =
        fileExt === 'yaml' || fileExt === 'yml' ? 'yaml' : fileExt === 'json' ? 'json' : 'markdown';
      return {
        content: generatedContent,
        type: fileType,
      };
    }

    return {
      content: `# ${selectedFile}\n\n# Content for this file is being generated...`,
      type: 'markdown',
    };
  };

  const { content, type } = getFileContent();

  return (
    <div className="h-full flex bg-white overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
      `}</style>

      {/* Line Numbers */}
      <div className="select-none pr-3 pl-3 pt-2 text-right text-gray-400 text-[11px] font-mono leading-[18px] sticky left-0">
        {content.split('\n').map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      {/* Code Content */}
      <pre className="text-[11px] font-mono leading-[18px] flex-1 pt-2 pr-3">
        {renderWithSyntax(content, type)}
      </pre>
    </div>
  );
}

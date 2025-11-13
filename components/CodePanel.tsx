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

export default function CodePanel({ selectedFile, companyUrl, companyAnalysis, isAICoding, generatedFileContents, typingFile, aiThinking }: CodePanelProps) {
  const companyName = companyUrl.split('.')[0];
  const capitalizedName = companyAnalysis?.companyName || companyName.charAt(0).toUpperCase() + companyName.slice(1);

  // Check if we're showing a typing file
  const showingTypingFile = typingFile && selectedFile === typingFile.name;

  // Check if this is a generated file
  const isGeneratedFile = selectedFile?.startsWith('generated/');
  const generatedContent = showingTypingFile ? typingFile.content : (isGeneratedFile && selectedFile ? generatedFileContents?.get(selectedFile) : null);

  // VS Code-style syntax highlighting helper
  const renderWithSyntax = (code: string, fileType: string) => {
    if (fileType === 'yaml') {
      return code.split('\n').map((line, i) => {
        if (line.trim().startsWith('#')) {
          return <div key={i} className="text-[#6A9955]">{line}</div>;
        }
        if (line.includes(':') && !line.trim().startsWith('-')) {
          const [key, ...rest] = line.split(':');
          return (
            <div key={i}>
              <span className="text-[#9CDCFE]">{key}</span>
              <span className="text-[#D4D4D4]">:</span>
              <span className="text-[#CE9178]">{rest.join(':')}</span>
            </div>
          );
        }
        if (line.trim().startsWith('-')) {
          return <div key={i} className="text-[#D4D4D4]">{line}</div>;
        }
        return <div key={i} className="text-[#D4D4D4]">{line}</div>;
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
              <span className="text-[#D4D4D4]">{key.replace(/"([^"]+)"/, '')}</span>
              <span className="text-[#9CDCFE]">&quot;{key.match(/"([^"]+)"/)?.[1] || ''}&quot;</span>
              <span className="text-[#D4D4D4]">: </span>
              <span className="text-[#CE9178]">{value}</span>
            </div>
          );
        }
        return <div key={i} className="text-[#D4D4D4]">{line}</div>;
      });
    }

    return <div className="text-[#D4D4D4] whitespace-pre-wrap">{code}</div>;
  };

  // Sample code content based on selected file
  const getFileContent = () => {
    if (!selectedFile) {
      return {
        content: `# Welcome to ${capitalizedName} Integration Layer\n\n${companyAnalysis?.productDescription || 'Select a file from the left panel to view its contents.'}`,
        type: 'markdown'
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
        type: 'yaml'
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
        type: 'json'
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
        type: 'json'
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
        type: 'yaml'
      };
    }

    // Handle generated files
    if (isGeneratedFile && generatedContent) {
      const fileExt = selectedFile.split('.').pop() || '';
      const fileType = fileExt === 'yaml' || fileExt === 'yml' ? 'yaml' :
                       fileExt === 'json' ? 'json' : 'markdown';
      return {
        content: generatedContent,
        type: fileType
      };
    }

    return {
      content: `# ${selectedFile}\n\n# Content for this file is being generated...`,
      type: 'markdown'
    };
  };

  const { content, type } = getFileContent();

  return (
    <div className="h-full flex flex-col">
      {/* File tab */}
      {selectedFile && (
        <div className="bg-[#252526] border-b border-[#2D2D2D] px-4 py-2 flex items-center">
          <span className="text-sm text-[#CCCCCC]">{selectedFile}</span>
        </div>
      )}

      {/* Code content */}
      <div className="flex-1 overflow-auto bg-[#1E1E1E] p-6 relative">
        <pre className="text-sm font-mono leading-relaxed">
          {renderWithSyntax(content, type)}
        </pre>
      </div>

      {/* AI Thinking Terminal - shown when AI is working */}
      {isAICoding && aiThinking && (
        <div className="h-40 bg-[#0E0E0E] border-t border-[#2D2D2D] overflow-auto font-mono text-xs">
          <div className="sticky top-0 bg-[#181818] px-3 py-2 border-b border-[#2D2D2D] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[#CCCCCC] font-semibold">membrane@ide:~/projects/{capitalizedName}-integration-layer$</span>
          </div>
          <div className="p-3 text-[#00FF00] whitespace-pre-wrap">
            {aiThinking}
          </div>
        </div>
      )}
    </div>
  );
}

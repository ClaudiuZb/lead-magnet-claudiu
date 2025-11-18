'use client';

import { useState } from 'react';

interface FileTreeProps {
  onFileSelect: (file: string) => void;
  selectedFile: string | null;
  companyUrl: string;
  dynamicFiles?: FileNode[];
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path: string;
}

export default function FileTree({ onFileSelect, selectedFile, companyUrl, dynamicFiles = [] }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['packages', 'flows', 'schemas', 'mappings', 'config', 'generated'])
  );

  const baseFileStructure: FileNode[] = [
    {
      name: 'packages',
      type: 'folder',
      path: 'packages',
      children: [
        { name: 'crm-sync.yaml', type: 'file', path: 'packages/crm-sync.yaml' },
        { name: 'analytics-events.yaml', type: 'file', path: 'packages/analytics-events.yaml' },
        { name: 'support-tickets.yaml', type: 'file', path: 'packages/support-tickets.yaml' },
        { name: 'billing-webhooks.yaml', type: 'file', path: 'packages/billing-webhooks.yaml' },
      ],
    },
    {
      name: 'flows',
      type: 'folder',
      path: 'flows',
      children: [
        { name: 'customer_created.flow', type: 'file', path: 'flows/customer_created.flow' },
        { name: 'contact_updated.flow', type: 'file', path: 'flows/contact_updated.flow' },
        { name: 'ticket_assigned.flow', type: 'file', path: 'flows/ticket_assigned.flow' },
        { name: 'invoice_paid.flow', type: 'file', path: 'flows/invoice_paid.flow' },
        { name: 'event_tracked.flow', type: 'file', path: 'flows/event_tracked.flow' },
      ],
    },
    {
      name: 'schemas',
      type: 'folder',
      path: 'schemas',
      children: [
        { name: 'customer.schema.json', type: 'file', path: 'schemas/customer.schema.json' },
        { name: 'contact.schema.json', type: 'file', path: 'schemas/contact.schema.json' },
        { name: 'ticket.schema.json', type: 'file', path: 'schemas/ticket.schema.json' },
        { name: 'event.schema.json', type: 'file', path: 'schemas/event.schema.json' },
      ],
    },
    {
      name: 'mappings',
      type: 'folder',
      path: 'mappings',
      children: [
        { name: 'crm_field_map.json', type: 'file', path: 'mappings/crm_field_map.json' },
        { name: 'analytics_transform.json', type: 'file', path: 'mappings/analytics_transform.json' },
        { name: 'support_routing.json', type: 'file', path: 'mappings/support_routing.json' },
      ],
    },
    {
      name: 'config',
      type: 'folder',
      path: 'config',
      children: [
        { name: 'apps.json', type: 'file', path: 'config/apps.json' },
        { name: 'auth.json', type: 'file', path: 'config/auth.json' },
      ],
    },
  ];

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <div
            className="flex items-center gap-1 px-3 py-1 cursor-pointer hover:bg-gray-100 text-sm"
            style={{ paddingLeft: `${level * 12 + 12}px` }}
            onClick={() => toggleFolder(node.path)}
          >
            <span className="text-gray-600">{isExpanded ? '▼' : '▶'}</span>
            <span className="text-gray-700 ml-1 font-medium">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div>{node.children.map((child) => renderNode(child, level + 1))}</div>
          )}
        </div>
      );
    }

    return (
      <div
        key={node.path}
        className={`flex items-center gap-2 px-3 py-1 cursor-pointer text-sm ${
          isSelected ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500' : 'text-gray-700 hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${level * 12 + 28}px` }}
        onClick={() => onFileSelect(node.path)}
      >
        <span className="text-gray-500">📄</span>
        <span>{node.name}</span>
      </div>
    );
  };

  const companyName = companyUrl.split('.')[0];
  const capitalizedName = companyName.charAt(0).toUpperCase() + companyName.slice(1);

  // Combine base structure with dynamic files
  const fileStructure: FileNode[] = [
    ...baseFileStructure,
    // Add generated folder if there are dynamic files
    ...(dynamicFiles.length > 0
      ? [
          {
            name: 'generated',
            type: 'folder' as const,
            path: 'generated',
            children: dynamicFiles,
          },
        ]
      : []),
  ];

  return (
    <div className="h-full">
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-1">{capitalizedName}</div>
        <div className="text-xs text-gray-500">integration-layer</div>
      </div>
      <div className="py-2">{fileStructure.map((node) => renderNode(node))}</div>
    </div>
  );
}

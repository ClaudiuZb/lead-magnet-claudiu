'use client';

import { useState } from 'react';

interface IDEFileTreeProps {
  onFileSelect: (file: string) => void;
  selectedFile: string | null;
  companyUrl: string;
  generatedFileContents?: Map<string, string>;
  expandedFolders?: Set<string>;
  onToggleFolder?: (path: string) => void;
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path: string;
}

export default function IDEFileTree({
  onFileSelect,
  selectedFile,
  companyUrl,
  generatedFileContents = new Map(),
  expandedFolders: externalExpandedFolders,
  onToggleFolder,
}: IDEFileTreeProps) {
  const [internalExpandedFolders, setInternalExpandedFolders] = useState<Set<string>>(
    new Set(['src'])
  );

  const expandedFolders = externalExpandedFolders || internalExpandedFolders;

  const toggleFolder = (path: string) => {
    if (onToggleFolder) {
      onToggleFolder(path);
    } else {
      setInternalExpandedFolders((prev) => {
        const next = new Set(prev);
        if (next.has(path)) {
          next.delete(path);
        } else {
          next.add(path);
        }
        return next;
      });
    }
  };

  const buildFileTree = (): FileNode[] => {
    const root: FileNode = {
      name: 'src',
      type: 'folder',
      path: 'src',
      children: [],
    };

    generatedFileContents.forEach((content, filePath) => {
      const parts = filePath.split('/');
      let currentNode = root;

      for (let i = 0; i < parts.length - 1; i++) {
        const folderName = parts[i];
        const folderPath = parts.slice(0, i + 1).join('/');

        if (folderName === 'src') continue;

        let folderNode = currentNode.children?.find(
          (child) => child.name === folderName && child.type === 'folder'
        );

        if (!folderNode) {
          folderNode = {
            name: folderName,
            type: 'folder',
            path: folderPath,
            children: [],
          };
          if (!currentNode.children) currentNode.children = [];
          currentNode.children.push(folderNode);
        }

        currentNode = folderNode;
      }

      const fileName = parts[parts.length - 1];
      if (!currentNode.children) currentNode.children = [];
      currentNode.children.push({
        name: fileName,
        type: 'file',
        path: filePath,
      });
    });

    return [root];
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <div
            className="flex items-center gap-1 px-2 py-0.5 cursor-pointer hover:bg-[#2A2D2E] text-[12px]"
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => toggleFolder(node.path)}
          >
            <span className="text-gray-500 text-[10px]">{isExpanded ? '▼' : '▶'}</span>
            <span className="text-gray-300 ml-1">{node.name}</span>
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
        className={`flex items-center gap-2 px-2 py-0.5 cursor-pointer text-[12px] ${
          isSelected
            ? 'bg-[#37373D] text-white border-l-2 border-blue-500'
            : 'text-gray-400 hover:bg-[#2A2D2E]'
        }`}
        style={{ paddingLeft: `${level * 12 + 20}px` }}
        onClick={() => onFileSelect(node.path)}
      >
        <span className="text-[11px]">
          {node.name.endsWith('.ts') || node.name.endsWith('.tsx')
            ? '📘'
            : node.name.endsWith('.js') || node.name.endsWith('.jsx')
              ? '📙'
              : node.name.endsWith('.json')
                ? '📋'
                : node.name.endsWith('.yaml') || node.name.endsWith('.yml')
                  ? '📄'
                  : '📄'}
        </span>
        <span>{node.name}</span>
      </div>
    );
  };

  const companyName = companyUrl.split('.')[0];
  const capitalizedName = companyName.charAt(0).toUpperCase() + companyName.slice(1);

  const fileStructure: FileNode[] = buildFileTree();

  return (
    <div className="h-full flex flex-col bg-[#252526]">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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
          overflow-x: hidden;
        }
      `}</style>
      <div className="px-3 py-2 border-b border-[#3E3E42]">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {capitalizedName}
        </div>
        <div className="text-[10px] text-gray-500">integration-layer</div>
      </div>
      <div className="py-2 flex-1 overflow-y-auto custom-scrollbar">
        {fileStructure.map((node) => renderNode(node))}
      </div>
    </div>
  );
}

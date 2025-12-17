'use client';

/**
 * NoteCard Component
 *
 * Displays a single note with actions. Demonstrates:
 * - Client component patterns
 * - Optimistic UI updates
 * - Action handlers
 */

import { useState } from 'react';
import { Trash2, Pin, PinOff } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string | null;
  color: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
}

const colorClasses: Record<string, string> = {
  yellow: 'bg-yellow-50 border-yellow-200',
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  pink: 'bg-pink-50 border-pink-200',
  purple: 'bg-purple-50 border-purple-200',
};

export function NoteCard({ note, onDelete, onTogglePin }: NoteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const colorClass = note.color
    ? colorClasses[note.color] ?? 'bg-white border-gray-200'
    : 'bg-white border-gray-200';

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(note.id);
  };

  const handleTogglePin = () => {
    onTogglePin(note.id, !note.pinned);
  };

  return (
    <div
      className={`
        relative p-4 rounded-lg border-2 transition-all
        ${colorClass}
        ${isDeleting ? 'opacity-50' : ''}
        ${note.pinned ? 'ring-2 ring-blue-300' : ''}
      `}
    >
      {/* Pin indicator */}
      {note.pinned && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
          <Pin className="h-3 w-3" />
        </div>
      )}

      {/* Title */}
      <h3 className="font-semibold text-gray-900 mb-2 pr-16">{note.title}</h3>

      {/* Content */}
      {note.content && (
        <p className="text-gray-600 text-sm line-clamp-3 mb-3">{note.content}</p>
      )}

      {/* Footer with timestamp and actions */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>

        <div className="flex gap-1">
          {/* Toggle Pin */}
          <button
            onClick={handleTogglePin}
            className="p-1.5 rounded hover:bg-black/5 transition-colors"
            title={note.pinned ? 'Unpin' : 'Pin'}
          >
            {note.pinned ? (
              <PinOff className="h-4 w-4" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded hover:bg-red-100 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

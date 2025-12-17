'use client';

/**
 * CreateNoteForm Component
 *
 * Form for creating new notes. Demonstrates:
 * - Form handling with useState
 * - Validation feedback
 * - Loading states
 * - Color picker UI
 */

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface CreateNoteFormProps {
  onSubmit: (data: { title: string; content?: string; color?: string }) => Promise<void>;
}

const colors = [
  { value: 'yellow', bg: 'bg-yellow-200', ring: 'ring-yellow-400' },
  { value: 'blue', bg: 'bg-blue-200', ring: 'ring-blue-400' },
  { value: 'green', bg: 'bg-green-200', ring: 'ring-green-400' },
  { value: 'pink', bg: 'bg-pink-200', ring: 'ring-pink-400' },
  { value: 'purple', bg: 'bg-purple-200', ring: 'ring-purple-400' },
];

export function CreateNoteForm({ onSubmit }: CreateNoteFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim() || undefined,
        color,
      });

      // Reset form on success
      setTitle('');
      setContent('');
      setColor(undefined);
      setIsOpen(false);
    } catch {
      setError('Failed to create note');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="
          w-full p-4 border-2 border-dashed border-gray-300 rounded-lg
          text-gray-500 hover:border-gray-400 hover:text-gray-600
          transition-colors flex items-center justify-center gap-2
        "
      >
        <Plus className="h-5 w-5" />
        Add Note
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-2 border-gray-200 rounded-lg bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-700">New Note</span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded">
          {error}
        </div>
      )}

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="
          w-full px-3 py-2 border border-gray-300 rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          mb-3
        "
        autoFocus
      />

      {/* Content */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Note content (optional)"
        rows={3}
        className="
          w-full px-3 py-2 border border-gray-300 rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          mb-3 resize-none
        "
      />

      {/* Color picker */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600">Color:</span>
        <div className="flex gap-1">
          {colors.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value === color ? undefined : c.value)}
              className={`
                w-6 h-6 rounded-full ${c.bg}
                ${color === c.value ? `ring-2 ${c.ring}` : ''}
              `}
              title={c.value}
            />
          ))}
        </div>
        {color && (
          <button
            type="button"
            onClick={() => setColor(undefined)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="
          w-full py-2 px-4 bg-blue-600 text-white rounded-md
          hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
      >
        {isSubmitting ? 'Creating...' : 'Create Note'}
      </button>
    </form>
  );
}

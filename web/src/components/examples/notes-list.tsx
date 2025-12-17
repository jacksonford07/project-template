'use client';

/**
 * NotesList Component
 *
 * Client component that manages notes state and actions.
 * Demonstrates:
 * - Data fetching with useEffect
 * - Optimistic updates
 * - Error handling
 * - Loading states
 */

import { useState, useEffect, useCallback } from 'react';
import { NoteCard } from './note-card';
import { CreateNoteForm } from './create-note-form';

interface Note {
  id: string;
  title: string;
  content: string | null;
  color: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export function NotesList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes on mount
  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch('/api/internal/notes');
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      const data = await response.json();
      setNotes(data);
      setError(null);
    } catch {
      setError('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Create a new note
  const handleCreate = async (data: {
    title: string;
    content?: string;
    color?: string;
  }) => {
    const response = await fetch('/api/internal/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create note');
    }

    const newNote = await response.json();
    setNotes((prev) => [newNote, ...prev]);
  };

  // Delete a note (optimistic update)
  const handleDelete = async (id: string) => {
    // Optimistic: remove from UI immediately
    const previousNotes = notes;
    setNotes((prev) => prev.filter((n) => n.id !== id));

    try {
      const response = await fetch(`/api/internal/notes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }
    } catch {
      // Rollback on failure
      setNotes(previousNotes);
    }
  };

  // Toggle pin status (optimistic update)
  const handleTogglePin = async (id: string, pinned: boolean) => {
    // Optimistic: update in UI immediately
    const previousNotes = notes;
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned } : n))
    );

    try {
      const response = await fetch(`/api/internal/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned }),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      // Refetch to get correct sort order
      await fetchNotes();
    } catch {
      // Rollback on failure
      setNotes(previousNotes);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <p className="font-medium">Error</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchNotes}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create form */}
      <CreateNoteForm onSubmit={handleCreate} />

      {/* Notes grid */}
      {notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No notes yet. Create your first note above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

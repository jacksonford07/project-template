/**
 * Notes Seed Data
 *
 * Creates sample notes for testing the Notes feature.
 */

import { PrismaClient } from '@prisma/client';
import type { SeededUser } from './users';

export interface SeededNote {
  id: string;
  title: string;
  userId: string;
}

const NOTE_COLORS = ['yellow', 'blue', 'green', 'pink', 'purple', null];

const SAMPLE_NOTES = [
  {
    title: 'Welcome to Notes',
    content: 'This is your first note. You can edit, pin, or delete it.',
    pinned: true,
    color: 'yellow',
  },
  {
    title: 'Meeting Notes',
    content: `## Agenda
- Review Q4 goals
- Discuss roadmap
- Team updates

## Action Items
- [ ] Follow up with design team
- [ ] Schedule next sync
- [ ] Update documentation`,
    pinned: false,
    color: 'blue',
  },
  {
    title: 'Ideas for New Features',
    content: `1. Dark mode support
2. Export to PDF
3. Collaborative editing
4. Tags and categories
5. Search improvements`,
    pinned: false,
    color: 'green',
  },
  {
    title: 'Shopping List',
    content: `- Milk
- Bread
- Eggs
- Coffee
- Fruits`,
    pinned: false,
    color: 'pink',
  },
  {
    title: 'Quick Tip',
    content: 'Press Ctrl+S to save your changes quickly!',
    pinned: false,
    color: 'purple',
  },
  {
    title: 'Project Deadlines',
    content: `**Phase 1**: Jan 15
**Phase 2**: Feb 28
**Launch**: March 15

Don't forget to update the stakeholders!`,
    pinned: true,
    color: 'yellow',
  },
  {
    title: 'Book Recommendations',
    content: `- Clean Code by Robert Martin
- The Pragmatic Programmer
- Designing Data-Intensive Applications
- System Design Interview`,
    pinned: false,
    color: null,
  },
  {
    title: 'API Endpoints to Review',
    content: `GET /api/users
POST /api/users
GET /api/projects/:id
PATCH /api/projects/:id

Need to add rate limiting to all endpoints.`,
    pinned: false,
    color: 'blue',
  },
];

export async function seedNotes(
  prisma: PrismaClient,
  users: SeededUser[]
): Promise<SeededNote[]> {
  console.log('Seeding notes...');

  const notes: SeededNote[] = [];

  // Get users who should have notes (not guests)
  const usersWithNotes = users.filter((u) => u.accountType !== 'GUEST');

  if (usersWithNotes.length === 0) {
    console.log('  ⚠ No eligible users found, skipping notes');
    return notes;
  }

  for (const user of usersWithNotes) {
    // Each user gets a random subset of notes
    const userNotes = SAMPLE_NOTES.slice(0, Math.floor(Math.random() * 4) + 3);

    for (const noteData of userNotes) {
      // Check if note already exists for this user
      const existingNote = await prisma.note.findFirst({
        where: {
          title: noteData.title,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (existingNote) {
        notes.push({
          id: existingNote.id,
          title: existingNote.title,
          userId: existingNote.userId,
        });
        continue;
      }

      const note = await prisma.note.create({
        data: {
          ...noteData,
          userId: user.id,
        },
      });
      notes.push({
        id: note.id,
        title: note.title,
        userId: note.userId,
      });
    }
    console.log(`  ✓ Created ${userNotes.length} notes for ${user.email}`);
  }

  console.log(`Seeded ${notes.length} total notes`);
  return notes;
}

/**
 * Example Page
 *
 * This page demonstrates the template patterns in action:
 * - Server component with auth check
 * - Client component for interactivity
 * - Database integration
 * - API routes usage
 *
 * This is a fully functional Notes feature you can:
 * 1. Learn from as a reference implementation
 * 2. Modify to fit your needs
 * 3. Remove entirely when starting your project
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NotesList } from '@/components/examples/notes-list';
import Link from 'next/link';

export default async function ExamplePage() {
  const session = await auth();

  // Redirect unauthenticated users
  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/example');
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
              <p className="text-sm text-gray-500">
                Example feature demonstrating template patterns
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session.user?.name ?? session.user?.email}
              </span>
              <Link
                href="/api/auth/signout"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Info banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-medium text-blue-900">Template Example</h2>
          <p className="text-sm text-blue-700 mt-1">
            This is a working Notes feature that demonstrates the template&apos;s patterns:
            API routes, database operations, soft deletes, rate limiting, and client components.
            Feel free to explore the code or remove this feature when starting your project.
          </p>
          <div className="mt-2 flex gap-2 text-xs">
            <code className="bg-blue-100 px-1.5 py-0.5 rounded">
              src/app/example/
            </code>
            <code className="bg-blue-100 px-1.5 py-0.5 rounded">
              src/app/api/internal/notes/
            </code>
            <code className="bg-blue-100 px-1.5 py-0.5 rounded">
              src/components/examples/
            </code>
          </div>
        </div>

        {/* Notes list */}
        <NotesList />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <p className="text-sm text-gray-500 text-center">
            Built with Next.js, Prisma, and NextAuth &middot;{' '}
            <Link href="/" className="text-blue-600 hover:underline">
              Back to Home
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}

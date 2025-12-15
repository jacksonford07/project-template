'use client';

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Input,
  Avatar,
  AvatarGroup,
  Spinner,
} from '@/components/ui';

export default function Home(): React.ReactElement {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <Badge variant="primary" className="mb-4">
            Project Template v1.0
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Next.js Starter
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Production-ready template with TypeScript, Prisma, BMAD Method, and beautiful UI
            components out of the box.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="outline">
              View Docs
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What&apos;s Included</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card hover>
            <CardHeader>
              <CardTitle>TypeScript Strict Mode</CardTitle>
              <CardDescription>Full type safety with strict compiler options</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="success" dot>
                Configured
              </Badge>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle>BMAD Method</CardTitle>
              <CardDescription>AI-driven development with specialized agents</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="primary" dot>
                7 Agents
              </Badge>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle>Prisma ORM</CardTitle>
              <CardDescription>Type-safe database access with migrations</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="info" dot>
                PostgreSQL
              </Badge>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>NextAuth v5 with Prisma adapter ready</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="warning" dot>
                Configure Provider
              </Badge>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle>UI Components</CardTitle>
              <CardDescription>Beautiful, accessible components included</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="success" dot>
                10+ Components
              </Badge>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle>CI/CD Pipeline</CardTitle>
              <CardDescription>GitHub Actions workflow configured</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="success" dot>
                Ready
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Component Showcase */}
      <div className="bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Component Preview</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="outline">Outline</Button>
                  <Button loading>Loading</Button>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="info" dot>
                    With Dot
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Inputs */}
            <Card>
              <CardHeader>
                <CardTitle>Inputs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input label="Email" placeholder="you@example.com" />
                  <Input label="Password" type="password" hint="Must be 8+ characters" />
                  <Input label="Error State" error="This field is required" />
                </div>
              </CardContent>
            </Card>

            {/* Avatars */}
            <Card>
              <CardHeader>
                <CardTitle>Avatars</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar name="John Doe" size="sm" />
                    <Avatar name="Jane Smith" size="md" />
                    <Avatar name="Bob Wilson" size="lg" />
                    <Avatar name="Alice Brown" size="xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Avatar Group:</p>
                    <AvatarGroup>
                      <Avatar name="John Doe" />
                      <Avatar name="Jane Smith" />
                      <Avatar name="Bob Wilson" />
                      <Avatar name="Alice Brown" />
                      <Avatar name="Charlie Davis" />
                      <Avatar name="Eve Miller" />
                    </AvatarGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get up and running in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100 overflow-x-auto">
              <pre>{`# Install dependencies
cd web && pnpm install

# Set up environment
cp .env.example .env

# Start database
docker-compose up -d

# Run migrations
pnpm prisma migrate dev --name init

# Start development
pnpm dev`}</pre>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">
              View Full Docs
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-gray-500 text-sm">
          <p>Built with Next.js 15, TypeScript, Tailwind CSS, and BMAD Method</p>
        </div>
      </footer>
    </main>
  );
}

/**
 * Project Seed Data
 *
 * Creates test projects and assigns users to them.
 */

import { PrismaClient, ProjectStatus, ProjectRole } from '@prisma/client';
import type { SeededUser } from './users';

export interface SeededProject {
  id: string;
  name: string;
  status: ProjectStatus;
}

export async function seedProjects(
  prisma: PrismaClient,
  users: SeededUser[]
): Promise<SeededProject[]> {
  console.log('Seeding projects...');

  const projects: SeededProject[] = [];

  // Find admin and regular users
  const admin = users.find((u) => u.accountType === 'ADMIN');
  const regularUsers = users.filter((u) => u.accountType === 'USER');

  if (!admin) {
    console.log('  ⚠ No admin user found, skipping projects');
    return projects;
  }

  // Project definitions
  const projectData = [
    {
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design and improved UX.',
      status: 'ACTIVE' as ProjectStatus,
      externalId: 'proj-001',
    },
    {
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android platforms.',
      status: 'ACTIVE' as ProjectStatus,
      externalId: 'proj-002',
    },
    {
      name: 'API Integration',
      description: 'Third-party API integrations for payment processing and analytics.',
      status: 'ACTIVE' as ProjectStatus,
      externalId: 'proj-003',
    },
    {
      name: 'Legacy Migration',
      description: 'Migration of legacy systems to new architecture.',
      status: 'ARCHIVED' as ProjectStatus,
      externalId: 'proj-004',
    },
  ];

  for (const data of projectData) {
    const project = await prisma.project.upsert({
      where: { externalId: data.externalId },
      update: {},
      create: {
        ...data,
        lastSyncedAt: new Date(),
      },
    });
    projects.push({
      id: project.id,
      name: project.name,
      status: project.status,
    });
    console.log(`  ✓ Created project: ${project.name}`);

    // Assign admin as owner
    await prisma.userProject.upsert({
      where: {
        userId_projectId: {
          userId: admin.id,
          projectId: project.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        projectId: project.id,
        role: 'OWNER',
      },
    });

    // Assign regular users with different roles
    for (let i = 0; i < regularUsers.length; i++) {
      const user = regularUsers[i];
      const role: ProjectRole = i === 0 ? 'EDITOR' : 'VIEWER';

      await prisma.userProject.upsert({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId: project.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          projectId: project.id,
          role,
        },
      });
    }
  }

  console.log(`Seeded ${projects.length} projects with user assignments`);
  return projects;
}

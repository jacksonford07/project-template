/**
 * Seed Data Index
 *
 * Exports all seed functions for use by the main seed script.
 * Add new seed modules here as your schema grows.
 */

export { seedUsers } from './users';
export type { SeededUser } from './users';

export { seedProjects } from './projects';
export type { SeededProject } from './projects';

export { seedNotes } from './notes';
export type { SeededNote } from './notes';

# Story: STORY-001 Add User Profile Editing

## Overview
Allow users to edit their profile information (name, email, avatar) from a dedicated settings page.

## User Story
**As a** registered user
**I want to** edit my profile information
**So that** I can keep my account details up to date

## Acceptance Criteria

### AC-1: Profile Settings Page
- [ ] User can navigate to /settings/profile from the header menu
- [ ] Page displays current profile information (name, email, avatar)
- [ ] Page shows "Save Changes" button (disabled until changes made)

### AC-2: Edit Name
- [ ] User can edit their display name
- [ ] Name must be 2-50 characters
- [ ] Invalid names show inline error message
- [ ] Saving updates the name across the application

### AC-3: Edit Email
- [ ] User can edit their email address
- [ ] Email must be valid format
- [ ] Duplicate emails show error "Email already in use"
- [ ] Email change requires re-verification (out of scope for this story)

### AC-4: Upload Avatar
- [ ] User can upload a new avatar image
- [ ] Accepted formats: JPG, PNG, WebP
- [ ] Max file size: 2MB
- [ ] Image is cropped to square and resized to 200x200
- [ ] Preview shown before saving

### AC-5: Success Feedback
- [ ] Toast notification "Profile updated successfully" on save
- [ ] Form resets dirty state after successful save
- [ ] "Save Changes" button disabled again after save

## Technical Notes

### Files to Modify
- `src/app/(dashboard)/settings/profile/page.tsx` - New page
- `src/components/settings/profile-form.tsx` - New component
- `src/lib/api/middleware.ts` - Add file upload handling

### New Files to Create
- `src/app/api/internal/users/me/route.ts` - GET/PATCH current user
- `src/app/api/internal/users/me/avatar/route.ts` - POST avatar upload
- `src/lib/validations/user.ts` - Update validation schemas

### Database Changes
- [ ] No schema changes required (using existing User table)

### Dependencies
- None - uses existing auth system

## Tasks

Execute in order. Do not skip ahead.

### Task 1: API Endpoints
- [ ] Create GET /api/internal/users/me endpoint
- [ ] Create PATCH /api/internal/users/me endpoint
- [ ] Write tests for both endpoints
- [ ] Verify endpoints work via curl/Postman

### Task 2: Profile Form Component
- [ ] Write failing test for ProfileForm component
- [ ] Create ProfileForm with name and email fields
- [ ] Add validation using Zod schema
- [ ] Implement form submission with loading state
- [ ] Add toast notification on success

### Task 3: Avatar Upload
- [ ] Create POST /api/internal/users/me/avatar endpoint
- [ ] Add file upload handling with size/type validation
- [ ] Create avatar upload component with preview
- [ ] Test upload flow end-to-end

### Task 4: Settings Page
- [ ] Create /settings/profile page
- [ ] Add navigation link in header/sidebar
- [ ] Integrate ProfileForm and avatar components
- [ ] Add loading skeleton while data fetches

### Task 5: Verification
- [ ] All tests passing
- [ ] Manual verification of all AC
- [ ] No lint errors
- [ ] Type check passes
- [ ] Test on mobile viewport

## Definition of Done
- [ ] All acceptance criteria verified
- [ ] All tests passing (unit + integration)
- [ ] No new lint warnings
- [ ] Toast notifications working
- [ ] Form validation working
- [ ] Avatar upload working

## Dev Agent Record

### Implementation Log
| Task | Status | Notes | Timestamp |
|------|--------|-------|-----------|
| Task 1 | Complete | Used createHandler pattern | 2024-01-15 10:30 |
| Task 2 | Complete | Added useForm hook | 2024-01-15 11:45 |
| Task 3 | Complete | Using sharp for image processing | 2024-01-15 14:00 |
| Task 4 | Complete | | 2024-01-15 15:30 |
| Task 5 | Complete | All tests green | 2024-01-15 16:00 |

### Blockers Encountered
- Image upload initially failed due to body size limit. Fixed by adding `export const config = { api: { bodyParser: { sizeLimit: '4mb' } } }` to route.

### Decisions Made
- Used sharp library for image processing (already in project deps)
- Stored avatars in /public/avatars with userId as filename
- Added optimistic UI update for better UX

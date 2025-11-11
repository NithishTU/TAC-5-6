# Feature: Task Filter and Search

## Metadata
issue_number: `1`
adw_id: `400b43af`
issue_json: `{"number":1,"title":"Task Filter and Search","body":"  Add filtering and search functionality to the Kanban board to help users find tasks quickly. Currently, users have to\n  manually scan through all tasks to find what they're looking for. This feature will provide a search bar and filter dropdowns    \n   to narrow down visible tasks."}`

## Feature Description
Implement comprehensive filtering and search functionality for the Kanban board to enable users to quickly locate specific tasks without manually scanning through all columns. The feature includes a real-time search input with debouncing, status filter dropdown, assignee filter dropdown, clear filters button with active filter count indicator, and a "no results" message when filters return no matches. The filtering supports AND logic when multiple filters are applied simultaneously.

## User Story
As a developer using the Kanban board
I want to filter and search for tasks by title, description, status, and assignee
So that I can quickly find specific tasks without manually scanning through all columns

## Problem Statement
Currently, users must manually scan through all tasks across all Kanban columns to find what they're looking for. As the number of tasks grows, this becomes increasingly time-consuming and inefficient. Users need a way to quickly narrow down visible tasks based on search queries and specific criteria like status and assignee.

## Solution Statement
Implement a filter panel above the Kanban board with three filtering mechanisms: a search input that filters by title and description in real-time with debouncing to reduce API calls, a status dropdown to filter by task status (backlog, todo, in_progress, in_review, done), and an assignee dropdown to filter by assigned user. All filters work together with AND logic, and a clear filters button with an active filter count badge allows users to reset all filters at once. The backend API supports query parameters for filtering, and the frontend uses React Query for efficient data fetching and caching.

## Relevant Files
Use these files to implement the feature:

- **app/client/src/pages/Kanban.tsx** - Main Kanban board component that needs filter UI and state management
  - Already contains the complete filter implementation with search, status, and assignee filters
  - Includes debouncing logic for search input (300ms delay)
  - Implements filter state management and clear filters functionality
  - Shows active filter count and task count
  - Displays "no results" message when filters return no matches

- **app/server/core/routers/tasks.py** - Tasks API router that needs filtering query parameters
  - Already implements list_tasks endpoint with optional filtering
  - Supports status_filter, assignee_id, and search query parameters
  - Search uses ilike for case-insensitive matching on title and description
  - Returns filtered tasks ordered by position and created_at

- **app/client/src/api/client.ts** - API client that needs to support filter parameters
  - tasksAPI.list() already supports params object with status, assignee, and search
  - Uses axios params for clean query parameter handling

- **app/client/src/types/index.ts** - TypeScript interfaces for Task and User types
  - Already contains complete Task and User interface definitions
  - No changes needed as all required fields are present

- **app/server/core/models.py** - Database models for Task and User
  - Task model already has all required fields (title, description, status, assignee_id)
  - User model supports relationships with tasks
  - No schema changes needed

- **app/server/core/schemas.py** - Pydantic schemas for validation
  - TaskResponse already includes assignee relationship
  - No changes needed to schemas

### New Files

- **.claude/commands/e2e/test_task_filter_search.md** - E2E test file to validate the filter and search functionality
  - Already created with comprehensive test steps
  - Validates search input, status filter, assignee filter, multiple filters, clear filters, and no results state
  - Includes 8+ screenshots for visual validation
  - Tests debouncing behavior and AND logic for multiple filters

## Implementation Plan

### Phase 1: Foundation
The foundational work involves understanding the existing Kanban board structure, Task and User data models, and the API patterns used for fetching tasks. The backend already supports filtering through query parameters in the tasks router, and the frontend uses React Query for data fetching. The filter UI components will be built using Tailwind CSS following existing design patterns in the application.

### Phase 2: Core Implementation
The core implementation adds filter state management to the Kanban component using React hooks (useState, useEffect), implements a debounced search input to reduce API calls while providing responsive user experience, creates dropdown filters for status and assignee selection, and updates the React Query queryKey to include filter parameters so data refetches automatically when filters change. The filter panel displays active filter count and task count, with appropriate loading states.

### Phase 3: Integration
Integration involves connecting the filter UI to the backend API by passing filter parameters through the tasksAPI.list() method, ensuring the queryClient properly invalidates and refetches data when filters change, adding a clear filters button that resets all filter state, and displaying a "no results" message with a clear filters link when no tasks match the current filters. The feature seamlessly integrates with existing task management functionality (create, move, delete tasks).

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Verify Backend Filter Support
- Read app/server/core/routers/tasks.py to confirm the list_tasks endpoint supports filtering
- Verify status_filter, assignee_id, and search query parameters are implemented
- Confirm the search uses case-insensitive matching (ilike) on title and description fields
- Verify the query returns properly ordered results

### Step 2: Update API Client
- Read app/client/src/api/client.ts
- Verify tasksAPI.list() supports params object with status, assignee, and search
- Ensure axios correctly serializes query parameters
- No changes needed if already implemented

### Step 3: Implement Filter State Management
- Read app/client/src/pages/Kanban.tsx
- Add state variables for searchQuery, statusFilter, assigneeFilter
- Add debouncedSearch state with useEffect hook (300ms delay)
- Update React Query queryKey to include filter parameters: ['tasks', debouncedSearch, statusFilter, assigneeFilter]

### Step 4: Create Filter UI Panel
- Add filter panel card above the Kanban board columns
- Create search input with placeholder "Search tasks..."
- Create status filter dropdown with "All Statuses" option and all status values
- Create assignee filter dropdown with "All Assignees" option populated from users query
- Style using Tailwind CSS classes following existing patterns

### Step 5: Implement Clear Filters Functionality
- Create handleClearFilters function that resets all filter state
- Create getActiveFilterCount function that counts active filters
- Add Clear Filters button with active filter count badge
- Disable button when no filters are active (count === 0)

### Step 6: Add Filter Status Display
- Display task count with "(filtered)" text when filters are active
- Show active filter count in blue text
- Add loading indicator when isLoading is true
- Display "Found X task(s)" message below filter panel

### Step 7: Implement No Results State
- Add conditional rendering when tasks.length === 0 and activeFilterCount > 0
- Display "No tasks found matching your filters" message
- Add "Clear all filters" link that calls handleClearFilters
- Style the no results card appropriately

### Step 8: Create E2E Test File
- Read .claude/commands/test_e2e.md to understand the E2E test runner
- Read .claude/commands/e2e/test_basic_query.md as an example E2E test
- Create .claude/commands/e2e/test_task_filter_search.md with comprehensive test steps
- Include test steps for: search input, status filter, assignee filter, multiple filters, clear filters, no results state
- Specify at least 8 screenshots to capture throughout the test
- Define clear success criteria for each filtering mechanism

### Step 9: Test Backend Filter Endpoints
- Write unit tests in app/server/tests/test_tasks.py for filtering functionality
- Test search parameter filters by title and description
- Test status filter parameter
- Test assignee filter parameter
- Test multiple filters combined (AND logic)
- Test empty results when no matches found

### Step 10: Run Validation Commands
- Execute all validation commands listed below to ensure zero regressions
- Run backend tests with pytest
- Run frontend type checking with tsc --noEmit
- Run frontend build
- Execute E2E test to validate the feature works end-to-end

## Testing Strategy

### Unit Tests
- **Backend Tests (app/server/tests/test_tasks.py)**:
  - test_filter_tasks_by_status: Verify status filter returns only matching tasks
  - test_filter_tasks_by_assignee: Verify assignee filter returns only assigned tasks
  - test_search_tasks_by_title: Verify search matches title field (case-insensitive)
  - test_search_tasks_by_description: Verify search matches description field
  - test_multiple_filters_combined: Verify AND logic when multiple filters applied
  - test_no_results_with_filters: Verify empty array when no matches found

- **Frontend Type Safety**:
  - Run tsc --noEmit to catch any TypeScript errors
  - Verify proper types for filter parameters in API client
  - Ensure Task and User interfaces match backend schemas

### Edge Cases
- Empty search query returns all tasks
- Search with special characters (quotes, backslashes, SQL-like patterns)
- Filter by non-existent assignee ID returns empty results
- Filter by invalid status value (should be rejected by validation)
- Multiple filters with no matching results shows no results message
- Debouncing prevents excessive API calls during rapid typing
- Filters persist correctly when creating, moving, or deleting tasks
- Clear filters button correctly resets all filter state
- Active filter count updates correctly when filters change
- No results message appears/disappears appropriately

## Acceptance Criteria
- Search input filters tasks by title and description in real-time with 300ms debouncing
- Status filter dropdown shows all status options and filters correctly
- Assignee filter dropdown shows all users and filters by assigned tasks
- Multiple filters work together with AND logic (all conditions must match)
- Clear Filters button resets all filters and shows active filter count badge
- Active filter count displays correctly (1, 2, or 3 filters)
- Filter status shows task count and "(filtered)" indicator when filters active
- No results message displays when filters return zero tasks
- Clear filters link in no results message works correctly
- All existing task management features work without regression (create, move, delete)
- Backend API returns filtered results efficiently with proper query optimization
- Frontend uses React Query caching to minimize unnecessary API calls
- UI is responsive and works well on different screen sizes
- Loading states display appropriately during data fetching
- E2E test passes with all screenshots captured

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read .claude/commands/test_e2e.md to understand how to run E2E tests
- Read and execute .claude/commands/e2e/test_task_filter_search.md to validate the filter and search functionality works end-to-end with screenshots
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && bun tsc --noEmit` - Run frontend type checking to validate the feature works with zero regressions
- `cd app/client && bun run build` - Run frontend build to validate the feature works with zero regressions

## Notes
- The feature has already been fully implemented in the codebase (app/client/src/pages/Kanban.tsx and app/server/core/routers/tasks.py)
- An E2E test file (.claude/commands/e2e/test_task_filter_search.md) already exists with comprehensive test steps
- The debounce delay is set to 300ms which provides good balance between responsiveness and API call reduction
- The backend uses SQLAlchemy's ilike() for case-insensitive search matching on both title and description
- React Query's queryKey includes all filter parameters, ensuring automatic refetching when filters change
- The filter panel follows existing design patterns using Tailwind CSS utility classes
- Active filter count badge uses a white background with blue text for good contrast
- The Clear Filters button is disabled (grayed out) when no filters are active to prevent confusion
- No additional libraries were needed as the feature uses existing dependencies (React Query, Axios, Tailwind CSS)
- Consider adding additional filters in the future: labels filter, date range filter, priority filter
- Consider adding filter presets or saved filter combinations for power users
- Consider adding URL query parameters to allow bookmarking/sharing filtered views

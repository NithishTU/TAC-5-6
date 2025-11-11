# Feature: Task Filter and Search

## Metadata
issue_number: `1`
adw_id: `5ea09d42`
issue_json: `{"number":1,"title":"Task Filter and Search","body":"  Add filtering and search functionality to the Kanban board to help users find tasks quickly. Currently, users have to\n  manually scan through all tasks to find what they're looking for. This feature will provide a search bar and filter dropdowns    \n   to narrow down visible tasks."}`

## Feature Description
This feature adds comprehensive filtering and search capabilities to the Kanban board to help users quickly locate specific tasks. The implementation includes a search bar for text-based queries and filter dropdowns for status, assignee, and labels. The search functionality will query tasks in real-time based on title and description, while filters will allow users to narrow results by task properties. All filtering happens on both the frontend (for immediate UI feedback) and backend (for data accuracy), with URL parameters to maintain filter state across page refreshes.

## User Story
As a developer using the Dev Dashboard
I want to filter and search tasks on the Kanban board
So that I can quickly find specific tasks without manually scanning through all columns

## Problem Statement
Currently, users must manually scan through all five Kanban columns (Backlog, To Do, In Progress, In Review, Done) to find specific tasks. As the number of tasks grows, this becomes increasingly time-consuming and inefficient. Users need the ability to:
- Search for tasks by title or description text
- Filter tasks by status (column)
- Filter tasks by assignee
- Filter tasks by labels
- Combine multiple filters for refined searches
- See real-time results as they type or change filters

## Solution Statement
Implement a comprehensive filtering and search system that:
1. Adds a search input field above the Kanban board that searches task titles and descriptions in real-time
2. Provides filter dropdowns for status, assignee, and labels
3. Uses the existing backend API filtering capabilities (already supports status, assignee, and search parameters)
4. Maintains filter state in URL query parameters for shareable filtered views
5. Shows a visual indicator of active filters with clear/reset functionality
6. Displays filtered task counts in each column
7. Provides smooth user experience with debounced search input to avoid excessive API calls

## Relevant Files
Use these files to implement the feature:

- `app/client/src/pages/Kanban.tsx` (line 14-185) - Main Kanban board component where filters will be added. Already uses React Query for task fetching and has a basic task list query. Need to extend this to include filter parameters.

- `app/client/src/api/client.ts` (line 37-58) - Task API client that already supports filter parameters in the `list` method (status, assignee, search). No changes needed here, just need to utilize the existing parameters.

- `app/server/core/routers/tasks.py` (line 16-45) - Backend task list endpoint that already implements filtering logic for status, assignee, and search. The search uses SQL `ILIKE` for case-insensitive partial matching on title and description fields.

- `app/client/src/types/index.ts` (line 11-23) - TypeScript interfaces for Task type. Labels are already defined as `string[]` type, which will be used for label filtering.

- `app/server/core/models.py` (line 43-67) - Task database model that includes all filterable fields (status, assignee_id, labels, title, description). Labels are stored as JSON field.

### New Files

- `.claude/commands/e2e/test_task_filter_search.md` - E2E test file to validate the task filtering and search functionality works correctly. Should test search input, status filter, assignee filter, label filter, combined filters, and clear filters.

## Implementation Plan

### Phase 1: Foundation
Create the UI components for the filter and search controls:
- Add search input field with debounce (300ms) to minimize API calls
- Add status filter dropdown (multi-select or single-select)
- Add assignee filter dropdown (populated from users who have assigned tasks)
- Add label filter (multi-select from existing labels across all tasks)
- Add "Clear Filters" button to reset all filters
- Add visual indicator showing active filter count

### Phase 2: Core Implementation
Integrate filtering logic with the existing API:
- Extend the React Query `useQuery` hook in Kanban.tsx to accept filter parameters
- Wire up filter controls to update query parameters
- Use URL query parameters to persist filter state (enables shareable filtered views)
- Implement debounced search input to avoid excessive API calls
- Update task count display in column headers to reflect filtered results
- Add loading states during filter operations

### Phase 3: Integration
Polish the user experience and ensure proper integration:
- Style the filter controls to match existing dashboard design (Tailwind CSS)
- Add smooth transitions when filters change
- Ensure filtered view works correctly with existing task operations (create, move, delete)
- Test filter combinations (search + status + assignee + labels)
- Add empty state message when no tasks match filters
- Ensure filter state persists in URL for bookmarking/sharing
- Verify all filtering works correctly with the existing backend API

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create E2E Test File
- Create `.claude/commands/e2e/test_task_filter_search.md` following the pattern from `test_basic_query.md`
- Include test steps to:
  - Navigate to Kanban board
  - Verify search input is present
  - Create several test tasks with different statuses, labels, and titles
  - Test search functionality by entering text and verifying filtered results
  - Test status filter by selecting a status and verifying only tasks with that status appear
  - Test clearing filters and verifying all tasks reappear
  - Take screenshots at each major step (initial state, search active, filters active, cleared filters)
- Define success criteria for the test
- Include 4-5 screenshots showing the feature in action

### 2. Add Filter State Management to Kanban Component
- In `app/client/src/pages/Kanban.tsx`, add state variables for:
  - `searchQuery: string` (for search input)
  - `statusFilter: string[]` (for selected statuses, empty array means all)
  - `assigneeFilter: string[]` (for selected assignee IDs, empty array means all)
  - `labelFilter: string[]` (for selected labels, empty array means all)
- Add debounced search state using `useState` and `useEffect` with 300ms delay
- Update the `useQuery` hook to pass filter parameters to the API
- Add logic to build the filter params object based on state

### 3. Create Filter UI Components
- Add a filter bar container above the Kanban columns (below the "Quick Add Task" form)
- Add search input field with:
  - Placeholder: "Search tasks by title or description..."
  - Icon (magnifying glass)
  - Clear button (X) when text is entered
- Add status filter dropdown:
  - Multi-select checkboxes for: Backlog, To Do, In Progress, In Review, Done
  - "All Statuses" option to clear filter
- Add assignee filter dropdown:
  - Extract unique assignees from current tasks
  - Multi-select checkboxes for each assignee (show username)
  - "All Assignees" option to clear filter
- Add label filter:
  - Extract unique labels from all tasks
  - Multi-select checkboxes for each label
  - "All Labels" option to clear filter
- Add "Clear All Filters" button that resets all filter state
- Add active filter indicator badge showing count of active filters

### 4. Implement URL Query Parameter Sync
- Use `useSearchParams` from `react-router-dom` to sync filters with URL
- On mount, read URL params and initialize filter state
- When filters change, update URL params (without page reload)
- Support these query params:
  - `?search=<text>` for search query
  - `?status=<status1,status2>` for status filters (comma-separated)
  - `?assignee=<id1,id2>` for assignee filters (comma-separated)
  - `?labels=<label1,label2>` for label filters (comma-separated)
- Ensure URL params are properly encoded/decoded

### 5. Update Task Query Logic
- Modify the `tasksAPI.list()` call in the `useQuery` hook to include filter parameters
- Build filter params object from state:
  ```typescript
  const params = {
    search: debouncedSearchQuery || undefined,
    status: statusFilter.length > 0 ? statusFilter.join(',') : undefined,
    assignee: assigneeFilter.length > 0 ? assigneeFilter.join(',') : undefined,
  }
  ```
- Note: Backend already supports `status`, `assignee`, and `search` params
- For label filtering, implement frontend filtering since backend doesn't have label filter yet
- Update the `queryKey` to include filter params so React Query refetches when filters change

### 6. Implement Frontend Label Filtering
- Since the backend doesn't support label filtering yet, implement it in the frontend
- After fetching tasks, filter the results based on `labelFilter` state
- Only show tasks that have ALL selected labels (AND logic)
- Update `getTasksByColumn` function to apply label filter

### 7. Add Empty State and Loading States
- Show loading spinner or skeleton when filters are being applied
- Add empty state component when no tasks match the current filters:
  - Message: "No tasks found matching your filters"
  - Show active filter summary
  - "Clear Filters" button
- Ensure empty state is visually distinct from loading state

### 8. Style Filter Components
- Use existing Tailwind CSS classes from the codebase for consistency
- Match the design patterns from the existing "Quick Add Task" form
- Use `input`, `btn-primary`, `card` classes already defined in the app
- Ensure responsive design - filters should stack vertically on mobile
- Add smooth transitions for filter panel expand/collapse
- Use proper spacing and alignment with existing UI

### 9. Test All Filter Combinations
- Manually test each filter individually:
  - Search only
  - Status filter only
  - Assignee filter only
  - Label filter only
- Test combinations:
  - Search + status filter
  - Search + assignee filter
  - All filters together
- Test edge cases:
  - Empty search query
  - No matching results
  - All filters cleared
  - Special characters in search
- Verify URL params update correctly for all combinations

### 10. Run Validation Commands
- Execute all validation commands to ensure zero regressions
- Run E2E test to validate the feature works end-to-end
- Fix any issues that arise during validation

## Testing Strategy

### Unit Tests
- Test debounce logic for search input
- Test filter state updates correctly when URL params change
- Test filter params are correctly built from state
- Test label filtering logic (frontend)
- Test "Clear Filters" resets all state
- Test active filter count calculation

### Edge Cases
- Empty search query (should show all tasks)
- Search with no results (show empty state)
- Selecting all statuses (equivalent to no filter)
- Special characters in search query (ensure proper encoding)
- URL params with invalid values (handle gracefully)
- Multiple filters with no matching tasks
- Tasks with no labels when label filter is active
- Tasks with no assignee when assignee filter is active
- Extremely long search queries (ensure UI doesn't break)
- Rapid filter changes (ensure debounce works correctly)

## Acceptance Criteria
- Search input filters tasks by title and description in real-time
- Status filter dropdown allows filtering by one or more statuses
- Assignee filter dropdown allows filtering by one or more assignees
- Label filter allows filtering by one or more labels
- "Clear Filters" button resets all filters to default state
- Active filter count badge shows number of active filters
- Filtered task counts display correctly in column headers
- URL query parameters reflect current filter state and can be shared
- Loading state shows while fetching filtered results
- Empty state displays when no tasks match filters
- All filters can be combined for refined searches
- Debounced search prevents excessive API calls (max 1 call per 300ms)
- Filter state persists across page refreshes via URL params
- Existing task operations (create, move, delete) work correctly with filters active

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_task_filter_search.md` to validate task filtering and search functionality works end-to-end
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && bun tsc --noEmit` - Run frontend type checking to validate the feature works with zero regressions
- `cd app/client && bun run build` - Run frontend build to validate the feature works with zero regressions

## Notes

### Backend API Already Supports Core Filtering
The backend task list endpoint (`/api/tasks`) already supports:
- `status` query parameter (filters by single status)
- `assignee` query parameter (filters by assignee ID)
- `search` query parameter (case-insensitive search in title and description)

This means the majority of filtering logic is already implemented on the backend. The frontend just needs to pass these parameters correctly.

### Label Filtering Requires Frontend Implementation
The backend does NOT currently support label filtering. For this feature, implement label filtering on the frontend by filtering the results after fetching from the API. If performance becomes an issue with large datasets, a future enhancement can add backend label filtering.

### URL Query Parameters for Shareability
Using URL query parameters allows users to:
- Bookmark specific filtered views
- Share filtered views with team members via URL
- Use browser back/forward buttons to navigate filter history

### Debouncing Search Input
Implement a 300ms debounce on the search input to prevent excessive API calls while the user is typing. This improves performance and reduces server load.

### Future Enhancements (Not in Scope)
- Backend label filtering support for better performance
- Saved filter presets/favorites
- Advanced search operators (AND/OR/NOT)
- Date range filtering (created_at, updated_at)
- Sort by options (created date, updated date, title)
- Filter by task position or priority
- Export filtered results to CSV

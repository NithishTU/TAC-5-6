# Feature: Task Filter and Search

## Metadata
issue_number: `1`
adw_id: `bc2412c3`
issue_json: `{"number":1,"title":"Task Filter and Search","body":"  Add filtering and search functionality to the Kanban board to help users find tasks quickly. Currently, users have to\n  manually scan through all tasks to find what they're looking for. This feature will provide a search bar and filter dropdowns    \n   to narrow down visible tasks."}`

## Feature Description
This feature adds comprehensive filtering and search capabilities to the Kanban board, enabling users to quickly locate tasks without manually scanning through all columns. The implementation includes a search bar for text-based queries and filter dropdowns for status and label-based filtering. The backend already supports filtering via query parameters (status, assignee, search), so this feature primarily involves adding the UI controls and integrating them with the existing API.

## User Story
As a developer using the Kanban board
I want to filter and search tasks by status, labels, and text content
So that I can quickly find specific tasks without manually scanning through all columns and improve my workflow efficiency

## Problem Statement
The current Kanban board displays all tasks across all columns, requiring users to manually scan through potentially hundreds of tasks to find what they're looking for. This becomes increasingly inefficient as the number of tasks grows. Users need a way to narrow down visible tasks based on specific criteria such as status, labels, assignee, or text search terms.

## Solution Statement
Add a filtering and search control panel above the Kanban board that includes:
1. A search input field that filters tasks by title and description in real-time
2. A status filter dropdown to show tasks from specific columns
3. A labels filter that allows filtering by one or more labels
4. Visual indicators showing active filters
5. A clear/reset button to remove all filters

The solution leverages the existing backend filtering API (`/api/tasks?status=...&search=...&assignee=...`) and implements client-side state management to control which filters are active.

## Relevant Files
Use these files to implement the feature:

- **app/client/src/pages/Kanban.tsx** (lines 1-185)
  - Main Kanban board component that needs the filter UI added
  - Already uses React Query for data fetching with `tasksAPI.list()`
  - Contains the COLUMNS constant defining available statuses
  - Needs to be updated to pass filter parameters to the API

- **app/client/src/api/client.ts** (lines 37-58)
  - Contains `tasksAPI.list()` which already accepts optional parameters: `{ status?: string; assignee?: string; search?: string }`
  - No changes required - already supports filtering

- **app/server/core/routers/tasks.py** (lines 16-45)
  - Backend endpoint `/api/tasks/` with existing filter support
  - Already implements status, assignee, and search filters
  - No changes required - backend is ready

- **app/server/core/models.py** (lines 43-66)
  - Task model with labels field (JSON type)
  - No changes required - model already supports what we need

- **app/client/src/types/index.ts** (lines 11-23)
  - Task interface definition
  - No changes required - already has all necessary fields

- **app/server/tests/test_tasks.py** (lines 159-171)
  - Existing test for filtering tasks by status
  - Will be used as reference for adding new filter tests

- **.claude/commands/test_e2e.md**
  - E2E test runner documentation
  - Will be used to understand how to create E2E tests

- **.claude/commands/e2e/test_basic_query.md**
  - Example E2E test file structure
  - Will be used as a template for the new filter E2E test

### New Files

- **.claude/commands/e2e/test_task_filter_search.md**
  - New E2E test file to validate the filter and search functionality works correctly
  - Will test search input, status filters, label filters, and clear filters functionality

## Implementation Plan
### Phase 1: Foundation
1. Add state management for filter parameters in the Kanban component (search text, selected status, selected labels)
2. Create reusable filter UI components following existing design patterns from the codebase
3. Extract unique labels from all tasks to populate the labels filter dropdown

### Phase 2: Core Implementation
1. Implement search input with debouncing to avoid excessive API calls
2. Implement status filter dropdown with multi-select or single-select capability
3. Implement labels filter with multi-select capability
4. Connect filter state to the React Query data fetching by passing parameters to `tasksAPI.list()`
5. Add visual indicators for active filters (badges showing count, highlighted filters)
6. Implement "Clear All Filters" button to reset all filter state

### Phase 3: Integration
1. Ensure filtered results update the Kanban columns correctly
2. Add loading states while filters are being applied
3. Add empty state messaging when no tasks match the filters
4. Test filter combinations (search + status, search + labels, all filters together)
5. Ensure filters persist across page navigation (optional: use URL query parameters)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Filter State Management to Kanban Component
- Add React state hooks for `searchQuery`, `statusFilter`, and `labelsFilter` in Kanban.tsx
- Initialize all filter states to empty/default values
- Create a `clearFilters` function to reset all filter state

### 2. Update API Query to Support Filters
- Modify the `useQuery` hook in Kanban.tsx to pass filter parameters to `tasksAPI.list()`
- Ensure query key includes filter parameters so React Query refetches when filters change
- Test that changing filter state triggers new API requests

### 3. Create Filter UI Panel Component
- Add a filter panel section above the Kanban board columns
- Create a search input field with a search icon and placeholder text "Search tasks..."
- Implement debouncing on the search input (300ms delay) to reduce API calls
- Style the filter panel to match the existing design system (using Tailwind classes)

### 4. Implement Status Filter Dropdown
- Add a status filter dropdown with options for each column (Backlog, To Do, In Progress, In Review, Done)
- Add an "All Statuses" option to show tasks from all columns
- Connect the dropdown to the `statusFilter` state
- Display the selected status in the dropdown

### 5. Implement Labels Filter
- Extract unique labels from all tasks to populate the labels filter
- Create a labels filter dropdown or multi-select component
- Connect the labels filter to the `labelsFilter` state
- Support multiple label selection if applicable
- Display selected labels as badges or chips

### 6. Add Active Filter Indicators
- Display badges showing the number of active filters
- Highlight active filter controls visually (e.g., different border color, background)
- Show the search query text if present
- Show selected status and labels as removable chips/badges

### 7. Implement Clear Filters Button
- Add a "Clear Filters" button that is only visible when filters are active
- Connect the button to the `clearFilters` function
- Ensure clicking it resets all filter state and refreshes the data

### 8. Add Empty State for No Results
- Detect when the filtered task list is empty
- Display a helpful message: "No tasks match your filters. Try adjusting your search criteria."
- Show the "Clear Filters" button prominently in the empty state

### 9. Update Task Display Logic
- Ensure the `getTasksByColumn` function works correctly with filtered results
- Update column counts to reflect filtered task counts
- Test that tasks move between columns correctly when filters are active

### 10. Add Unit Tests for Filter Functionality
- Add tests to `app/server/tests/test_tasks.py` for search query filtering
- Add tests for combined filters (status + search, status + assignee + search)
- Add tests for edge cases (empty search, special characters, no results)
- Ensure all tests pass with zero regressions

### 11. Create E2E Test File
- Create `.claude/commands/e2e/test_task_filter_search.md` following the structure of `test_basic_query.md`
- Define user story for the filter and search feature
- List detailed test steps covering:
  - Entering search text and verifying filtered results
  - Selecting a status filter and verifying only tasks from that column appear
  - Selecting label filters and verifying correct filtering
  - Combining multiple filters
  - Clearing filters and verifying all tasks return
- Include success criteria and screenshot requirements
- Specify verification steps for each filter type

### 12. Run Validation Commands
- Execute all validation commands listed in the Validation Commands section
- Ensure zero errors and zero regressions
- Fix any issues that arise before marking the feature as complete

## Testing Strategy
### Unit Tests
- **Search filter test**: Create tasks with different titles/descriptions, query with search parameter, verify correct tasks returned
- **Status filter test**: Extend existing `test_filter_tasks_by_status` to cover all statuses
- **Combined filters test**: Test search + status, search + assignee, all filters together
- **Case insensitivity test**: Verify search is case-insensitive (handled by SQLAlchemy's `ilike`)
- **Empty results test**: Verify API returns empty list when no tasks match filters
- **Special characters test**: Verify search handles special characters correctly (%, _, etc.)

### Edge Cases
- Empty search query (should return all tasks)
- Search with only whitespace (should be treated as empty)
- Status filter with invalid status value (should be handled by backend validation)
- Multiple labels selected (if implementing multi-select labels filter)
- No tasks exist in the database
- Search query matching partial words in title or description
- Filters active when creating/moving/deleting tasks (ensure filter state remains consistent)

## Acceptance Criteria
- Search input filters tasks by title and description in real-time with debouncing
- Status filter dropdown allows filtering by any column status or "All Statuses"
- Labels filter allows filtering by task labels
- Multiple filters can be applied simultaneously and work correctly together
- Active filters are visually indicated with badges or highlights
- "Clear Filters" button removes all active filters and shows all tasks
- Empty state message appears when no tasks match the filter criteria
- Kanban columns update correctly to show only filtered tasks
- Column counts reflect the number of filtered tasks in each column
- All existing functionality (task creation, moving, deletion) works correctly with filters active
- Unit tests pass with 100% success rate
- E2E test validates the complete filter workflow with screenshots
- Frontend build completes without errors
- Zero regressions in existing Kanban board functionality

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md`, then read and execute your new E2E `.claude/commands/e2e/test_task_filter_search.md` test file to validate this functionality works
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && bun tsc --noEmit` - Run frontend type checking to validate the feature works with zero regressions
- `cd app/client && bun run build` - Run frontend build to validate the feature works with zero regressions

## Notes
- The backend already supports filtering via query parameters, so no server-side changes are required
- Consider using URL query parameters to persist filter state across page refreshes (optional enhancement)
- Debounce the search input to reduce the number of API calls (recommend 300ms delay)
- When implementing labels filter, extract unique labels by flattening the labels arrays from all tasks
- Ensure the filter UI is responsive and works well on different screen sizes
- Consider adding keyboard shortcuts for common filter actions (e.g., Cmd+K to focus search)
- The search is case-insensitive and uses SQL LIKE pattern matching via SQLAlchemy's `ilike` operator
- Future enhancement: Add assignee filter using a dropdown of available users
- Future enhancement: Add date range filter for created_at/updated_at fields
- Future enhancement: Save filter presets for quick access to common filter combinations

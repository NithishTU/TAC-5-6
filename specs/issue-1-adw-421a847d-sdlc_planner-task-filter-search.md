# Feature: Task Filter and Search

## Metadata
issue_number: `1`
adw_id: `421a847d`
issue_json: `{"number":1,"title":"Task Filter and Search","body":"  Add filtering and search functionality to the Kanban board to help users find tasks quickly. Currently, users have to\n  manually scan through all tasks to find what they're looking for. This feature will provide a search bar and filter dropdowns    \n   to narrow down visible tasks."}`

## Feature Description
Add comprehensive filtering and search functionality to the Kanban board to enable users to quickly locate specific tasks. The feature will include a search bar for text-based queries and filter dropdowns for task attributes (status and labels). This will significantly improve user efficiency when working with large numbers of tasks by reducing visual clutter and providing targeted task visibility.

## User Story
As a developer using the Kanban board
I want to filter and search tasks by various criteria
So that I can quickly find specific tasks without manually scanning through all cards in every column

## Problem Statement
Currently, users must manually scan through all tasks across all Kanban columns to find specific items. This becomes increasingly inefficient as the number of tasks grows. Users need to locate tasks based on:
- Task title or description content (text search)
- Specific status columns (status filter)
- Task labels/tags (label filter)

Without filtering and search capabilities, the Kanban board becomes difficult to navigate with more than 20-30 tasks, leading to reduced productivity and increased cognitive load.

## Solution Statement
Implement a filter and search UI component above the Kanban board that allows users to:
1. Enter text in a search bar to filter tasks by title and description (case-insensitive)
2. Select one or more status values to show only tasks in those columns
3. Select one or more labels to show only tasks with those labels
4. Clear all filters to return to the full task view

The backend already supports filtering via query parameters (status, assignee, search) in the `/api/tasks/` endpoint. We'll leverage this existing API and enhance the frontend to provide an intuitive filtering interface. Filters will work together (AND logic) to progressively narrow results.

## Relevant Files
Use these files to implement the feature:

- `app/client/src/pages/Kanban.tsx` - Main Kanban board component where we'll add the filter/search UI and filter logic. This component already fetches tasks and renders the board, so we'll add state management for filters and update the rendering logic to respect filter criteria.

- `app/client/src/api/client.ts` - API client with tasksAPI.list() method that accepts filter parameters (status, assignee, search). We'll use this existing method to fetch filtered tasks from the backend.

- `app/client/src/types/index.ts` - TypeScript type definitions including the Task interface. We'll reference these types when implementing filter state and logic.

- `app/server/core/routers/tasks.py` - Tasks router with existing filter support in the list_tasks endpoint (lines 16-45). The backend already supports status_filter, assignee_id, and search parameters with proper SQL filtering.

- `app/server/core/models.py` - Task model definition (lines 43-66) showing available fields: title, description, status, labels, assignee_id, position, created_at, updated_at.

- `app/server/core/schemas.py` - Task schema definitions for request/response validation. TaskResponse schema shows the structure of task data returned from the API.

- `app/server/tests/test_tasks.py` - Existing test file with test_filter_tasks_by_status (lines 159-171). We'll add additional tests for search and label filtering.

- `README.md` - Project documentation with setup and development instructions to understand the project structure and commands.

- `.claude/commands/test_e2e.md` - E2E test runner instructions for creating and executing browser-based tests.

- `.claude/commands/e2e/test_basic_query.md` - Example E2E test structure showing how to write test steps, success criteria, and verification points.

### New Files

- `.claude/commands/e2e/test_task_filter_search.md` - New E2E test file to validate the filter and search functionality works correctly in the browser. This test will verify that the search bar, filter dropdowns, and clear filters button all function properly and correctly filter the visible tasks.

## Implementation Plan
### Phase 1: Foundation
1. Review existing backend API to understand available filter parameters and their behavior
2. Identify the current task fetching mechanism in Kanban.tsx and how it can be extended
3. Design the UI component structure for filters (search input, status multi-select, label multi-select, clear button)
4. Plan state management approach for filter values using React hooks

### Phase 2: Core Implementation
1. Add filter state management to Kanban component (search text, selected statuses, selected labels)
2. Create filter UI components above the Kanban board
3. Connect filter UI to state (input handlers, selection handlers)
4. Update task fetching to pass filter parameters to the API
5. Implement client-side label filtering (since backend doesn't support label filtering yet)
6. Add visual indicators for active filters (e.g., badge showing filter count)
7. Implement "Clear Filters" functionality

### Phase 3: Integration
1. Test filter interactions with existing Kanban functionality (drag-drop, task creation, task updates)
2. Ensure filters persist correctly when tasks are modified
3. Verify filter UI is responsive and works well on different screen sizes
4. Add loading states for filter operations
5. Implement E2E tests to validate the complete user flow

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Filter State Management to Kanban Component
- Add useState hooks in Kanban.tsx for: searchText, selectedStatuses, selectedLabels
- Initialize filter state with sensible defaults (empty search, all statuses selected, no labels selected)
- Create helper function to determine if any filters are active

### 2. Create Filter UI Component Structure
- Design and implement a filter bar component above the Kanban board
- Add search input field with placeholder text "Search tasks..."
- Add status multi-select dropdown (checkboxes for each status: backlog, todo, in_progress, in_review, done)
- Add label multi-select dropdown (dynamically populated from available labels in tasks)
- Add "Clear Filters" button that resets all filters
- Add active filter count badge/indicator
- Style filter components to match existing application design (dark mode support)

### 3. Implement Search Functionality
- Connect search input to searchText state
- Add debouncing to search input (300ms delay) to avoid excessive API calls
- Update tasksAPI.list() call to include search parameter when searchText is not empty
- Test search with various queries (case-insensitive, partial matches, special characters)

### 4. Implement Status Filter Functionality
- Add handler functions for status checkbox changes
- Update task fetching to include status filter parameters when specific statuses are selected
- Handle "All statuses" vs "Some statuses" selection logic
- Ensure Kanban columns show/hide appropriately when statuses are filtered

### 5. Implement Label Filter Functionality
- Extract all unique labels from the tasks array to populate label filter dropdown
- Add handler functions for label checkbox changes
- Implement client-side label filtering logic (filter tasks after API response)
- Handle empty label array (tasks with no labels) in filter logic

### 6. Implement Clear Filters Functionality
- Create clearFilters function that resets all filter state to defaults
- Connect function to "Clear Filters" button
- Re-fetch tasks with no filter parameters after clearing

### 7. Add Backend Tests for Search and Label Filtering
- Add test_search_tasks_by_title in test_tasks.py to verify backend search functionality
- Add test_search_tasks_by_description in test_tasks.py
- Add test_search_tasks_case_insensitive in test_tasks.py
- Ensure all existing tests still pass

### 8. Create E2E Test for Filter and Search Feature
- Create `.claude/commands/e2e/test_task_filter_search.md` based on examples in `.claude/commands/e2e/test_basic_query.md`
- Define test steps to validate:
  - Search bar filters tasks by title/description
  - Status filters show/hide appropriate columns and tasks
  - Label filters show only tasks with selected labels
  - Clear filters button resets all filters and shows all tasks
  - Multiple filters work together (AND logic)
- Include screenshot capture points for visual verification
- Define clear success criteria

### 9. Run Complete Validation Suite
- Execute all validation commands listed below
- Fix any regressions or issues discovered
- Verify E2E test passes completely
- Ensure no TypeScript errors or build failures

## Testing Strategy
### Unit Tests
- Test search query filtering with various input strings
- Test status filter with single and multiple status selections
- Test label filter with single and multiple label selections
- Test filter combinations (search + status, search + label, all three)
- Test clear filters resets all state correctly
- Test edge cases: empty search, no matching tasks, tasks without labels

### Edge Cases
- Search with special characters (&, %, $, etc.)
- Search with very long query strings
- Filter with no matching results (empty state)
- Tasks with no labels should be filterable
- Rapidly changing filters (debouncing test)
- Filter state persistence when tasks are created/updated/deleted
- Filter behavior when all tasks are deleted
- Multiple labels on single task
- Label filter with labels that don't exist in any tasks

## Acceptance Criteria
- Search input filters tasks by title and description (case-insensitive)
- Search is debounced to avoid excessive API calls
- Status filter dropdown allows selecting multiple statuses
- Only tasks matching selected statuses are visible
- Label filter dropdown shows all unique labels from existing tasks
- Only tasks with selected labels are visible
- Clear Filters button resets all filters and shows all tasks
- Multiple filters work together with AND logic (all conditions must match)
- Active filter count is displayed when filters are applied
- Filter UI is responsive and works on mobile/tablet/desktop
- No regressions in existing Kanban functionality (task creation, moving, deletion)
- All backend tests pass
- All frontend TypeScript checks pass
- Frontend builds successfully
- E2E test validates complete filter and search workflow

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_task_filter_search.md` to validate the filter and search functionality works end-to-end in the browser
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && bun tsc --noEmit` - Run frontend TypeScript checks to validate no type errors
- `cd app/client && bun run build` - Run frontend build to validate the feature builds successfully

## Notes
- The backend already supports search and status filtering via query parameters, which reduces implementation complexity
- Label filtering is not currently supported by the backend API, so we'll implement it client-side by filtering the results after fetching from the API
- Consider adding a "No results found" empty state when filters produce no matching tasks
- Future enhancement: Add a "Save filter preset" feature to allow users to save commonly used filter combinations
- Future enhancement: Add assignee filter to allow filtering by who is assigned to tasks
- Future enhancement: Persist filter state to localStorage so filters survive page refresh
- Consider adding keyboard shortcuts for quick filter access (e.g., Ctrl+F for search focus)
- The COLUMNS constant in Kanban.tsx defines the available status values and should be used as the source of truth for status filter options

# Feature: Task Filter and Search

## Metadata
issue_number: `1`
adw_id: `eced50c9`
issue_json: `{"number":1,"title":"Task Filter and Search","body":"  Add filtering and search functionality to the Kanban board to help users find tasks quickly. Currently, users have to\n  manually scan through all tasks to find what they're looking for. This feature will provide a search bar and filter dropdowns    \n   to narrow down visible tasks."}`

## Feature Description
Add comprehensive filtering and search functionality to the Kanban board, enabling users to quickly locate specific tasks without manually scanning through all columns. This feature will include a search bar for text-based queries across task titles and descriptions, plus dropdown filters for task status and labels. The backend already supports filtering via query parameters (status, assignee, search), so this feature focuses on exposing that functionality through an intuitive UI that provides real-time filtering of displayed tasks.

## User Story
As a project manager or developer
I want to search and filter tasks on the Kanban board by text, status, and labels
So that I can quickly find specific tasks without manually scanning through all columns

## Problem Statement
Users managing multiple tasks across different Kanban columns must manually scan through all tasks to find specific items, which becomes increasingly inefficient as the number of tasks grows. Without filtering or search capabilities, users waste time scrolling and visually parsing tasks, especially when looking for tasks with specific labels, statuses, or content.

## Solution Statement
Implement a filtering UI component above the Kanban board that includes:
1. A search input that filters tasks by title and description in real-time
2. A status dropdown filter to show tasks from specific columns only
3. A label filter to show tasks with specific labels
4. Clear visual feedback showing active filters
5. A "Clear Filters" button to reset all filters at once

The solution will leverage the existing backend filtering capabilities (already implemented in app/server/core/routers/tasks.py:16-45) and provide a seamless user experience with debounced search input to minimize API calls.

## Relevant Files
Use these files to implement the feature:

- **app/client/src/pages/Kanban.tsx** (app/client/src/pages/Kanban.tsx:1-186) - Main Kanban board component where the filter UI will be added
- **app/client/src/api/client.ts** (app/client/src/api/client.ts:36-58) - API client that already supports filter parameters in tasksAPI.list()
- **app/client/src/types/index.ts** (app/client/src/types/index.ts:11-23) - Task interface definition showing available fields for filtering
- **app/server/core/routers/tasks.py** (app/server/core/routers/tasks.py:16-45) - Backend tasks router with existing filter support (status, assignee, search)
- **app/server/tests/test_tasks.py** (app/server/tests/test_tasks.py:164-176) - Existing tests demonstrating filter functionality
- **README.md** - Project overview and commands for running the application
- **.claude/commands/conditional_docs.md** - Conditional documentation guide
- **.claude/commands/test_e2e.md** - E2E test runner documentation
- **.claude/commands/e2e/test_basic_query.md** - Example E2E test structure

### New Files
- **.claude/commands/e2e/test_task_filter_search.md** - E2E test to validate the filter and search functionality works correctly

## Implementation Plan
### Phase 1: Foundation
Create the filter UI component structure and state management in the Kanban component. Set up the filter state variables (search query, status filter, label filter) and connect them to the existing tasksAPI.list() method that already accepts these parameters.

### Phase 2: Core Implementation
Implement the search input with debouncing to prevent excessive API calls, add status and label filter dropdowns, and wire up the filters to call the API with the appropriate query parameters. Display active filter indicators and implement a "Clear Filters" button.

### Phase 3: Integration
Ensure the filtered tasks display correctly in their respective Kanban columns, update the task count badges to reflect filtered results, and test the integration with existing task CRUD operations (create, move, delete).

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Filter State Management to Kanban Component
- Add state variables for search query, status filter, and label filter to Kanban.tsx
- Update the useQuery call to include filter parameters when fetching tasks
- Implement debounced search to minimize API calls (use a 300ms delay)

### 2. Create Filter UI Section
- Add a filter bar component above the Kanban board columns
- Include a search input field with placeholder "Search tasks..."
- Add a status dropdown filter with options: All, Backlog, To Do, In Progress, In Review, Done
- Add a label multi-select or dropdown for filtering by labels
- Style the filter section to match the existing design system (using Tailwind classes)

### 3. Implement Search Functionality
- Connect the search input to the search state variable
- Implement debouncing logic (300ms delay) to prevent excessive API calls
- Pass the search parameter to tasksAPI.list() when fetching tasks
- Display a loading indicator when search is in progress

### 4. Implement Status Filter
- Connect the status dropdown to the status filter state
- Pass the status parameter to tasksAPI.list() when a specific status is selected
- Update the "All" option to clear the status filter

### 5. Implement Label Filter
- Extract unique labels from all tasks to populate the label filter dropdown
- Connect the label filter to state and pass to the API (note: may need backend enhancement if label filtering isn't fully implemented)
- Allow clearing the label filter

### 6. Add Active Filter Indicators
- Display visual badges or indicators showing active filters (e.g., "Searching: keyword", "Status: In Progress")
- Show the total count of filtered results
- Style active filters to be clearly visible

### 7. Implement Clear Filters Button
- Add a "Clear Filters" button that resets all filter states
- Only show the button when at least one filter is active
- Ensure clicking the button refreshes the task list with no filters

### 8. Create E2E Test File
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_basic_query.md` to understand E2E test structure
- Create `.claude/commands/e2e/test_task_filter_search.md` with test steps that:
  - Navigate to the Kanban board
  - Verify the filter UI elements are present (search input, status dropdown, label filter)
  - Create test tasks with different statuses and labels
  - Test searching by task title
  - Test filtering by status
  - Test filtering by label
  - Test the "Clear Filters" button
  - Capture screenshots at each step
  - Verify filtered results display correctly

### 9. Add Backend Tests for Search Functionality
- Add test cases to app/server/tests/test_tasks.py for search functionality
- Test searching by title and description
- Test case-insensitive search
- Test search with no results
- Test combining search with status filters

### 10. Update Task Count Display
- Ensure the task count badges in each Kanban column reflect filtered results, not total tasks
- Add a total filtered count indicator in the header (e.g., "Showing 5 of 20 tasks")

### 11. Run Validation Commands
- Execute all validation commands listed below to ensure zero regressions
- Fix any issues that arise
- Verify the E2E test passes with all assertions

## Testing Strategy
### Unit Tests
- **Backend Tests (Python/Pytest)**:
  - Test search endpoint with various query strings (partial match, case-insensitive)
  - Test search against both title and description fields
  - Test search with special characters and edge cases
  - Test combining search with status and assignee filters
  - Test empty search returns all tasks

- **Frontend Tests** (if time permits):
  - Test filter state management
  - Test debounce logic for search input
  - Test filter clearing functionality

### Edge Cases
- Empty search query should show all tasks
- Search with no matching results should display an appropriate empty state message
- Filtering by status should only affect the available columns (e.g., filtering by "Done" should only show the Done column)
- Combining multiple filters (search + status + label) should work correctly
- Very long task titles or descriptions should not break the search UI
- Special characters in search queries should be handled safely (no XSS vulnerabilities)
- Rapid typing in the search box should be debounced properly
- Clearing filters should immediately restore all tasks
- Creating a new task while filters are active should work correctly
- Moving a task to a filtered-out status should remove it from view
- URL should not break if query parameters are manually edited (optional enhancement)

## Acceptance Criteria
- Search input filters tasks by title and description with 300ms debounce
- Status dropdown filters tasks to show only selected status
- Label filter shows tasks with matching labels
- Active filters are clearly visible with badges or indicators
- "Clear Filters" button resets all filters and shows all tasks
- Task count badges reflect filtered results accurately
- Filtered tasks display in the correct Kanban columns
- Search is case-insensitive
- No console errors or warnings
- Backend tests for search functionality pass
- E2E test validates the complete filter and search workflow with screenshots
- All existing functionality (create, move, delete tasks) works with filters active
- Zero regressions in existing tests

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

Read `.claude/commands/test_e2e.md`, then read and execute your new E2E `.claude/commands/e2e/test_task_filter_search.md` test file to validate this functionality works.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && bun tsc --noEmit` - Run frontend tests to validate the feature works with zero regressions
- `cd app/client && bun run build` - Run frontend build to validate the feature works with zero regressions

## Notes
- The backend already supports filtering via query parameters (status, assignee, search) in app/server/core/routers/tasks.py:16-45, so no backend changes are needed for basic search and status filtering
- The search functionality uses SQL ILIKE for case-insensitive partial matching on both title and description fields
- Consider adding URL query parameters to persist filter state across page refreshes (optional future enhancement)
- Label filtering may need verification - the backend schema supports labels as a JSON field (app/server/core/models.py:53), but the filter endpoint may need enhancement to support filtering by labels
- Use React Query's existing caching and refetching mechanisms to optimize performance
- Consider adding keyboard shortcuts for common filters (optional enhancement)
- The filter UI should be responsive and work well on mobile devices
- All Tailwind CSS classes should follow the existing design patterns in the codebase (card, btn-primary, input classes)

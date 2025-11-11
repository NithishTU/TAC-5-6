# Feature: Task Filter and Search

## Metadata
issue_number: `1`
adw_id: `8890ed56`
issue_json: `{"number":1,"title":"Task Filter and Search","body":"  Add filtering and search functionality to the Kanban board to help users find tasks quickly. Currently, users have to\n  manually scan through all tasks to find what they're looking for. This feature will provide a search bar and filter dropdowns    \n   to narrow down visible tasks."}`

## Feature Description
Add comprehensive filtering and search functionality to the Kanban board to help users find tasks quickly. Currently, users must manually scan through all tasks across all columns to locate specific items. This feature will introduce a search bar for text-based queries and filter dropdowns to narrow down visible tasks by status, assignee, and labels. The backend already supports these filters via query parameters, so this feature focuses on building the frontend UI and integrating it with the existing API.

## User Story
As a Kanban board user
I want to search and filter tasks by text, status, assignee, and labels
So that I can quickly find specific tasks without manually scanning through all columns

## Problem Statement
Users working with large numbers of tasks on the Kanban board must manually scan through all columns to find specific tasks. This is time-consuming and inefficient, particularly when looking for tasks by:
- Title or description keywords
- Specific status (column)
- Assigned team member
- Labels/tags

The backend API already supports filtering via query parameters (status, assignee, search), but the frontend lacks UI controls to expose this functionality to users.

## Solution Statement
Implement a filter and search panel above the Kanban board columns that allows users to:
1. Search tasks by entering text that matches task titles or descriptions
2. Filter tasks by status (column) using a dropdown
3. Filter tasks by assignee using a dropdown
4. Clear all filters to return to the full task view

The solution will use the existing backend API endpoints without requiring backend changes. Results will update the Kanban board view in real-time, hiding tasks that don't match the current filter criteria while maintaining the board's column structure.

## Relevant Files
Use these files to implement the feature:

- **app/client/src/pages/Kanban.tsx** (Lines 1-186)
  - Main Kanban board component that needs the filter UI and logic
  - Already uses React Query to fetch tasks
  - Needs to integrate filter state and pass parameters to the API

- **app/client/src/api/client.ts** (Lines 36-58)
  - Tasks API client that already supports filter parameters
  - `tasksAPI.list()` method accepts `{ status, assignee, search }` params

- **app/client/src/types/index.ts** (Lines 1-23)
  - Contains Task and User type definitions
  - May need filter-related types

- **app/server/core/routers/tasks.py** (Lines 16-45)
  - Backend endpoint already implements filtering logic
  - Supports `status`, `assignee`, and `search` query parameters
  - No backend changes needed

- **app/server/core/models.py** (Lines 43-67)
  - Task model with status, assignee_id, labels, title, description fields
  - Understanding the model structure helps inform filter design

- **app/server/core/schemas.py** (Lines 42-83)
  - Task schemas for validation
  - Reference for understanding available task fields

- **app/server/tests/test_tasks.py** (Lines 159-171)
  - Existing test for status filtering
  - Template for adding more comprehensive filter tests

- **app/client/src/styles.css**
  - Application styles using Tailwind CSS
  - Reference for styling the filter components consistently

- **.claude/commands/test_e2e.md** (Lines 1-62)
  - E2E test runner instructions for creating end-to-end tests

- **.claude/commands/e2e/test_basic_query.md** (Lines 1-39)
  - Example E2E test structure to follow

### New Files

- **.claude/commands/e2e/test_task_filter_search.md**
  - New E2E test file to validate the filter and search functionality
  - Will test searching by text, filtering by status/assignee, and clearing filters
  - Will capture screenshots demonstrating the feature works correctly

## Implementation Plan

### Phase 1: Foundation
Set up the filter state management and UI structure in the Kanban component. This includes:
- Adding React state hooks for search text, status filter, and assignee filter
- Creating the filter panel UI layout above the Kanban board
- Implementing the visual design using existing Tailwind CSS patterns

### Phase 2: Core Implementation
Integrate the filter functionality with the backend API and update the task display logic:
- Connect filter state to the React Query hook that fetches tasks
- Pass filter parameters to the `tasksAPI.list()` method
- Implement real-time filtering as users type or select filters
- Add debouncing to the search input to avoid excessive API calls
- Create a "Clear Filters" button to reset all filters

### Phase 3: Integration
Test the feature end-to-end and ensure proper integration with existing functionality:
- Verify filters work correctly in isolation and combination
- Ensure task creation, moving, and deletion work with filters active
- Add comprehensive tests (unit and E2E)
- Validate the feature works across different browsers and screen sizes

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Create E2E Test File
- Read `.claude/commands/test_e2e.md` to understand E2E test structure
- Read `.claude/commands/e2e/test_basic_query.md` as an example
- Create `.claude/commands/e2e/test_task_filter_search.md` with test steps that:
  - Navigate to the Kanban board
  - Verify the filter UI elements are present (search input, status dropdown, assignee dropdown, clear button)
  - Create several test tasks with different titles, descriptions, statuses, and assignees
  - Test searching by text (should filter tasks by title/description)
  - Test filtering by status (should show only tasks in that column)
  - Test filtering by assignee (should show only tasks assigned to that user)
  - Test combining multiple filters
  - Test clearing filters (should show all tasks again)
  - Capture screenshots at key points to demonstrate the feature

### Step 2: Implement Filter UI Components
- Open `app/client/src/pages/Kanban.tsx`
- Add React state hooks for filter values:
  - `searchText`: string for search input
  - `statusFilter`: string or null for status dropdown
  - `assigneeFilter`: string or null for assignee dropdown
- Create a filter panel component above the Kanban board (between the header and columns)
- Add a search input field with placeholder "Search tasks..."
- Add a status dropdown with options: "All Statuses", "Backlog", "To Do", "In Progress", "In Review", "Done"
- Add an assignee dropdown with options: "All Assignees" + list of unique assignees from tasks
- Add a "Clear Filters" button that resets all filter state
- Style the filter panel using existing Tailwind CSS utility classes for consistency

### Step 3: Connect Filters to API
- Update the `useQuery` hook in `app/client/src/pages/Kanban.tsx`
- Modify the `queryKey` to include filter values so React Query refetches when filters change
- Pass filter parameters to `tasksAPI.list()`:
  - `search`: searchText
  - `status`: statusFilter (if not "all")
  - `assignee`: assigneeFilter (if not "all")
- Implement debouncing for the search input using `useDeferredValue` or a custom debounce hook to avoid excessive API calls (300ms delay)

### Step 4: Implement Filter Logic
- Update the filter state handlers:
  - `handleSearchChange`: updates searchText state
  - `handleStatusChange`: updates statusFilter state
  - `handleAssigneeChange`: updates assigneeFilter state
  - `handleClearFilters`: resets all filters to default values
- Ensure the Kanban board re-renders when filter state changes
- Verify that tasks are filtered correctly based on the selected criteria

### Step 5: Add Unit Tests for Filter Functionality
- Open `app/server/tests/test_tasks.py`
- Add comprehensive tests for filtering:
  - `test_search_tasks_by_title`: verify search by title works
  - `test_search_tasks_by_description`: verify search by description works
  - `test_search_tasks_case_insensitive`: verify search is case-insensitive
  - `test_filter_by_assignee`: verify filtering by assignee works
  - `test_combined_filters`: verify multiple filters work together (e.g., status + search)
  - `test_filter_returns_empty_when_no_matches`: verify empty results when no tasks match
- Run tests to ensure they pass

### Step 6: Improve UX with Visual Feedback
- Add visual indicators when filters are active:
  - Show a badge count of active filters
  - Highlight the "Clear Filters" button when filters are active
  - Show a message like "X tasks found" below the filter panel
- Add loading states while fetching filtered tasks
- Handle edge cases:
  - Empty search results: show "No tasks found" message
  - No assignees available: disable or hide the assignee dropdown
  - Preserve filter state when creating/moving/deleting tasks

### Step 7: Run Validation Commands
- Execute all validation commands listed in the "Validation Commands" section
- Ensure all tests pass with zero errors
- Execute the E2E test to validate the feature works end-to-end
- Fix any issues discovered during validation

## Testing Strategy

### Unit Tests
- **Backend Filter Tests** (`app/server/tests/test_tasks.py`):
  - Test search functionality (by title, by description, case-insensitive)
  - Test status filtering (single status, multiple queries)
  - Test assignee filtering (valid assignee, non-existent assignee)
  - Test combined filters (status + search, assignee + search, all three)
  - Test empty results scenarios
  - Test special characters in search queries
  - Test filtering with pagination (if implemented)

- **Frontend Component Tests**:
  - Test filter state management (setting, clearing filters)
  - Test debounce behavior for search input
  - Test dropdown options render correctly
  - Test "Clear Filters" button resets state

### Edge Cases
- Empty search query (should show all tasks)
- Search with no matches (should show empty state)
- Filtering when no tasks exist
- Filtering when all tasks match the criteria
- Special characters in search text (quotes, ampersands, etc.)
- Very long search strings
- Rapid filter changes (debouncing should handle)
- Filtering with tasks that have no assignee
- Filtering with tasks that have no labels
- Concurrent operations (filtering while creating/moving tasks)
- Browser back/forward navigation with active filters
- URL parameter persistence (optional enhancement)

## Acceptance Criteria
- Search input filters tasks by title and description in real-time with 300ms debounce
- Status dropdown filters tasks to show only those in the selected column
- Assignee dropdown filters tasks to show only those assigned to the selected user
- Multiple filters can be applied simultaneously (search + status + assignee)
- "Clear Filters" button resets all filters and shows all tasks
- Filter panel is visually integrated with the existing Kanban board design
- Active filters are clearly indicated to the user (badge, highlight, or count)
- Empty states are handled gracefully with appropriate messaging
- All existing functionality (create, move, delete tasks) continues to work with filters active
- Backend tests for filtering pass with 100% success
- Frontend builds without TypeScript errors
- E2E test validates the feature works correctly across all scenarios
- Feature works consistently across modern browsers (Chrome, Firefox, Edge)
- No regressions in existing Kanban board functionality

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md`, then read and execute your new E2E `.claude/commands/e2e/test_task_filter_search.md` test file to validate this functionality works
- `cd app/server && uv run pytest tests/test_tasks.py -v` - Run backend filter tests
- `cd app/server && uv run pytest` - Run all server tests to validate zero regressions
- `cd app/client && bun tsc --noEmit` - Run frontend TypeScript validation
- `cd app/client && bun run build` - Run frontend build to validate zero regressions

## Notes

### Technical Decisions
- **No Backend Changes Required**: The backend API already supports all required filtering parameters (status, assignee, search), so this is purely a frontend enhancement
- **Debouncing**: Implement 300ms debounce on search input to reduce API calls while maintaining responsive UX
- **React Query Integration**: Leverage React Query's caching and refetching mechanisms by including filter values in the query key
- **State Management**: Use local React state (useState hooks) rather than a global state management library for simplicity

### Future Enhancements
- **Label Filtering**: Add ability to filter by task labels (requires multi-select dropdown)
- **Advanced Search**: Support search operators (AND, OR, NOT) or regex patterns
- **Filter Persistence**: Save filter preferences to localStorage or URL parameters
- **Saved Filters**: Allow users to save common filter combinations
- **Filter Presets**: Quick access buttons for common filters ("My Tasks", "Urgent", "This Sprint")
- **Date Range Filtering**: Filter tasks by creation or update date
- **Export Filtered Results**: Allow exporting filtered task list as CSV or JSON

### Design Considerations
- Use existing Tailwind CSS utility classes for consistency with the rest of the application
- Match the existing color scheme (gray for neutral elements, blue for primary actions)
- Ensure filter controls are keyboard-accessible (tab navigation, enter to submit)
- Mobile responsive design (stack filters vertically on small screens)
- Consider adding filter icons (magnifying glass for search, funnel for filters)

### Performance Considerations
- Search debouncing prevents excessive API calls during typing
- React Query caching reduces redundant API requests for the same filter combinations
- Consider implementing virtual scrolling if task lists become very large
- Filter operations happen on the backend via SQL queries, keeping the frontend lightweight

### Dependencies
- No new npm packages required
- Uses existing libraries:
  - React Query for data fetching
  - Axios for HTTP requests
  - Tailwind CSS for styling

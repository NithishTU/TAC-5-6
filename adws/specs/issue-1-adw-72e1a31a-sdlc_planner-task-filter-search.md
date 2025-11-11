# Feature: Task Filter and Search

## Metadata
issue_number: `1`
adw_id: `72e1a31a`
issue_json: `{"number":1,"title":"Task Filter and Search","body":"  Add filtering and search functionality to the Kanban board to help users find tasks quickly. Currently, users have to\n  manually scan through all tasks to find what they're looking for. This feature will provide a search bar and filter dropdowns    \n   to narrow down visible tasks."}`

## Feature Description
This feature adds comprehensive filtering and search capabilities to the Kanban board, enabling users to quickly locate tasks without manually scanning through all columns. The implementation includes a search bar for text-based queries and filter dropdowns for status-based and assignee-based filtering. The backend already supports these filters via query parameters (`status`, `assignee`, `search`) on the `/api/tasks` endpoint, so this feature primarily focuses on enhancing the frontend UI to expose these capabilities to users.

## User Story
As a developer using the Kanban board
I want to filter and search for tasks
So that I can quickly find specific tasks without scanning through all columns manually

## Problem Statement
Currently, the Kanban board displays all tasks across five columns (Backlog, To Do, In Progress, In Review, Done). As the number of tasks grows, users must manually scan through each column to find specific tasks. This becomes time-consuming and inefficient, especially when looking for:
- Tasks with specific keywords in their title or description
- Tasks assigned to a particular user
- Tasks in a specific status column
- A combination of the above criteria

The backend API already supports filtering via query parameters, but the frontend lacks the UI controls to utilize these capabilities.

## Solution Statement
We will add a filter and search panel to the Kanban board that includes:
1. **Search Input**: A text field that searches through task titles and descriptions in real-time
2. **Status Filter**: A dropdown to filter tasks by status (with an "All" option to show all statuses)
3. **Assignee Filter**: A dropdown to filter tasks by assignee (with an "All" option to show all tasks)
4. **Clear Filters Button**: A button to reset all filters to their default state
5. **Filter State Management**: React state to manage active filters and automatically refetch tasks when filters change
6. **Visual Feedback**: Show active filter count and highlight filtered columns

The solution leverages the existing backend filtering capabilities and integrates seamlessly with the current React Query setup.

## Relevant Files
Use these files to implement the feature:

- **app/client/src/pages/Kanban.tsx** - Main Kanban board component where filters will be added. This file already uses React Query to fetch tasks and has the `tasksAPI.list()` call that accepts filter parameters.

- **app/client/src/api/client.ts** - API client configuration. The `tasksAPI.list()` function already accepts optional parameters `{ status?: string; assignee?: string; search?: string }` that map directly to the backend query parameters.

- **app/client/src/types/index.ts** - TypeScript type definitions. Contains the `Task` and `User` interfaces used throughout the application.

- **app/server/core/routers/tasks.py** - Backend tasks router. The `list_tasks` endpoint (line 16-45) already implements filtering logic for `status_filter`, `assignee_id`, and `search` parameters.

- **app/server/core/models.py** - Database models. Contains the `Task` model (line 42-66) and `User` model (line 19-40) with their relationships.

- **app/server/core/schemas.py** - Pydantic schemas for validation. Contains `TaskResponse` and `UserResponse` schemas used in API responses.

- **README.md** - Project documentation with setup instructions for running the application.

- **.claude/commands/conditional_docs.md** - Documentation guide to understand when to read specific documentation files.

- **.claude/commands/test_e2e.md** - E2E test runner documentation to understand how to create and execute browser-based tests.

- **.claude/commands/e2e/test_basic_query.md** - Example E2E test structure to use as a template for creating the new E2E test.

### New Files

- **.claude/commands/e2e/test_task_filter_search.md** - New E2E test file to validate the filter and search functionality works correctly. This test will verify users can search for tasks, filter by status, filter by assignee, and clear filters.

## Implementation Plan

### Phase 1: Foundation
Before implementing the main feature, we need to:
1. **Review existing API capabilities**: Verify the backend `/api/tasks` endpoint supports all required filter parameters
2. **Review existing state management**: Understand how React Query is currently managing task data
3. **Plan UI layout**: Determine where to place the filter controls in the Kanban board UI for optimal user experience
4. **Create test data**: Ensure there are sample tasks with various statuses and assignees for testing

### Phase 2: Core Implementation
The main implementation work includes:
1. **Add filter state management**: Implement React state hooks to track search query, status filter, and assignee filter
2. **Build filter UI components**: Create search input, status dropdown, assignee dropdown, and clear filters button
3. **Integrate filters with API calls**: Modify the React Query call to pass filter parameters to `tasksAPI.list()`
4. **Implement real-time filtering**: Ensure the task list refetches when filter values change
5. **Add visual feedback**: Display active filter count and provide clear visual indicators
6. **Style the filter panel**: Use existing Tailwind CSS classes to match the application's design system

### Phase 3: Integration
After core implementation:
1. **Test filter combinations**: Verify that multiple filters work correctly together (e.g., search + status filter)
2. **Test edge cases**: Handle scenarios like no results found, invalid filter values, empty search queries
3. **Optimize performance**: Implement debouncing for search input to reduce API calls
4. **Add accessibility features**: Ensure filter controls are keyboard-navigable and screen-reader friendly
5. **Create E2E test**: Build comprehensive browser-based test to validate the feature end-to-end
6. **Update documentation**: Document the new filtering capabilities

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Review and Understand Existing Code
- Read `app/client/src/pages/Kanban.tsx` to understand current component structure
- Read `app/client/src/api/client.ts` to understand the `tasksAPI.list()` function signature
- Read `app/server/core/routers/tasks.py` to verify backend filtering capabilities
- Confirm that the backend supports `status`, `assignee`, and `search` query parameters

### Step 2: Add Filter State Management
- Add React state hooks for managing filter values:
  - `searchQuery` (string) - for text search
  - `statusFilter` (string | null) - for status filtering (null means "All")
  - `assigneeFilter` (string | null) - for assignee filtering (null means "All")
- Implement debouncing for the search query (300ms delay) to reduce API calls
- Modify the React Query `useQuery` call to pass filter parameters to `tasksAPI.list()`

### Step 3: Fetch Users for Assignee Filter
- Add a new React Query hook to fetch the list of users from the backend
- Create a backend endpoint in `app/server/core/routers/auth.py` to list all users (if it doesn't exist)
- Use the user list to populate the assignee filter dropdown

### Step 4: Build Filter UI Components
- Create a filter panel component above the Kanban board
- Add a search input with placeholder text "Search tasks..."
- Add a status filter dropdown with options: "All", "Backlog", "To Do", "In Progress", "In Review", "Done"
- Add an assignee filter dropdown with options: "All" + list of users
- Add a "Clear Filters" button that resets all filters to default values
- Style the filter panel using Tailwind CSS to match the existing design

### Step 5: Implement Filter Logic
- Connect the search input to the `searchQuery` state
- Connect the status dropdown to the `statusFilter` state
- Connect the assignee dropdown to the `assigneeFilter` state
- Ensure the task list automatically refetches when any filter changes
- Display a message when no tasks match the current filters

### Step 6: Add Visual Feedback
- Show the count of active filters (e.g., "2 filters active")
- Highlight the "Clear Filters" button when filters are active
- Show a loading indicator while tasks are being fetched
- Display the total number of tasks found

### Step 7: Test Filter Functionality
- Manually test each filter individually
- Test combinations of filters (search + status, search + assignee, all three together)
- Test edge cases (empty search, no results, clearing filters)
- Verify that the Kanban board correctly displays filtered tasks

### Step 8: Add Search Debouncing
- Implement a debounced search input to prevent excessive API calls
- Use a 300ms delay before triggering the search
- Show a loading indicator while debouncing

### Step 9: Optimize Performance
- Ensure React Query caching is working correctly
- Verify that unnecessary re-renders are avoided
- Test with a large number of tasks (100+) to ensure performance remains good

### Step 10: Create E2E Test File
- Create `.claude/commands/e2e/test_task_filter_search.md` following the structure of `test_basic_query.md`
- Define test steps to validate:
  - Initial page load shows all tasks
  - Search input filters tasks by title/description
  - Status filter dropdown filters tasks by status
  - Assignee filter dropdown filters tasks by assignee
  - Clear filters button resets all filters
  - Multiple filters work together correctly
- Specify screenshot capture points for visual verification
- Define success criteria for the test

### Step 11: Run All Tests
- Execute unit tests: `cd app/server && uv run pytest`
- Execute frontend type check: `cd app/client && bun tsc --noEmit`
- Execute frontend build: `cd app/client && bun run build`
- Read `.claude/commands/test_e2e.md` and execute the new E2E test `test_task_filter_search.md`

### Step 12: Run Validation Commands
- Execute all validation commands listed below to ensure zero regressions
- Fix any issues that arise during validation
- Verify that the feature works correctly end-to-end

## Testing Strategy

### Unit Tests
Since this feature primarily adds UI components, we will focus on:
1. **Backend tests**: Verify that the existing `/api/tasks` endpoint correctly filters tasks based on query parameters
2. **Frontend component tests** (optional): Test filter state management and UI interactions
3. **API integration tests**: Ensure the frontend correctly passes filter parameters to the backend

### Edge Cases
Test the following edge cases:
1. **Empty search query**: Should display all tasks
2. **No matching results**: Should display a "No tasks found" message
3. **Special characters in search**: Should handle quotes, slashes, and other special characters
4. **Multiple spaces in search**: Should trim and handle correctly
5. **Filter combinations**: All possible combinations of search, status, and assignee filters
6. **Clearing filters**: Should reset to showing all tasks
7. **Invalid assignee ID**: Backend should handle gracefully
8. **Invalid status value**: Backend should handle gracefully
9. **Very long search queries**: Should not break the UI
10. **Case sensitivity**: Search should be case-insensitive
11. **Partial matches**: Search should find partial matches in titles and descriptions
12. **Debouncing**: Rapid typing should not trigger multiple API calls

## Acceptance Criteria
- [ ] Search input field is visible above the Kanban board
- [ ] Status filter dropdown is visible with all status options plus "All"
- [ ] Assignee filter dropdown is visible with all users plus "All"
- [ ] Clear filters button is visible and functional
- [ ] Typing in search input filters tasks in real-time (with debouncing)
- [ ] Selecting a status filters tasks to that status only
- [ ] Selecting an assignee filters tasks assigned to that user only
- [ ] Multiple filters work together correctly (AND logic)
- [ ] Clear filters button resets all filters and shows all tasks
- [ ] Active filter count is displayed when filters are active
- [ ] Loading indicator shows while fetching filtered tasks
- [ ] "No tasks found" message appears when no tasks match filters
- [ ] Filtered tasks are displayed correctly in their respective columns
- [ ] Existing task management features (add, move, delete) still work with filters active
- [ ] All existing unit tests pass
- [ ] Frontend type checking passes without errors
- [ ] Frontend build completes without errors
- [ ] E2E test validates the feature works correctly with screenshots

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

Read `.claude/commands/test_e2e.md`, then read and execute your new E2E `.claude/commands/e2e/test_task_filter_search.md` test file to validate this functionality works.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && bun tsc --noEmit` - Run frontend tests to validate the feature works with zero regressions
- `cd app/client && bun run build` - Run frontend build to validate the feature works with zero regressions

## Notes

### Technical Considerations
- The backend API already supports all required filtering parameters, so no backend changes are needed for basic functionality
- Consider adding a `/api/users` endpoint if one doesn't exist to populate the assignee filter dropdown
- Use React Query's caching to avoid unnecessary API calls when filters haven't changed
- Implement debouncing on the search input to improve performance and reduce API load
- The filter UI should be responsive and work well on mobile devices

### Future Enhancements
After this feature is implemented, consider these future improvements:
- **Advanced filters**: Add filters for labels, created date, updated date
- **Saved filter presets**: Allow users to save and load commonly used filter combinations
- **Filter by priority**: Add priority field to tasks and filter by it
- **Filter persistence**: Save filter state to localStorage and restore on page load
- **Filter by multiple assignees**: Allow selecting multiple assignees at once
- **Date range filters**: Filter tasks created or updated within a specific date range
- **Export filtered results**: Allow exporting filtered task list to CSV or JSON

### Dependencies
- No new dependencies are required for this feature
- Existing dependencies (React, React Query, Tailwind CSS) provide all necessary functionality

### Performance Notes
- Debouncing the search input is critical to avoid excessive API calls
- React Query's automatic caching will help improve perceived performance
- Consider adding pagination if the number of tasks grows very large (100+ tasks)
- The backend query uses indexed columns (`status`, `assignee_id`) for efficient filtering

### Accessibility
- All filter controls should be keyboard navigable (Tab, Enter, Escape)
- Screen readers should announce filter changes and result counts
- Focus management should work correctly when clearing filters
- ARIA labels should be added to all filter controls

### Mobile Considerations
- Filter panel should collapse on mobile devices to save screen space
- Consider a "Filters" button that opens a modal on mobile
- Ensure dropdowns work well on touch devices
- Test on various screen sizes (mobile, tablet, desktop)

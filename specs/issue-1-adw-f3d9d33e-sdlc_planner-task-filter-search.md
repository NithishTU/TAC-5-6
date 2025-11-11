# Feature: Task Filter and Search

## Metadata
issue_number: `1`
adw_id: `f3d9d33e`
issue_json: `{"number":1,"title":"Task Filter and Search","body":"  Add filtering and search functionality to the Kanban board to help users find tasks quickly. Currently, users have to\n  manually scan through all tasks to find what they're looking for. This feature will provide a search bar and filter dropdowns    \n   to narrow down visible tasks."}`

## Feature Description
This feature adds comprehensive filtering and search capabilities to the Kanban board, enabling users to quickly locate specific tasks without manually scanning through all columns. The implementation includes a search input for text-based queries and filter dropdowns for status and labels. The backend already supports filtering via query parameters (status, assignee, search), so the frontend will leverage these existing capabilities while adding a client-side filtering UI for enhanced user experience.

## User Story
As a developer using the Kanban board
I want to search and filter tasks by text, status, and labels
So that I can quickly find relevant tasks without scanning through all columns manually

## Problem Statement
Currently, the Kanban board displays all tasks across five columns (Backlog, To Do, In Progress, In Review, Done) without any filtering or search capabilities. As the number of tasks grows, users must manually scan through every column to find specific tasks, which becomes time-consuming and inefficient. This lack of search functionality reduces productivity, especially when dealing with large backlogs or multiple in-progress items.

## Solution Statement
Implement a comprehensive filtering system in the Kanban board that includes:
1. A search bar that filters tasks by title and description in real-time
2. A status filter dropdown to show/hide specific columns or filter across all columns
3. A label filter to display only tasks with specific labels
4. A clear/reset button to remove all active filters
5. Visual indicators showing active filters and the count of filtered results
6. Leverage existing backend API support for filtering (status, assignee, search parameters)

The solution will provide both server-side filtering (when filters are applied) and client-side display logic for an optimal user experience, ensuring that users can quickly narrow down visible tasks based on multiple criteria simultaneously.

## Relevant Files
Use these files to implement the feature:

- **app/client/src/pages/Kanban.tsx** - Main Kanban board component where filtering UI and logic will be added. Currently has basic task display and column management.
- **app/server/core/routers/tasks.py** - Backend API already supports filtering via query parameters (status, assignee, search). Line 16-45 shows the list_tasks endpoint with filter support.
- **app/server/core/models.py** - Task model definition (lines 43-66) showing available fields for filtering: title, description, status, labels.
- **app/server/core/schemas.py** - Task schemas (lines 42-83) defining the structure of task data and validation rules.
- **app/client/src/api/client.ts** - API client with tasksAPI.list() method (line 38) that accepts params for filtering. Needs to be utilized with filter parameters.
- **app/client/src/types/index.ts** - Task type definition (lines 11-23) showing the structure of task objects.
- **app/client/src/styles.css** - Contains Tailwind CSS custom components (btn-primary, card, input) that will be used for filter UI elements.
- **README.md** - Project overview and setup instructions for understanding the architecture.
- **.claude/commands/test_e2e.md** - E2E test runner template to understand how to structure E2E tests.
- **.claude/commands/e2e/test_basic_query.md** - Example E2E test file showing the format and structure for validation tests.

### New Files
- **.claude/commands/e2e/test_task_filter_search.md** - E2E test file to validate the filtering and search functionality works as expected with step-by-step validation instructions and screenshot capture points.

## Implementation Plan

### Phase 1: Foundation
1. Review the existing backend API filter support in `app/server/core/routers/tasks.py` (lines 16-45) to understand available query parameters
2. Create a filter state management structure in the Kanban component to track active filters (search text, selected status, selected labels)
3. Design the filter UI layout that will be positioned above the Kanban board columns

### Phase 2: Core Implementation
1. Implement the search input component with debounced text input to filter tasks by title/description
2. Add status filter dropdown to filter by specific task statuses
3. Add label filter dropdown (multi-select or single-select) to filter by labels
4. Create a clear/reset filters button to remove all active filters
5. Implement the filtering logic that updates the query parameters sent to the backend API
6. Add visual indicators showing active filter count and which filters are applied
7. Update the task display logic to show filtered results and maintain proper column organization

### Phase 3: Integration
1. Connect the filter UI to the existing React Query implementation for seamless data refetching
2. Update the getTasksByColumn function to work with filtered results
3. Add visual feedback (loading states, empty states) when filters return no results
4. Ensure filter state persists during task operations (create, move, delete)
5. Test integration with existing functionality (task creation, task movement, task deletion)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create E2E Test Specification
- Create `.claude/commands/e2e/test_task_filter_search.md` following the format of `test_basic_query.md`
- Define user story: filtering and searching tasks on the Kanban board
- List test steps covering:
  - Initial state verification (filter UI elements present)
  - Search functionality (enter text, verify filtered results)
  - Status filter (select status, verify only those tasks appear)
  - Label filter (select label, verify filtered results)
  - Clear filters (verify all tasks return)
  - Combined filters (search + status filter)
- Include screenshot capture points at each validation step
- Define success criteria for passing the E2E test

### 2. Add Filter State Management
- Open `app/client/src/pages/Kanban.tsx`
- Add state variables for filter criteria:
  - `searchText` (string)
  - `statusFilter` (string or null)
  - `labelFilter` (string or null)
- Add derived state for determining if any filters are active
- Add handler functions for updating each filter type

### 3. Update API Query to Support Filtering
- Modify the `useQuery` hook in Kanban.tsx to pass filter parameters
- Update the query key to include filter values for proper cache invalidation
- Pass `{ status: statusFilter, search: searchText }` params to `tasksAPI.list()`
- Ensure the query refetches when filter values change

### 4. Create Filter UI Components
- Add a filter toolbar section above the Kanban columns
- Create search input with placeholder "Search tasks by title or description..."
- Add status filter dropdown with options: All, Backlog, To Do, In Progress, In Review, Done
- Add label filter dropdown (initially support single label selection)
- Add a "Clear Filters" button that resets all filter states
- Style using existing Tailwind classes and custom components from styles.css

### 5. Implement Search Functionality
- Add debounced search input to prevent excessive API calls
- Use a 300ms debounce delay
- Update `searchText` state on input change
- Ensure search filters tasks by both title and description (backend already supports this)

### 6. Implement Status Filter
- Add onChange handler to status filter dropdown
- Update `statusFilter` state when user selects a status
- When "All" is selected, set statusFilter to null to show all tasks
- Ensure filtered results maintain proper column organization

### 7. Implement Label Filter
- Extract unique labels from all tasks for the filter dropdown options
- Add onChange handler to label filter dropdown
- Implement client-side filtering since backend doesn't support label filtering
- Filter tasks where `task.labels` includes the selected label

### 8. Add Filter Visual Indicators
- Display active filter count badge when filters are applied
- Show which specific filters are active (e.g., "Search: 'bug'" or "Status: In Progress")
- Add visual styling to indicate active filter state

### 9. Handle Empty Filter Results
- Add conditional rendering for empty state when no tasks match filters
- Display a friendly message: "No tasks match your filters. Try adjusting your search criteria."
- Include the "Clear Filters" button in the empty state

### 10. Update Task Display Logic
- Modify `getTasksByColumn` function to work with filtered task list
- Ensure task counts in column headers reflect filtered results
- Maintain proper column structure even with filtered results

### 11. Add Filter Persistence During Task Operations
- Ensure filters remain active after creating a new task
- Verify filters stay active after moving a task
- Verify filters stay active after deleting a task
- The existing `queryClient.invalidateQueries` should handle this automatically

### 12. Test Integration with Existing Features
- Create several test tasks with different statuses and labels
- Verify search works correctly
- Verify status filter works correctly
- Verify label filter works correctly
- Test combined filters (search + status)
- Test clearing filters
- Verify task creation works with active filters
- Verify task movement works with active filters
- Verify task deletion works with active filters

### 13. Run Validation Commands
- Execute all validation commands listed below to ensure zero regressions
- Run server tests to validate backend functionality
- Run client TypeScript checks and build to ensure no compile errors
- Execute the E2E test to validate the feature works end-to-end

## Testing Strategy

### Unit Tests
Since the backend already has test coverage in `app/server/tests/test_tasks.py`, we should add tests for:
1. Filtering tasks by search query - verify the ilike filter works correctly for title and description
2. Filtering tasks by status - verify status filter returns only matching tasks
3. Combined filters - verify multiple filters work together correctly
4. Edge cases:
   - Empty search query returns all tasks
   - Non-existent status returns empty list
   - Case-insensitive search works correctly

For the frontend, testing should focus on:
1. Filter state management updates correctly
2. API calls include proper query parameters
3. UI updates when filters change
4. Clear button resets all filters

### Edge Cases
1. **Empty search with no results** - Show appropriate empty state message
2. **Special characters in search** - Ensure proper escaping and handling
3. **Multiple labels on a task** - Verify label filter works when tasks have multiple labels
4. **Rapid filter changes** - Debouncing should prevent excessive API calls
5. **Filter during task operations** - Filters should persist when creating/moving/deleting tasks
6. **No tasks in the system** - Empty state should distinguish between "no tasks" and "no tasks matching filters"
7. **All tasks filtered out** - Every column shows empty with clear filter option
8. **Browser refresh** - Filters reset (intentional behavior for now; can be enhanced with URL params later)

## Acceptance Criteria
1. Users can enter text in a search input to filter tasks by title or description
2. Search results update with a reasonable debounce delay (300ms) to prevent excessive API calls
3. Users can select a specific status from a dropdown to filter tasks to that status
4. Users can select "All" in status filter to show all tasks across all columns
5. Users can filter tasks by label (at least single label selection)
6. A "Clear Filters" button resets all active filters and shows all tasks
7. Visual indicators show which filters are currently active
8. Task counts in column headers reflect the filtered results
9. An empty state message appears when no tasks match the active filters
10. Filters persist when users create, move, or delete tasks
11. The existing task operations (create, move, delete) continue to work without regressions
12. E2E test passes validating all filter functionality works correctly
13. Server tests pass with zero failures
14. Client builds successfully with no TypeScript errors

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md`, then read and execute the new `.claude/commands/e2e/test_task_filter_search.md` test file to validate filtering and search functionality works end-to-end
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && bun tsc --noEmit` - Run frontend tests to validate the feature works with zero regressions
- `cd app/client && bun run build` - Run frontend build to validate the feature works with zero regressions

## Notes

### Future Enhancements
1. **URL-based filter persistence** - Store filter state in URL query parameters so filters persist across browser refreshes and can be bookmarked
2. **Assignee filter** - Add filtering by assigned user (backend already supports this with assignee_id parameter)
3. **Multi-label filter** - Support selecting multiple labels simultaneously (AND/OR logic)
4. **Date range filter** - Filter by created_at or updated_at date ranges
5. **Saved filter presets** - Allow users to save commonly used filter combinations
6. **Filter by position** - Allow sorting/filtering by task position within columns
7. **Advanced search** - Support search operators like "status:done label:bug" for power users

### Technical Considerations
- The backend API already supports status, assignee, and search parameters in the `/tasks` endpoint (lines 18-42 in tasks.py)
- The search uses SQLAlchemy's `ilike` for case-insensitive partial matching
- Label filtering will need to be implemented client-side initially since the backend doesn't have a label filter parameter yet
- Consider adding backend support for label filtering in a future iteration for better performance with large datasets
- The current implementation uses React Query for data fetching, which provides automatic caching and refetching
- Debouncing the search input improves performance and reduces unnecessary API calls

### Dependencies
No new dependencies are required. The feature uses:
- Existing React hooks (useState, useEffect)
- Existing @tanstack/react-query for data fetching
- Existing Tailwind CSS for styling
- Existing axios API client

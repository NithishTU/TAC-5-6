# Feature: Task Filter and Search

## Metadata
issue_number: `1`
adw_id: `31a67217`
issue_json: `{"number":1,"title":"Task Filter and Search","body":"  Add filtering and search functionality to the Kanban board to help users find tasks quickly. Currently, users have to\n  manually scan through all tasks to find what they're looking for. This feature will provide a search bar and filter dropdowns    \n   to narrow down visible tasks."}`

## Feature Description
Add comprehensive filtering and search functionality to the Kanban board to help users quickly find and narrow down tasks. This feature will enhance productivity by allowing users to filter tasks by status, assignee, and labels, as well as search through task titles and descriptions in real-time. The feature will leverage the existing backend API filtering capabilities that are already implemented in the tasks router.

## User Story
As a developer using the Kanban board
I want to filter and search tasks by various criteria
So that I can quickly find specific tasks without manually scanning through all columns

## Problem Statement
Currently, users must manually scan through all five Kanban columns (Backlog, To Do, In Progress, In Review, Done) to find specific tasks. As the number of tasks grows, this becomes increasingly time-consuming and inefficient. Users need a way to quickly filter tasks by status, assignee, labels, or search for specific keywords in task titles and descriptions.

## Solution Statement
Implement a filter and search UI component above the Kanban board that allows users to:
1. Search tasks by title/description using a text input with real-time debounced search
2. Filter tasks by status using a multi-select dropdown
3. Filter tasks by assignee using a dropdown
4. Filter tasks by labels using a multi-select dropdown
5. Clear all filters with a single action
6. See active filter count indicator

The implementation will use the existing backend API filtering capabilities (status, assignee, search parameters) that are already implemented in `app/server/core/routers/tasks.py`.

## Relevant Files
Use these files to implement the feature:

### Backend Files
- **`app/server/core/routers/tasks.py`** (lines 16-45) - Already implements filtering logic via query parameters (`status`, `assignee`, `search`). No backend changes needed, but review to understand the API contract.
- **`app/server/core/models.py`** (lines 43-67) - Task model with labels field. Review for understanding filter capabilities.
- **`app/server/core/schemas.py`** (lines 42-83) - Task schemas including labels and assignee_id fields.

### Frontend Files
- **`app/client/src/pages/Kanban.tsx`** (lines 1-185) - Main Kanban board component where filter UI will be added. Current implementation uses TanStack Query for data fetching.
- **`app/client/src/api/client.ts`** (lines 37-58) - Tasks API client that already supports filter parameters in the `list()` method.
- **`app/client/src/types/index.ts`** (lines 11-23) - Task interface definition for TypeScript type safety.
- **`app/client/src/components/Layout.tsx`** - Main layout component for consistent styling reference.

### Documentation Files
- **`.claude/commands/test_e2e.md`** - E2E test runner template to understand how to create E2E tests
- **`.claude/commands/e2e/test_basic_query.md`** - Example E2E test file showing the format and structure

### New Files

#### E2E Test File
- **`.claude/commands/e2e/test_task_filter_search.md`** - E2E test file to validate task filtering and search functionality works as expected, following the format of existing E2E test files.

## Implementation Plan

### Phase 1: Foundation
1. Review existing backend API filtering capabilities in `app/server/core/routers/tasks.py` to understand the filtering contract (status, assignee, search parameters)
2. Analyze current Kanban.tsx component structure and state management approach
3. Identify UI/UX patterns from existing components for consistent styling
4. Plan component architecture for the filter UI (will be added to Kanban.tsx above the board)

### Phase 2: Core Implementation
1. Create filter state management in Kanban.tsx using React hooks (useState for filter values)
2. Implement search input with debouncing (using useEffect and setTimeout) to reduce API calls
3. Implement status multi-select dropdown supporting multiple status selections
4. Implement assignee dropdown (will need to fetch user list from backend)
5. Implement labels multi-select dropdown supporting multiple label selections
6. Add "Clear Filters" button to reset all filter state
7. Add active filter count badge to show number of active filters
8. Update the TanStack Query call to pass filter parameters to the API
9. Ensure the UI remains responsive and accessible

### Phase 3: Integration
1. Test filter combinations work correctly with the existing backend API
2. Ensure filters persist during task operations (create, update, delete, move)
3. Verify the Kanban board updates correctly when filters change
4. Add loading states and error handling for filter operations
5. Test edge cases (no results, invalid filters, special characters in search)
6. Ensure the UI remains performant with large numbers of tasks

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Review Backend API and Existing Code
- Read `app/server/core/routers/tasks.py` to understand the filtering API contract
- Confirm that status, assignee, and search parameters are already supported
- Review `app/client/src/api/client.ts` to understand how to pass filter parameters
- Review current Kanban.tsx implementation to understand state management patterns

### Step 2: Create E2E Test File
- Create `.claude/commands/e2e/test_task_filter_search.md` following the format of `.claude/commands/e2e/test_basic_query.md`
- Define test steps to validate:
  - Search input filters tasks by title/description
  - Status filter shows only tasks with selected status
  - Assignee filter shows only tasks assigned to selected user
  - Labels filter shows only tasks with selected labels
  - Clear filters button resets all filters
  - Active filter count displays correctly
  - Multiple filters work together
- Include screenshot capture points for visual validation

### Step 3: Implement Filter State Management
- Add filter state variables to Kanban.tsx using useState:
  - `searchQuery` (string)
  - `statusFilter` (string[])
  - `assigneeFilter` (string | null)
  - `labelsFilter` (string[])
- Create helper functions to update filter state
- Create a clearFilters function to reset all filters

### Step 4: Implement Search Input with Debouncing
- Add search input field above the Kanban board
- Implement debounced search using useEffect with setTimeout (300ms delay)
- Store the debounced search value in a separate state variable
- Add clear button (X icon) inside search input when text is present

### Step 5: Implement Status Multi-Select Filter
- Add status multi-select dropdown using HTML select with multiple attribute or custom multi-select component
- Display all possible statuses: backlog, todo, in_progress, in_review, done
- Update statusFilter state when selections change
- Display selected status count in the dropdown button/label

### Step 6: Implement Assignee Filter
- Fetch users list from backend (may need to add a basic /api/users endpoint or use existing user data)
- Add assignee dropdown with all available users
- Update assigneeFilter state when selection changes
- Show "All Users" as default option

### Step 7: Implement Labels Multi-Select Filter
- Extract unique labels from all tasks to populate the dropdown
- Add labels multi-select dropdown
- Update labelsFilter state when selections change
- Display selected labels count in the dropdown button/label

### Step 8: Implement Clear Filters Button and Filter Count Badge
- Add "Clear Filters" button that resets all filter state
- Calculate active filter count (non-empty filter values)
- Display badge showing active filter count next to the Clear Filters button
- Disable Clear Filters button when no filters are active

### Step 9: Connect Filters to API Query
- Update the useQuery call in Kanban.tsx to include filter parameters
- Pass searchQuery, statusFilter, assigneeFilter, and labelsFilter to tasksAPI.list()
- Update the queryKey to include filter values for proper cache invalidation
- Ensure the board re-fetches when filter values change

### Step 10: Add UI Polish and Accessibility
- Style filter components consistently with existing UI (Tailwind CSS classes)
- Add proper labels and placeholders for all inputs
- Add aria-labels for accessibility
- Add loading state indication when filters are being applied
- Add empty state message when no tasks match filters
- Ensure responsive design for mobile/tablet screens

### Step 11: Test Filter Combinations
- Manually test various filter combinations in the browser
- Test edge cases: empty search, special characters, non-existent assignees
- Test that filters work correctly with task operations (create, move, delete)
- Verify filter state persists during task mutations but respects the filters

### Step 12: Run Validation Commands
- Execute all validation commands to ensure zero regressions
- Run E2E test to validate the feature works as expected
- Fix any issues discovered during testing

## Testing Strategy

### Unit Tests
While the backend already has tests in `app/server/tests/test_tasks.py` that validate filtering logic, no new backend tests are needed since we're not modifying backend code.

For the frontend:
- Test filter state management logic
- Test debounce functionality for search input
- Test that correct API parameters are passed based on filter state
- Test clear filters functionality resets all state

### Integration Tests
- Test that filters correctly communicate with the backend API
- Test that multiple filters work together (e.g., search + status filter)
- Test that task operations (create, update, delete, move) work correctly with active filters

### Edge Cases
- Empty search query
- Search with special characters (quotes, brackets, etc.)
- No tasks matching filter criteria
- Filter by non-existent assignee
- Filter by non-existent labels
- All filters applied simultaneously
- Very long search queries
- Rapid filter changes (debounce handling)
- Filter state during task mutations

## Acceptance Criteria
1. Search input filters tasks by title and description with debouncing
2. Status multi-select dropdown allows filtering by one or more statuses
3. Assignee dropdown allows filtering by assignee
4. Labels multi-select dropdown allows filtering by one or more labels
5. Multiple filters work together correctly (AND logic)
6. Clear Filters button resets all filters to default state
7. Active filter count badge displays the number of active filters
8. Kanban board updates in real-time as filters change
9. Filter UI is responsive and accessible
10. Empty state message displays when no tasks match filters
11. All existing Kanban functionality works with filters active
12. Backend API calls include correct filter parameters
13. E2E test passes validating all filter scenarios
14. No regressions in existing task management features

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

Read `.claude/commands/test_e2e.md`, then read and execute the new E2E test file `.claude/commands/e2e/test_task_filter_search.md` to validate this functionality works end-to-end with visual screenshots.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && bun tsc --noEmit` - Run frontend TypeScript compilation to validate no type errors
- `cd app/client && bun run build` - Run frontend build to validate the feature builds successfully with zero errors

## Notes

### Backend Considerations
- The backend already supports filtering via query parameters (status, assignee, search) in `app/server/core/routers/tasks.py` lines 18-42
- No backend changes are required for this feature
- The search parameter uses SQL ILIKE for case-insensitive partial matching on title and description

### Frontend Architecture
- Use TanStack Query's built-in caching and refetching behavior
- Include filter values in the queryKey to ensure proper cache invalidation
- Use React hooks (useState, useEffect) for state management
- Implement debouncing using useEffect to avoid excessive API calls

### UX Considerations
- Debounce search input by 300ms to reduce API calls while typing
- Show loading indicator when filters are being applied
- Display active filter count to help users understand what filters are active
- Provide clear visual feedback when no tasks match the current filters
- Ensure filters are easily discoverable and not hidden behind menus

### Future Enhancements (Out of Scope)
- Save filter preferences to localStorage or user settings
- Shareable filter URLs with query parameters
- Advanced filters (date ranges, custom fields)
- Filter presets/saved searches
- Export filtered results

### Technical Debt
- May need to create a basic /api/users endpoint if user list is not already available for the assignee dropdown
- Consider extracting the filter UI into a separate component if it becomes complex
- Consider using a proper multi-select library if the native HTML select doesn't provide good UX

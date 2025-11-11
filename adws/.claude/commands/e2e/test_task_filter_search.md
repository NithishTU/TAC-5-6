# E2E Test: Task Filter and Search

## Test Objective
Validate that the task filtering and search functionality works correctly on the Kanban board, allowing users to filter tasks by search text, status, assignee, and labels.

## Prerequisites
- Server is running at http://localhost:8000
- Client is running at http://localhost:5173
- Database is initialized with sample data
- User is logged in

## Test Steps

### 1. Navigate to Kanban Board
- Navigate to http://localhost:5173
- Take screenshot: `01_initial_kanban_view.png`
- Verify the Kanban board loads with all columns visible (Backlog, To Do, In Progress, In Review, Done)
- Verify filter controls are visible above the board

### 2. Create Test Tasks
Create several test tasks with different properties for thorough testing:

#### Task 1: Frontend Search Test
- Title: "Implement search functionality"
- Description: "Add search bar to filter tasks by title"
- Status: To Do
- Labels: ["frontend", "feature"]

#### Task 2: Backend API Test
- Title: "Create API endpoint"
- Description: "Build backend API for task filtering"
- Status: In Progress
- Labels: ["backend", "api"]

#### Task 3: Database Query Test
- Title: "Optimize database queries"
- Description: "Improve query performance for large datasets"
- Status: Backlog
- Labels: ["backend", "performance"]

#### Task 4: UI Design Test
- Title: "Design filter UI components"
- Description: "Create mockups for filter interface"
- Status: Done
- Labels: ["frontend", "design"]

Take screenshot after creating tasks: `02_tasks_created.png`

### 3. Test Search Functionality
- Click on the search input field
- Type "search" into the search input
- Wait for debounce (300ms) and observe results
- Verify only "Implement search functionality" task is visible
- Take screenshot: `03_search_active.png`
- Clear the search input
- Verify all tasks reappear

### 4. Test Status Filter
- Click on the status filter dropdown
- Select "In Progress"
- Verify only tasks with "In Progress" status are visible
- Verify the task "Create API endpoint" is shown
- Take screenshot: `04_status_filter_active.png`
- Click "All Statuses" or clear the filter
- Verify all tasks reappear

### 5. Test Label Filter
- Click on the label filter dropdown
- Select "frontend" label
- Verify only tasks with "frontend" label are visible
- Verify tasks "Implement search functionality" and "Design filter UI components" are shown
- Take screenshot: `05_label_filter_active.png`
- Clear the label filter
- Verify all tasks reappear

### 6. Test Combined Filters
- Type "API" in the search input
- Select "backend" from label filter
- Verify only "Create API endpoint" task is visible (matches both search and label filter)
- Take screenshot: `06_combined_filters_active.png`
- Verify active filter count badge shows "2" (search + label)

### 7. Test Clear All Filters
- With filters active from previous step, click "Clear All Filters" button
- Verify all filters are reset:
  - Search input is empty
  - No status filters selected
  - No label filters selected
  - Active filter count is 0
- Verify all tasks are visible again
- Take screenshot: `07_filters_cleared.png`

### 8. Test URL Parameter Persistence
- Apply a search filter: type "database" in search
- Copy the URL from browser address bar
- Verify URL contains query parameter like `?search=database`
- Open the URL in a new browser tab/window
- Verify the search filter is automatically applied
- Verify the correct tasks are filtered based on the URL parameter

### 9. Test Empty State
- Type a search query that matches no tasks: "xyznonexistent"
- Verify empty state message is displayed: "No tasks found matching your filters"
- Verify "Clear Filters" button is shown in empty state
- Click the "Clear Filters" button in empty state
- Verify all tasks reappear

### 10. Test Assignee Filter (if assignees exist)
- If tasks have assignees assigned:
  - Click on assignee filter dropdown
  - Select an assignee
  - Verify only tasks assigned to that user are visible
  - Clear the assignee filter
  - Verify all tasks reappear

## Success Criteria
- ✓ Search input filters tasks by title and description in real-time
- ✓ Search has debounce delay (no excessive API calls)
- ✓ Status filter dropdown allows filtering by status
- ✓ Label filter allows filtering by labels
- ✓ Multiple filters can be combined (search + status + labels)
- ✓ "Clear All Filters" button resets all filters
- ✓ Active filter count badge shows correct number
- ✓ URL parameters reflect current filter state
- ✓ Filter state persists when URL is shared/refreshed
- ✓ Empty state displays when no tasks match filters
- ✓ All filter operations are smooth and responsive
- ✓ Task counts in columns update correctly when filtered

## Expected Screenshots
1. `01_initial_kanban_view.png` - Initial Kanban board with filter controls visible
2. `02_tasks_created.png` - Board with test tasks created
3. `03_search_active.png` - Search filter active showing filtered results
4. `04_status_filter_active.png` - Status filter active showing only "In Progress" tasks
5. `05_label_filter_active.png` - Label filter active showing only "frontend" tasks
6. `06_combined_filters_active.png` - Multiple filters active showing combined results
7. `07_filters_cleared.png` - All filters cleared, all tasks visible

## Notes
- Debounce delay for search is 300ms - wait for results to appear
- Label filtering is implemented on the frontend
- Status and search filtering uses backend API
- URL parameters should update as filters change
- Filter state should survive page refresh via URL parameters

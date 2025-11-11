# E2E Test: Task Filter and Search

Test the task filter and search functionality in the Kanban board.

## User Story

As a developer using the Kanban board
I want to filter and search tasks by status, labels, and text content
So that I can quickly find specific tasks without manually scanning through all columns

## Test Steps

1. Navigate to the `Application URL/kanban`
2. Take a screenshot of the initial Kanban board state
3. **Verify** core UI elements are present:
   - Search input field with placeholder "Search tasks..."
   - Status filter dropdown with "All Statuses" option
   - Filter panel card is visible
   - All 5 Kanban columns (Backlog, To Do, In Progress, In Review, Done)

4. Create test tasks for filtering:
   - Click "Add Task" to create task: "Fix authentication bug" with status "To Do" and label "bug"
   - Click "Add Task" to create task: "Add new feature dashboard" with status "In Progress" and label "feature"
   - Click "Add Task" to create task: "Fix database connection" with status "Done" and label "bug"
   - Click "Add Task" to create task: "Update documentation" with status "To Do" and label "docs"
5. Take a screenshot showing all created tasks

6. **Test Search Functionality:**
   - Type "fix" in the search input field
   - **Verify** only tasks with "fix" in title/description are displayed
   - **Verify** "Active filters" section appears showing: Search: "fix"
   - Take a screenshot of filtered results
   - Click the "×" button next to the search filter badge to clear it
   - **Verify** all tasks are displayed again

7. **Test Status Filter:**
   - Select "To Do" from the status dropdown
   - **Verify** only tasks with "To Do" status are displayed
   - **Verify** the status dropdown has blue border indicating active filter
   - **Verify** "Active filters" section shows: Status: To Do
   - Take a screenshot of status filtered results
   - Select "All Statuses" to clear the filter
   - **Verify** all tasks are displayed again

8. **Test Labels Filter:**
   - Select "bug" from the labels filter dropdown
   - **Verify** only tasks with "bug" label are displayed
   - **Verify** the labels dropdown has blue border indicating active filter
   - **Verify** "Active filters" section shows: Label: bug
   - Take a screenshot of label filtered results
   - Click the "×" button next to the label filter badge to clear it
   - **Verify** all tasks are displayed again

9. **Test Combined Filters:**
   - Type "fix" in the search input
   - Select "To Do" from the status dropdown
   - **Verify** only tasks matching both filters are displayed (should show "Fix authentication bug")
   - **Verify** "Active filters" section shows both: Search: "fix" AND Status: To Do
   - **Verify** "Clear Filters" button is visible
   - Take a screenshot of combined filtered results

10. **Test Clear All Filters:**
    - Click the "Clear Filters" button
    - **Verify** search input is cleared
    - **Verify** status dropdown shows "All Statuses"
    - **Verify** no filter badges are displayed
    - **Verify** all tasks are displayed again
    - Take a screenshot showing cleared filters

11. **Test Empty State:**
    - Type "nonexistent" in the search input
    - **Verify** empty state message appears: "No tasks match your filters."
    - **Verify** helpful text appears: "Try adjusting your search criteria or clear all filters."
    - **Verify** "Clear All Filters" button is displayed in empty state
    - Take a screenshot of empty state
    - Click "Clear All Filters" button in empty state
    - **Verify** all tasks are displayed again

12. **Test Multi-Label Filter:**
    - Select "bug" from the labels filter dropdown
    - Then select "feature" from the labels filter dropdown
    - **Verify** tasks with either "bug" OR "feature" label are displayed
    - **Verify** both label badges appear in "Active filters" section
    - Take a screenshot of multi-label filter results

13. **Test Filter Persistence During Task Operations:**
    - Apply search filter: "fix"
    - Move "Fix authentication bug" to "In Progress" column
    - **Verify** the filter remains active (search still shows "fix")
    - **Verify** the task appears in the correct column
    - Take a screenshot showing filter persists after task move

## Success Criteria
- Search input filters tasks by title and description with 300ms debouncing
- Status filter dropdown correctly filters tasks by status
- Labels filter correctly filters tasks by labels
- Multiple labels can be selected and work with OR logic
- Combined filters work correctly (search + status + labels)
- Active filter indicators display correctly with removable badges
- "Clear Filters" button removes all filters
- Empty state displays when no tasks match filters
- Filter state persists during task operations (move, delete)
- All filter controls have proper visual indicators when active (blue border)
- Minimum 8 screenshots are taken documenting all test scenarios

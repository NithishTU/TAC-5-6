# E2E Test: Task Filter and Search

Test filtering and search functionality in the Kanban board application.

## User Story

As a developer using the Kanban board
I want to search and filter tasks by text, status, and labels
So that I can quickly find relevant tasks without scanning through all columns manually

## Test Steps

1. Navigate to the `Application URL`
2. Take a screenshot of the initial state
3. **Verify** the page shows the Kanban board with columns: Backlog, To Do, In Progress, In Review, Done
4. **Verify** filter UI elements are present:
   - Search input textbox with placeholder "Search tasks by title or description..."
   - Status filter dropdown
   - Label filter dropdown
   - Clear Filters button

5. Create test data (if not already present):
   - Create task "Fix login bug" with label "bug" and status "In Progress"
   - Create task "Add user authentication" with label "feature" and status "To Do"
   - Create task "Update documentation" with label "docs" and status "Done"
   - Create task "Fix navigation issue" with label "bug" and status "Backlog"

6. **Test Search Functionality:**
   - Enter "bug" in the search input
   - Take a screenshot of the search input
   - **Verify** only tasks with "bug" in title or description are shown
   - **Verify** filter count indicator shows active filters
   - Take a screenshot of the filtered results

7. **Test Clear Filters:**
   - Click the "Clear Filters" button
   - **Verify** all tasks are visible again
   - **Verify** filter indicators are cleared
   - Take a screenshot of cleared state

8. **Test Status Filter:**
   - Select "In Progress" from the status filter dropdown
   - **Verify** only tasks with "In Progress" status are shown
   - **Verify** other columns show as empty or hidden
   - Take a screenshot of status filtered results

9. **Test Label Filter:**
   - Click "Clear Filters" to reset
   - Select "bug" from the label filter dropdown
   - **Verify** only tasks with "bug" label are shown
   - Take a screenshot of label filtered results

10. **Test Combined Filters:**
    - Click "Clear Filters" to reset
    - Enter "Fix" in the search input
    - Select "bug" from the label filter dropdown
    - **Verify** only tasks matching both criteria are shown
    - **Verify** filter count shows "2 filters active" or similar
    - Take a screenshot of combined filtered results

11. **Test Empty Results:**
    - Enter "nonexistent_task_xyz123" in the search input
    - **Verify** empty state message appears: "No tasks match your filters"
    - **Verify** "Clear Filters" button is visible in empty state
    - Take a screenshot of empty state

12. **Test Filter Persistence During Task Operations:**
    - Click "Clear Filters" to reset
    - Apply a filter (e.g., search for "bug")
    - Create a new task with "bug" in the title
    - **Verify** the filter remains active
    - **Verify** the new task appears in filtered results
    - Move a task to a different column
    - **Verify** the filter remains active
    - Take a screenshot of final state

## Success Criteria
- Search input filters tasks by title and description
- Search uses debouncing (300ms delay)
- Status filter shows only tasks with selected status
- Label filter shows only tasks with selected label
- Clear Filters button resets all filters
- Active filter indicators show which filters are applied
- Empty state displays when no tasks match filters
- Filters persist during task create/move/delete operations
- Task counts in columns reflect filtered results
- At least 7 screenshots are captured at key validation points

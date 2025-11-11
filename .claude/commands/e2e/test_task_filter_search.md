# E2E Test: Task Filter and Search

Test task filtering and search functionality in the Kanban board application.

## User Story

As a project manager or developer
I want to search and filter tasks on the Kanban board by text, status, and labels
So that I can quickly find specific tasks without manually scanning through all columns

## Test Steps

1. Navigate to the `Application URL`
2. Take a screenshot of the initial Kanban board state
3. **Verify** the page contains "Kanban Board" heading
4. **Verify** filter UI elements are present:
   - Search input with placeholder "Search tasks..."
   - Status dropdown filter
   - Label filter dropdown
   - Task count display

5. Create test tasks with different statuses and labels:
   - Task 1: "Implement authentication" with status "in_progress" and label "backend"
   - Task 2: "Design login page" with status "todo" and label "frontend"
   - Task 3: "Write API tests" with status "done" and label "testing"
   - Task 4: "Setup CI/CD pipeline" with status "backlog" and label "devops"
6. Take a screenshot of the board with all test tasks

7. **Test Search Functionality**
   - Enter "authentication" in the search input
   - Wait 400ms for debounce
   - **Verify** only tasks matching "authentication" are displayed
   - **Verify** task count shows correct filtered count
   - **Verify** active filter badge displays "Searching: authentication"
   - Take a screenshot of search results

8. Clear the search by clicking "Clear Filters" button
9. **Verify** all tasks are displayed again
10. Take a screenshot after clearing filters

11. **Test Status Filter**
    - Select "In Progress" from status dropdown
    - **Verify** only tasks with "in_progress" status are displayed
    - **Verify** active filter badge displays "Status: In Progress"
    - **Verify** other columns show 0 tasks
    - Take a screenshot of status-filtered results

12. Clear the status filter by clicking "Clear Filters"
13. **Verify** all tasks are visible again

14. **Test Label Filter**
    - Select "frontend" from label filter dropdown
    - **Verify** only tasks with "frontend" label are displayed
    - **Verify** active filter badge displays "Label: frontend"
    - Take a screenshot of label-filtered results

15. Clear filters and test combined filters:
    - Select "To Do" from status filter
    - Select "frontend" from label filter
    - **Verify** only tasks matching both filters are displayed
    - **Verify** both filter badges are visible
    - Take a screenshot of combined filters

16. **Test Clear Filters Button**
    - Click "Clear Filters" button
    - **Verify** all filter inputs are reset
    - **Verify** all tasks are displayed
    - **Verify** "Clear Filters" button is hidden
    - Take a screenshot of cleared state

17. **Test Task Count Display**
    - Apply any filter
    - **Verify** task count shows "Showing X of Y tasks" format
    - Clear filters
    - **Verify** task count shows "Y tasks" format

## Success Criteria
- Search input filters tasks by title with 300ms debounce
- Status dropdown filters tasks correctly
- Label filter shows tasks with matching labels
- Active filters display as badges with descriptive text
- "Clear Filters" button resets all filters
- Task count reflects filtered results accurately
- Filtered tasks display in correct Kanban columns
- All filter combinations work correctly
- At least 7 screenshots are captured

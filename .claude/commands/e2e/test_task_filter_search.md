# E2E Test: Task Filter and Search

Test the task filtering and search functionality on the Kanban board.

## User Story

As a Kanban board user
I want to search and filter tasks by text, status, assignee, and labels
So that I can quickly find specific tasks without manually scanning through all columns

## Test Steps

1. Navigate to the `Application URL` (should redirect to /kanban)
2. Take a screenshot of the initial Kanban board state
3. **Verify** the filter UI elements are present:
   - Search input textbox with placeholder "Search tasks..."
   - Status dropdown filter
   - Assignee dropdown filter
   - Clear Filters button

4. Create test task 1:
   - Click "Add Task" button
   - Enter title: "Implement authentication feature"
   - Enter description: "Add JWT-based authentication system"
   - Set status: "To Do"
   - Set assignee: First available user
   - Submit the form
   - **Verify** task appears in the "To Do" column

5. Create test task 2:
   - Click "Add Task" button
   - Enter title: "Fix login bug"
   - Enter description: "Users cannot log in with special characters"
   - Set status: "In Progress"
   - Set assignee: First available user
   - Submit the form
   - **Verify** task appears in the "In Progress" column

6. Create test task 3:
   - Click "Add Task" button
   - Enter title: "Update documentation"
   - Enter description: "Add API endpoint documentation"
   - Set status: "Done"
   - Set assignee: Second available user (if exists, otherwise first)
   - Submit the form
   - **Verify** task appears in the "Done" column

7. Take a screenshot showing all three test tasks created

8. Test search functionality:
   - Click into the search input field
   - Type "authentication"
   - Wait 500ms for debounce
   - **Verify** only task 1 ("Implement authentication feature") is visible
   - **Verify** tasks 2 and 3 are not visible
   - Take a screenshot of search results

9. Clear search and test search by description:
   - Clear the search input
   - Type "special characters"
   - Wait 500ms for debounce
   - **Verify** only task 2 ("Fix login bug") is visible
   - Take a screenshot of description search results

10. Test status filtering:
    - Clear the search input
    - Click the status dropdown
    - Select "In Progress"
    - **Verify** only task 2 appears
    - **Verify** tasks 1 and 3 are not visible
    - Take a screenshot of status filter results

11. Test assignee filtering:
    - Click the status dropdown
    - Select "All Statuses"
    - Click the assignee dropdown
    - Select the first available user
    - **Verify** tasks 1 and 2 are visible (if both assigned to first user)
    - **Verify** task 3 is not visible (if assigned to different user)
    - Take a screenshot of assignee filter results

12. Test combined filters:
    - With assignee filter still active
    - Type "bug" in the search input
    - Wait 500ms for debounce
    - **Verify** only task 2 is visible
    - Take a screenshot of combined filters

13. Test clear filters:
    - Click the "Clear Filters" button
    - **Verify** all three tasks are visible again
    - **Verify** search input is empty
    - **Verify** status dropdown shows "All Statuses"
    - **Verify** assignee dropdown shows "All Assignees"
    - Take a screenshot of cleared filters

14. Test empty search results:
    - Type "nonexistent query xyz123" in search input
    - Wait 500ms for debounce
    - **Verify** no tasks are visible or "No tasks found" message appears
    - Take a screenshot of empty results

15. Clear filters one final time and verify all tasks are restored

## Success Criteria
- Filter UI elements render correctly and are accessible
- Search input filters tasks by title (case-insensitive)
- Search input filters tasks by description (case-insensitive)
- Search has proper debouncing (300-500ms)
- Status dropdown filters tasks to show only selected status
- Assignee dropdown filters tasks to show only tasks for selected user
- Multiple filters work together (search + status, search + assignee)
- Clear Filters button resets all filters and shows all tasks
- Empty search results are handled gracefully
- Task creation works while filters are active
- At least 10 screenshots are captured showing each test scenario

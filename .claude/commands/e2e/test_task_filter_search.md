# E2E Test: Task Filter and Search

Test task filtering and search functionality in the Kanban board application.

## User Story

As a developer using the Kanban board
I want to filter and search for tasks
So that I can quickly find specific tasks without scanning through all columns manually

## Test Steps

1. Navigate to the `Application URL`
2. Take a screenshot of the initial state
3. **Verify** the page title contains "Kanban Board"
4. **Verify** core filter UI elements are present:
   - Search input with placeholder "Search tasks..."
   - Status filter dropdown with "All Statuses" option
   - Assignee filter dropdown with "All Assignees" option
   - Clear Filters button

5. **Verify** initial state shows all tasks across all columns
6. Take a screenshot of the unfiltered board

7. Enter the search query: "test"
8. Wait for debouncing (500ms)
9. **Verify** only tasks with "test" in title or description are shown
10. **Verify** filter status shows "Found X task(s) (filtered)"
11. **Verify** active filter count shows "1 filter active"
12. Take a screenshot of the search results

13. Clear the search input
14. Wait for debouncing (500ms)
15. **Verify** all tasks are shown again

16. Select "In Progress" from the status filter dropdown
17. **Verify** only tasks with status "in_progress" are shown
18. **Verify** tasks appear only in the "In Progress" column
19. **Verify** filter status shows "Found X task(s) (filtered)"
20. **Verify** active filter count shows "1 filter active"
21. Take a screenshot of the status filter results

22. Click the "Clear Filters" button
23. **Verify** the status filter resets to "All Statuses"
24. **Verify** all tasks are shown again
25. **Verify** active filter count is not displayed (0 filters active)
26. Take a screenshot after clearing filters

27. Select an assignee from the assignee filter dropdown (if any users exist)
28. **Verify** only tasks assigned to that user are shown
29. **Verify** filter status shows "Found X task(s) (filtered)"
30. **Verify** active filter count shows "1 filter active"
31. Take a screenshot of the assignee filter results

32. Enter a search query: "bug"
33. Wait for debouncing (500ms)
34. **Verify** both search and assignee filters are applied (AND logic)
35. **Verify** filter status shows "Found X task(s) (filtered)"
36. **Verify** active filter count shows "2 filters active"
37. Take a screenshot of multiple filters active

38. Click the "Clear Filters" button
39. **Verify** all filters are reset
40. **Verify** search input is empty
41. **Verify** status filter shows "All Statuses"
42. **Verify** assignee filter shows "All Assignees"
43. **Verify** all tasks are shown
44. Take a screenshot of the final cleared state

45. Enter a search query that matches no tasks: "zzzznonexistent"
46. Wait for debouncing (500ms)
47. **Verify** "No tasks found matching your filters" message is displayed
48. **Verify** a "Clear all filters" link is shown in the no results message
49. Take a screenshot of the no results state

50. Click the "Clear all filters" link in the no results message
51. **Verify** search is cleared and all tasks are shown again

## Success Criteria
- Search input filters tasks by title and description in real-time
- Search is debounced (no excessive API calls)
- Status filter dropdown filters tasks by status
- Assignee filter dropdown filters tasks by assignee
- Multiple filters work together with AND logic
- Clear Filters button resets all filters
- Active filter count is displayed correctly
- Filter status shows task count and "(filtered)" text
- Loading indicator shows while fetching
- No results message appears when no tasks match
- Clear filters link in no results message works
- All existing task management features still work
- At least 8 screenshots are taken

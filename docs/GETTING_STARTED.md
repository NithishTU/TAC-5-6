# Getting Started with Dev Dashboard

This guide will help you set up and start using the Developer Productivity Dashboard.

## Quick Start

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.sample .env
```

Edit `.env` and configure:
- `SECRET_KEY`: Generate a secure random key
- `DATABASE_URL`: Keep default for SQLite, or configure PostgreSQL
- GitHub OAuth credentials (optional for MVP)

### 2. Backend Setup

```bash
cd app/server

# Create and activate virtual environment
python -m venv .venv

# On Windows
.venv\Scripts\activate

# On macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
python server.py
```

Backend runs at: **http://localhost:8000**

API docs available at: **http://localhost:8000/docs**

### 3. Frontend Setup

```bash
cd app/client

# Install dependencies (using npm)
npm install

# Or using bun (faster)
bun install

# Start development server
npm run dev
# Or: bun run dev
```

Frontend runs at: **http://localhost:5173**

### 4. Access the Application

Open your browser and go to:
```
http://localhost:5173
```

You should see the Developer Productivity Dashboard!

## Using the Kanban Board

1. Navigate to the **Kanban** page from the sidebar
2. Use the quick add form at the top to create tasks
3. Select a column (status) and enter a task title
4. Click "Add Task"
5. Use the ← → arrows on task cards to move them between columns
6. Click "Delete" to remove a task

## Understanding the Dashboard

The dashboard shows:
- **Total Tasks**: All tasks in the system
- **Completed**: Tasks in "Done" status
- **Active Tasks**: Tasks in "In Progress" or "In Review"
- **Time Logged**: Total time tracked (when time tracking is implemented)

## Working with ADW (AI Developer Workflow)

### Starting ADW Triggers

In a separate terminal:

```bash
# Option 1: Cron trigger (polls GitHub every 20s)
python adws/adw_triggers/trigger_cron.py

# Option 2: Webhook trigger (real-time)
python adws/adw_triggers/trigger_webhook.py
```

### Creating Issues for ADW

Create GitHub issues with special tags:

**Feature Request:**
```bash
gh issue create \
  --title "Add user authentication" \
  --body "/feature

## Description
Implement user authentication with email/password.

## Acceptance Criteria
- [ ] User registration
- [ ] User login
- [ ] Password reset
- [ ] Session management"
```

**Bug Report:**
```bash
gh issue create \
  --title "Timer stops when page refreshes" \
  --body "/bug

## Steps to Reproduce
1. Start a timer
2. Refresh the page
3. Timer is no longer running

## Expected
Timer should resume

## Actual
Timer is lost"
```

**Chore/Maintenance:**
```bash
gh issue create \
  --title "Update dependencies" \
  --body "/chore

Update all npm and pip dependencies to latest versions."
```

### ADW Workflow Steps

When you create an issue, ADW automatically:

1. **Detects** the issue (via trigger)
2. **Plans**: Generates implementation spec
3. **Builds**: Writes the code
4. **Tests**: Runs test suite
5. **Reviews**: Takes screenshots and validates
6. **Documents**: Generates documentation
7. **Submits**: Creates a pull request
8. **Updates**: Comments progress on the issue

You'll see comments on the issue at each step!

## Next Steps

### Enable GitHub Integration

1. Create a GitHub OAuth App:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new OAuth App
   - Set callback URL: `http://localhost:8000/api/auth/github/callback`

2. Add credentials to `.env`:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

3. Restart backend server

### Set Up PostgreSQL (Optional, for Production)

1. Install PostgreSQL

2. Create database:
   ```sql
   CREATE DATABASE devdash;
   CREATE USER devdash_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE devdash TO devdash_user;
   ```

3. Update `.env`:
   ```
   DATABASE_URL=postgresql://devdash_user:your_password@localhost:5432/devdash
   ```

4. Restart backend

### Enable Background Tasks (Optional)

For GitHub sync and scheduled tasks:

1. Install and start Redis:
   ```bash
   # On Windows (using Chocolatey)
   choco install redis-64

   # On macOS
   brew install redis
   brew services start redis

   # On Linux
   sudo apt-get install redis-server
   sudo service redis-server start
   ```

2. Start Celery worker:
   ```bash
   cd app/server
   celery -A core.celery_app worker --loglevel=info
   ```

## Troubleshooting

### Backend won't start

- Check Python version: `python --version` (needs 3.10+)
- Check if port 8000 is available
- Check `.env` file exists and has correct values
- Check database connection in `.env`

### Frontend won't start

- Check Node version: `node --version` (needs 18+)
- Check if port 5173 is available
- Delete `node_modules` and run `npm install` again
- Clear browser cache

### API requests failing

- Check backend is running at http://localhost:8000
- Check CORS settings in `.env` (`ALLOWED_ORIGINS`)
- Open browser console for error details
- Check backend logs for errors

### ADW not processing issues

- Check trigger is running
- Check `CLAUDE_CODE_PATH` in `.env`
- Check `GITHUB_PAT` is valid
- Check issue has `/feature`, `/bug`, or `/chore` tag
- Check ADW logs in `agents/` directory

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- **Backend**: Automatically reloads when Python files change
- **Frontend**: Automatically reloads when React files change

### Database Reset

To reset the database:
```bash
# SQLite
rm devdash.db

# PostgreSQL
psql -d devdash -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Then restart backend to recreate tables
```

### Viewing Logs

- **Backend logs**: Printed to console where `python server.py` is running
- **Frontend logs**: Browser console (F12 → Console tab)
- **ADW logs**: `agents/{adw_id}/execution.log`

### API Testing

Use the built-in API docs:
```
http://localhost:8000/docs
```

Or use curl/httpx:
```bash
# Health check
curl http://localhost:8000/api/health

# List tasks
curl http://localhost:8000/api/tasks

# Create task
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task", "status": "todo"}'
```

## Getting Help

- **Documentation**: See `docs/` directory
- **Specification**: See `dev-dashboard-spec.md` for detailed features
- **GitHub Issues**: Report bugs or request features
- **ADW System**: See `adws/README.md` (if exists)

---

Happy coding! 🚀

# Developer Productivity Dashboard

A comprehensive developer productivity platform that integrates with GitHub to provide real-time insights, task management, time tracking, and team analytics.

## Features

### 🎯 Core Features (MVP)
- **Kanban Board**: Visual task management with drag-and-drop
- **GitHub Integration**: Track PRs, commits, and issues
- **Dashboard**: Real-time productivity metrics
- **Task Management**: Create, update, and organize tasks

### 🚀 Planned Features
- **Time Tracking**: Pomodoro timer and time entries
- **Team Analytics**: Velocity charts, burndown charts, PR metrics
- **Sprint Planning**: Sprint management with story points
- **Focus Mode**: Distraction-free development environment

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL ORM
- **PostgreSQL/SQLite** - Database
- **Celery + Redis** - Background tasks
- **PyGithub** - GitHub API integration

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TanStack Query** - Data fetching
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ (or Bun)
- Git
- (Optional) PostgreSQL for production

### Installation

1. **Clone the repository**
```bash
cd D:\TAC\dev-dashboard
```

2. **Set up environment variables**
```bash
cp .env.sample .env
# Edit .env with your configuration
```

3. **Set up backend**
```bash
cd app/server

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (if using Alembic)
# alembic upgrade head

# Start backend server
python server.py
# Or: uvicorn server:app --reload
```

Backend will be available at `http://localhost:8000`

4. **Set up frontend**
```bash
cd app/client

# Install dependencies
npm install
# Or: bun install

# Start development server
npm run dev
# Or: bun run dev
```

Frontend will be available at `http://localhost:5173`

### Running with ADW (AI Developer Workflow)

This project includes the ADW system for automated development from GitHub issues.

1. **Start ADW trigger** (in a separate terminal)
```bash
# Cron trigger (polls every 20 seconds)
python adws/adw_triggers/trigger_cron.py

# OR webhook trigger (real-time via GitHub webhooks)
python adws/adw_triggers/trigger_webhook.py
```

2. **Create a GitHub issue** with appropriate tag:
```bash
gh issue create \
  --title "Add dark mode toggle" \
  --body "/feature

## Description
Users should be able to toggle between light and dark themes.

## Acceptance Criteria
- [ ] Toggle button in header
- [ ] Theme persists across sessions
- [ ] Smooth transition between themes"
```

3. **ADW will automatically**:
   - Generate implementation spec
   - Write the code
   - Run tests
   - Take screenshots
   - Create documentation
   - Submit pull request
   - Comment progress on issue

## Project Structure

```
dev-dashboard/
├── app/
│   ├── server/              # FastAPI backend
│   │   ├── core/
│   │   │   ├── routers/     # API endpoints
│   │   │   ├── models.py    # Database models
│   │   │   ├── schemas.py   # Pydantic schemas
│   │   │   ├── database.py  # DB connection
│   │   │   └── config.py    # Settings
│   │   ├── tests/           # Backend tests
│   │   ├── server.py        # Main application
│   │   └── requirements.txt
│   └── client/              # React frontend
│       ├── src/
│       │   ├── api/         # API client
│       │   ├── components/  # React components
│       │   ├── pages/       # Page components
│       │   ├── types/       # TypeScript types
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── package.json
│       └── vite.config.ts
├── adws/                    # ADW workflow system
│   ├── adw_plan.py
│   ├── adw_build.py
│   ├── adw_test.py
│   ├── adw_review.py
│   ├── adw_modules/
│   └── adw_triggers/
├── .claude/                 # Claude Code configuration
│   ├── commands/            # Custom slash commands
│   ├── hooks/               # Lifecycle hooks
│   └── settings.json
├── specs/                   # Feature specifications
├── scripts/                 # Automation scripts
├── agents/                  # ADW execution logs
└── README.md
```

## API Documentation

Once the backend is running, visit:
- **OpenAPI docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Available Scripts

### Backend
```bash
cd app/server

# Run development server
python server.py

# Run tests
pytest

# Run tests with coverage
pytest --cov=.

# Lint code
ruff check .
```

### Frontend
```bash
cd app/client

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint code
npm run lint
```

### ADW Workflows
```bash
# Complete SDLC (all phases)
python adws/adw_sdlc.py --issue-number 123

# Plan + Build + Test
python adws/adw_plan_build_test.py --issue-number 123

# Plan + Build only
python adws/adw_plan_build.py --issue-number 123
```

## Environment Variables

See `.env.sample` for all available environment variables.

Key variables:
- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: JWT secret key
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: GitHub OAuth credentials
- `CLAUDE_CODE_PATH`: Path to Claude Code CLI
- `GITHUB_PAT`: GitHub Personal Access Token for ADW

## Testing

### Backend Tests
```bash
cd app/server
pytest
```

### Frontend Tests
```bash
cd app/client
npm test
```

### E2E Tests
E2E tests are located in `.claude/commands/e2e/` and can be run via Claude Code CLI.

## Contributing

This project uses ADW for automated development:

1. Create a GitHub issue with `/feature`, `/bug`, or `/chore` tag
2. ADW will automatically process and create a PR
3. Review and merge the PR

Manual contributions are also welcome:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

- GitHub Issues: For bug reports and feature requests
- Documentation: See `docs/` directory
- Specification: See `dev-dashboard-spec.md`

## Roadmap

See `dev-dashboard-spec.md` for detailed feature roadmap and implementation phases.

### Phase 1: MVP (Current)
- [x] Project setup
- [x] Backend API scaffold
- [x] Frontend application scaffold
- [x] ADW integration
- [ ] Kanban board functionality
- [ ] GitHub OAuth
- [ ] Basic dashboard

### Phase 2: Time Tracking
- [ ] Timer functionality
- [ ] Pomodoro mode
- [ ] Time reports

### Phase 3: Analytics
- [ ] Velocity charts
- [ ] PR metrics
- [ ] Team analytics

### Phase 4: Sprint Planning
- [ ] Sprint CRUD
- [ ] Story points
- [ ] Burndown charts

---

**Built with Claude Code ADW** 🤖

# Quick Start Guide

## Prerequisites
- Node.js v18+
- npm v9+

## Installation

1. **Navigate to project**
   ```bash
   cd rbac-task-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Seed database**
   ```bash
   npm run seed
   ```

## Running the Application

### Terminal 1 - Backend
```bash
npm run api
```
Backend will be available at `http://localhost:3333`

### Terminal 2 - Frontend
```bash
npm run dashboard
```
Frontend will be available at `http://localhost:4200`

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@example.com | password |
| Admin | admin@example.com | password |
| Viewer | viewer@example.com | password |

## Testing RBAC

1. **Login as Owner** - See all tasks, full access
2. **Login as Admin** - See organization tasks, manage org tasks
3. **Login as Viewer** - See only own tasks, limited access

## Features to Try

- ✅ Create new tasks
- ✅ Drag tasks between columns (To Do → In Progress → Done)
- ✅ Edit task details
- ✅ Delete tasks
- ✅ Toggle dark/light mode
- ✅ View task statistics
- ✅ Check completion progress

## Project Structure

```
apps/
├── api/          # NestJS backend
└── dashboard/    # Angular frontend

libs/
├── data/         # Shared types
└── auth/         # RBAC logic
```

## Documentation

- [README.md](./README.md) - Full documentation
- [API_DOCS.md](./API_DOCS.md) - API reference
- [walkthrough.md](./.gemini/antigravity/brain/428f1d59-9fd0-4d58-86cf-70451e27e10a/walkthrough.md) - Implementation walkthrough

## Support

For issues or questions, refer to the comprehensive documentation in README.md.

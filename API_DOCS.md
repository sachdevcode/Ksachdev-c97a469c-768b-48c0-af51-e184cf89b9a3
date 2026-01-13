# API Documentation

## Base URL
```
http://localhost:3333/api
```

## Authentication

All endpoints except `/auth/login` and `/auth/register` require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "organizationId": "org-1"
}
```

**Response:** `201 Created`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "viewer",
    "organizationId": "org-1",
    "createdAt": "2024-01-13T00:00:00.000Z",
    "updatedAt": "2024-01-13T00:00:00.000Z"
  }
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "viewer",
    "organizationId": "org-1"
  }
}
```

---

### Tasks

#### Get All Tasks
```http
GET /tasks
```

**Description:** Returns tasks based on user role:
- **Owner**: All tasks across all organizations
- **Admin**: Tasks in their organization and child organizations
- **Viewer**: Only their own tasks

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Complete documentation",
    "description": "Write API docs",
    "status": "todo",
    "category": "work",
    "ownerId": "user-uuid",
    "organizationId": "org-1",
    "createdAt": "2024-01-13T00:00:00.000Z",
    "updatedAt": "2024-01-13T00:00:00.000Z",
    "owner": {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "organization": {
      "id": "org-1",
      "name": "Acme Corporation"
    }
  }
]
```

#### Create Task
```http
POST /tasks
```

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "category": "work",
  "status": "todo"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "category": "work",
  "ownerId": "current-user-id",
  "organizationId": "current-user-org-id",
  "createdAt": "2024-01-13T00:00:00.000Z",
  "updatedAt": "2024-01-13T00:00:00.000Z"
}
```

#### Get Task by ID
```http
GET /tasks/:id
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Task Title",
  "description": "Task description",
  "status": "in_progress",
  "category": "work",
  "ownerId": "user-uuid",
  "organizationId": "org-1",
  "createdAt": "2024-01-13T00:00:00.000Z",
  "updatedAt": "2024-01-13T00:00:00.000Z"
}
```

**Error:** `403 Forbidden` if user doesn't have access

#### Update Task
```http
PUT /tasks/:id
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "done",
  "category": "personal"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "description": "Updated description",
  "status": "done",
  "category": "personal",
  "ownerId": "user-uuid",
  "organizationId": "org-1",
  "updatedAt": "2024-01-13T00:00:00.000Z"
}
```

**Permissions:**
- **Owner**: Can update any task
- **Admin**: Can update tasks in their organization
- **Viewer**: Can only update their own tasks

#### Delete Task
```http
DELETE /tasks/:id
```

**Response:** `200 OK`

**Permissions:**
- **Owner**: Can delete any task
- **Admin**: Can delete tasks in their organization
- **Viewer**: Can only delete their own tasks

---

### Audit Logs

#### Get Audit Logs
```http
GET /tasks/audit-log
```

**Description:** Returns the last 100 audit log entries

**Permissions:** Owner and Admin only

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "userId": "user-uuid",
    "action": "CREATE",
    "resource": "task",
    "resourceId": "task-uuid",
    "timestamp": "2024-01-13T00:00:00.000Z",
    "metadata": {
      "title": "New Task"
    }
  }
]
```

**Error:** `403 Forbidden` for Viewer role

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Email already exists |
| 500 | Internal Server Error |

---

## Data Models

### Task Status
- `todo` - Task not started
- `in_progress` - Task in progress
- `done` - Task completed

### Task Category
- `work` - Work-related task
- `personal` - Personal task
- `urgent` - Urgent task
- `other` - Other category

### User Roles
- `owner` - Full system access
- `admin` - Organization-level access
- `viewer` - Personal tasks only

---

## RBAC Permission Matrix

| Action | Owner | Admin | Viewer |
|--------|-------|-------|--------|
| View all tasks | ✅ | ✅ (org only) | ❌ |
| View own tasks | ✅ | ✅ | ✅ |
| Create task | ✅ | ✅ | ✅ |
| Update any task | ✅ | ✅ (org only) | ❌ |
| Update own task | ✅ | ✅ | ✅ |
| Delete any task | ✅ | ✅ (org only) | ❌ |
| Delete own task | ✅ | ✅ | ✅ |
| View audit logs | ✅ | ✅ | ❌ |

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Task not found",
  "error": "Not Found"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider implementing:
- Rate limiting per IP/user
- Request throttling
- API key management

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "organizationId": "org-1"
  }'
```

### Login
```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password"
  }'
```

### Get Tasks
```bash
curl http://localhost:3333/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Task
```bash
curl -X POST http://localhost:3333/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Task",
    "description": "Task description",
    "category": "work"
  }'
```

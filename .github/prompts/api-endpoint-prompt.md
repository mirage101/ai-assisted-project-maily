# API Endpoint Generation Prompt

## Purpose

Use this prompt template to generate new API endpoints for the Maily backend.

---

## Prompt Template

```
Create an API endpoint for [ENDPOINT_PURPOSE] with the following requirements:

**Route:**
[METHOD] /api/[resource]/[path]

**Purpose:**
[Describe what this endpoint does]

**Authentication:**
- [ ] Public
- [ ] Requires authentication (protect middleware)
- [ ] Requires ownership verification

**Request:**
**Params:**
- [param1]: [type] - [description]

**Query:**
- [query1]: [type] - [description]

**Body:**
- [field1]: [type] - [required/optional] - [description]
- [field2]: [type] - [required/optional] - [description]

**Response:**
**Success (200/201):**
```json
{
  "success": true,
  "data": {
    // response data structure
  }
}
```

**Error (400/401/403/404/500):**
```json
{
  "success": false,
  "error": "Error message"
}
```

**Validation Rules:**
- [field1]: [validation requirements]
- [field2]: [validation requirements]

**Business Logic:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Database Operations:**
- [List Mongoose operations needed]

**Error Handling:**
- [List error conditions to check]

**File Locations:**
- Route: server/routes/[resourceName].js
- Controller: server/controllers/[resourceName]Controller.js
- Update existing or create new files

Generate complete, production-ready code following Maily backend conventions:
- Use async/await with try-catch
- Return consistent JSON response format
- Validate input data
- Check authentication and authorization
- Use appropriate HTTP status codes
- Add JSDoc comments
- Log errors appropriately
```

---

## Example Usage

### Example 1: Create Template Endpoint

```
Create an API endpoint for creating a new email template with the following requirements:

**Route:**
POST /api/templates

**Purpose:**
Create a new email template for the authenticated user

**Authentication:**
- [x] Requires authentication (protect middleware)

**Request:**
**Body:**
- name: String - required - Template name (1-100 characters)
- description: String - optional - Template description (max 500 characters)
- componentTree: Object - required - Component tree structure
- category: String - optional - Template category (newsletter/promotional/transactional/announcement/other)
- tags: Array<String> - optional - Template tags
- isPublic: Boolean - optional - Whether template is publicly visible

**Response:**
**Success (201):**
```json
{
  "success": true,
  "data": {
    "id": "template_id",
    "name": "My Template",
    "description": "Template description",
    "componentTree": {},
    "category": "newsletter",
    "tags": ["tag1", "tag2"],
    "isPublic": false,
    "userId": "user_id",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Template name is required"
}
```

**Validation Rules:**
- name: Required, 1-100 characters, trimmed
- description: Max 500 characters, trimmed
- componentTree: Required, must be valid object with root node
- category: Must be one of allowed values
- tags: Array of strings, each trimmed
- isPublic: Boolean, defaults to false

**Business Logic:**
1. Validate request body
2. Check that componentTree has root node
3. Serialize componentTree for database storage
4. Create template with userId from authenticated user
5. Return formatted template response

**Database Operations:**
- Template.create() with validated data

**Error Handling:**
- Missing required fields (400)
- Invalid componentTree structure (400)
- Invalid category value (400)
- Database errors (500)

**File Locations:**
- Route: server/routes/templates.js
- Controller: server/controllers/templateController.js
- Update existing files

Generate complete, production-ready code following Maily backend conventions:
- Use async/await with try-catch
- Return consistent JSON response format
- Validate input data
- Check authentication and authorization
- Use appropriate HTTP status codes
- Add JSDoc comments
- Log errors appropriately
```

### Example 2: Search Templates Endpoint

```
Create an API endpoint for searching public templates with the following requirements:

**Route:**
GET /api/templates/search

**Purpose:**
Search for public templates by name, description, category, or tags

**Authentication:**
- [ ] Public
- [x] Requires authentication (protect middleware)

**Request:**
**Query:**
- q: String - Search query (name/description)
- category: String - Filter by category
- tags: String - Comma-separated tags
- page: Number - Page number (default: 1)
- limit: Number - Results per page (default: 20, max: 100)

**Response:**
**Success (200):**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "template_id",
        "name": "Template Name",
        "description": "Description",
        "thumbnail": "url",
        "category": "newsletter",
        "tags": ["tag1", "tag2"],
        "userId": "user_id",
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Invalid page number"
}
```

**Validation Rules:**
- q: Optional, max 200 characters
- category: Must be valid category if provided
- tags: Comma-separated, each tag trimmed
- page: Positive integer, default 1
- limit: Positive integer, min 1, max 100, default 20

**Business Logic:**
1. Parse and validate query parameters
2. Build MongoDB query for public templates
3. Add text search if q provided
4. Add category filter if provided
5. Add tags filter if provided
6. Calculate pagination offset
7. Execute query with pagination
8. Get total count for pagination
9. Format response with pagination data

**Database Operations:**
- Template.find() with filters
- Use $text $search for text query
- Use $in operator for tags
- Apply skip() and limit() for pagination
- Template.countDocuments() for total count

**Error Handling:**
- Invalid query parameters (400)
- Invalid page/limit values (400)
- Database errors (500)

**File Locations:**
- Route: server/routes/templates.js
- Controller: server/controllers/templateController.js
- Update existing files

Generate complete, production-ready code following Maily backend conventions:
- Use async/await with try-catch
- Return consistent JSON response format
- Validate input data
- Check authentication and authorization
- Use appropriate HTTP status codes
- Add JSDoc comments
- Log errors appropriately
```

---

## HTTP Methods Reference

- **GET**: Retrieve data (read-only)
- **POST**: Create new resource
- **PUT**: Update entire resource
- **PATCH**: Partially update resource
- **DELETE**: Remove resource

## Status Codes Reference

- **200 OK**: Successful GET, PUT, PATCH, DELETE
- **201 Created**: Successful POST (resource created)
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate or conflicting resource
- **500 Internal Server Error**: Server-side error

---

**Fill in the template sections and provide to an AI agent to generate API endpoints following Maily conventions.**
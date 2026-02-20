# Maily - HTML Email Template Builder

A full-stack MERN application for designing and managing HTML email templates with a drag-and-drop interface.

## Features

- 🎨 Drag-and-drop email template builder
- 👁️ Live preview with desktop/mobile views
- 💾 Save and manage templates
- 📤 Export email-safe HTML
- 🔐 User authentication and authorization
- 📝 Code editor with syntax highlighting

## Tech Stack

### Frontend
- React + Vite
- Material-UI
- @dnd-kit (drag-and-drop)
- Monaco Editor
- React Router

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcrypt

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB running locally or connection string

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd maily
```

2. Install backend dependencies
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

### Running the Application

1. Start MongoDB (if running locally)
```bash
mongod
```

2. Start the backend server (from server directory)
```bash
npm run dev
```

3. Start the frontend dev server (from client directory)
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## Project Structure

```
Maily/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── server/          # Express backend
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── package.json
└── README.md
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Template Endpoints
- `GET /api/templates` - Get all public templates
- `GET /api/templates/my-templates` - Get user's templates
- `GET /api/templates/:id` - Get template by ID
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

## License

MIT

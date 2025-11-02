# AdaptEd Frontend

A modern, minimalist React frontend for the AdaptEd educational platform. Transform educational content into personalized learning formats (Visual, Audio, Quiz) tailored to each student's learning style.

## 🎯 Project Overview

AdaptEd is an AI-powered learning platform that converts educational content into multiple learning formats:
- **Visual Learning**: Mind maps, charts, diagrams, and infographics
- **Audio Generation**: Podcast-style narration of content
- **Quiz Generation**: Interactive quizzes for knowledge assessment

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with JavaScript
- **Styling**: Tailwind CSS for modern, responsive design
- **Routing**: React Router v6 for multi-page navigation
- **Build Tool**: Vite for fast development and optimized builds
- **Package Manager**: npm

## 📦 Project Structure

```
adapted-frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Navigation header with auth status
│   │   ├── Login.jsx           # Login form component
│   │   ├── Signup.jsx          # Sign-up form component
│   │   ├── Dashboard.jsx       # Main dashboard after login
│   │   ├── Upload.jsx          # File upload with format selection
│   │   ├── Results.jsx         # Results display with bookmarking
│   │   └── Assessment.jsx      # Cognitive assessment placeholder
│   ├── App.jsx                 # Main app with routing
│   ├── App.css                 # App-specific styles
│   ├── index.css               # Tailwind CSS imports
│   └── main.jsx                # React entry point
├── public/
│   └── vite.svg
├── index.html                  # HTML template
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
├── vite.config.js              # Vite configuration
└── package.json                # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**:
```bash
cd adapted-frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the development server**:
```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## 📄 Pages & Routes

| Route | Component | Protected | Description |
|-------|-----------|-----------|-------------|
| `/login` | Login | No | User login page |
| `/signup` | Signup | No | User registration page |
| `/dashboard` | Dashboard | Yes | Main dashboard with recent uploads |
| `/upload` | Upload | Yes | File upload and format selection |
| `/results/:id` | Results | Yes | Display transformed content |
| `/assessment` | Assessment | Yes | Cognitive assessment (coming soon) |

## 🔐 Authentication

The current implementation uses **mock authentication** for demonstration purposes. To integrate with your Flask backend:

1. **Login** (`src/components/Login.jsx`):
   - Replace the mock API call with your backend endpoint
   - Store authentication token (JWT) in localStorage
   - Update protected routes to validate token

2. **Signup** (`src/components/Signup.jsx`):
   - Connect to your user registration endpoint
   - Implement email verification if needed

3. **Protected Routes** (`src/App.jsx`):
   - Validate token on app load
   - Redirect to login if token is invalid/expired

## 📤 File Upload Integration

The Upload component (`src/components/Upload.jsx`) currently uses **mock file handling**. To connect to your Flask backend:

1. **Update the form submission** with your backend endpoint
2. **Supported file types**: PDF (.pdf) and DOCX (.docx)
3. **File size limit**: 10MB (configurable in Upload.jsx)

## 🎨 Design System

### Color Scheme
- **Primary**: Purple (#a855f7)
- **Background**: White (#ffffff)
- **Text**: Gray (#1a1a1a)
- **Borders**: Light Gray (#e5e7eb)

### Component Classes (Tailwind)
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button
- `.input-field` - Form input field
- `.card` - Content card container

## 🚧 Future Features (From Your Requirements)

- [ ] Cognitive Assessment Integration (CAT4 support)
- [ ] Progress Tracking & Analytics
- [ ] Additional file format support (images, audio, video)
- [ ] Advanced quiz features (timed, grading, explanations)
- [ ] User profile and settings page
- [ ] Bookmarks/favorites management page
- [ ] Sharing and collaboration features
- [ ] Dark mode support

## 🔗 Backend Integration Checklist

To connect this frontend to your Flask backend:

- [ ] Update API endpoints in all components
- [ ] Implement proper error handling and loading states
- [ ] Add request/response interceptors for auth tokens
- [ ] Set up CORS configuration on backend
- [ ] Implement file upload progress tracking
- [ ] Add real-time status updates for transformations

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

**Version**: 1.0.0  
**Status**: Active Development

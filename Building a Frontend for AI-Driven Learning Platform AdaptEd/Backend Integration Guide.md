# Backend Integration Guide

This guide explains how to connect the AdaptEd frontend to your Flask backend API.

## 🔗 API Endpoints Expected

Your Flask backend should provide these endpoints:

### Authentication

**POST** `/api/auth/login`
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**POST** `/api/auth/signup`
```json
Request:
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### File Upload

**POST** `/api/uploads` (multipart/form-data)
```
Request:
- file: File (PDF or DOCX)
- title: string
- formats: JSON array ["visual", "audio", "quiz"]

Response:
{
  "id": "upload_id",
  "title": "Biology Chapter 3",
  "status": "processing",
  "uploadDate": "2024-11-01T12:00:00Z",
  "formats": ["visual", "audio", "quiz"]
}
```

### Get Uploads

**GET** `/api/uploads`
```json
Response:
[
  {
    "id": "upload_id",
    "title": "Biology Chapter 3",
    "uploadDate": "2024-11-01T12:00:00Z",
    "status": "completed",
    "formats": ["visual", "audio", "quiz"]
  }
]
```

### Get Results

**GET** `/api/results/:id`
```json
Response:
{
  "id": "result_id",
  "uploadId": "upload_id",
  "title": "Biology Chapter 3",
  "formats": {
    "visual": {
      "type": "Mind Map",
      "content": "...",
      "url": "..."
    },
    "audio": {
      "type": "Podcast Narration",
      "duration": "8:45",
      "url": "..."
    },
    "quiz": {
      "type": "Interactive Quiz",
      "questions": [...]
    }
  }
}
```

## 🔧 Integration Steps

### 1. Create API Service

Create a new file `src/services/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('authToken');

const apiCall = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired, redirect to login
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

export const authAPI = {
  login: (email, password) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (name, email, password) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
};

export const uploadAPI = {
  upload: (file, title, formats) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('formats', JSON.stringify(formats));

    return apiCall('/uploads', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAuthToken()}` },
      body: formData,
    });
  },

  getUploads: () => apiCall('/uploads'),
};

export const resultsAPI = {
  getResults: (id) => apiCall(`/results/${id}`),
};
```

### 2. Update Login Component

In `src/components/Login.jsx`, replace the mock API call:

```javascript
import { authAPI } from '../services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await authAPI.login(email, password);
    localStorage.setItem('authToken', response.token);
    onLogin(response.user);
    navigate('/dashboard');
  } catch (err) {
    setError(err.message || 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### 3. Update Upload Component

In `src/components/Upload.jsx`, replace the mock API call:

```javascript
import { uploadAPI } from '../services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const selectedFormats = Object.keys(selectedFormats).filter(key => selectedFormats[key]);
    const response = await uploadAPI.upload(file, title, selectedFormats);
    navigate(`/results/${response.id}`);
  } catch (err) {
    setError(err.message || 'Upload failed. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### 4. Update Dashboard Component

In `src/components/Dashboard.jsx`, fetch real data:

```javascript
import { uploadAPI } from '../services/api';
import { useEffect, useState } from 'react';

export default function Dashboard({ user }) {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const data = await uploadAPI.getUploads();
        setUploads(data);
      } catch (err) {
        console.error('Failed to fetch uploads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, []);

  // Rest of component...
}
```

### 5. Update Results Component

In `src/components/Results.jsx`, fetch real results:

```javascript
import { resultsAPI } from '../services/api';
import { useEffect, useState } from 'react';

export default function Results() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await resultsAPI.getResults(id);
        setResult(data);
      } catch (err) {
        console.error('Failed to fetch results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  // Rest of component...
}
```

## 🌍 Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

Then update `src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

## 🔒 CORS Configuration

Ensure your Flask backend has CORS enabled:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
  r"/api/*": {
    "origins": ["http://localhost:5173", "http://localhost:3000"],
    "methods": ["GET", "POST", "PUT", "DELETE"],
    "allow_headers": ["Content-Type", "Authorization"]
  }
})
```

## 🧪 Testing Integration

1. **Start your Flask backend** on `http://localhost:5000`
2. **Update `.env`** with your backend URL
3. **Start the React dev server**: `npm run dev`
4. **Test login** with valid credentials
5. **Test file upload** with a PDF or DOCX file
6. **Check browser console** for any errors

## 🐛 Debugging

Enable debug logging by adding to `src/services/api.js`:

```javascript
const apiCall = async (endpoint, options = {}) => {
  console.log(`API Call: ${options.method || 'GET'} ${endpoint}`);
  
  // ... rest of function
  
  const data = await response.json();
  console.log('API Response:', data);
  return data;
};
```

## 📝 Notes

- Always validate tokens on the backend
- Implement proper error handling for network failures
- Use HTTPS in production
- Store sensitive data securely (never in localStorage)
- Implement token refresh mechanism for long sessions
- Add request timeouts to prevent hanging requests

## 🚀 Deployment

When deploying to production:

1. Update `VITE_API_URL` to your production backend URL
2. Build the project: `npm run build`
3. Deploy the `dist/` folder to your hosting service
4. Ensure backend CORS allows your production domain

---

For more information, refer to the main README.md file.

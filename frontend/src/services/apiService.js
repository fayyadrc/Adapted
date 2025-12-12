// API service for backend communication

// Central backend base URL
// Keep this as the single source of truth for frontend -> backend calls
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async uploadFile(file, title, formats, numQuestions = 5, folderId = null, hostVoiceId = null, guestVoiceId = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('formats', JSON.stringify(formats));
    formData.append('num_questions', numQuestions);
    if (folderId) formData.append('folder_id', folderId);
    if (hostVoiceId) formData.append('host_voice_id', hostVoiceId);
    if (guestVoiceId) formData.append('guest_voice_id', guestVoiceId);

    console.log('=== API SERVICE DEBUG ===');
    console.log('Sending to /api/upload:');
    console.log('  file:', file?.name);
    console.log('  title:', title);
    console.log('  formats:', formats);
    console.log('  formats JSON:', JSON.stringify(formats));
    console.log('  num_questions:', numQuestions);
    console.log('  host_voice_id:', hostVoiceId);
    console.log('  guest_voice_id:', guestVoiceId);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const responseData = await response.json();
    console.log('=== API RESPONSE ===');
    console.log('Response:', responseData);
    return responseData;
  }

  async getResult(id) {
    const response = await fetch(`${API_BASE_URL}/results/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch result');
    }

    return response.json();
  }

  async getResults() {
    const response = await fetch(`${API_BASE_URL}/results`);

    if (!response.ok) {
      throw new Error('Failed to fetch results');
    }

    return response.json();
  }

  async deleteResult(id) {
    const response = await fetch(`${API_BASE_URL}/results/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete result');
    }

    return response.json();
  }

  async createFolder(name, userId, color) {
    const response = await fetch(`${API_BASE_URL}/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, user_id: userId, color }),
    });

    if (!response.ok) {
      throw new Error('Failed to create folder');
    }

    return response.json();
  }

  async getFolders(userId) {
    const response = await fetch(`${API_BASE_URL}/folders?user_id=${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch folders');
    }

    return response.json();
  }

  async deleteFolder(id) {
    const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete folder');
    }

    return response.json();
  }

  async moveLessonToFolder(lessonId, folderId) {
    const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/move`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folder_id: folderId }),
    });

    if (!response.ok) {
      throw new Error('Failed to move lesson to folder');
    }

    return response.json();
  }

  async generateMindMap(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate mind map');
    }

    return response.json();
  }

  async generateSummary(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/generate-summary`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate summary');
    }

    return response.json();
  }

  async generateQuiz(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/generate-quiz`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate quiz');
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default new ApiService();
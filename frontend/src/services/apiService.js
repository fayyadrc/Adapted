// API service for backend communication

// Central backend base URL
// Keep this as the single source of truth for frontend -> backend calls
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async uploadFile(file, title, formats, numQuestions = 5) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('formats', JSON.stringify(formats));
    formData.append('num_questions', numQuestions);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  }

  async getResult(id) {
    const response = await fetch(`${API_BASE_URL}/results/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch result');
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
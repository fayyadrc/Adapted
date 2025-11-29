// Test data helper for development/testing
// This file provides utilities for testing and development

// Helper to generate mock data for testing
export const generateTestData = () => {
  return {
    user: {
      email: 'test@example.com',
      name: 'Test User'
    }
  };
};

// Console log for development
if (import.meta.env.DEV) {
  console.log('Test data helper loaded');
}

export default {};

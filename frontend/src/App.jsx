import { useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  const fetchFromBackend = () => {
    //backend is running on localhost:5000
    fetch('http://localhost:5000/api/test')
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message); 
      })
      .catch((err) => {
        console.error("Failed to fetch:", err);
        setMessage("Failed to connect to backend.");
      });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">AdaptEd Project</h1>
      <p className="text-lg text-gray-400 mb-8">
        React Frontend is running!
      </p>

      <button
        onClick={fetchFromBackend}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-200"
      >
        Test Backend Connection
      </button>

      {message && (
        <p className="mt-6 p-4 bg-gray-800 rounded-lg text-green-400">
          <strong>Backend says:</strong> {message}
        </p>
      )}
    </div>
  );
}

export default App;
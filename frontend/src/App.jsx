import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import Login from './components/Login';
import MindMap from './components/MindMap';

// Example data for the MindMap component
const mindMapData = {
  "root": {
    "topic": "Main Topic",
    "children": [
      {
        "topic": "Core Concept",
        "summary": "optional detailed summary string (e.g., key points from the text).",
        "definition": "optional short, single-sentence definition string for key terms.",
        "children": [
          {
            "topic": "Further Detail or Sub-topic",
            "summary": "another optional summary",
            "children": []
          }
        ]
      },
      {
        "topic": "Another Core Concept",
        "summary": "Details about this second concept.",
        "children": []
      }
    ]
  }
};

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-8">
              <Header />
              <div className="w-full max-w-4xl my-8">
                <MindMap data={mindMapData} />
              </div>
              <FileUpload />
            </div>
          }
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;

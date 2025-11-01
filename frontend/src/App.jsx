import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SimpleUploader from './components/SimpleUploader';
import AssessmentForm from './components/AssessmentForm';
import Login from './components/Login';
import MindMap from './components/MindMap';


function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="py-8">
                <SimpleUploader />
              </main>
            </div>
          }
        />
        <Route
          path="/assessment"
          element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="py-8">
                <AssessmentForm />
              </main>
            </div>
          }
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;

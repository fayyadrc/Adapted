import Header from './components/Header';
import FileUpload from './components/FileUpload';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-8">
      <Header />
      <FileUpload />
    </div>
  );
}

export default App;


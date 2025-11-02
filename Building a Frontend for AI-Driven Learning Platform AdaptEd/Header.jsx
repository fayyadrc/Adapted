import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();
  
  return (
    <header className="w-full bg-white shadow-sm px-6 py-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <Link to="/" className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            AdaptEd
          </h1>
        </Link>
        
        <nav className="flex space-x-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              location.pathname === '/' 
                ? 'bg-purple-100 text-purple-700' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Upload
          </Link>
          <Link
            to="/assessment"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              location.pathname === '/assessment' 
                ? 'bg-purple-100 text-purple-700' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Assessment
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;


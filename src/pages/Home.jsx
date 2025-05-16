import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Home = ({isAuthenticated,setIsAuthenticated}) => {
  const navigate = useNavigate();
const aiBots = [
  {
    title: "AI Chat Assistant",
    description: "Have natural conversations with our advanced AI chatbot",
    icon: "💬",
    path: "/chat",
    color: "bg-gradient-to-r from-indigo-500 to-cyan-400 text-white"
  },
  {
    title: "Code Review Bot",
    description: "Get instant code analysis and improvement suggestions",
    icon: "👨‍💻",
    path: "/code-review",
    color: "bg-gradient-to-r from-purple-500 to-purple-700 text-white"
  },
  {
    title: "Code Generator",
    description: "Generate code, explanation and output from your prompt",
    icon: "⚙️",
    path: "/codegen",
    color: "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white"
  },
  {
    title: "AI Image Generator",
    description: "Create stunning images from text prompts",
    icon: "🖼️",
    path: "/image-gen",
    color: "bg-gradient-to-r from-lime-400 to-lime-600 text-white"
  },
  {
    title: "Text Summarizer",
    description: "Transform lengthy content into clear, brief summaries",
    icon: "✂️",
    path: "/summarize",
    color: "bg-gradient-to-r from-yellow-500 to-orange-600 text-white"
  },
  {
    title: "PDF Summarizer",
    description: "Upload PDFs and get concise, readable summaries instantly",
    icon: "📄",
    path: "/pdf-summarizer",
    color: "bg-gradient-to-r from-pink-500 to-red-600 text-white"
  }
];



  async function logout() {
    try{
      const response = await fetch('http://localhost:4000/logout', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      if(data.success){
        toast.success('Logged out successfully !')
        setIsAuthenticated(false);
      }
    }
    catch(e){
      console.log(e);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-blue-400">AI Assistant Suite</div>
    { !isAuthenticated ? (<div className="flex space-x-4">
          <button 
            onClick={() => navigate('/login')}
            className="cursor-pointer bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Sign Up
          </button>
        </div>) : (<div className='cursor-pointer bg-red-700 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors' onClick={logout}>Logout</div>)}
      </nav>

      {/* Hero Section */}
      <header className="bg-gray-800 py-20 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 pb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          AI Power at Your Fingertips
        </h1>
        <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-300">
          Access specialized AI assistants for all your needs
        </p>
      </header>

      {/* AI Bots Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center text-blue-400">
          Our AI Assistants
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {aiBots.map((bot, index) => (
            <div 
              key={index}
              onClick={() => {if(isAuthenticated || bot.title=='Text Summarizer' || bot.title=='Code Review Bot'){navigate(bot.path)} else{toast.error('Login to access the feature')}}}
              className={`${bot.color} p-6 rounded-xl shadow-lg transform transition-all hover:scale-105 cursor-pointer hover:shadow-xl`}
            >
              <div className="text-4xl mb-4">{bot.icon}</div>
              <h3 className="text-xl font-bold mb-2">{bot.title}</h3>
              <p className="text-gray-100">{bot.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-8 px-4 text-center text-gray-400">
        <p>© {new Date().getFullYear()} AI Assistant Suite. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
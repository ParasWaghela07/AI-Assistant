import { useState } from 'react'
import './App.css'
import { useEffect } from 'react'
import { Route,Routes } from 'react-router-dom'
import CodeReview from './pages/CodeReview'
import Chat from './pages/Chat'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Home from './pages/Home'
import ImageGen from './pages/ImageGen'
import Summarize from './pages/Summarize'
import PdfSummarizer from './pages/PdfSummarizer'
import CodeGenerator from './pages/CodeGenerator'
function App() {
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function checkAuth() {
    try {
      const response = await fetch('http://localhost:4000/checkAuth', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        console.error('Authentication check failed:', data.message);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className=''>
      <Routes>
        <Route path='/' element={<Home isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login setIsAuthenticated={setIsAuthenticated}/>} />
        <Route path='/code-review' element={<CodeReview/>} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/image-gen' element={<ImageGen />} />
        <Route path='/summarize' element={<Summarize />}/>
        <Route path='/pdf-summarizer' element={<PdfSummarizer />}/>
        <Route path='/codegen' element={<CodeGenerator />}/>
        <Route path='*' element={<div className='w-screen h-screen flex items-center justify-center bg-gray-900 text-gray-200 overflow-hidden'>
          <h1 className='text-4xl font-bold text-blue-400'>404 Not Found</h1>
        </div>} />
      </Routes>
    </div>
  )
}

export default App

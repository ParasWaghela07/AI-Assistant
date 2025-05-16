import React, { useState,useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from "rehype-highlight";
import Editor from "react-simple-code-editor"
import prism from "prismjs"
import { useNavigate } from 'react-router-dom';
import hljs from 'highlight.js/lib/core';  
import javascript from 'highlight.js/lib/languages/javascript';
import "prismjs/themes/prism-tomorrow.css"
import "highlight.js/styles/github-dark.css";

const CodeReview = () => {
  const [code, setCode] = useState(`function sum() {
  return 1 , 1
}`);
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  hljs.registerLanguage('javascript', javascript);
    useEffect(() => {
        prism.highlightAll()
    }, [])



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:4000/codeReview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to get code review');
      }

      const data = await response.json();
      setReview(data.message || 'No review provided');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-gray-900 text-gray-200 overflow-hidden">
      {/* Left side - Code Input */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col p-4 border-r border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <div className='flex items-center gap-x-5'> 
                <p className='bg-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-800 transition-all' onClick={()=>navigate('/')}>Back</p>
                <h2 className="text-xl font-bold text-blue-400">Your Code</h2>
            </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !code.trim()}
            className={`cursor-pointer px-4 py-2 rounded-md font-medium transition-all ${
              isLoading
                ? 'bg-blue-800 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } ${!code.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              'Get Code Review'
            )}
          </button>
        </div>
        
        <Editor
          value={code}
          onValueChange={code => setCode(code)}
        highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 16,
                border: "1px solid #ddd",
                borderRadius: "5px",
                height: "100%",
                width: "100%"
              }}
        />
      </div>

      {/* Right side - Review Output */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col p-4">
      
        <h2 className="text-xl font-bold text-green-400 mb-4">Code Review</h2>
        
        <div className="flex-1 rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
          {error ? (
            <div className="p-4 text-red-400 bg-red-900/20">{error}</div>
          ) : isLoading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-400">Analyzing your code...</p>
            </div>
          ) : review ? (
            <div className="p-4 h-full overflow-auto text-lg">
                <ReactMarkdown  rehypePlugins={[ rehypeHighlight ]}>{review}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 italic">
              Your code review will appear here after submission
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeReview;
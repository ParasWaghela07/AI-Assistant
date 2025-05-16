import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { useNavigate } from 'react-router-dom';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';
import 'highlight.js/styles/github-dark.css';
import { toast } from 'sonner';

const CodeGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState({ explanation: '', code: '', output: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/codeGenerator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate code');
      setResponse(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="w-screen h-screen flex flex-col bg-gray-900 text-gray-200 overflow-hidden">
      {/* Top Section */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Left: Code */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col p-4 border-r border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <div className='flex items-center gap-x-5'>
              <p className='bg-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-800 transition-all' onClick={() => navigate('/')}>Back</p>
              <h2 className="text-xl font-bold text-blue-400">Generated Code</h2>
            </div>
            <button 
              onClick={() => handleCopy(response.code)} 
              className="cursor-pointer text-sm bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
            >
              Copy code
            </button>
          </div>
          <div className="bg-[#0d1117] border border-gray-700 p-4 rounded-md overflow-auto flex-1">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{`\`\`\`javascript\n${response.code || 'No code generated'}\n\`\`\``}</ReactMarkdown>
          </div>
        </div>

        {/* Right: Explanation + Output */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col p-4 space-y-4">
          {error ? (
            <div className="p-4 text-red-400 bg-red-900/20">{error}</div>
          ) : isLoading ? (
            <div className="flex flex-1 justify-center items-center">
              <div className="animate-spin h-10 w-10 border-t-4 border-blue-500 rounded-full"></div>
            </div>
          ) : (
            <>
              <div className="flex-1 bg-gray-800 border border-gray-700 p-4 rounded-md overflow-auto relative">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-yellow-400">Explanation</h3>
                  <button 
                    onClick={() => handleCopy(response.explanation)} 
                    className="cursor-pointer text-sm bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                  >
                    Copy
                  </button>
                </div>
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{response.explanation}</ReactMarkdown>
              </div>

              <div className="flex-1 bg-gray-800 border border-gray-700 p-4 rounded-md overflow-auto relative">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-yellow-400">Output</h3>
                  <button 
                    onClick={() => handleCopy(response.output)} 
                    className="cursor-pointer text-sm bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                  >
                    Copy
                  </button>
                </div>
                <pre className="text-white">{response.output || 'No output available'}</pre>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Input Bar */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-gray-800 border-t border-gray-700 p-4 flex gap-4 items-center"
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your prompt..."
          className="flex-1 p-2 rounded-md bg-gray-700 text-white border border-gray-600"
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className={`cursor-pointer px-4 py-2 rounded-md transition-all font-medium ${isLoading ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} ${!prompt.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </form>
    </div>
  );
};

export default CodeGenerator;

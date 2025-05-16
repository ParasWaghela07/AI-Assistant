import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {toast} from 'sonner';

const ImageGen = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:4000/generateImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
  if (!imageUrl) return;
  
  // Create a temporary anchor element
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = `ai-image-${Date.now()}.png`; // or .jpg based on your image type
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Header matching the theme */}
      <header className="bg-gray-800 py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 pb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          AI Image Generator
        </h1>
        <p className="text-lg text-gray-300 mb-4">
          Transform your ideas into stunning visuals
        </p>
        <button onClick={() => navigate('/')}
        className="bg-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-800 transition-all">
            Back
        </button>
      </header>

      {/* Main content area */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="prompt" className="text-lg">
                Describe your image
              </label>
              <input
                type="text"
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="A sunset over mountains in watercolor style..."
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`cursor-pointer w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Generating...' : 'Generate Image'}
            </button>
          </form>
        </div>

        {/* Results section */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 mb-8 text-center">
            {error}
          </div>
        )}

        {imageUrl && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className='flex justify-between items-center mb-4'>
                <h2 className="text-xl font-bold text-blue-400">Your Generated Image</h2>
                <button
                onClick={handleDownload}
                className="cursor-pointer py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                Download
                </button>
            </div>
            <div className="flex justify-center">
              <img 
                src={imageUrl} 
                alt="Generated from prompt" 
                className="max-w-full h-auto rounded-lg border border-gray-700"
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ImageGen;
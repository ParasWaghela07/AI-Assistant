import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaArrowRight } from "react-icons/fa6";
import { toast } from 'sonner';

const Chat = () => {
    const [message, setMessage] = useState("");
    const [chatid, setChatid] = useState(null);
    const [currentChat, setCurrentChat] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [allchats, setAllchats] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

   


    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
    }, [currentChat, isLoading]);

    // Fetch all chats on component mount
    useEffect(() => {
        fetchAllChats();
    }, []);

    async function getResult() {
        if (!message.trim()) return;
        
        setIsLoading(true);
        const userMessage = { sender: "user", content: message };
        setCurrentChat(prev => [...prev, userMessage]);
        setMessage("");
        
        try {
            const response = await fetch('http://localhost:4000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, chatid }),
                credentials: 'include'
            });
            
            const data = await response.json();
            setCurrentChat(prev => [...prev, { sender: "ai", content: data.message }]);
            setChatid(data.chatid);
            fetchAllChats(); 
        } catch (e) {
            console.error(e);
            setCurrentChat(prev => [...prev, { 
                sender: "ai", 
                content: "Sorry, I encountered an error. Please try again." 
            }]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
            e.preventDefault();
            getResult();
        }
    };

    async function fetchAllChats() {
        try {
            const response = await fetch('http://localhost:4000/fetchAllChats', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await response.json();
            // console.log(data.chats);
            const unsortedChats = data.chats || [];
            const sortedChats = unsortedChats.sort((a, b) => {
                return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
            });
            setAllchats(sortedChats || []);
        } catch (e) {
            console.error(e);
        }
    }

    

    function formatDate(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    const startNewChat = () => {
        setChatid(null);
        setCurrentChat([]);
    };

    return (
        <div className="w-screen h-screen flex flex-col md:flex-row bg-gray-900 text-gray-200 overflow-hidden">

            {/* Sidebar */}
            <div className={`fixed md:static top-0 left-0 h-full z-40 ${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 transition-all duration-300 flex flex-col border-r border-gray-700 overflow-hidden`}>

                <div className="p-4 border-b border-gray-700 flex-row-reverse flex gap-x-5">
                    <button 
                        onClick={startNewChat}
                        className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                    >
                        + New Chat
                    </button>
                        <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="bg-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition-all z-50"
                        >
                         <FaArrowLeftLong />
                        </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {allchats.map(chat => (
                        <div 
                            key={chat._id}
                            onClick={() => {setChatid(chat._id); setCurrentChat(chat.messages);}}
                            className={`p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                                chatid === chat._id ? 'bg-gray-700' : ''
                            }`}
                        >
                            <div className="font-medium text-white truncate">
                                {chat.title}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                {formatDate(chat.updatedAt || chat.createdAt)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-gray-800 p-4 shadow-md flex justify-between items-center">
                    <div className="flex items-center gap-x-5">
                        {!sidebarOpen && <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="bg-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition-all z-50"
                        >
                          <FaArrowRight />
                        </button>}
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-800 transition-all"
                        >
                            Back
                        </button>
                    </div>
                    <h1 className="text-xl font-bold text-blue-400">AI Chat</h1>
                </div>

                {/* Chat messages container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {currentChat.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500">
                                <p className="text-lg">Start a conversation with the AI</p>
                                <p className="text-sm">Type a message below to begin</p>
                            </div>
                        </div>
                    ) : (
                        currentChat.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div 
                                    className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${msg.sender === "user" 
                                        ? "bg-blue-600 text-white rounded-br-none" 
                                        : "bg-gray-800 text-gray-200 shadow-md rounded-bl-none"}`}
                                >
                                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                    <p className={`text-xs opacity-50 mt-1 ${msg.sender === "user" ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {msg.sender === "user" ? "You" : "AI"}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-800 text-gray-200 rounded-lg px-4 py-2 shadow-md rounded-bl-none">
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                                    <span>AI is thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef}></div>
                </div>

                {/* Input area */}
                <div className="border-t border-gray-700 p-4 bg-gray-800">
                    <div className="flex space-x-2">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message here..."
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-200 placeholder-gray-400"
                            rows={3}
                            disabled={isLoading}
                            ref={inputRef}
                        />
                        <button
                            onClick={getResult}
                            disabled={isLoading || !message.trim()}
                            className={`bg-blue-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                            } ${!message.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 mx-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Send'
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Chat;
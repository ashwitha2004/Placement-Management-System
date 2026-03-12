import React, { useState, useRef, useEffect } from 'react';

export default function VideoChat({ socket, roomId, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef();

  useEffect(() => {
    if (!socket) return;
    socket.on('chat-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off('chat-message');
    };
  }, [socket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim()) {
      const msg = { user: user?.name || 'HR', text: input, time: new Date().toLocaleTimeString() };
      socket.emit('chat-message', { roomId, msg });
      setMessages((prev) => [...prev, msg]);
      setInput('');
    }
  };

  return (
    <div className="vc-chat bg-white dark:bg-slate-900 rounded-xl p-4 shadow-md flex flex-col h-72 w-full">
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map((m, idx) => (
          <div key={idx} className="mb-1 text-sm">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{m.user}:</span> {m.text}
            <span className="ml-2 text-xs text-gray-400">{m.time}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border px-2 py-1 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button className="bg-indigo-600 text-white px-3 py-1 rounded-lg font-bold" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

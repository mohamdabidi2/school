"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useCurrentUser } from './providers/CurrentUserProvider';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'announcement' | 'alert';
}

interface RealtimeMessagingProps {
  isOpen: boolean;
  onClose: () => void;
}

const RealtimeMessaging: React.FC<RealtimeMessagingProps> = ({ isOpen, onClose }) => {
  const user = useCurrentUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Initialize WebSocket connection
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        // Send user info to server
        ws.send(JSON.stringify({
          type: 'user_join',
          userId: user?.id,
          userName: user?.displayName || user?.username,
          userRole: user?.role
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'message':
            setMessages(prev => [...prev, data.message]);
            break;
          case 'user_online':
            setOnlineUsers(prev => [...prev, data.userId]);
            break;
          case 'user_offline':
            setOnlineUsers(prev => prev.filter(id => id !== data.userId));
            break;
          case 'typing':
            // Handle typing indicators
            break;
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() && wsRef.current && isConnected) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        senderId: user?.id || '',
        senderName: user?.displayName || user?.username || 'Unknown',
        senderRole: user?.role || 'user',
        timestamp: new Date(),
        isRead: false,
        type: 'text'
      };

      wsRef.current.send(JSON.stringify({
        type: 'message',
        message
      }));

      setNewMessage('');
    }
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'admin': 'bg-red-100 text-red-800',
      'teacher': 'bg-blue-100 text-blue-800',
      'student': 'bg-green-100 text-green-800',
      'parent': 'bg-purple-100 text-purple-800',
      'director': 'bg-pink-100 text-pink-800',
      'school-manager': 'bg-emerald-100 text-emerald-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 lg:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] lg:h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 lg:p-4 border-b">
          <div className="flex items-center gap-2 lg:gap-3">
            <h2 className="text-lg lg:text-xl font-semibold">Messages</h2>
            <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs lg:text-sm text-gray-500">
              {onlineUsers.length} en ligne
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Image src="/close.png" alt="Fermer" width={18} height={18} className="lg:w-5 lg:h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] lg:max-w-md px-3 lg:px-4 py-2 rounded-lg ${
                message.senderId === user?.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-xs lg:text-sm">{message.senderName}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(message.senderRole)}`}>
                    {message.senderRole}
                  </span>
                </div>
                <p className="text-xs lg:text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 lg:p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Tapez votre message..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className="px-3 lg:px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden lg:inline">Envoyer</span>
              <span className="lg:hidden">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeMessaging;

import React from 'react';
import { Message } from '../types';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  if (message.isSystem) {
    return (
      <div className="flex justify-center my-4 animate-pulse">
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-1 rounded-full text-xs font-mono flex items-center">
          <AlertTriangle size={12} className="mr-2" />
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[75%] px-4 py-3 rounded-2xl relative group ${
          isOwn 
            ? 'bg-emerald-600 text-white rounded-br-none shadow-[0_0_10px_rgba(5,150,105,0.3)]' 
            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
        }`}
      >
        <div className="text-sm font-light break-words leading-relaxed">
          {message.text}
        </div>
        
        <div className={`flex items-center justify-end mt-1 space-x-1 opacity-50 text-[10px] uppercase font-mono`}>
          {message.encrypted && <ShieldCheck size={10} />}
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Pseudo-encryption visual decoration */}
        <div className="absolute -bottom-4 right-0 text-[8px] text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
           ID: {message.id.slice(0, 8)}...
        </div>
      </div>
    </div>
  );
};

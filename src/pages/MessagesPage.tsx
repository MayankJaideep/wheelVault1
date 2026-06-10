import { useState, useEffect, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { MessageSquare, Send, User, Search, MoreVertical, Check, CheckCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useConversations, useMessages } from '../lib/useData';
import { formatRelativeTime, cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

export function MessagesPage() {
  const { conversationId } = useParams();
  const { user, profile } = useAuth();
  const { conversations, loading: conversationsLoading } = useConversations(user?.id);
  const { messages, loading: messagesLoading, setMessages } = useMessages(conversationId);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationId || null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) setSelectedConversation(conversationId);
    else if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: newMessage.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, { ...data, sender: profile! }]);
      setNewMessage('');

      // Update conversation's last_message
      await supabase
        .from('conversations')
        .update({
          last_message: newMessage.trim(),
          last_message_at: new Date().toISOString()
        })
        .eq('id', selectedConversation);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-200px)] min-h-[500px]">
            {/* Conversations List */}
            <div className="border-r border-dark-700 flex flex-col">
              <div className="p-4 border-b border-dark-700">
                <h1 className="text-xl font-bold text-white mb-4">Messages</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Search..." className="input pl-10 text-sm" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversationsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No conversations yet.</p>
                    <p className="text-sm text-gray-500 mt-2">Start by messaging a seller on a listing page.</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={cn(
                        'w-full p-4 flex gap-3 border-b border-dark-800 transition-colors',
                        selectedConversation === conv.id
                          ? 'bg-primary-500/10 border-l-2 border-l-primary-500'
                          : 'hover:bg-dark-800/50'
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center overflow-hidden">
                          {conv.other_participant?.avatar_url ? (
                            <img
                              src={conv.other_participant.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white truncate">
                            {conv.other_participant?.display_name || conv.other_participant?.username || 'User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(conv.last_message_at || conv.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conv.last_message || 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat */}
            <div className="lg:col-span-2 flex flex-col bg-dark-900/30">
              {currentConversation ? (
                <>
                  <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center overflow-hidden">
                        {currentConversation.other_participant?.avatar_url ? (
                          <img
                            src={currentConversation.other_participant.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <Link
                          to={`/profile/${currentConversation.other_participant?.username}`}
                          className="font-semibold text-white hover:text-primary-400"
                        >
                          {currentConversation.other_participant?.display_name || currentConversation.other_participant?.username}
                        </Link>
                      </div>
                    </div>
                    <button className="btn-icon">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isOwn = msg.sender_id === user?.id;
                        return (
                          <div key={msg.id} className={cn('flex', isOwn && 'justify-end')}>
                            <div
                              className={cn(
                                'max-w-[70%] p-3 rounded-xl',
                                isOwn
                                  ? 'bg-primary-600 text-white rounded-br-none'
                                  : 'bg-dark-800 text-gray-100 rounded-bl-none'
                              )}
                            >
                              <p>{msg.content}</p>
                              <div className={cn('flex items-center gap-1 mt-1 text-xs opacity-70', isOwn && 'flex-row-reverse')}>
                                <span>{formatRelativeTime(msg.created_at)}</span>
                                {isOwn && (
                                  msg.read_at ? (
                                    <CheckCheck className="w-3 h-3 text-primary-200" />
                                  ) : (
                                    <Check className="w-3 h-3 opacity-70" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="p-4 border-t border-dark-700">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="w-full h-12 px-4 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className={cn('btn-primary', (!newMessage.trim() || sending) && 'opacity-50 cursor-not-allowed')}
                      >
                        {sending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {conversations.length === 0
                        ? 'No conversations yet'
                        : 'Select a conversation'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

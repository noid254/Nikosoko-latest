import React, { useState, useEffect, useRef } from 'react';
import type { ServiceProvider, InboxMessage } from '../types';
import * as api from '../services/api';

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

interface MessageCenterViewProps {
  onBack: () => void;
  currentUser?: ServiceProvider | null;
  onOpenCompleteSignUp?: () => void;
  onOpenReviewModal?: (providerId: string) => void;
}

const MessageCenterView: React.FC<MessageCenterViewProps> = ({
  onBack,
  currentUser,
  onOpenCompleteSignUp,
  onOpenReviewModal,
}) => {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sentReminders, setSentReminders] = useState<Record<number, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playNotificationSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch {
      // Audio playback fallbacks
    }
  };

  useEffect(() => {
    const loadInbox = async () => {
      const msgs = await api.getInboxMessages();
      if (msgs && msgs.length > 0) {
        setMessages(msgs);
      } else {
        const defaultMsgs: InboxMessage[] = [
          {
            id: 1,
            sender: 'team',
            text: 'Welcome to Nikosoko Notifications & Support Center! Tap notifications stay active for rate requests.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'general',
          },
          {
            id: 2,
            sender: 'team',
            text: 'Tip: Every time someone taps your Call, Chat, Save, or Book button, you can click the notification to remind them to rate your service.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'general',
          },
        ];
        setMessages(defaultMsgs);
      }
    };
    loadInbox();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showToast = (txt: string) => {
    setToastMsg(txt);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const userMessage: Omit<InboxMessage, 'id'> = {
      sender: 'user',
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'general',
    };

    const added = await api.addInboxMessage(userMessage);
    setMessages(prev => [added, ...prev]);
    setNewMessage('');

    setTimeout(async () => {
      const teamReply: Omit<InboxMessage, 'id'> = {
        sender: 'team',
        text: 'Thank you for your message. An agent will get back to you shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'general',
      };
      const addedReply = await api.addInboxMessage(teamReply);
      setMessages(prev => [addedReply, ...prev]);
      playNotificationSound();
    }, 1500);
  };

  const handleSendRatingReminder = async (msg: InboxMessage) => {
    setSentReminders(prev => ({ ...prev, [msg.id]: true }));
    showToast(`Rating reminder sent to ${msg.tapperName || 'customer'}!`);
    playNotificationSound();

    // Create rating prompt for tapper
    const reminderMsg: Omit<InboxMessage, 'id'> = {
      sender: 'team',
      text: `⭐ Reminder: ${msg.targetProviderName || 'The service provider'} requested a rating for your recent interaction! Tap below to leave a quick 5-star review.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'rating_reminder',
      targetProviderId: msg.targetProviderId,
      targetProviderName: msg.targetProviderName,
      isActionable: true,
    };

    const added = await api.addInboxMessage(reminderMsg);
    setMessages(prev => [added, ...prev]);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-100 h-screen flex flex-col font-sans relative">
      {/* Toast popup */}
      {toastMsg && (
        <div className="absolute top-16 left-4 right-4 z-50 bg-slate-900 text-amber-400 border border-amber-400/50 p-3 rounded-xl shadow-xl text-center text-xs font-black animate-bounce">
          ✨ {toastMsg}
        </div>
      )}

      {/* Header */}
      <header className="p-4 bg-white shadow-xs border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-700 hover:text-black p-1">
            <BackIcon />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Notification & Support Hub</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CTA Notifications & Reviews</p>
          </div>
        </div>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="System Connected"></span>
      </header>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Profile incomplete warning */}
        {currentUser && !currentUser.isProfileCompleted && (
          <div className="p-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-2xl shadow-md border border-amber-400 space-y-2 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🔔</span>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-black">Unread: Complete Sign Up</h4>
                  <p className="text-[10px] font-bold text-black/80 leading-tight mt-0.5">
                    Your account is in guest mode. Complete your full Skill Profile PDF to list custom rates, upload photos, get verified & receive bookings!
                  </p>
                </div>
              </div>
              <span className="bg-red-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                UNREAD
              </span>
            </div>
            {onOpenCompleteSignUp && (
              <button
                onClick={onOpenCompleteSignUp}
                className="w-full bg-black text-amber-400 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-slate-900 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Complete Sign Up Now &rarr;
              </button>
            )}
          </div>
        )}

        {/* Inbox items */}
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          const isCtaTap = msg.type === 'cta_tap';
          const isRatingReminder = msg.type === 'rating_reminder';

          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[90%] p-4 rounded-2xl transition-all shadow-sm ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-br-none'
                    : isCtaTap
                    ? 'bg-amber-50 border-2 border-amber-400 text-slate-900 rounded-bl-none'
                    : isRatingReminder
                    ? 'bg-indigo-50 border-2 border-indigo-300 text-slate-900 rounded-bl-none'
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                }`}
              >
                {/* Header Badge */}
                {isCtaTap && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-amber-200">
                    <span className="bg-amber-400 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-md">
                      CTA TAP DETECTED ({msg.ctaType?.toUpperCase() || 'CTA'})
                    </span>
                    <span className="text-[10px] font-bold text-amber-800">Remind to Rate</span>
                  </div>
                )}

                {isRatingReminder && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-indigo-200">
                    <span className="bg-indigo-600 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-md">
                      ⭐ RATING REQUEST
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700">Client Review</span>
                  </div>
                )}

                <p className="text-xs font-medium leading-relaxed" style={{ wordBreak: 'break-word' }}>
                  {msg.text}
                </p>

                {/* Interactive Action Buttons */}
                {isCtaTap && (
                  <div className="mt-3 pt-2 border-t border-amber-300/60">
                    <button
                      onClick={() => handleSendRatingReminder(msg)}
                      disabled={sentReminders[msg.id]}
                      className={`w-full font-black py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer ${
                        sentReminders[msg.id]
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 text-amber-400 hover:bg-slate-800 active:scale-95'
                      }`}
                    >
                      {sentReminders[msg.id] ? '✓ Reminder Sent' : `📩 Send Rating Reminder to ${msg.tapperName || 'Customer'}`}
                    </button>
                  </div>
                )}

                {isRatingReminder && (
                  <div className="mt-3 pt-2 border-t border-indigo-200">
                    <button
                      onClick={() => {
                        if (msg.targetProviderId && onOpenReviewModal) {
                          onOpenReviewModal(msg.targetProviderId);
                        } else {
                          showToast('Opening review screen...');
                        }
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      ⭐ Rate Service Provider Now
                    </button>
                  </div>
                )}

                <p className={`text-[10px] mt-2 ${isUser ? 'text-slate-400' : 'text-slate-400'} text-right font-mono`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <footer className="p-3 bg-white border-t border-slate-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a support message or question..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
          />
          <button
            type="submit"
            className="bg-slate-900 text-amber-400 p-2.5 rounded-xl hover:bg-slate-800 transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <SendIcon />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default MessageCenterView;

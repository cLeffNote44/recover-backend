import { useState } from 'react'
import { Search, Send, Clock } from 'lucide-react'

const mockConversations = [
  {
    id: 1,
    patient: 'John Doe',
    lastMessage: 'Thank you for the session today...',
    time: 'Just now',
    unread: true,
  },
  {
    id: 2,
    patient: 'Jane Smith',
    lastMessage: 'I wanted to share my progress...',
    time: '2 min ago',
    unread: true,
  },
  {
    id: 3,
    patient: 'Michael Johnson',
    lastMessage: 'Can we reschedule tomorrow...',
    time: '15 min ago',
    unread: false,
  },
  {
    id: 4,
    patient: 'Sarah Wilson',
    lastMessage: 'I completed my weekly goals!',
    time: '1 hour ago',
    unread: false,
  },
]

const mockMessages = [
  { id: 1, sender: 'patient', text: 'Hi Dr. Martinez, I wanted to thank you for the session today.', time: '2:30 PM' },
  { id: 2, sender: 'patient', text: 'The coping strategies you suggested really helped me this week.', time: '2:31 PM' },
  { id: 3, sender: 'staff', text: 'I\'m so glad to hear that, John! How have you been feeling overall?', time: '2:45 PM' },
  { id: 4, sender: 'patient', text: 'Much better! I\'ve been doing my daily check-ins and the breathing exercises have been helping with my cravings.', time: '2:47 PM' },
  { id: 5, sender: 'staff', text: 'That\'s wonderful progress. Keep up the great work! Remember, I\'m here if you need anything.', time: '2:50 PM' },
]

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0])
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')

  const handleSend = () => {
    if (newMessage.trim()) {
      // TODO: Send message via API
      console.log('Sending:', newMessage)
      setNewMessage('')
    }
  }

  return (
    <div className="animate-fadeIn h-[calc(100vh-8rem)] flex">
      {/* Conversations List */}
      <div className="w-80 bg-white rounded-l-xl shadow-card border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                selectedConversation.id === conv.id ? 'bg-primary-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-semibold text-primary-600">
                  {conv.patient.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{conv.patient}</p>
                    <span className="text-xs text-gray-400">{conv.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread && (
                  <div className="w-2 h-2 bg-primary-600 rounded-full" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-r-xl shadow-card flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-semibold text-primary-600">
              {selectedConversation.patient.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{selectedConversation.patient}</p>
              <p className="text-sm text-gray-500">Active patient</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'staff' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${
                msg.sender === 'staff'
                  ? 'bg-primary-600 text-white rounded-2xl rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm'
              } px-4 py-3`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${
                  msg.sender === 'staff' ? 'text-primary-200' : 'text-gray-400'
                }`}>
                  <Clock className="w-3 h-3" />
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="p-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { Send, X } from 'lucide-react'
import Modal from '../ui/Modal'
import { chatWithCareer } from '../../services/ai'

const MAX_TURNS = 5

export default function CareerChatWidget({ isOpen, onClose, careerTitle, studentProfile }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'user',
        content: `Tell me about a typical day as a ${careerTitle}.`,
        auto: true,
      }])
      handleSend(`Tell me about a typical day as a ${careerTitle}.`, [])
    }
  }, [isOpen, careerTitle])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const userTurns = messages.filter(m => m.role === 'user').length

  const handleSend = async (text, existingMessages) => {
    const msgText = text !== undefined ? text : input.trim()
    if (!msgText || loading) return

    const newMsg = { role: 'user', content: msgText }
    const allMessages = [...(existingMessages !== undefined ? existingMessages : messages), newMsg]

    if (text === undefined) {
      setMessages(allMessages)
      setInput('')
    }

    setLoading(true)
    try {
      const { data, error } = await chatWithCareer(careerTitle, studentProfile, allMessages)
      if (error) throw error

      const reply = data?.reply || data?.content || 'Sorry, I could not get a response. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment."
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setMessages([])
    setInput('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`💬 Ask AI about ${careerTitle}`} width="500px">
      {/* Message list */}
      <div className="flex flex-col gap-3 min-h-[300px] max-h-[400px] overflow-y-auto mb-4 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm font-body leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gold text-navy rounded-br-sm'
                  : 'bg-cream text-navy border border-cborder rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-cream border border-cborder rounded-bl-sm">
              <div className="flex gap-1 items-center h-4">
                <div className="w-2 h-2 rounded-full bg-muted typing-dot" />
                <div className="w-2 h-2 rounded-full bg-muted typing-dot" />
                <div className="w-2 h-2 rounded-full bg-muted typing-dot" />
              </div>
            </div>
          </div>
        )}

        {userTurns >= MAX_TURNS && !loading && (
          <div className="text-center text-sm text-muted font-body py-3 border-t border-cborder mt-2">
            You've reached the conversation limit. Start a new chat to continue exploring.
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {userTurns < MAX_TURNS && (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-cborder rounded-xl font-body text-sm text-navy focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 bg-white disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="bg-gold text-navy px-4 py-2.5 rounded-xl hover:bg-goldLight disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      )}
    </Modal>
  )
}

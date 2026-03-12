import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, width = '480px' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: width }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-cborder">
          <h3 className="font-display text-xl text-navy">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-navy p-1 rounded-lg hover:bg-cream transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

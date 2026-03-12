import { createContext, useContext, useState, useCallback } from 'react'
import { clsx } from 'clsx'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

const icons = {
  success: <CheckCircle size={18} className="text-success" />,
  error: <AlertCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-blue-500" />,
}

const bgMap = {
  success: 'bg-white border-l-4 border-success',
  error: 'bg-white border-l-4 border-red-500',
  info: 'bg-white border-l-4 border-blue-500',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={clsx(
              'flex items-start gap-3 p-4 rounded-lg shadow-lg border border-cborder animate-fade-in',
              bgMap[toast.type]
            )}
          >
            {icons[toast.type]}
            <p className="text-sm text-navy flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-muted hover:text-navy">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

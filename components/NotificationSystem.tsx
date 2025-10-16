"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react"

interface Notification {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  duration?: number
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Escutar eventos de notificação global
    const handleNotification = (event: CustomEvent) => {
      const notification: Notification = {
        id: Date.now().toString(),
        duration: 5000,
        ...event.detail
      }
      
      setNotifications(prev => [...prev, notification])
      
      // Auto-remover após duração
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id))
      }, notification.duration || 5000)
    }

    window.addEventListener('notification' as any, handleNotification)
    return () => window.removeEventListener('notification' as any, handleNotification)
  }, [])

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case "success": return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case "error": return <XCircle className="h-5 w-5 text-red-500" />
      case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default: return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case "success": return "bg-emerald-500/10 border-emerald-500/30"
      case "error": return "bg-red-500/10 border-red-500/30"
      case "warning": return "bg-yellow-500/10 border-yellow-500/30"
      default: return "bg-blue-500/10 border-blue-500/30"
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm p-4 rounded-lg border backdrop-blur-sm ${getBgColor(notification.type)} animate-in slide-in-from-right-full duration-300`}
        >
          <div className="flex items-start gap-3">
            {getIcon(notification.type)}
            <div className="flex-1">
              <h4 className="font-semibold text-white text-sm">
                {notification.title}
              </h4>
              <p className="text-slate-300 text-xs mt-1">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Função helper para disparar notificações
export function notify(type: Notification['type'], title: string, message: string) {
  const event = new CustomEvent('notification', {
    detail: { type, title, message }
  })
  window.dispatchEvent(event)
}


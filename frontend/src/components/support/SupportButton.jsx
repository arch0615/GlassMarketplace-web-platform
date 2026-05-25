import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import SupportPanel from './SupportPanel'
import { api } from '../../lib/api'

const POLL_MS = 30000 // background poll for unread counter

export default function SupportButton() {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  // Background poll: how many admin → user messages are waiting?
  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      try {
        const data = await api('/support/me')
        if (!cancelled) setUnread(data?.thread?.unreadForUser || 0)
      } catch {
        // silent — user might not be logged in yet on first render
      }
    }
    tick()
    const id = setInterval(tick, POLL_MS)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700
                   text-white shadow-lg shadow-blue-600/30 flex items-center justify-center transition-colors
                   focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
        aria-label="Abrir chat de soporte"
        title="Soporte Lensia"
      >
        <MessageCircle className="w-6 h-6" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white
                           text-[11px] font-bold flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-900">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      <SupportPanel open={open} onClose={() => setOpen(false)} onUnreadChange={setUnread} />
    </>
  )
}

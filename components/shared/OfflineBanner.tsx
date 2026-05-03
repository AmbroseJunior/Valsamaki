'use client'

import { useOffline } from '@/hooks/useOffline'
import { WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function OfflineBanner() {
  const { isOffline } = useOffline()

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-[var(--z-toast)] flex items-center justify-center gap-2 bg-[var(--color-terra)] text-white text-sm font-medium py-2 px-4"
          role="alert"
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>You&apos;re offline — showing cached content</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

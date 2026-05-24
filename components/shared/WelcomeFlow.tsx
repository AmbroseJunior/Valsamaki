'use client'

import { useState } from 'react'
import { FirstVisitLanguagePicker } from './FirstVisitLanguagePicker'
import { WaitlistModal } from './WaitlistModal'

const WAITLIST_KEY = 'valsamaki_waitlist_seen'

export function WelcomeFlow() {
  const [waitlist, setWaitlist] = useState<{ show: boolean; locale?: string }>({ show: false })

  function handleLanguageDismiss(locale?: string) {
    try {
      if (!localStorage.getItem(WAITLIST_KEY)) {
        setWaitlist({ show: true, locale })
      }
    } catch {}
  }

  function handleWaitlistDismiss() {
    try { localStorage.setItem(WAITLIST_KEY, '1') } catch {}
    setWaitlist({ show: false })
  }

  return (
    <>
      <FirstVisitLanguagePicker onDismiss={handleLanguageDismiss} />
      {waitlist.show && (
        <WaitlistModal locale={waitlist.locale} onDismiss={handleWaitlistDismiss} />
      )}
    </>
  )
}

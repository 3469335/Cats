'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.875rem',
      }}
    >
      Выйти
    </button>
  )
}

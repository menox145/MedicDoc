// app/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const getCachedUser = () => {
    const local = localStorage.getItem('user')
    if (local) {
      try {
        return JSON.parse(local)
      } catch {
        return null
      }
    }

    const match = document.cookie.match(/(?:^|;\s*)user=([^;]+)/)
    if (!match) return null
    try {
      return JSON.parse(decodeURIComponent(match[1]))
    } catch {
      return null
    }
  }

  useEffect(() => {
    const u = getCachedUser()
    if (!u) {
      router.push('/login')
      return
    }

    if (u.role === 'ADMIN') router.push('/admin')
    else router.push('/dashboard')
  }, [router])

  return <div className="p-10">Loading...</div>
}
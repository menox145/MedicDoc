// app/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) router.push('/login')
    else {
      const u = JSON.parse(user)
      if (u.role === 'ADMIN') router.push('/admin')
      else router.push('/dashboard')
    }
  }, [router])

  return <div className="p-10">Loading...</div>
}
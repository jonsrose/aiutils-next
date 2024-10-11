'use client'

import Link from 'next/link'
import { withAuth } from '@/components/withAuth'
import { signOut, useSession } from 'next-auth/react'

function Home() {
  const { data: session } = useSession()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Our App</h1>
      
      <h1>Welcome to the Home Page, {session?.user?.name ?? 'User'}!</h1>
      <p>Your user ID is: {session?.user?.id ?? 'Not available'}</p>
      <Link href="/hi">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
          Go to Hi Page
        </button>
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: '/signin' })}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Sign Out
      </button>
      
      <nav className="mt-8">
        <ul className="space-y-4">
          <li>
            <Link 
              href="/store-api-key" 
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Store API Key
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  )
}

export default withAuth(Home)

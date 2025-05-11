// src/components/HealthStatus.tsx - Fixed version

import { useEffect, useState } from 'react'
import { checkHealth } from '../api/api'

export function HealthStatus() {
  const [status, setStatus] = useState<string>('Vérification...')
  const [isOnline, setIsOnline] = useState<boolean | null>(null)

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const res = await checkHealth()
        setStatus(res.message || 'Serveur connecté')
        setIsOnline(true)
      } catch (error) {
        console.error('Health check failed:', error)
        setStatus("Le serveur est injoignable.")
        setIsOnline(false)
      }
    }

    // Check immediately
    checkServerStatus()
    
    // Then set up an interval to check periodically
    const intervalId = setInterval(checkServerStatus, 30000) // every 30 seconds
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className={`px-3 py-1 rounded-full text-sm ${
      isOnline === null ? 'bg-gray-100 text-gray-600' : 
      isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      <div className="flex items-center">
        <div className={`w-2 h-2 mr-2 rounded-full ${
          isOnline === null ? 'bg-gray-500' : 
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        {status}
      </div>
    </div>
  )
}
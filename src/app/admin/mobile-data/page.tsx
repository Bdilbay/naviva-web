'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { DataTable } from '@/components/admin/DataTable'
import { Users, Ship, AlertCircle } from 'lucide-react'

type Tab = 'users' | 'boats' | 'logs' | 'alerts' | 'trips'

interface MobileUser {
  id: string
  email?: string
  full_name?: string
  created_at?: string
}

interface BoatData {
  id: string
  name: string
  user_id: string
  type?: string
  created_at?: string
}

export default function MobileDataPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>('users')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      let endpoint = ''

      switch (activeTab) {
        case 'users':
          endpoint = '/api/admin/get-mobile-users'
          break
        case 'boats':
          endpoint = '/api/admin/get-boats'
          break
        case 'logs':
          endpoint = '/api/admin/get-boat-logs'
          break
        case 'alerts':
          endpoint = '/api/admin/get-alerts'
          break
        case 'trips':
          endpoint = '/api/admin/get-trips'
          break
        default:
          return
      }

      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data')
      }

      setData(result.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const renderContent = () => {
    if (activeTab === 'users') {
      return (
        <DataTable
          columns={[
            { key: 'id', label: 'ID', width: 'w-32' },
            { key: 'email', label: 'Email' },
            {
              key: 'full_name',
              label: 'Full Name',
              render: (value) => value || '-',
            },
            {
              key: 'created_at',
              label: 'Joined',
              render: (value) => value ? new Date(value).toLocaleDateString() : '-',
            },
          ]}
          data={data}
          loading={loading}
          pageSize={15}
        />
      )
    }

    if (activeTab === 'boats') {
      return (
        <DataTable
          columns={[
            { key: 'id', label: 'ID', width: 'w-32' },
            { key: 'name', label: 'Name' },
            { key: 'type', label: 'Type' },
            {
              key: 'user_id',
              label: 'Owner ID',
              width: 'w-32',
              render: (value) => value?.slice(0, 8) + '...' || '-',
            },
            {
              key: 'created_at',
              label: 'Created',
              render: (value) => value ? new Date(value).toLocaleDateString() : '-',
            },
          ]}
          data={data}
          loading={loading}
          pageSize={15}
        />
      )
    }

    if (activeTab === 'logs') {
      return (
        <DataTable
          columns={[
            { key: 'id', label: 'ID', width: 'w-32' },
            { key: 'from_port', label: 'From' },
            { key: 'to_port', label: 'To' },
            {
              key: 'date',
              label: 'Date',
              render: (value) => value ? new Date(value).toLocaleDateString() : '-',
            },
            {
              key: 'created_at',
              label: 'Created',
              render: (value) => value ? new Date(value).toLocaleDateString() : '-',
            },
          ]}
          data={data}
          loading={loading}
          pageSize={15}
        />
      )
    }

    if (activeTab === 'alerts') {
      return (
        <DataTable
          columns={[
            { key: 'id', label: 'ID', width: 'w-32' },
            { key: 'name', label: 'Name' },
            { key: 'type', label: 'Type' },
            {
              key: 'is_active',
              label: 'Status',
              render: (value) => (
                <span className={value ? 'text-red-400' : 'text-green-400'}>
                  {value ? 'Active' : 'Closed'}
                </span>
              ),
            },
            {
              key: 'created_at',
              label: 'Created',
              render: (value) => value ? new Date(value).toLocaleDateString() : '-',
            },
          ]}
          data={data}
          loading={loading}
          pageSize={15}
        />
      )
    }

    if (activeTab === 'trips') {
      return (
        <DataTable
          columns={[
            { key: 'id', label: 'ID', width: 'w-32' },
            {
              key: 'start_at',
              label: 'Start',
              render: (value) => value ? new Date(value).toLocaleDateString() : '-',
            },
            {
              key: 'end_at',
              label: 'End',
              render: (value) => value ? new Date(value).toLocaleDateString() : '-',
            },
            {
              key: 'status',
              label: 'Status',
              render: (value) => (
                <span className={`${
                  value === 'completed' ? 'text-green-400' :
                  value === 'active' ? 'text-blue-400' :
                  'text-slate-400'
                }`}>
                  {value || '-'}
                </span>
              ),
            },
          ]}
          data={data}
          loading={loading}
          pageSize={15}
        />
      )
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Mobile Data Management</h2>
        <p className="text-slate-400">Manage users, boats, and other mobile app data</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700">
        {(
          [
            { id: 'users', label: '👥 Users', icon: Users },
            { id: 'boats', label: '⛵ Boats', icon: Ship },
            { id: 'logs', label: '📖 Boat Logs', icon: AlertCircle },
            { id: 'alerts', label: '🚨 Alerts', icon: AlertCircle },
            { id: 'trips', label: '🗺️ Trips', icon: AlertCircle },
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-orange-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        {renderContent()}
      </div>
    </div>
  )
}

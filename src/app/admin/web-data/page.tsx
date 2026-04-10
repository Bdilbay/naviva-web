'use client'

import { useEffect, useState, useCallback } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { Users, ShoppingCart, UserCheck, Tag, MessageSquare } from 'lucide-react'

type Tab = 'users' | 'listings' | 'masters' | 'categories' | 'reviews'

export default function WebDataPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      let endpoint = ''

      switch (activeTab) {
        case 'users':
          endpoint = '/api/admin/get-web-users'
          break
        case 'listings':
          endpoint = '/api/admin/get-listings'
          break
        case 'masters':
          endpoint = '/api/admin/get-masters'
          break
        case 'categories':
          endpoint = '/api/admin/get-categories'
          break
        case 'reviews':
          endpoint = '/api/admin/get-reviews'
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

    if (activeTab === 'listings') {
      return (
        <DataTable
          columns={[
            { key: 'id', label: 'ID', width: 'w-32' },
            { key: 'title', label: 'Title' },
            { key: 'category', label: 'Category' },
            {
              key: 'status',
              label: 'Status',
              render: (value) => (
                <span className={value === 'active' ? 'text-green-400' : 'text-slate-400'}>
                  {value || '-'}
                </span>
              ),
            },
            {
              key: 'price',
              label: 'Price',
              render: (value) => value ? `$${value}` : '-',
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

    if (activeTab === 'masters') {
      return (
        <DataTable
          columns={[
            { key: 'id', label: 'ID', width: 'w-32' },
            { key: 'title', label: 'Name' },
            { key: 'category', label: 'Category' },
            { key: 'location', label: 'Location' },
            {
              key: 'rating',
              label: 'Rating',
              render: (value) => value ? `${value.toFixed(1)} ⭐` : '-',
            },
            {
              key: 'is_verified',
              label: 'Verified',
              render: (value) => (
                <span className={value ? 'text-green-400' : 'text-slate-400'}>
                  {value ? 'Yes' : 'No'}
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

    if (activeTab === 'categories') {
      return (
        <DataTable
          columns={[
            { key: 'id', label: 'ID', width: 'w-32' },
            { key: 'name', label: 'Name' },
            {
              key: 'description',
              label: 'Description',
              render: (value) => (value ? value.substring(0, 50) + '...' : '-'),
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

    if (activeTab === 'reviews') {
      return (
        <DataTable
          columns={[
            { key: 'id', label: 'ID', width: 'w-32' },
            {
              key: 'user_id',
              label: 'User',
              width: 'w-32',
              render: (value) => value?.slice(0, 8) + '...' || '-',
            },
            {
              key: 'rating',
              label: 'Rating',
              render: (value) => `${value} ⭐` || '-',
            },
            {
              key: 'comment',
              label: 'Comment',
              render: (value) => (value ? value.substring(0, 50) + '...' : '-'),
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
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Web Platform Data Management</h2>
        <p className="text-slate-400">Manage users, listings, masters, and other platform data</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700 overflow-x-auto">
        {(
          [
            { id: 'users', label: '👥 Users', icon: Users },
            { id: 'listings', label: '🏪 Listings', icon: ShoppingCart },
            { id: 'masters', label: '👨‍🔧 Masters', icon: UserCheck },
            { id: 'categories', label: '🏷️ Categories', icon: Tag },
            { id: 'reviews', label: '💬 Reviews', icon: MessageSquare },
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
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

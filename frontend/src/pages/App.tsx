import React, { useState, useEffect } from 'react'
import MapPanel from '../ui/MapPanel'
import { AuthModal } from '../ui/AuthModal'
import { UserInterface } from '../ui/UserInterface'
import { AdminInterface } from '../ui/AdminInterface'

export type College = {
  affiliation: string
  college_id: number
  name: string
  longitude: number
  latitude: number
  province: string
  city: string
  category: string
  nature: string
  type?: string
  is_985?: number
  is_211?: number
  is_double_first?: number
  address?: string
  admin_code?: number | null
}

export default function App() {
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string>('user')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [mapDetailCollegeId, setMapDetailCollegeId] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('jwt')
    const role = localStorage.getItem('userRole')
    console.log('从localStorage获取的token:', token)
    console.log('从localStorage获取的角色:', role)
    if (token && role) {
      setIsAuthenticated(true)
      setUserRole(role)
    } else {
      setShowAuthModal(true)
    }
  }, [])

  const handleLogin = (token: string, role: string) => {
    setIsAuthenticated(true)
    setUserRole(role)
    setShowAuthModal(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('jwt')
    localStorage.removeItem('userRole')
    setIsAuthenticated(false)
    setUserRole('user')
    setShowAuthModal(true)
  }

  const handleMapDetail = (collegeId: number) => {
    setMapDetailCollegeId(collegeId)
  }

  const handleSelectCollege = (college: College | null) => {
    setSelectedCollege(college)
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => {}} 
          onLogin={handleLogin} 
        />
      </div>
    )
  }

  return (
    <div className="layout">
      <div className="header">
        <h1>高校数据库管理系统</h1>
        <div className="user-info">
          <span>欢迎，{userRole === 'admin' ? '管理员' : '用户'}</span>
          <button onClick={() => {
            const newRole = userRole === 'admin' ? 'user' : 'admin'
            setUserRole(newRole)
            localStorage.setItem('userRole', newRole)
          }}>切换角色</button>
          <button onClick={handleLogout}>退出登录</button>
        </div>
      </div>
      
      <div className="main-content">
        <div className="map-container">
          <MapPanel 
            onShowDetail={handleMapDetail} 
            onSelect={handleSelectCollege}
            selectedCollegeId={selectedCollege?.college_id} // 传递选中的高校ID
          />
        </div>
        
        <div className="interface-container">
          <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '10px' }}>
            <strong>调试信息:</strong> 当前角色: {userRole} | 是否管理员: {userRole === 'admin' ? '是' : '否'}
          </div>
          {userRole === 'admin' ? (
            <AdminInterface 
              selectedCollege={selectedCollege} 
              onSelect={setSelectedCollege}
              mapDetailCollegeId={mapDetailCollegeId}
              onMapDetailClear={() => setMapDetailCollegeId(null)}
            />
          ) : (
            <UserInterface 
              selectedCollege={selectedCollege} 
              onSelect={setSelectedCollege}
              mapDetailCollegeId={mapDetailCollegeId}
              onMapDetailClear={() => setMapDetailCollegeId(null)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
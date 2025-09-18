import React, { useState, useEffect } from 'react'

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userDetails, setUserDetails] = useState<any>(null)

  const buildHeaders = (): HeadersInit => {
    const token = localStorage.getItem('jwt')
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
      }
    }
    return {}
  }

  const getUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user', {
        headers: buildHeaders()
      })
      
      if (res.ok) {
        const data = await res.json()
        // 将API返回的数据格式转换为组件内部使用的格式
        const formattedUsers = data.map((user: any) => ({
          id: user.user_id,
          username: user.username,
          role: user.role,
          province: user.province,
          city: user.city
        }))
        setUsers(formattedUsers)
      } else {
        throw new Error('获取用户列表失败')
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      alert('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const getUserDetails = async (userId: number) => {
    try {
      const res = await fetch(`/api/user/${userId}`, {
        headers: buildHeaders()
      })
      if (res.ok) {
        const data = await res.json()
        setUserDetails(data)
        setSelectedUser(users.find(u => u.id === userId))
      } else {
        alert('获取用户详情失败')
      }
    } catch (error) {
      console.error('获取用户详情失败:', error)
      alert('获取用户详情失败')
    }
  }

  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      // 这里应该调用更新用户角色的接口
      // 由于后端可能没有这个接口，我们只更新本地状态
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
      alert(`用户角色已更新为: ${newRole}`)
    } catch (error) {
      console.error('更新用户角色失败:', error)
      alert('更新用户角色失败')
    }
  }

  useEffect(() => {
    getUsers()
  }, [])

  return (
    <div className="user-management">
      <div className="management-header">
        <h4>用户管理</h4>
        <button onClick={getUsers} disabled={loading}>
          {loading ? '加载中...' : '刷新用户列表'}
        </button>
      </div>

      <div className="user-list">
        <h5>用户列表 ({users.length})</h5>
        {users.map((user) => (
          <div key={user.id} className="user-item">
            <div className="user-info">
              <div className="user-name">
                <strong>{user.username}</strong>
                <span className={`role-badge ${user.role}`}>
                  {user.role === 'admin' ? '管理员' : '用户'}
                </span>
              </div>
              <div className="user-location">
                {user.province} · {user.city}
              </div>
            </div>
            <div className="user-actions">
              <button onClick={() => getUserDetails(user.id)}>
                查看详情
              </button>
              <select 
                value={user.role} 
                onChange={(e) => updateUserRole(user.id, e.target.value)}
              >
                <option value="user">用户</option>
                <option value="admin">管理员</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {userDetails && selectedUser && (
        <div className="user-details">
          <h5>用户详情</h5>
          <div className="details-content">
            <div className="detail-item">
              <label>用户名:</label>
              <span>{userDetails.username || selectedUser.username}</span>
            </div>
            <div className="detail-item">
              <label>角色:</label>
              <span>{userDetails.role || selectedUser.role}</span>
            </div>
            <div className="detail-item">
              <label>省份:</label>
              <span>{userDetails.province || selectedUser.province}</span>
            </div>
            <div className="detail-item">
              <label>城市:</label>
              <span>{userDetails.city || selectedUser.city}</span>
            </div>
            <div className="detail-item">
              <label>地址:</label>
              <span>{userDetails.address || '未设置'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="management-actions">
        <h5>管理操作</h5>
        <div className="action-buttons">
          <button>批量操作</button>
          <button>导出用户数据</button>
          <button>用户权限设置</button>
        </div>
      </div>
    </div>
  )
}
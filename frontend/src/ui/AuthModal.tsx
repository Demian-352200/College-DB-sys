import React, { useState } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onLogin: (token: string, role: string) => void
}

export function AuthModal({ isOpen, onClose, onLogin }: Props) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = isLogin ? '/api/login' : '/api/register'
      const body = isLogin 
        ? { username, password }
        : { username, password, province, city, address }
      
      console.log('提交认证请求:', url, body)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      console.log('认证API响应状态:', res.status)
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('认证失败:', res.status, res.statusText, errorText)
        alert(`操作失败: ${res.status} ${res.statusText}\n${errorText}`)
        setLoading(false)
        return
      }
      
      const data = await res.json()
      console.log('认证响应数据:', data)
      const token = data?.token || data?.access_token || data?.Authorization || ''
      const role = data?.role || data?.user_role || 'user'
      
      console.log('登录响应数据:', data)
      console.log('解析的角色:', role)
      
      if (token) {
        localStorage.setItem('jwt', token)
        localStorage.setItem('userRole', role)
        onLogin(token, role)
        onClose()
      } else {
        alert(`操作失败: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('认证请求出错:', error)
      alert(`网络错误: ${error}`)
      
      // 检查是否是网络错误
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        alert('网络连接错误，请检查后端服务是否运行正常')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isLogin ? '登录' : '注册'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {!isLogin && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="省份"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="城市"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="详细地址（可选）"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </>
          )}
          
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
            </button>
            <button type="button" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? '切换到注册' : '切换到登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

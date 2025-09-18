import React, { useState, useEffect } from 'react'
import { College } from '../pages/App'
import { FeatureCard } from './FeatureCard'
import { EvaluationForm } from './EvaluationForm'

type Props = {
  selectedCollege: College | null
  onSelect: (college: College | null) => void
  mapDetailCollegeId?: number | null
  onMapDetailClear: () => void
}

type WindowState = {
  id: string
  type: 'search' | 'chat' | 'analysis' | 'evaluation' | 'add-college' | 'update-college'
  position: { x: number, y: number }
  size: { width: number, height: number }
}

type AnalysisResult = {
  id: number
  type: 'traffic' | 'climate'
  college: College
  content: string
  timestamp: Date
}

export function UserInterface({ selectedCollege, onSelect, mapDetailCollegeId, onMapDetailClear }: Props) {
  const [messages, setMessages] = useState<string[]>([])
  const [notifications, setNotifications] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [searchResults, setSearchResults] = useState<College[]>([])
  const [detailCollege, setDetailCollege] = useState<any>(null)
  const [searchParams, setSearchParams] = useState({
    name: '', province: '', city: '', category: '', nature: '', type: '', is_985: '', is_211: '', is_double_first: ''
  })
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [windows, setWindows] = useState<WindowState[]>([])
  const [nextId, setNextId] = useState(1)
  const [newCollegeData, setNewCollegeData] = useState({
    name: '',
    province: '',
    city: '',
    category: '',
    nature: '',
    type: '',
    is_985: false,
    is_211: false,
    is_double_first: false,
    address: '',
    longitude: 0,
    latitude: 0,
    admin_code: '',
    affiliation: ''
  })
  
  const [updateCollegeData, setUpdateCollegeData] = useState({
    name: '',
    province: '',
    city: '',
    category: '',
    nature: '',
    type: '',
    is_985: false,
    is_211: false,
    is_double_first: false,
    address: '',
    longitude: 0,
    latitude: 0,
    admin_code: '',
    affiliation: ''
  })
  const [userEvaluations, setUserEvaluations] = useState<any[]>([])
  const [collegeNames, setCollegeNames] = useState<Record<number, string>>({})
  const [editingEvaluation, setEditingEvaluation] = useState<{
    id: number;
    data: any;
  } | null>(null)

  const buildHeaders = (): HeadersInit => {
    const token = localStorage.getItem('jwt')
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
      }
    }
    return {}
  }

  // 处理从地图传来的详情请求
  useEffect(() => {
    if (mapDetailCollegeId) {
      loadCollegeDetail(mapDetailCollegeId)
      // 如果没有搜索窗口，则创建一个
      if (!windows.some(w => w.type === 'search')) {
        openWindow('search')
      }
      onMapDetailClear() // 清除地图详情请求状态
    }
  }, [mapDetailCollegeId, onMapDetailClear])

  // 当详情数据加载完成时确保有搜索窗口
  useEffect(() => {
    if (detailCollege && !windows.some(w => w.type === 'search')) {
      openWindow('search')
    }
  }, [detailCollege])

  // 显示通知信息
  const showNotification = (message: string, duration: number = 3000) => {
    setNotifications(prev => [...prev, message]);
    // 根据指定时长自动清除通知，默认3秒
    setTimeout(() => {
      setNotifications(prev => prev.filter(msg => msg !== message));
    }, duration);
  };

  const sendMessage = async () => {
    if (!input.trim()) return
    
    // 添加用户消息到消息列表
    const userMessage = input.trim()
    setMessages((prev) => [...prev, `用户: ${userMessage}`])
    setInput('') // 立即清空输入框
    
    const token = localStorage.getItem('jwt') || ''
    const resp = await fetch('/api/server', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ Content: userMessage }),
    })
    const reader = resp.body?.getReader()
    if (reader) {
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let assistantResponse = ''
      
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let idx
        while ((idx = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, idx).trim()
          buffer = buffer.slice(idx + 1)
          if (!line) continue
          try {
            const parsed = JSON.parse(line)
            if (parsed?.data) {
              // 提取content中的内容
              let messageText = ''
              if (typeof parsed.data === 'string') {
                // 如果data是字符串，尝试解析它作为JSON
                try {
                  const innerData = JSON.parse(parsed.data)
                  if (innerData.Content) {
                    messageText = innerData.Content
                  } else {
                    messageText = parsed.data
                  }
                } catch {
                  messageText = parsed.data
                }
              } else if (parsed.data.content) {
                messageText = parsed.data.content
              } else if (parsed.data.Content) {
                // 特别处理大写Content字段
                messageText = parsed.data.Content
              } else if (parsed.data.message) {
                messageText = parsed.data.message
              } else {
                messageText = JSON.stringify(parsed.data)
              }
              
              assistantResponse += messageText
              // 实时更新最后一条消息
              setMessages((prev) => {
                const newMessages = [...prev]
                if (newMessages[newMessages.length - 1]?.startsWith('助手:')) {
                  newMessages[newMessages.length - 1] = `助手: ${assistantResponse}`
                } else {
                  newMessages.push(`助手: ${assistantResponse}`)
                }
                return newMessages
              })
            }
          } catch {
            // 如果不是JSON，直接添加原始内容
            assistantResponse += line
            setMessages((prev) => {
              const newMessages = [...prev]
              if (newMessages[newMessages.length - 1]?.startsWith('助手:')) {
                newMessages[newMessages.length - 1] = `助手: ${assistantResponse}`
              } else {
                newMessages.push(`助手: ${assistantResponse}`)
              }
              return newMessages
            })
          }
        }
      }
    }
  }

  const searchColleges = async () => {
    const qs = new URLSearchParams()
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) qs.set(k, String(v))
    })
    const res = await fetch(`/api/colleges/search/?${qs.toString()}`)
    const data = await res.json()
    setSearchResults(Array.isArray(data) ? data : [])
  }

  const loadCollegeDetail = async (id: number) => {
    try {
      const res = await fetch(`/api/colleges/${id}`)
      const data = await res.json()
      console.log('高校详情数据:', data)
      setDetailCollege(data)
    } catch (error) {
      console.error('获取高校详情失败:', error)
      showNotification(`获取高校详情失败: ${error}`)
    }
  }

  const callTraffic = async () => {
    if (!selectedCollege) {
      showNotification('请先在地图上选择一所高校', 3000)
      return
    }
    
    try {
      const res = await fetch(`/api/server/traffic/${selectedCollege.college_id}`, {
        method: 'POST',
        headers: buildHeaders(),
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json().catch(() => ({}))
      
      // 解析交通分析结果
      let trafficMessage = '交通分析结果:\n'
      if (data && typeof data === 'object') {
        if (data.message) {
          trafficMessage += data.message
        } else {
          trafficMessage += JSON.stringify(data, null, 2)
        }
      } else if (typeof data === 'string') {
        trafficMessage += data
      } else {
        trafficMessage += '暂无详细交通分析信息'
      }
      
      // 添加到分析结果列表
      const newResult: AnalysisResult = {
        id: Date.now(),
        type: 'traffic',
        college: selectedCollege,
        content: trafficMessage,
        timestamp: new Date()
      }
      
      setAnalysisResults(prev => [newResult, ...prev])
    } catch (error) {
      console.error('交通分析失败:', error)
      showNotification(`交通分析失败: ${error}`, 5000)
    }
  }

  const callClimate = async () => {
    if (!selectedCollege) {
      showNotification('请先在地图上选择一所高校', 3000)
      return
    }
    
    try {
      const res = await fetch(`/api/server/climate/${selectedCollege.college_id}`, {
        method: 'POST',
        headers: buildHeaders(),
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json().catch(() => ({}))
      
      // 解析气候分析结果
      let climateMessage = '气候分析结果:\n'
      if (data && typeof data === 'object') {
        if (data.message) {
          climateMessage += data.message
        } else {
          climateMessage += JSON.stringify(data, null, 2)
        }
      } else if (typeof data === 'string') {
        climateMessage += data
      } else {
        climateMessage += '暂无详细气候分析信息'
      }
      
      // 添加到分析结果列表
      const newResult: AnalysisResult = {
        id: Date.now(),
        type: 'climate',
        college: selectedCollege,
        content: climateMessage,
        timestamp: new Date()
      }
      
      setAnalysisResults(prev => [newResult, ...prev])
    } catch (error) {
      console.error('气候分析失败:', error)
      showNotification(`气候分析失败: ${error}`, 5000)
    }
  }

  const removeAnalysisResult = (id: number) => {
    setAnalysisResults(prev => prev.filter(result => result.id !== id))
  }

  const openWindow = (type: WindowState['type']) => {
    // 计算新窗口的位置，避免完全重叠
    const offsetX = (windows.length * 30) % 100
    const offsetY = (windows.length * 30) % 100
    
    const newWindow: WindowState = {
      id: `window-${nextId}`,
      type,
      position: { 
        x: window.innerWidth - 470 + offsetX, 
        y: 60 + offsetY 
      },
      size: { width: 450, height: 600 }
    }
    
    setWindows(prev => [...prev, newWindow])
    setNextId(prev => prev + 1)
  }

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(window => window.id !== id))
    
    // 如果关闭的是搜索窗口，同时清除搜索结果和详情
    const closingWindow = windows.find(window => window.id === id)
    if (closingWindow?.type === 'search') {
      setSearchResults([])
      setDetailCollege(null)
    }
    
    // 如果关闭的是添加高校窗口，清除表单数据
    if (closingWindow?.type === 'add-college') {
      setNewCollegeData({
        name: '',
        province: '',
        city: '',
        category: '',
        nature: '',
        type: '',
        is_985: false,
        is_211: false,
        is_double_first: false,
        address: '',
        longitude: 0,
        latitude: 0,
        admin_code: '',
        affiliation: ''
      })
    }
    
    // 如果关闭的是更新高校窗口，清除表单数据
    if (closingWindow?.type === 'update-college') {
      setUpdateCollegeData({
        name: '',
        province: '',
        city: '',
        category: '',
        nature: '',
        type: '',
        is_985: false,
        is_211: false,
        is_double_first: false,
        address: '',
        longitude: 0,
        latitude: 0,
        admin_code: '',
        affiliation: ''
      })
    }
  }

  const updateWindow = (id: string, position?: { x: number, y: number }, size?: { width: number, height: number }) => {
    setWindows(prev => prev.map(window => {
      if (window.id === id) {
        return {
          ...window,
          position: position || window.position,
          size: size || window.size
        }
      }
      return window
    }))
  }

  const handleAddCollegeChange = (field: string, value: string | boolean | number) => {
    setNewCollegeData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUpdateCollegeChange = (field: string, value: string | boolean | number) => {
    setUpdateCollegeData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const submitNewCollege = async () => {
    try {
      const token = localStorage.getItem('jwt')
      if (!token) {
        showNotification('请先登录', 3000)
        return
      }

      // 构造提交数据
      const collegeData = {
        ...newCollegeData,
        shape: `POINT(${newCollegeData.longitude} ${newCollegeData.latitude})`,
        is_985: newCollegeData.is_985 ? 1 : 0,
        is_211: newCollegeData.is_211 ? 1 : 0,
        is_double_first: newCollegeData.is_double_first ? 1 : 0,
        admin_code: newCollegeData.admin_code ? parseInt(newCollegeData.admin_code as string) : undefined
      }

      const response = await fetch('/api/colleges/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(collegeData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || '提交失败')
      }

      const result = await response.json()
      showNotification('高校信息提交成功，等待审核', 5000)
      
      // 关闭添加高校窗口
      setWindows(prev => prev.filter(window => window.type !== 'add-college'))
      
      // 清空表单
      setNewCollegeData({
        name: '',
        province: '',
        city: '',
        category: '',
        nature: '',
        type: '',
        is_985: false,
        is_211: false,
        is_double_first: false,
        address: '',
        longitude: 0,
        latitude: 0,
        admin_code: '',
        affiliation: ''
      })
    } catch (error: unknown) {
      console.error('添加高校失败:', error)
      let errorMessage = '添加高校失败'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      showNotification(`添加高校失败: ${errorMessage}`, 5000)
    }
  }

  const submitUpdateCollege = async () => {
    if (!selectedCollege) {
      showNotification('请先选择一所高校', 3000)
      return
    }

    try {
      const token = localStorage.getItem('jwt')
      if (!token) {
        showNotification('请先登录', 3000)
        return
      }

      // 构造提交数据，只包含有值的字段
      const collegeData: any = {}
      
      // 只添加非空字段
      if (updateCollegeData.name) collegeData.name = updateCollegeData.name
      if (updateCollegeData.province) collegeData.province = updateCollegeData.province
      if (updateCollegeData.city) collegeData.city = updateCollegeData.city
      if (updateCollegeData.category) collegeData.category = updateCollegeData.category
      if (updateCollegeData.nature) collegeData.nature = updateCollegeData.nature
      if (updateCollegeData.type) collegeData.type = updateCollegeData.type
      if (updateCollegeData.address) collegeData.address = updateCollegeData.address
      if (updateCollegeData.affiliation) collegeData.affiliation = updateCollegeData.affiliation
      if (updateCollegeData.admin_code) collegeData.admin_code = parseInt(updateCollegeData.admin_code as string)
      
      // 处理布尔值字段
      if (updateCollegeData.is_985 !== false || updateCollegeData.name) 
        collegeData.is_985 = updateCollegeData.is_985 ? 1 : 0
      if (updateCollegeData.is_211 !== false || updateCollegeData.name) 
        collegeData.is_211 = updateCollegeData.is_211 ? 1 : 0
      if (updateCollegeData.is_double_first !== false || updateCollegeData.name) 
        collegeData.is_double_first = updateCollegeData.is_double_first ? 1 : 0
      
      // 处理坐标
      if (updateCollegeData.longitude !== 0 || updateCollegeData.name) 
        collegeData.longitude = updateCollegeData.longitude
      if (updateCollegeData.latitude !== 0 || updateCollegeData.name) 
        collegeData.latitude = updateCollegeData.latitude

      const response = await fetch(`/api/colleges/${selectedCollege.college_id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(collegeData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || '提交失败')
      }

      const result = await response.json()
      showNotification('高校信息更新请求已提交，等待审核', 5000)
      
      // 关闭更新高校窗口
      setWindows(prev => prev.filter(window => window.type !== 'update-college'))
      
      // 清空表单
      setUpdateCollegeData({
        name: '',
        province: '',
        city: '',
        category: '',
        nature: '',
        type: '',
        is_985: false,
        is_211: false,
        is_double_first: false,
        address: '',
        longitude: 0,
        latitude: 0,
        admin_code: '',
        affiliation: ''
      })
    } catch (error: unknown) {
      console.error('更新高校失败:', error)
      let errorMessage = '更新高校失败'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      showNotification(`更新高校失败: ${errorMessage}`, 5000)
    }
  }

  // 获取高校名称
  const fetchCollegeName = async (collegeId: number) => {
    // 如果已经获取过，直接返回
    if (collegeNames[collegeId]) {
      return collegeNames[collegeId]
    }

    try {
      const response = await fetch(`/api/colleges/${collegeId}`)
      if (!response.ok) {
        throw new Error('获取高校信息失败')
      }

      const data = await response.json()
      const collegeName = data.college.name
      
      // 更新高校名称缓存
      setCollegeNames(prev => ({
        ...prev,
        [collegeId]: collegeName
      }))
      
      return collegeName
    } catch (error) {
      console.error('获取高校名称失败:', error)
      return '未知高校'
    }
  }

  // 获取用户所有评价
  const fetchUserEvaluations = async () => {
    try {
      const token = localStorage.getItem('jwt')
      if (!token) {
        showNotification('请先登录', 3000)
        return
      }

      const response = await fetch('/api/colleges/evaluations/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('获取评价失败')
      }

      const evaluations = await response.json()
      
      // 为每个评价获取对应的高校名称
      const evaluationsWithNames = await Promise.all(
        (Array.isArray(evaluations) ? evaluations : []).map(async (evaluation) => {
          const collegeName = await fetchCollegeName(evaluation.college_id)
          return {
            ...evaluation,
            college_name: collegeName
          }
        })
      )
      
      setUserEvaluations(evaluationsWithNames)
    } catch (error: unknown) {
      console.error('获取用户评价失败:', error)
      let errorMessage = '获取用户评价失败'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      showNotification(errorMessage, 5000)
    }
  }

  // 删除评价
  const deleteUserEvaluation = async (evaluationId: number) => {
    try {
      const token = localStorage.getItem('jwt')
      if (!token) {
        showNotification('请先登录', 3000)
        return
      }

      const response = await fetch(`/api/colleges/evaluations/${evaluationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || '删除评价失败')
      }

      // 更新本地评价列表
      setUserEvaluations(prev => prev.filter(evaluation => evaluation.evaluation_id !== evaluationId))
      showNotification('评价删除成功', 3000)
    } catch (error: unknown) {
      console.error('删除评价失败:', error)
      let errorMessage = '删除评价失败'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      showNotification(errorMessage, 5000)
    }
  }

  // 开始编辑评价
  const startEditEvaluation = async (evaluation: any) => {
    setEditingEvaluation({
      id: evaluation.evaluation_id,
      data: { ...evaluation }
    })
  }

  // 更新评价字段
  const updateEditingEvaluation = (field: string, value: string) => {
    if (!editingEvaluation) return
    
    setEditingEvaluation({
      ...editingEvaluation,
      data: {
        ...editingEvaluation.data,
        [field]: value
      }
    })
  }

  // 保存编辑的评价
  const saveEditedEvaluation = async () => {
    if (!editingEvaluation) return

    try {
      const token = localStorage.getItem('jwt')
      if (!token) {
        showNotification('请先登录', 3000)
        return
      }

      const response = await fetch(`/api/colleges/evaluations/${editingEvaluation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          college_id: editingEvaluation.data.college_id,
          Dietary_evaluation: editingEvaluation.data.Dietary_evaluation || null,
          Traffic_evaluation: editingEvaluation.data.Traffic_evaluation || null,
          Evaluation: editingEvaluation.data.Evaluation || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || '更新评价失败')
      }

      const updatedEvaluation = await response.json()
      
      // 更新本地评价列表
      setUserEvaluations(prev => 
        prev.map(evaluation => 
          evaluation.evaluation_id === editingEvaluation.id 
            ? { 
                ...evaluation, 
                ...updatedEvaluation,
                college_name: evaluation.college_name // 保留高校名称
              } 
            : evaluation
        )
      )
      
      setEditingEvaluation(null)
      showNotification('评价更新成功', 3000)
    } catch (error: unknown) {
      console.error('更新评价失败:', error)
      let errorMessage = '更新评价失败'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      showNotification(errorMessage, 5000)
    }
  }

  // 取消编辑
  const cancelEditEvaluation = () => {
    setEditingEvaluation(null)
  }

  return (
    <div className="user-interface">
      {/* 通知显示区域 */}
      <div className="notifications">
        {notifications.map((notification, index) => (
          <div key={index} className="notification">
            {notification}
          </div>
        ))}
      </div>
      
      <div className="toolbar">
        <button onClick={() => openWindow('search')}>🔍 搜索</button>
        <button onClick={() => openWindow('chat')}>💬 智能助手</button>
        <button onClick={() => openWindow('analysis')}>📊 数据分析</button>
        <button onClick={() => openWindow('evaluation')}>⭐ 我的评价</button>
        <button onClick={() => openWindow('add-college')}>➕ 添加高校</button>
      </div>

      {/* 渲染所有打开的窗口 */}
      {windows.map(window => (
        <FeatureCard 
          key={window.id}
          id={window.id}
          title={
            window.type === 'search' ? '搜索高校' :
            window.type === 'chat' ? '智能助手' :
            window.type === 'analysis' ? '数据分析' :
            window.type === 'evaluation' ? '评价管理' :
            '添加高校'
          } 
          isOpen={true}
          position={window.position}
          size={window.size}
          onUpdate={(position, size) => updateWindow(window.id, position, size)}
          onClose={() => closeWindow(window.id)}
        >
          {window.type === 'search' && (
            <div className="search-container">
              <div className="search-left-panel">
                <div className="search-form">
                  <div className="form-row">
                    <input placeholder="名称" value={searchParams.name} onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })} />
                    <input placeholder="省份" value={searchParams.province} onChange={(e) => setSearchParams({ ...searchParams, province: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <input placeholder="城市" value={searchParams.city} onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })} />
                    <input placeholder="类别" value={searchParams.category} onChange={(e) => setSearchParams({ ...searchParams, category: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <input placeholder="性质" value={searchParams.nature} onChange={(e) => setSearchParams({ ...searchParams, nature: e.target.value })} />
                    <input placeholder="类型" value={searchParams.type} onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <input placeholder="985" value={searchParams.is_985} onChange={(e) => setSearchParams({ ...searchParams, is_985: e.target.value })} />
                    <input placeholder="211" value={searchParams.is_211} onChange={(e) => setSearchParams({ ...searchParams, is_211: e.target.value })} />
                  </div>
                  <button onClick={searchColleges}>搜索</button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="search-results">
                    <h4>搜索结果 ({searchResults.length})</h4>
                    {searchResults.map((college) => (
                      <div 
                        key={college.college_id} 
                        className={`result-item ${detailCollege && (detailCollege.college_id === college.college_id || detailCollege?.college?.college_id === college.college_id) ? 'selected' : ''}`}
                        onClick={() => loadCollegeDetail(college.college_id)}
                      >
                        <div>
                          <strong>{college.name}</strong>
                          <div className="result-meta">{college.province} · {college.city} · {college.category}</div>
                        </div>
                        <div className="result-actions">
                          <button onClick={(e) => {
                            e.stopPropagation();
                            onSelect(college);
                          }}>选中</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {detailCollege && (
                <div className="college-details">
                  <div className="details-content">
                    <h4>高校详细信息</h4>
                    <div className="basic-info">
                      <h5>基本信息</h5>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>高校名称:</label>
                          <span>{detailCollege?.college?.name || detailCollege?.name}</span>
                        </div>
                        <div className="info-item">
                          <label>省份:</label>
                          <span>{detailCollege?.college?.province || detailCollege?.province}</span>
                        </div>
                        <div className="info-item">
                          <label>城市:</label>
                          <span>{detailCollege?.college?.city || detailCollege?.city}</span>
                        </div>
                        <div className="info-item">
                          <label>类别:</label>
                          <span>{detailCollege?.college?.category || detailCollege?.category}</span>
                        </div>
                        <div className="info-item">
                          <label>性质:</label>
                          <span>{detailCollege?.college?.nature || detailCollege?.nature}</span>
                        </div>
                        <div className="info-item">
                          <label>类型:</label>
                          <span>{detailCollege?.college?.type || detailCollege?.type || '未设置'}</span>
                        </div>
                        <div className="info-item">
                          <label>详细地址:</label>
                          <span>{detailCollege?.college?.address || detailCollege?.address || '未设置'}</span>
                        </div>
                        <div className="info-item">
                          <label>隶属单位:</label>
                          <span>{detailCollege?.college?.affiliation || detailCollege?.affiliation || '未设置'}</span>
                        </div>
                        <div className="info-item">
                          <label>坐标位置:</label>
                          <span>{detailCollege?.college?.longitude || detailCollege?.longitude}, {detailCollege?.college?.latitude || detailCollege?.latitude}</span>
                        </div>
                      </div>
                      
                      <div className="school-attributes">
                        <h6>学校属性</h6>
                        <div className="attributes-grid">
                          <div className="attribute-item">
                            <span className={`badge ${(detailCollege?.college?.is_985 || detailCollege?.is_985) ? 'yes' : 'no'}`}>
                              {(detailCollege?.college?.is_985 || detailCollege?.is_985) ? '985高校' : '非985'}
                            </span>
                          </div>
                          <div className="attribute-item">
                            <span className={`badge ${(detailCollege?.college?.is_211 || detailCollege?.is_211) ? 'yes' : 'no'}`}>
                              {(detailCollege?.college?.is_211 || detailCollege?.is_211) ? '211高校' : '非211'}
                            </span>
                          </div>
                          <div className="attribute-item">
                            <span className={`badge ${(detailCollege?.college?.is_double_first || detailCollege?.is_double_first) ? 'yes' : 'no'}`}>
                              {(detailCollege?.college?.is_double_first || detailCollege?.is_double_first) ? '双一流' : '非双一流'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {Array.isArray(detailCollege?.evaluations) && detailCollege.evaluations.length > 0 && (
                      <div className="evaluations-section">
                        <h5>用户评价 ({detailCollege.evaluations.length})</h5>
                        {detailCollege.evaluations.map((evaluation: any, index: number) => (
                          <div key={evaluation.evaluation_id || index} className="evaluation-item">
                            <div className="evaluation-content">
                              {evaluation.Dietary_evaluation && (
                                <div className="evaluation-field">
                                  <label>饮食评价:</label>
                                  <p>{evaluation.Dietary_evaluation}</p>
                                </div>
                              )}
                              {evaluation.Traffic_evaluation && (
                                <div className="evaluation-field">
                                  <label>交通评价:</label>
                                  <p>{evaluation.Traffic_evaluation}</p>
                                </div>
                              )}
                              {evaluation.Evaluation && (
                                <div className="evaluation-field">
                                  <label>其他评价:</label>
                                  <p>{evaluation.Evaluation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {window.type === 'chat' && (
            <div className="chat-container">
              <div className="messages">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className="message"
                    data-type={msg.startsWith('用户:') ? 'user' : msg.startsWith('助手:') ? 'assistant' : 'system'}
                  >
                    {msg}
                  </div>
                ))}
              </div>
              <div className="input-row">
                <input
                  placeholder="输入问题..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>发送</button>
              </div>
            </div>
          )}

          {window.type === 'analysis' && (
            <div className="analysis-container">
              {!selectedCollege ? (
                <div className="tip">请先在地图上选择一所高校</div>
              ) : (
                <div>
                  <div className="selected-college">
                    <h4>已选高校：{selectedCollege.name}</h4>
                    <p>{selectedCollege.province} · {selectedCollege.city} · {selectedCollege.category}</p>
                  </div>
                  <div className="analysis-buttons">
                    <button onClick={callTraffic}>交通分析</button>
                    <button onClick={callClimate}>气候分析</button>
                  </div>
                </div>
              )}
              
              {/* 显示分析结果卡片 */}
              {analysisResults.length > 0 && (
                <div className="analysis-results">
                  <h4>分析结果</h4>
                  {analysisResults.map(result => (
                    <div key={result.id} className={`analysis-result-card ${result.type}`}>
                      <div className="result-header">
                        <div className="result-title">
                          <span className="result-type">
                            {result.type === 'traffic' ? '交通分析' : '气候分析'}
                          </span>
                          <span className="result-college">{result.college.name}</span>
                        </div>
                        <button 
                          className="remove-result" 
                          onClick={() => removeAnalysisResult(result.id)}
                        >
                          ×
                        </button>
                      </div>
                      <div className="result-content">
                        <pre>{result.content}</pre>
                      </div>
                      <div className="result-footer">
                        {result.timestamp.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {window.type === 'evaluation' && (
            <div className="evaluation-container">
              <h3>我的评价管理</h3>
              <div className="evaluation-actions">
                <button onClick={fetchUserEvaluations}>刷新评价列表</button>
              </div>
              
              {editingEvaluation ? (
                // 编辑模式
                <div className="edit-evaluation-form">
                  <h4>编辑评价</h4>
                  <div className="form-group">
                    <label>高校名称</label>
                    <input 
                      type="text" 
                      value={collegeNames[editingEvaluation.data.college_id] || '加载中...'} 
                      readOnly 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>饮食评价</label>
                    <textarea
                      value={editingEvaluation.data.Dietary_evaluation || ''}
                      onChange={(e) => updateEditingEvaluation('Dietary_evaluation', e.target.value)}
                      rows={3}
                      placeholder="请描述该高校的饮食情况..."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>交通评价</label>
                    <textarea
                      value={editingEvaluation.data.Traffic_evaluation || ''}
                      onChange={(e) => updateEditingEvaluation('Traffic_evaluation', e.target.value)}
                      rows={3}
                      placeholder="请描述该高校的交通便利性..."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>其他评价</label>
                    <textarea
                      value={editingEvaluation.data.Evaluation || ''}
                      onChange={(e) => updateEditingEvaluation('Evaluation', e.target.value)}
                      rows={3}
                      placeholder="请分享其他方面的评价..."
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button onClick={saveEditedEvaluation}>保存</button>
                    <button onClick={cancelEditEvaluation}>取消</button>
                  </div>
                </div>
              ) : selectedCollege ? (
                // 添加评价模式
                <div className="add-evaluation-form">
                  <h4>为 {selectedCollege.name} 添加评价</h4>
                  <EvaluationForm 
                    collegeId={selectedCollege.college_id} 
                    onSuccess={() => {
                      fetchUserEvaluations();
                      setNotifications(prev => [...prev, `成功为 ${selectedCollege.name} 添加评价`]);
                    }} 
                  />
                  <div className="form-actions">
                    <button onClick={() => onSelect(null)}>取消</button>
                  </div>
                </div>
              ) : userEvaluations.length === 0 ? (
                // 空状态
                <div className="tip">
                  您还没有发布任何评价。<br />
                  请先在地图上选择一所高校并添加评价，或点击"添加评价"按钮选择高校。
                </div>
              ) : (
                // 显示评价列表
                <div className="user-evaluations">
                  <h4>我的评价列表 ({userEvaluations.length})</h4>
                  {userEvaluations.map((evaluation) => (
                    <div key={evaluation.evaluation_id} className="evaluation-card">
                      <div className="evaluation-header">
                        <div className="evaluation-college">
                          {evaluation.college_name || `高校ID: ${evaluation.college_id}`}
                        </div>
                        <div className="evaluation-actions">
                          <button 
                            onClick={() => startEditEvaluation(evaluation)}
                            className="edit-btn"
                          >
                            编辑
                          </button>
                          <button 
                            onClick={() => deleteUserEvaluation(evaluation.evaluation_id)}
                            className="delete-btn"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                      
                      <div className="evaluation-content">
                        {evaluation.Dietary_evaluation && (
                          <div className="evaluation-field">
                            <label>饮食评价:</label>
                            <p>{evaluation.Dietary_evaluation}</p>
                          </div>
                        )}
                        {evaluation.Traffic_evaluation && (
                          <div className="evaluation-field">
                            <label>交通评价:</label>
                            <p>{evaluation.Traffic_evaluation}</p>
                          </div>
                        )}
                        {evaluation.Evaluation && (
                          <div className="evaluation-field">
                            <label>其他评价:</label>
                            <p>{evaluation.Evaluation}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="evaluation-footer">
                        评价ID: {evaluation.evaluation_id}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {window.type === 'add-college' && (
            <div className="add-college-form">
              <h3>添加新高校</h3>
              <p>注意：普通用户提交的高校信息需要管理员审核后才能显示</p>
              
              <div className="form-group">
                <label>高校名称 *</label>
                <input
                  type="text"
                  value={newCollegeData.name}
                  onChange={(e) => handleAddCollegeChange('name', e.target.value)}
                  placeholder="请输入高校名称"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>省份 *</label>
                  <input
                    type="text"
                    value={newCollegeData.province}
                    onChange={(e) => handleAddCollegeChange('province', e.target.value)}
                    placeholder="请输入省份"
                  />
                </div>
                
                <div className="form-group">
                  <label>城市 *</label>
                  <input
                    type="text"
                    value={newCollegeData.city}
                    onChange={(e) => handleAddCollegeChange('city', e.target.value)}
                    placeholder="请输入城市"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>类别 *</label>
                  <select
                    value={newCollegeData.category}
                    onChange={(e) => handleAddCollegeChange('category', e.target.value)}
                  >
                    <option value="">请选择类别</option>
                    <option value="综合类">综合类</option>
                    <option value="理工类">理工类</option>
                    <option value="师范类">师范类</option>
                    <option value="医药类">医药类</option>
                    <option value="财经类">财经类</option>
                    <option value="艺术类">艺术类</option>
                    <option value="农林类">农林类</option>
                    <option value="政法类">政法类</option>
                    <option value="语言类">语言类</option>
                    <option value="体育类">体育类</option>
                    <option value="军事类">军事类</option>
                    <option value="民族类">民族类</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>性质 *</label>
                  <select
                    value={newCollegeData.nature}
                    onChange={(e) => handleAddCollegeChange('nature', e.target.value)}
                  >
                    <option value="">请选择性质</option>
                    <option value="公办">公办</option>
                    <option value="民办">民办</option>
                    <option value="中外合办">中外合办</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>类型</label>
                  <select
                    value={newCollegeData.type}
                    onChange={(e) => handleAddCollegeChange('type', e.target.value)}
                  >
                    <option value="">请选择类型</option>
                    <option value="本科">本科</option>
                    <option value="专科">专科</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>隶属单位</label>
                  <input
                    type="text"
                    value={newCollegeData.affiliation}
                    onChange={(e) => handleAddCollegeChange('affiliation', e.target.value)}
                    placeholder="请输入隶属单位"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>详细地址</label>
                <input
                  type="text"
                  value={newCollegeData.address}
                  onChange={(e) => handleAddCollegeChange('address', e.target.value)}
                  placeholder="请输入详细地址"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>经度 *</label>
                  <input
                    type="number"
                    step="any"
                    value={newCollegeData.longitude}
                    onChange={(e) => handleAddCollegeChange('longitude', parseFloat(e.target.value) || 0)}
                    placeholder="请输入经度"
                  />
                </div>
                
                <div className="form-group">
                  <label>纬度 *</label>
                  <input
                    type="number"
                    step="any"
                    value={newCollegeData.latitude}
                    onChange={(e) => handleAddCollegeChange('latitude', parseFloat(e.target.value) || 0)}
                    placeholder="请输入纬度"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>行政区划代码</label>
                <input
                  type="text"
                  value={newCollegeData.admin_code}
                  onChange={(e) => handleAddCollegeChange('admin_code', e.target.value)}
                  placeholder="请输入行政区划代码"
                />
              </div>
              
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newCollegeData.is_985}
                    onChange={(e) => handleAddCollegeChange('is_985', e.target.checked)}
                  />
                  是否985高校
                </label>
                
                <label>
                  <input
                    type="checkbox"
                    checked={newCollegeData.is_211}
                    onChange={(e) => handleAddCollegeChange('is_211', e.target.checked)}
                  />
                  是否211高校
                </label>
                
                <label>
                  <input
                    type="checkbox"
                    checked={newCollegeData.is_double_first}
                    onChange={(e) => handleAddCollegeChange('is_double_first', e.target.checked)}
                  />
                  是否双一流高校
                </label>
              </div>
              
              <div className="form-actions">
                <button onClick={submitNewCollege}>提交</button>
                <button onClick={() => closeWindow(window.id)}>取消</button>
              </div>
            </div>
          )}

          {window.type === 'update-college' && (
            <div className="update-college-form">
              <h3>更新高校信息</h3>
              <p>注意：普通用户提交的高校信息更新需要管理员审核后才能生效</p>
              
              {!selectedCollege ? (
                <div className="tip">请先在地图上选择一所高校</div>
              ) : (
                <>
                  <div className="selected-college">
                    <h4>当前选中高校: {selectedCollege.name}</h4>
                    <p>{selectedCollege.province} · {selectedCollege.city} · {selectedCollege.category}</p>
                  </div>
                  
                  <div className="form-group">
                    <label>高校名称</label>
                    <input
                      type="text"
                      value={updateCollegeData.name}
                      onChange={(e) => handleUpdateCollegeChange('name', e.target.value)}
                      placeholder={`当前: ${selectedCollege.name}`}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>省份</label>
                      <input
                        type="text"
                        value={updateCollegeData.province}
                        onChange={(e) => handleUpdateCollegeChange('province', e.target.value)}
                        placeholder={`当前: ${selectedCollege.province}`}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>城市</label>
                      <input
                        type="text"
                        value={updateCollegeData.city}
                        onChange={(e) => handleUpdateCollegeChange('city', e.target.value)}
                        placeholder={`当前: ${selectedCollege.city}`}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>类别</label>
                      <select
                        value={updateCollegeData.category}
                        onChange={(e) => handleUpdateCollegeChange('category', e.target.value)}
                      >
                        <option value="">请选择类别</option>
                        <option value="综合类">综合类</option>
                        <option value="理工类">理工类</option>
                        <option value="师范类">师范类</option>
                        <option value="医药类">医药类</option>
                        <option value="财经类">财经类</option>
                        <option value="艺术类">艺术类</option>
                        <option value="农林类">农林类</option>
                        <option value="政法类">政法类</option>
                        <option value="语言类">语言类</option>
                        <option value="体育类">体育类</option>
                        <option value="军事类">军事类</option>
                        <option value="民族类">民族类</option>
                        <option value="其他">其他</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>性质</label>
                      <select
                        value={updateCollegeData.nature}
                        onChange={(e) => handleUpdateCollegeChange('nature', e.target.value)}
                      >
                        <option value="">请选择性质</option>
                        <option value="公办">公办</option>
                        <option value="民办">民办</option>
                        <option value="中外合办">中外合办</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>类型</label>
                      <select
                        value={updateCollegeData.type}
                        onChange={(e) => handleUpdateCollegeChange('type', e.target.value)}
                      >
                        <option value="">请选择类型</option>
                        <option value="本科">本科</option>
                        <option value="专科">专科</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>隶属单位</label>
                      <input
                        type="text"
                        value={updateCollegeData.affiliation}
                        onChange={(e) => handleUpdateCollegeChange('affiliation', e.target.value)}
                        placeholder={selectedCollege.affiliation || "无"}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>详细地址</label>
                    <input
                      type="text"
                      value={updateCollegeData.address}
                      onChange={(e) => handleUpdateCollegeChange('address', e.target.value)}
                      placeholder={selectedCollege.address || "无"}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>经度</label>
                      <input
                        type="number"
                        step="any"
                        value={updateCollegeData.longitude}
                        onChange={(e) => handleUpdateCollegeChange('longitude', parseFloat(e.target.value) || 0)}
                        placeholder={`当前: ${selectedCollege.longitude}`}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>纬度</label>
                      <input
                        type="number"
                        step="any"
                        value={updateCollegeData.latitude}
                        onChange={(e) => handleUpdateCollegeChange('latitude', parseFloat(e.target.value) || 0)}
                        placeholder={`当前: ${selectedCollege.latitude}`}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>行政区划代码</label>
                    <input
                      type="text"
                      value={updateCollegeData.admin_code}
                      onChange={(e) => handleUpdateCollegeChange('admin_code', e.target.value)}
                      placeholder={selectedCollege.admin_code?.toString() || "无"}
                    />
                  </div>
                  
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={updateCollegeData.is_985}
                        onChange={(e) => handleUpdateCollegeChange('is_985', e.target.checked)}
                      />
                      是否985高校
                    </label>
                    
                    <label>
                      <input
                        type="checkbox"
                        checked={updateCollegeData.is_211}
                        onChange={(e) => handleUpdateCollegeChange('is_211', e.target.checked)}
                      />
                      是否211高校
                    </label>
                    
                    <label>
                      <input
                        type="checkbox"
                        checked={updateCollegeData.is_double_first}
                        onChange={(e) => handleUpdateCollegeChange('is_double_first', e.target.checked)}
                      />
                      是否双一流高校
                    </label>
                  </div>
                  
                  <div className="form-actions">
                    <button onClick={submitUpdateCollege}>提交更新请求</button>
                    <button onClick={() => closeWindow(window.id)}>取消</button>
                  </div>
                </>
              )}
            </div>
          )}

        </FeatureCard>
      ))}
    </div>
  )
}
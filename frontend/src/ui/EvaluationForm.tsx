import React, { useState } from 'react'

type Props = {
  collegeId: number
  onSuccess: () => void
}

export function EvaluationForm({ collegeId, onSuccess }: Props) {
  const [dietary, setDietary] = useState('')
  const [traffic, setTraffic] = useState('')
  const [evaluation, setEvaluation] = useState('')
  const [loading, setLoading] = useState(false)

  const buildHeaders = () => {
    const token = localStorage.getItem('jwt') || ''
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 获取token
    const token = localStorage.getItem('jwt')
    
    // 检查是否已登录
    if (!token) {
      alert('请先登录')
      return
    }
    
    if (!dietary.trim() && !traffic.trim() && !evaluation.trim()) {
      alert('请至少填写一项评价内容')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/colleges/${collegeId}/evaluations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          Dietary_evaluation: dietary.trim() || null,
          Traffic_evaluation: traffic.trim() || null,
          Evaluation: evaluation.trim() || null
        })
      })

      if (res.ok) {
        const data = await res.json()
        console.log('评价提交成功:', data)
        onSuccess()
        // 显示成功消息
        alert('评价提交成功！')
        // 清空表单
        setDietary('')
        setTraffic('')
        setEvaluation('')
      } else {
        const error = await res.text()
        alert(`提交失败: ${error}`)
      }
    } catch (error) {
      alert(`网络错误: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="evaluation-form">
      <div className="form-group">
        <label>饮食评价</label>
        <textarea
          placeholder="请描述该高校的饮食情况..."
          value={dietary}
          onChange={(e) => setDietary(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="form-group">
        <label>交通评价</label>
        <textarea
          placeholder="请描述该高校的交通便利性..."
          value={traffic}
          onChange={(e) => setTraffic(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="form-group">
        <label>其他评价</label>
        <textarea
          placeholder="请分享其他方面的评价..."
          value={evaluation}
          onChange={(e) => setEvaluation(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? '提交中...' : '提交评价'}
        </button>
      </div>
    </form>
  )
}
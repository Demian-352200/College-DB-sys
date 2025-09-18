import React, { useState, useEffect } from 'react'
import { College } from '../pages/App'
import { FeatureCard } from './FeatureCard'
import { CollegeForm } from './CollegeForm'
import { UserManagement } from './UserManagement'

type Props = {
  selectedCollege: College | null
  onSelect: (college: College | null) => void
  mapDetailCollegeId?: number | null
  onMapDetailClear: () => void
}

type PendingReview = {
  review_id: number
  user_id: number
  status: string
  submit_time: string
  review_comment: string
  review_type: string
  pending_college?: any
  original_college?: any
}

type WindowInfo = {
  id: string
  type: string
  position: { x: number, y: number }
  size: { width: number, height: number }
  // 添加collegeId属性用于编辑高校窗口
  collegeId?: number
}

export function AdminInterface({ selectedCollege, onSelect, mapDetailCollegeId, onMapDetailClear }: Props) {
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const [messages, setMessages] = useState<string[]>([])
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([])
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null)
  const [reviewDetail, setReviewDetail] = useState<any>(null)
  const [reviewId, setReviewId] = useState('')
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected' | ''>('')
  const [reviewComment, setReviewComment] = useState('')
  // 添加窗口状态管理
  const [windows, setWindows] = useState<WindowInfo[]>([
    { id: 'reviews', type: 'reviews', position: { x: 50, y: 50 }, size: { width: 800, height: 600 } },
    { id: 'colleges', type: 'colleges', position: { x: 100, y: 100 }, size: { width: 800, height: 600 } },
    { id: 'users', type: 'users', position: { x: 150, y: 150 }, size: { width: 800, height: 600 } },
    { id: 'data', type: 'data', position: { x: 200, y: 200 }, size: { width: 800, height: 600 } },
    { id: 'system', type: 'system', position: { x: 250, y: 250 }, size: { width: 800, height: 600 } }
  ])

  const buildHeaders = (): HeadersInit => {
    const token = localStorage.getItem('jwt') || ''
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const loadCollegeDetail = async (id: number) => {
    try {
      const res = await fetch(`/api/colleges/${id}`, { headers: buildHeaders() })
      if (res.ok) {
        const data = await res.json()
        setReviewDetail(data)
      } else {
        console.error('获取高校详情失败')
        setReviewDetail(null)
      }
    } catch (error) {
      console.error('获取高校详情出错:', error)
      setReviewDetail(null)
    }
  }

  const getPendingReviews = async () => {
    const res = await fetch('/api/colleges/review/pending', { headers: buildHeaders() })
    const data = await res.json()
    setPendingReviews(Array.isArray(data) ? data : [])
    // 清除之前选择的审核项
    setSelectedReview(null)
    setReviewDetail(null)
  }

  const getReviewDetail = async (reviewId: number) => {
    try {
      const res = await fetch(`/api/colleges/review/${reviewId}`, { headers: buildHeaders() })
      if (res.ok) {
        const data = await res.json()
        setReviewDetail(data)
      } else {
        console.error('获取审核详情失败')
        setReviewDetail(null)
      }
    } catch (error) {
      console.error('获取审核详情出错:', error)
      setReviewDetail(null)
    }
  }

  const handleReviewSelect = (review: PendingReview) => {
    setSelectedReview(review)
    setReviewDetail(null)
    getReviewDetail(review.review_id)
  }

  const doReview = async () => {
    if (!reviewId || !reviewStatus) return
    const qs = new URLSearchParams({ status: reviewStatus, ...(reviewComment ? { comment: reviewComment } : {}) })
    const res = await fetch(`/api/colleges/review/${reviewId}?${qs.toString()}`, {
      method: 'PUT',
      headers: buildHeaders()
    })
    const data = await res.json().catch(() => ({}))
    setMessages((m) => [...m, `审核结果: ${JSON.stringify(data)}`])
    
    // 审核完成后刷新列表
    getPendingReviews()
  }

  const deleteCollege = async (id: number) => {
    const res = await fetch(`/api/colleges/${id}`, { method: 'DELETE', headers: buildHeaders() })
    const data = await res.json().catch(() => ({}))
    setMessages((m) => [...m, `删除高校: ${JSON.stringify(data)}`])
  }

  // 更新窗口位置和大小
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

  // 关闭窗口
  const closeWindow = (id: string) => {
    setActiveCard(null)
  }

  return (
    <div className="admin-interface">
      <div className="toolbar">
        <button onClick={() => setActiveCard('reviews')}>📋 审核管理</button>
        <button onClick={() => setActiveCard('colleges')}>🏫 高校管理</button>
        <button onClick={() => setActiveCard('users')}>👥 用户管理</button>
        <button onClick={() => setActiveCard('data')}>📊 数据管理</button>
        <button onClick={() => setActiveCard('system')}>⚙️ 系统设置</button>
      </div>

      {/* 渲染所有打开的窗口 */}
      {windows.map(window => (
        <FeatureCard 
          key={window.id}
          id={window.id}
          title={
            window.type === 'reviews' ? '审核管理' :
            window.type === 'colleges' ? '高校管理' :
            window.type === 'users' ? '用户管理' :
            window.type === 'data' ? '数据管理' :
            window.type === 'system' ? '系统设置' :
            window.type === 'add-college' ? '新增高校' :
            '编辑高校'
          } 
          isOpen={activeCard === window.type}
          position={window.position}
          size={window.size}
          onUpdate={(position, size) => updateWindow(window.id, position, size)}
          onClose={() => closeWindow(window.id)}
        >
          {window.type === 'reviews' && (
            <div className="review-container">
              <div className="review-actions">
                <button onClick={getPendingReviews}>获取待审核列表</button>
              </div>
              
              <div style={{ display: 'flex', gap: '20px' }}>
                {/* 左侧：待审核列表 */}
                {pendingReviews.length > 0 && (
                  <div className="pending-reviews" style={{ flex: 1 }}>
                    <h4>待审核项目 ({pendingReviews.length})</h4>
                    {pendingReviews.map((review) => (
                      <div 
                        key={review.review_id} 
                        className={`review-item ${selectedReview?.review_id === review.review_id ? 'selected' : ''}`}
                        onClick={() => handleReviewSelect(review)}
                      >
                        <div>
                          <strong>ID: {review.review_id}</strong>
                          <div>类型: {review.review_type}</div>
                          <div>提交时间: {review.submit_time}</div>
                          <div>状态: {review.status}</div>
                        </div>
                        <div className="review-buttons">
                          <button onClick={(e) => {
                            e.stopPropagation()
                            setReviewId(review.review_id.toString())
                            setReviewStatus('approved')
                          }}>通过</button>
                          <button onClick={(e) => {
                            e.stopPropagation()
                            setReviewId(review.review_id.toString())
                            setReviewStatus('rejected')
                          }}>拒绝</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 右侧：审核详情 */}
                {(selectedReview || reviewDetail) && (
                  <div className="review-detail" style={{ flex: 1 }}>
                    <h4>审核详情</h4>
                    {selectedReview && (
                      <div className="review-basic-info">
                        <p><strong>审核ID:</strong> {selectedReview.review_id}</p>
                        <p><strong>类型:</strong> {selectedReview.review_type}</p>
                        <p><strong>提交时间:</strong> {selectedReview.submit_time}</p>
                        <p><strong>提交用户ID:</strong> {selectedReview.user_id}</p>
                      </div>
                    )}
                    
                    {reviewDetail && (
                      <div className="review-college-detail">
                        <h5>高校信息</h5>
                        <div className="detail-content">
                          <p><strong>高校名称:</strong> {reviewDetail.name}</p>
                          <p><strong>省份:</strong> {reviewDetail.province}</p>
                          <p><strong>城市:</strong> {reviewDetail.city}</p>
                          <p><strong>类别:</strong> {reviewDetail.category}</p>
                          <p><strong>性质:</strong> {reviewDetail.nature}</p>
                          <p><strong>类型:</strong> {reviewDetail.type}</p>
                          <p><strong>隶属:</strong> {reviewDetail.affiliation}</p>
                          <p><strong>地址:</strong> {reviewDetail.address}</p>
                          <p><strong>是否985:</strong> {reviewDetail.is_985 ? '是' : '否'}</p>
                          <p><strong>是否211:</strong> {reviewDetail.is_211 ? '是' : '否'}</p>
                          <p><strong>是否双一流:</strong> {reviewDetail.is_double_first ? '是' : '否'}</p>
                          <p><strong>经度:</strong> {reviewDetail.longitude}</p>
                          <p><strong>纬度:</strong> {reviewDetail.latitude}</p>
                          {reviewDetail.shape && (
                            <p><strong>地理信息:</strong> {reviewDetail.shape}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="review-form">
                <h4>审核操作</h4>
                <div className="form-row">
                  <input placeholder="审核ID" value={reviewId} onChange={(e) => setReviewId(e.target.value)} />
                  <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value as any)}>
                    <option value="">选择状态</option>
                    <option value="approved">通过</option>
                    <option value="rejected">拒绝</option>
                  </select>
                </div>
                <textarea placeholder="审核备注" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
                <button onClick={doReview}>提交审核</button>
              </div>
            </div>
          )}

          {/* 添加编辑高校窗口 */}
          {window.type === 'edit-college' && window.collegeId && (
            <div className="college-form-container">
              <h3>编辑高校信息</h3>
              <CollegeForm 
                mode="edit" 
                collegeId={window.collegeId}
                onSuccess={() => {
                  setMessages(prev => [...prev, '高校信息更新成功']);
                  closeWindow(window.id);
                }}
              />
            </div>
          )}

          {/* 添加新增高校窗口 */}
          {window.type === 'add-college' && (
            <div className="college-form-container">
              <h3>新增高校信息</h3>
              <CollegeForm 
                mode="create"
                onSuccess={() => {
                  setMessages(prev => [...prev, '高校信息新增成功']);
                  closeWindow(window.id);
                }}
              />
            </div>
          )}
        
          {window.type === 'colleges' && (
            <div className="college-management">
              <div className="college-actions">
                <button onClick={() => {
                  // 打开新增高校窗口
                  const addWindowId = 'add-college';
                  setWindows(prev => [
                    ...prev.filter(w => w.id !== addWindowId),
                    {
                      id: addWindowId,
                      type: 'add-college',
                      position: { x: 100, y: 100 },
                      size: { width: 800, height: 600 }
                    }
                  ]);
                  setActiveCard('add-college');
                }}>新增高校</button>
              </div>

              {/* 显示选中的高校信息 */}
              {selectedCollege && (
                <div className="selected-college-info">
                  <h4>选中高校: {selectedCollege.name}</h4>
                  <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => {
                        // 打开编辑窗口
                        const editWindowId = `edit-college-${selectedCollege.college_id}`;
                        setWindows(prev => [
                          ...prev.filter(w => w.id !== editWindowId),
                          {
                            id: editWindowId,
                            type: 'edit-college',
                            collegeId: selectedCollege.college_id,
                            position: { x: 100, y: 100 },
                            size: { width: 800, height: 600 }
                          }
                        ]);
                        setActiveCard('edit-college');
                      }}
                      style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      编辑高校
                    </button>
                    <button 
                      onClick={() => deleteCollege(selectedCollege.college_id)}
                      style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      删除高校
                    </button>
                  </div>
                </div>
              )}

              {/* 加载高校表单 */}
              <div className="input-row" style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
                <input 
                  placeholder="高校ID" 
                  value={mapDetailCollegeId || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    // 如果父组件提供了onMapDetailClear，则使用它
                    if (val === '' && onMapDetailClear) {
                      onMapDetailClear();
                    }
                  }}
                  style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
                />
                <button 
                  onClick={() => {
                    if (mapDetailCollegeId) {
                      loadCollegeDetail(mapDetailCollegeId);
                    }
                  }}
                  style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  加载高校
                </button>
              </div>
              
              {reviewDetail && (
                <div className="college-detail">
                  <h4>高校详情</h4>
                  <div className="info-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '10px', 
                    margin: '15px 0' 
                  }}>
                    <div className="info-item" style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ fontWeight: 'bold', minWidth: '60px' }}>名称:</label>
                      <span>{reviewDetail.college?.name || reviewDetail.name}</span>
                    </div>
                    <div className="info-item" style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ fontWeight: 'bold', minWidth: '60px' }}>省份:</label>
                      <span>{reviewDetail.college?.province || reviewDetail.province}</span>
                    </div>
                    <div className="info-item" style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ fontWeight: 'bold', minWidth: '60px' }}>城市:</label>
                      <span>{reviewDetail.college?.city || reviewDetail.city}</span>
                    </div>
                    <div className="info-item" style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ fontWeight: 'bold', minWidth: '60px' }}>类别:</label>
                      <span>{reviewDetail.college?.category || reviewDetail.category}</span>
                    </div>
                    <div className="info-item" style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ fontWeight: 'bold', minWidth: '60px' }}>性质:</label>
                      <span>{reviewDetail.college?.nature || reviewDetail.nature}</span>
                    </div>
                    <div className="info-item" style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ fontWeight: 'bold', minWidth: '60px' }}>类型:</label>
                      <span>{(reviewDetail.college?.type || reviewDetail.type) || 'N/A'}</span>
                    </div>
                    <div className="info-item" style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ fontWeight: 'bold', minWidth: '60px' }}>985:</label>
                      <span>{(reviewDetail.college?.is_985 || reviewDetail.is_985) ? '是' : '否'}</span>
                    </div>
                    <div className="info-item" style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ fontWeight: 'bold', minWidth: '60px' }}>211:</label>
                      <span>{(reviewDetail.college?.is_211 || reviewDetail.is_211) ? '是' : '否'}</span>
                    </div>
                    <div className="info-item" style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ fontWeight: 'bold', minWidth: '60px' }}>双一流:</label>
                      <span>{(reviewDetail.college?.is_double_first || reviewDetail.is_double_first) ? '是' : '否'}</span>
                    </div>
                    <div className="info-item" style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ fontWeight: 'bold', minWidth: '60px' }}>地址:</label>
                      <span>{(reviewDetail.college?.address || reviewDetail.address) || 'N/A'}</span>
                    </div>
                    <div className="info-item" style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ fontWeight: 'bold', minWidth: '60px' }}>经度:</label>
                      <span>{reviewDetail.college?.longitude || reviewDetail.longitude}</span>
                    </div>
                    <div className="info-item" style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ fontWeight: 'bold', minWidth: '60px' }}>纬度:</label>
                      <span>{reviewDetail.college?.latitude || reviewDetail.latitude}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {window.type === 'users' && <UserManagement />}
          
          {window.type === 'data' && (
            <div className="data-management">
              <h4>数据管理功能</h4>
              <p>待实现</p>
            </div>
          )}

          {window.type === 'system' && (
            <div className="system-settings">
              <h4>系统设置</h4>
              <p>待实现</p>
            </div>
          )}
        </FeatureCard>
      ))}
    </div>
  )
}
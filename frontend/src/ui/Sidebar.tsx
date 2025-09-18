import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { College } from '../pages/App'

type Props = {
  selectedCollege: College | null
  onSelect?: (college: College) => void
}

export function Sidebar({ selectedCollege, onSelect }: Props) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const abortRef = useRef<AbortController | null>(null)
  const [traffic, setTraffic] = useState<string | null>(null)
  const [climateResult, setClimateResult] = useState<string | null>(null)

  // Auth
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [userQueryId, setUserQueryId] = useState('')

  // College
  const [searchParams, setSearchParams] = useState({
    name: '', province: '', city: '', category: '', nature: '', type: '', is_985: '', is_211: '', is_double_first: ''
  })
  const [searchOut, setSearchOut] = useState<any[]>([])
  const [detailCollege, setDetailCollege] = useState<any | null>(null)
  const [collegeCreateJson, setCollegeCreateJson] = useState('')
  const [collegeId, setCollegeId] = useState('')
  const [collegeUpdateJson, setCollegeUpdateJson] = useState('')
  const [evaluationId, setEvaluationId] = useState('')
  const [evaluationJson, setEvaluationJson] = useState('')

  // Admin Review
  const [pendingReviews, setPendingReviews] = useState<any[]>([])
  const [reviewId, setReviewId] = useState('')
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected' | ''>('')
  const [reviewComment, setReviewComment] = useState('')

  // AdminDivision / Climate
  const [adminAll, setAdminAll] = useState<any[] | null>(null)
  const [adminCode, setAdminCode] = useState('')
  const [adminOne, setAdminOne] = useState<any | null>(null)
  const [climateAll, setClimateAll] = useState<any[] | null>(null)
  const [climateId, setClimateId] = useState('')
  const [climateOne, setClimateOne] = useState<any | null>(null)
  const [climateCreateJson, setClimateCreateJson] = useState('')

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  const buildHeaders = (base: Record<string, string> = {}): Record<string, string> => {
    const headers: Record<string, string> = { ...base }
    const token = localStorage.getItem('jwt') || ''
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }

  const sendMessage = async () => {
    if (!input.trim()) return
    // 后端以 StreamingResponse(text/event-stream) 形式返回 POST 响应体
    // 这里使用 fetch + ReadableStream 逐块读取
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const token = localStorage.getItem('jwt') || ''
    const resp = await fetch('/api/server', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ Content: input.trim() }),
      signal: controller.signal,
    })
    const reader = resp.body?.getReader()
    if (reader) {
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      ;(async () => {
        try {
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
                if (parsed?.data) setMessages((prev) => [...prev, String(parsed.data)])
              } catch {
                setMessages((prev) => [...prev, line])
              }
            }
          }
        } catch (e) {
          // 被中断或网络错误
        }
      })()
    }
    setInput('')
  }

  const callTraffic = async () => {
    if (!selectedCollege) return
    const token = localStorage.getItem('jwt') || ''
    const res = await fetch(`/api/server/traffic/${selectedCollege.college_id}`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    })
    const data = await res.json().catch(() => ({}))
    setTraffic(JSON.stringify(data, null, 2))
  }

  const callClimate = async () => {
    if (!selectedCollege) return
    const res = await fetch(`/api/server/climate/${selectedCollege.college_id}`, {
      method: 'POST',
      headers: buildHeaders(),
    })
    const data = await res.json().catch(() => ({}))
    setClimateResult(JSON.stringify(data, null, 2))
  }

  // Auth & User
  const doLogin = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    const token = data?.token || data?.access_token || data?.Authorization || ''
    if (token) localStorage.setItem('jwt', token)
    setMessages((m) => [...m, `登录结果: ${JSON.stringify(data)}`])
  }

  const doRegister = async () => {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, province, city, address })
    })
    const data = await res.json()
    setMessages((m) => [...m, `注册结果: ${JSON.stringify(data)}`])
  }

  const getUser = async () => {
    if (!userQueryId) return
    const res = await fetch(`/api/user/${userQueryId}`)
    const data = await res.json()
    setMessages((m) => [...m, `用户(${userQueryId}): ${JSON.stringify(data)}`])
  }

  // College CRUD & search
  const searchColleges = async () => {
    const qs = new URLSearchParams()
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) qs.set(k, String(v))
    })
    const res = await fetch(`/api/colleges/search/?${qs.toString()}`)
    const data = await res.json()
    setSearchOut(Array.isArray(data) ? data : [])
  }

  const loadCollegeDetail = async (id: number) => {
    const res = await fetch(`/api/colleges/${id}`)
    const data = await res.json()
    setDetailCollege(data)
  }

  const createCollege = async () => {
    try {
      const body = JSON.parse(collegeCreateJson)
      const res = await fetch('/api/colleges/', {
        method: 'POST',
        headers: buildHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body)
      })
      const data = await res.json()
      setMessages((m) => [...m, `创建高校: ${JSON.stringify(data)}`])
    } catch (e) {
      setMessages((m) => [...m, `创建高校JSON错误`])
    }
  }

  const updateCollege = async () => {
    if (!collegeId) return
    try {
      const body = JSON.parse(collegeUpdateJson)
      const res = await fetch(`/api/colleges/${collegeId}/`, {
        method: 'PUT',
        headers: buildHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body)
      })
      const data = await res.json()
      setMessages((m) => [...m, `更新高校: ${JSON.stringify(data)}`])
    } catch (e) {
      setMessages((m) => [...m, `更新高校JSON错误`])
    }
  }

  const deleteCollege = async () => {
    if (!collegeId) return
    const res = await fetch(`/api/colleges/${collegeId}`, { method: 'DELETE', headers: buildHeaders() })
    const data = await res.json().catch(() => ({}))
    setMessages((m) => [...m, `删除高校: ${JSON.stringify(data)}`])
  }

  const addEvaluation = async () => {
    if (!collegeId) return
    try {
      const body = JSON.parse(evaluationJson)
      const res = await fetch(`/api/colleges/${collegeId}/evaluations/`, {
        method: 'POST',
        headers: buildHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body)
      })
      const data = await res.json()
      setMessages((m) => [...m, `新增评价: ${JSON.stringify(data)}`])
    } catch (e) {
      setMessages((m) => [...m, `评价JSON错误`])
    }
  }

  const updateEvaluation = async () => {
    if (!evaluationId) return
    try {
      const body = JSON.parse(evaluationJson)
      const res = await fetch(`/api/colleges/evaluations/${evaluationId}`, {
        method: 'PUT',
        headers: buildHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body)
      })
      const data = await res.json()
      setMessages((m) => [...m, `更新评价: ${JSON.stringify(data)}`])
    } catch (e) {
      setMessages((m) => [...m, `评价JSON错误`])
    }
  }

  const deleteEvaluation = async () => {
    if (!evaluationId) return
    const res = await fetch(`/api/colleges/evaluations/${evaluationId}`, { method: 'DELETE', headers: buildHeaders() })
    const data = await res.json().catch(() => ({}))
    setMessages((m) => [...m, `删除评价: ${JSON.stringify(data)}`])
  }

  // Review
  const getPending = async () => {
    const res = await fetch('/api/colleges/review/pending', { headers: buildHeaders() })
    const data = await res.json()
    setPendingReviews(Array.isArray(data) ? data : [])
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
  }

  return (
    <div className="sidebar">
      <h2>智能助手</h2>
      <div className="chat-box">
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className="message">
              {m}
            </div>
          ))}
        </div>
        <div className="input-row">
          <input
            placeholder="你好 或 输入任意问题"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>发送</button>
        </div>
      </div>

      <div className="divider" />

      <h3>交通分析</h3>
      {!selectedCollege ? (
        <div className="tip">在地图上点击一所高校以启用</div>
      ) : (
        <div>
          <div className="selected">已选：{selectedCollege.name}</div>
          <button onClick={callTraffic}>生成路线与分析</button>
          <button onClick={callClimate} style={{ marginLeft: 8 }}>气候差异分析</button>
        </div>
      )}
      {traffic && (
        <pre className="traffic">
{traffic}
        </pre>
      )}
      {climateResult && (
        <pre className="traffic">
{climateResult}
        </pre>
      )}

      <div className="divider" />

      <h3>认证</h3>
      <div className="input-row">
        <input placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input placeholder="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="input-row">
        <input placeholder="省份" value={province} onChange={(e) => setProvince(e.target.value)} />
        <input placeholder="城市" value={city} onChange={(e) => setCity(e.target.value)} />
      </div>
      <input placeholder="地址" value={address} onChange={(e) => setAddress(e.target.value)} />
      <div className="input-row">
        <button onClick={doLogin}>登录</button>
        <button onClick={doRegister}>注册</button>
      </div>
      <div className="input-row">
        <input placeholder="查询用户ID" value={userQueryId} onChange={(e) => setUserQueryId(e.target.value)} />
        <button onClick={getUser}>获取用户</button>
      </div>

      <div className="divider" />

      <h3>高校筛选与详情</h3>
      <div className="input-row">
        <input placeholder="名称" value={searchParams.name} onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })} />
        <input placeholder="省份" value={searchParams.province} onChange={(e) => setSearchParams({ ...searchParams, province: e.target.value })} />
      </div>
      <div className="input-row">
        <input placeholder="城市" value={searchParams.city} onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })} />
        <input placeholder="类别" value={searchParams.category} onChange={(e) => setSearchParams({ ...searchParams, category: e.target.value })} />
      </div>
      <div className="input-row">
        <input placeholder="性质" value={searchParams.nature} onChange={(e) => setSearchParams({ ...searchParams, nature: e.target.value })} />
        <input placeholder="类型" value={searchParams.type} onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })} />
      </div>
      <div className="input-row">
        <input placeholder="is_985(空/true/false)" value={searchParams.is_985} onChange={(e) => setSearchParams({ ...searchParams, is_985: e.target.value })} />
        <input placeholder="is_211" value={searchParams.is_211} onChange={(e) => setSearchParams({ ...searchParams, is_211: e.target.value })} />
      </div>
      <div className="input-row">
        <input placeholder="is_double_first" value={searchParams.is_double_first} onChange={(e) => setSearchParams({ ...searchParams, is_double_first: e.target.value })} />
        <button onClick={searchColleges}>筛选</button>
      </div>
      <div className="messages">
        <div>结果数: {searchOut.length}</div>
        {searchOut.slice(0, 100).map((c: any) => (
          <div key={c.college_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: '#475569' }}>{c.province} · {c.city} · {c.category} · {c.nature}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => onSelect && onSelect(c)}>选中</button>
              <button onClick={() => loadCollegeDetail(c.college_id)}>详情</button>
            </div>
          </div>
        ))}
      </div>

      {detailCollege && (
        <div className="messages" style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>高校详情</div>
          <div>名称：{detailCollege?.college?.name || detailCollege?.name}</div>
          <div>地址：{detailCollege?.college?.address || detailCollege?.address}</div>
          <div>坐标：{detailCollege?.college?.longitude || detailCollege?.longitude}, {detailCollege?.college?.latitude || detailCollege?.latitude}</div>
          {Array.isArray(detailCollege?.evaluations) && (
            <div style={{ marginTop: 6 }}>
              <div style={{ fontWeight: 600 }}>评价：</div>
              {detailCollege.evaluations.map((e: any) => (
                <div key={e.evaluation_id} style={{ fontSize: 12, color: '#334155' }}>
                  {e.Dietary_evaluation || ''} {e.Traffic_evaluation || ''} {e.Evaluation || ''}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="divider" />

      <h3>高校新增/更新/删除</h3>
      <input placeholder="高校ID(用于更新/删除)" value={collegeId} onChange={(e) => setCollegeId(e.target.value)} />
      <div className="messages" style={{ padding: 8 }}>
        <div style={{ fontWeight: 600 }}>新增高校</div>
        <div className="input-row">
          <input placeholder="shape (WKT)" onChange={(e) => setCollegeCreateJson((j) => {
            try { const o = j? JSON.parse(j): {}; o.shape = e.target.value; return JSON.stringify(o) } catch { return j }
          })} />
          <input placeholder="province" onChange={(e) => setCollegeCreateJson((j) => { try { const o = j? JSON.parse(j): {}; o.province = e.target.value; return JSON.stringify(o)} catch { return j } })} />
        </div>
        <div className="input-row">
          <input placeholder="name" onChange={(e) => setCollegeCreateJson((j) => { try { const o = j? JSON.parse(j): {}; o.name = e.target.value; return JSON.stringify(o)} catch { return j } })} />
          <input placeholder="category" onChange={(e) => setCollegeCreateJson((j) => { try { const o = j? JSON.parse(j): {}; o.category = e.target.value; return JSON.stringify(o)} catch { return j } })} />
        </div>
        <div className="input-row">
          <input placeholder="nature" onChange={(e) => setCollegeCreateJson((j) => { try { const o = j? JSON.parse(j): {}; o.nature = e.target.value; return JSON.stringify(o)} catch { return j } })} />
          <input placeholder="type(可空)" onChange={(e) => setCollegeCreateJson((j) => { try { const o = j? JSON.parse(j): {}; o.type = e.target.value; return JSON.stringify(o)} catch { return j } })} />
        </div>
        <div className="input-row">
          <input placeholder="longitude" onChange={(e) => setCollegeCreateJson((j) => { try { const o = j? JSON.parse(j): {}; o.longitude = Number(e.target.value)||0; return JSON.stringify(o)} catch { return j } })} />
          <input placeholder="latitude" onChange={(e) => setCollegeCreateJson((j) => { try { const o = j? JSON.parse(j): {}; o.latitude = Number(e.target.value)||0; return JSON.stringify(o)} catch { return j } })} />
        </div>
        <div className="input-row">
          <input placeholder="city" onChange={(e) => setCollegeCreateJson((j) => { try { const o = j? JSON.parse(j): {}; o.city = e.target.value; return JSON.stringify(o)} catch { return j } })} />
          <input placeholder="address(可空)" onChange={(e) => setCollegeCreateJson((j) => { try { const o = j? JSON.parse(j): {}; o.address = e.target.value; return JSON.stringify(o)} catch { return j } })} />
        </div>
        <div className="input-row">
          <input placeholder="is_985(0/1)" onChange={(e) => setCollegeCreateJson((j) => { try { const o = j? JSON.parse(j): {}; o.is_985 = Number(e.target.value)||0; return JSON.stringify(o)} catch { return j } })} />
          <input placeholder="is_211(0/1)" onChange={(e) => setCollegeCreateJson((j) => { try { const o = j? JSON.parse(j): {}; o.is_211 = Number(e.target.value)||0; return JSON.stringify(o)} catch { return j } })} />
        </div>
        <div className="input-row">
          <input placeholder="is_double_first(0/1)" onChange={(e) => setCollegeCreateJson((j) => { try { const o = j? JSON.parse(j): {}; o.is_double_first = Number(e.target.value)||0; return JSON.stringify(o)} catch { return j } })} />
          <input placeholder="admin_code(可空)" onChange={(e) => setCollegeCreateJson((j) => { try { const o = j? JSON.parse(j): {}; o.admin_code = Number(e.target.value)||undefined; return JSON.stringify(o)} catch { return j } })} />
        </div>
        <div className="input-row">
          <button onClick={createCollege}>新增高校(需权限)</button>
        </div>
      </div>

      <div className="messages" style={{ padding: 8 }}>
        <div style={{ fontWeight: 600 }}>更新高校</div>
        <div className="input-row">
          <input placeholder="name(可选)" onChange={(e) => setCollegeUpdateJson((j) => { try { const o = j? JSON.parse(j): {}; o.name = e.target.value; return JSON.stringify(o)} catch { return j } })} />
          <input placeholder="category(可选)" onChange={(e) => setCollegeUpdateJson((j) => { try { const o = j? JSON.parse(j): {}; o.category = e.target.value; return JSON.stringify(o)} catch { return j } })} />
        </div>
        <div className="input-row">
          <input placeholder="nature(可选)" onChange={(e) => setCollegeUpdateJson((j) => { try { const o = j? JSON.parse(j): {}; o.nature = e.target.value; return JSON.stringify(o)} catch { return j } })} />
          <input placeholder="address(可选)" onChange={(e) => setCollegeUpdateJson((j) => { try { const o = j? JSON.parse(j): {}; o.address = e.target.value; return JSON.stringify(o)} catch { return j } })} />
        </div>
        <div className="input-row">
          <button onClick={updateCollege}>更新高校(需权限)</button>
          <button onClick={deleteCollege}>删除高校(需权限)</button>
        </div>
      </div>

      <div className="divider" />

      <h3>高校评价 增/改/删</h3>
      <div className="input-row">
        <input placeholder="评价ID(用于改/删)" value={evaluationId} onChange={(e) => setEvaluationId(e.target.value)} />
      </div>
      <div className="messages" style={{ padding: 8 }}>
        <div className="input-row">
          <input placeholder="Dietary_evaluation" onChange={(e) => setEvaluationJson((j) => { try { const o = j? JSON.parse(j): {}; o.Dietary_evaluation = e.target.value; return JSON.stringify(o)} catch { return j } })} />
          <input placeholder="Traffic_evaluation" onChange={(e) => setEvaluationJson((j) => { try { const o = j? JSON.parse(j): {}; o.Traffic_evaluation = e.target.value; return JSON.stringify(o)} catch { return j } })} />
        </div>
        <input placeholder="Evaluation" onChange={(e) => setEvaluationJson((j) => { try { const o = j? JSON.parse(j): {}; o.Evaluation = e.target.value; return JSON.stringify(o)} catch { return j } })} />
        <div className="input-row">
          <button onClick={addEvaluation}>新增评价(需权限)</button>
          <button onClick={updateEvaluation}>更新评价(需权限)</button>
          <button onClick={deleteEvaluation}>删除评价(需权限)</button>
        </div>
      </div>

      <div className="divider" />

      <h3>审核(管理员)</h3>
      <div className="input-row">
        <button onClick={getPending}>获取待审核</button>
      </div>
      {pendingReviews?.length > 0 && (
        <div className="messages">待审核数量: {pendingReviews.length}</div>
      )}
      <div className="input-row">
        <input placeholder="review_id" value={reviewId} onChange={(e) => setReviewId(e.target.value)} />
        <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value as any)}>
          <option value="">选择状态</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
        </select>
      </div>
      <input placeholder="备注(可选)" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
      <div className="input-row">
        <button onClick={doReview}>提交审核</button>
      </div>
    </div>
  )
}



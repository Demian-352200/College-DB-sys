import React, { useState, useEffect } from 'react'

type Props = {
  mode: 'create' | 'edit'
  collegeId?: number
  initialData?: any
  onSuccess: () => void
}

export function CollegeForm({ mode, collegeId, initialData, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    province: '',
    city: '',
    category: '',
    nature: '',
    type: '',
    longitude: '',
    latitude: '',
    address: '',
    affiliation: '',
    is_985: 0,
    is_211: 0,
    is_double_first: 0,
    admin_code: ''
  })
  const [originalData, setOriginalData] = useState({}) // 用于存储原始数据
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const data = {
        name: initialData.name || '',
        province: initialData.province || '',
        city: initialData.city || '',
        category: initialData.category || '',
        nature: initialData.nature || '',
        type: initialData.type || '',
        longitude: initialData.longitude?.toString() || '',
        latitude: initialData.latitude?.toString() || '',
        address: initialData.address || '',
        affiliation: initialData.affiliation || '',
        is_985: initialData.is_985 || 0,
        is_211: initialData.is_211 || 0,
        is_double_first: initialData.is_double_first || 0,
        admin_code: initialData.admin_code?.toString() || ''
      };
      setFormData(data);
      setOriginalData(data); // 保存原始数据
    } else if (mode === 'edit' && collegeId) {
      // 如果是编辑模式但没有提供初始数据，则从API获取
      fetchCollegeData(collegeId);
    }
  }, [mode, initialData, collegeId])

  const fetchCollegeData = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/colleges/${id}`);
      if (response.ok) {
        const data = await response.json();
        const collegeData = data.college || data;
        const formDataObj = {
          name: collegeData.name || '',
          province: collegeData.province || '',
          city: collegeData.city || '',
          category: collegeData.category || '',
          nature: collegeData.nature || '',
          type: collegeData.type || '',
          longitude: collegeData.longitude?.toString() || '',
          latitude: collegeData.latitude?.toString() || '',
          address: collegeData.address || '',
          affiliation: collegeData.affiliation || '',
          is_985: collegeData.is_985 || 0,
          is_211: collegeData.is_211 || 0,
          is_double_first: collegeData.is_double_first || 0,
          admin_code: collegeData.admin_code?.toString() || ''
        };
        setFormData(formDataObj);
        setOriginalData(formDataObj); // 保存原始数据
      }
    } catch (error) {
      console.error('获取高校数据失败:', error);
    } finally {
      setLoading(false);
    }
  }

  const buildHeaders = () => {
    const token = localStorage.getItem('jwt') || '';
    return token ? { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    } : {
      'Content-Type': 'application/json'
    };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      let response;
      
      if (mode === 'create') {
        response = await fetch('/api/colleges/', {
          method: 'POST',
          headers: buildHeaders() as HeadersInit,
          body: JSON.stringify({
            ...formData,
            is_985: parseInt(formData.is_985.toString()) || 0,
            is_211: parseInt(formData.is_211.toString()) || 0,
            is_double_first: parseInt(formData.is_double_first.toString()) || 0,
            longitude: parseFloat(formData.longitude) || 0,
            latitude: parseFloat(formData.latitude) || 0,
            admin_code: formData.admin_code ? parseInt(formData.admin_code.toString()) : null
          })
        });
      } else if (mode === 'edit' && collegeId) {
        // 在编辑模式下，只提交有变化的字段
        const changedFields: any = {};
        Object.keys(formData).forEach(key => {
          // 比较当前值和原始值，如果不同则添加到changedFields中
          if (formData[key as keyof typeof formData] !== originalData[key as keyof typeof originalData]) {
            // 处理"保持不变"选项的情况
            if (formData[key as keyof typeof formData] === '') {
              return; // 跳过空值字段
            }
            
            // 对于特定字段进行类型转换
            if (['is_985', 'is_211', 'is_double_first'].includes(key)) {
              changedFields[key] = parseInt(formData[key as keyof typeof formData].toString()) || 0;
            } else if (['longitude', 'latitude'].includes(key)) {
              changedFields[key] = parseFloat(formData[key as keyof typeof formData].toString()) || 0;
            } else if (key === 'admin_code' && formData[key]) {
              changedFields[key] = parseInt(formData[key as keyof typeof formData].toString());
            } else if (formData[key as keyof typeof formData] !== '') {
              changedFields[key] = formData[key as keyof typeof formData];
            }
          }
        });

        response = await fetch(`/api/colleges/${collegeId}/`, {
          method: 'PUT',
          headers: buildHeaders() as HeadersInit,
          body: JSON.stringify(changedFields)
        });
      }

      if (response && response.ok) {
        const data = await response.json();
        console.log(`${mode === 'create' ? '创建' : '更新'}高校成功:`, data);
        onSuccess();
      } else {
        const error = response ? await response.text() : '未知错误';
        alert(`${mode === 'create' ? '创建' : '更新'}失败: ${error}`);
      }
    } catch (error) {
      alert(`网络错误: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="college-form">
      <div className="form-section">
        <h4>基本信息</h4>
        <div className="form-row">
          <div className="form-group">
            <label>高校名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>省份 *</label>
            <input
              type="text"
              value={formData.province}
              onChange={(e) => handleChange('province', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>城市 *</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>类别</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="">保持不变</option>
              <option value="综合类">综合类</option>
              <option value="理工类">理工类</option>
              <option value="师范类">师范类</option>
              <option value="农林类">农林类</option>
              <option value="医药类">医药类</option>
              <option value="财经类">财经类</option>
              <option value="艺术类">艺术类</option>
              <option value="体育类">体育类</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>性质</label>
            <select
              value={formData.nature}
              onChange={(e) => handleChange('nature', e.target.value)}
            >
              <option value="">保持不变</option>
              <option value="公办">公办</option>
              <option value="民办">民办</option>
              <option value="中外合办">中外合办</option>
            </select>
          </div>
          <div className="form-group">
            <label>类型</label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="">保持不变</option>
              <option value="本科">本科</option>
              <option value="专科">专科</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>位置信息</h4>
        <div className="form-row">
          <div className="form-group">
            <label>经度 *</label>
            <input
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => handleChange('longitude', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>纬度 *</label>
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => handleChange('latitude', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>详细地址</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>隶属单位</label>
          <input
            type="text"
            value={formData.affiliation}
            onChange={(e) => handleChange('affiliation', e.target.value)}
          />
        </div>
      </div>

      <div className="form-section">
        <h4>学校属性</h4>
        <div className="form-row">
          <div className="form-group">
            <label>985高校</label>
            <select
              value={formData.is_985}
              onChange={(e) => handleChange('is_985', parseInt(e.target.value))}
            >
              <option value={''}>保持不变</option>
              <option value={1}>是</option>
              <option value={0}>否</option>
            </select>
          </div>
          <div className="form-group">
            <label>211高校</label>
            <select
              value={formData.is_211}
              onChange={(e) => handleChange('is_211', parseInt(e.target.value))}
            >
              <option value={''}>保持不变</option>
              <option value={1}>是</option>
              <option value={0}>否</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>双一流高校</label>
            <select
              value={formData.is_double_first}
              onChange={(e) => handleChange('is_double_first', parseInt(e.target.value))}
            >
              <option value={''}>保持不变</option>
              <option value={1}>是</option>
              <option value={0}>否</option>
            </select>
          </div>
          <div className="form-group">
            <label>行政区划代码</label>
            <input
              type="number"
              value={formData.admin_code}
              onChange={(e) => handleChange('admin_code', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? '处理中...' : (mode === 'create' ? '创建高校' : '更新高校')}
        </button>
      </div>
    </form>
  )
}
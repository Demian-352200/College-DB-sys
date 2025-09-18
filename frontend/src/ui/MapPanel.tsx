import React, { useEffect, useMemo, useState, useRef } from 'react'
import L from 'leaflet'
import { College } from '../pages/App'
import 'leaflet/dist/leaflet.css'

type Props = {
  onSelect: (c: College | null) => void
  selectedCollegeId?: number | null // 添加选中的高校ID属性
  onShowDetail?: (collegeId: number) => void
}

type CollegeOut = {
  college_id: string
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
  admin_code?: string | null
  affiliation?: string
}

// 存储所有高校标记的Map，便于快速查找和更新样式
const collegeMarkersMap = new Map<number, L.Marker>()

// 高校数据缓存
const collegeDataCache = {
  data: null as CollegeOut[] | null,
  timestamp: 0,
  expirationTime: 5 * 60 * 1000, // 5分钟缓存时间
  
  isValid() {
    return this.data && (Date.now() - this.timestamp) < this.expirationTime;
  },
  
  set(data: CollegeOut[]) {
    this.data = data;
    this.timestamp = Date.now();
  },
  
  get(): CollegeOut[] | null {
    return this.isValid() ? this.data : null;
  },
  
  clear() {
    this.data = null;
    this.timestamp = 0;
  }
};

const MapPanel: React.FC<Props> = ({ onSelect, selectedCollegeId: propsSelectedCollegeId, onShowDetail }) => {
  const [map, setMap] = useState<L.Map | null>(null)
  const [collegeLayers, setCollegeLayers] = useState<L.Layer[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const popupRef = useMemo(() => L.popup({ maxWidth: 280 }), [])
  const mapRef = useRef<HTMLDivElement>(null)
  const isMapInitialized = useRef(false)
  const isAddingMarkers = useRef(false)
  const mapInstanceRef = useRef<L.Map | null>(null)

  // 定义普通标记图标
  const collegeMarkerIcon = useMemo(() => 
    L.divIcon({
      className: 'custom-college-marker',
      html: `<div class="marker-dot"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    }), 
  [])

  // 定义选中状态的标记图标
  const selectedCollegeMarkerIcon = useMemo(() =>
    L.divIcon({
      className: 'custom-college-marker selected',
      html: `<div class="marker-dot"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    }),
  [])

  // 更新标记样式以反映选中状态
  const updateMarkerStyles = (selectedId: number | null) => {
    collegeMarkersMap.forEach((marker, id) => {
      if (id === selectedId) {
        // 更新选中状态的标记
        marker.setIcon(selectedCollegeMarkerIcon)
      } else {
        // 恢复普通状态的标记
        marker.setIcon(collegeMarkerIcon)
      }
    })
  }

  // 使用props传递的selectedCollegeId，如果没有则为null
  const finalSelectedCollegeId = propsSelectedCollegeId ?? null;

  // 当selectedCollegeId变化时更新标记样式
  useEffect(() => {
    updateMarkerStyles(finalSelectedCollegeId);
  }, [finalSelectedCollegeId, collegeMarkerIcon, selectedCollegeMarkerIcon])

  useEffect(() => {
    // 检查地图容器是否存在
    if (!mapRef.current) {
      console.error('地图容器未找到')
      return
    }

    // 防止重复初始化
    if (map || isMapInitialized.current) {
      return
    }

    // 初始化地图
    let instance: L.Map
    try {
      instance = L.map(mapRef.current, {
        center: [35.0, 103.0],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
      })
      
      // 添加瓦片图层 - 使用高德地图服务
      const tileLayer = L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        maxZoom: 19,
        minZoom: 4,
        attribution: '&copy; <a href="https://ditu.amap.com/">高德地图</a>',
        tileSize: 256,
        zoomOffset: 0,
        detectRetina: true,
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 2,
        errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        crossOrigin: false, // 设置为false以避免CORS问题
        // 添加子域名以提高加载性能
        subdomains: ['1', '2', '3', '4']
      }).addTo(instance)
      
      // 添加瓦片加载状态监听
      tileLayer.on('loading', () => {
        console.log('地图瓦片加载中...')
        setIsLoading(true)
      })
      
      tileLayer.on('load', () => {
        console.log('地图瓦片加载完成')
        setIsLoading(false)
        // 地图加载完成后加载高校数据
        setTimeout(() => {
          if (mapInstanceRef.current) {
            loadCollegeData(mapInstanceRef.current)
          }
        }, 100)
      })
      
      // 添加瓦片加载错误处理
      tileLayer.on('tileerror', (error) => {
        console.warn('瓦片加载错误:', error)
        // 即使部分瓦片加载失败，也不影响整体地图显示
      })

      // 处理地图加载错误
      instance.on('error', (e) => {
        console.error('地图组件错误:', e)
        setIsLoading(false)
      })
      
      setMap(instance)
      isMapInitialized.current = true
      
      mapInstanceRef.current = instance
    } catch (error) {
      console.error('初始化地图失败:', error)
      setIsLoading(false)
      return
    }
    
    // 清理函数
    return () => {
      if (instance) {
        instance.remove()
        mapInstanceRef.current = null
        setMap(null)
        isMapInitialized.current = false
        isAddingMarkers.current = false
        // 清空标记Map
        collegeMarkersMap.clear()
      }
    }
  }, [])

  // 设置全局函数用于地图弹出框中的查看详情和选中按钮
  useEffect(() => {
    // @ts-ignore
    window.showCollegeDetail = (collegeId: number) => {
      console.log('查看详情按钮被点击，高校ID:', collegeId)
      if (onShowDetail) {
        console.log('调用onShowDetail函数')
        onShowDetail(collegeId)
      } else {
        console.log('onShowDetail函数未定义')
      }
    }
    
    // @ts-ignore
    window.selectCollege = (collegeId: number) => {
      console.log('选中按钮被点击，高校ID:', collegeId)
      // 通过API获取高校详细信息然后选中
      fetch(`/api/colleges/${collegeId}`)
        .then(res => res.json())
        .then(data => {
          const collegeData = data.college || data;
          onSelect({
            college_id: collegeData.college_id,
            name: collegeData.name,
            province: collegeData.province,
            city: collegeData.city,
            category: collegeData.category,
            nature: collegeData.nature,
            type: collegeData.type,
            is_985: collegeData.is_985,
            is_211: collegeData.is_211,
            is_double_first: collegeData.is_double_first,
            address: collegeData.address,
            longitude: collegeData.longitude,
            latitude: collegeData.latitude,
            admin_code: collegeData.admin_code,
            affiliation: collegeData.affiliation || '',
          });
        })
        .catch(error => {
          console.error('获取高校信息失败:', error);
        });
    }

    // 清理函数
    return () => {
      // @ts-ignore
      delete window.showCollegeDetail
      // @ts-ignore
      delete window.selectCollege
    }
  }, [onShowDetail, onSelect])

  // 处理弹出框内的查看详情按钮点击
  useEffect(() => {
    if (!map) return
    
    const handleClick = (e: any) => {
      // 检查 originalEvent 和 target 是否存在
      if (!e.originalEvent || !e.originalEvent.target) {
        return;
      }
      
      const target = e.originalEvent.target as HTMLElement
      if (target.tagName === 'BUTTON' && target.textContent === '查看详情') {
        const collegeIdStr = target.getAttribute('data-college-id')
        if (collegeIdStr && onShowDetail) {
          onShowDetail(parseInt(collegeIdStr))
        }
      }
    }
    
    map.on('popupopen', handleClick)
    
    return () => {
      map.off('popupopen', handleClick)
    }
  }, [map, onShowDetail])

  const loadCollegeData = async (mapInstance: L.Map) => {
    // 如果正在添加标记或地图未初始化，则不执行
    if (isAddingMarkers.current || !isMapInitialized.current) return
    
    try {
      isAddingMarkers.current = true
      console.log('开始获取高校数据...')
      
      // 检查缓存中是否有有效的数据
      const cachedData = collegeDataCache.get();
      let rawData: CollegeOut[];
      
      if (cachedData) {
        console.log('使用缓存的高校数据')
        rawData = cachedData;
      } else {
        console.log('从服务器获取高校数据...')
        const res = await fetch('/api/colleges/')
        console.log('API响应状态:', res.status)
        
        if (!res.ok) {
          const errorText = await res.text()
          console.error('获取高校数据失败:', res.status, res.statusText, errorText)
          setIsLoading(false)
          isAddingMarkers.current = false
          return
        }
        
        rawData = await res.json()
        console.log('成功获取高校数据:', rawData.length, '条记录')
        
        // 将数据存入缓存
        collegeDataCache.set(rawData);
      }
      
      // 清除现有高校图层
      collegeLayers.forEach(layer => {
        if (mapInstance.hasLayer(layer)) {
          mapInstance.removeLayer(layer)
        }
      })
      const newCollegeLayers: L.Layer[] = []
      
      // 清空标记Map
      collegeMarkersMap.clear()
      
      let validCount = 0
      let invalidCount = 0
      
      // 处理高校数据
      rawData.forEach((c) => {
        const { longitude, latitude } = c
        if (isNaN(longitude) || isNaN(latitude)) {
          invalidCount++
          console.log('高校坐标无效:', c.name, longitude, latitude)
          return
        }
        
        // 检查地图是否仍然有效
        if (!mapInstance) return
        
        try {
          // 创建标记 - 使用预定义的共享图标
          const marker = L.marker([latitude, longitude], {
            title: c.name,
            icon: collegeMarkerIcon,
          })
          
          // 将标记添加到Map中便于后续查找
          collegeMarkersMap.set(c.college_id, marker)
          
          // 绑定弹出框
          const popupContent = `
            <div class="college-popup">
              <div class="college-name">${c.name}</div>
              <div class="college-location">${c.province} · ${c.city}</div>
              <div class="college-category">${c.category} · ${c.nature}</div>
              <div class="college-features">
                ${c.is_985 ? '<span class="feature-tag">985</span>' : ''}
                ${c.is_211 ? '<span class="feature-tag">211</span>' : ''}
                ${c.is_double_first ? '<span class="feature-tag">双一流</span>' : ''}
              </div>
              <div class="popup-actions">
                <button onclick="selectCollege(${c.college_id})" class="select-btn">选中</button>
                <button onclick="showCollegeDetail(${c.college_id})" class="detail-btn">查看详情</button>
              </div>
            </div>
          `;
          
          marker.bindPopup(popupContent, {
            className: 'college-popup-container',
            maxWidth: 300,
            closeButton: false, // 隐藏默认关闭按钮
          })
          
          // 添加鼠标悬停事件 - 显示小卡片
          marker.on('mouseover', function (this: L.Marker) {
            if (!(this as any).isPopupOpen()) {
              (this as any).openPopup();
            }
          });
          
          marker.on('mouseout', function (this: L.Marker) {
            // 添加一点延迟，避免鼠标移动过快时卡片闪烁
            setTimeout(() => {
              if (!(this as any).isPopupOpen()) {
                (this as any).closePopup();
              }
            }, 100);
          });

          // 绑定点击事件
          marker.on('click', () => {
            const college: College = {
              college_id: c.college_id,
              name: c.name,
              province: c.province,
              city: c.city,
              category: c.category,
              nature: c.nature,
              type: c.type,
              is_985: c.is_985,
              is_211: c.is_211,
              is_double_first: c.is_double_first,
              address: c.address,
              longitude,
              latitude,
              admin_code: c.admin_code,
              affiliation: c.affiliation || '',
            };
            onSelect(college);
          })

          // 确保地图仍然有效再添加标记
          if (mapInstance && mapInstance.getSize().x > 0) {
            marker.addTo(mapInstance)
            newCollegeLayers.push(marker)
            validCount++
            // 移除这行日志以减少控制台输出
            // console.log('成功创建高校标记:', c.name, latitude, longitude)
          }
        } catch (error) {
          console.error('创建标记时出错:', error, '高校:', c.name)
        }
      })
      
      console.log(`高校数据处理完成: 有效=${validCount}, 无效=${invalidCount}`)
      setCollegeLayers(newCollegeLayers)
      setIsLoading(false)
      isAddingMarkers.current = false
      
      // 更新标记样式以反映初始选中状态
      updateMarkerStyles(finalSelectedCollegeId)
    } catch (error) {
      console.error('加载高校数据时出错:', error)
      setIsLoading(false)
      isAddingMarkers.current = false
      
      // 检查是否是网络错误
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        console.error('网络连接错误，请检查后端服务是否运行正常')
      }
    }
  }

  useEffect(() => {
    if (!map || finalSelectedCollegeId === null) return
    
    // 如果有选中的高校ID，从缓存中获取其位置信息
    if (collegeDataCache.isValid()) {
      const collegeData = collegeDataCache.data?.find(c => c.college_id === finalSelectedCollegeId);
      if (collegeData && !isNaN(collegeData.latitude) && !isNaN(collegeData.longitude)) {
        map.setView([collegeData.latitude, collegeData.longitude], Math.max(map.getZoom(), 8));
      }
    }
  }, [finalSelectedCollegeId, map])

  // 当选中的高校发生变化时，更新标记样式
  useEffect(() => {
    if (!map) return
    
    // 重置所有标记的图标为默认图标
    collegeMarkersMap.forEach((marker, collegeId) => {
      if (marker instanceof L.Marker) {
        marker.setIcon(collegeMarkerIcon)
      }
    })
    
    // 如果有选中的高校，将其标记设置为选中样式
    if (propsSelectedCollegeId && collegeMarkersMap.has(propsSelectedCollegeId)) {
      const selectedMarker = collegeMarkersMap.get(propsSelectedCollegeId)
      if (selectedMarker instanceof L.Marker) {
        selectedMarker.setIcon(selectedCollegeMarkerIcon)
        // 可选：将地图视图移动到选中的标记
        const college = collegeMarkersMap.get(propsSelectedCollegeId)
        if (college) {
          const latLng = (college as L.Marker).getLatLng()
          map.setView(latLng, map.getZoom())
        }
      }
    }
  }, [propsSelectedCollegeId, map])

  return (
    <div className="map-container">
      <div ref={mapRef} id="map" className="map" style={{ width: '100%', height: '100%' }}></div>
      {isLoading && (
        <div className="map-loading">
          地图加载中...
        </div>
      )}
      {/* 高校数据加载状态 */}
      {collegeLayers.length === 0 && !isLoading && (
        <div className="map-loading">
          正在加载高校数据...
        </div>
      )}
    </div>
  )
}

export default MapPanel
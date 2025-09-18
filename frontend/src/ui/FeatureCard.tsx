import React, { useState, useEffect, useRef } from 'react'

type Props = {
  id?: string
  title: string
  isOpen: boolean
  position?: { x: number, y: number }
  size?: { width: number, height: number }
  onUpdate: (position?: { x: number, y: number }, size?: { width: number, height: number }) => void
  onClose: () => void
  children: React.ReactNode
}

export function FeatureCard({ id, title, isOpen, position = { x: 0, y: 0 }, size = { width: 400, height: 300 }, onUpdate, onClose, children }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  // 处理拖动开始
  const handleDragStart = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.resize-handle')) {
      return // 如果点击的是调整大小手柄，则不处理拖动
    }
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  // 处理拖动
  const handleDrag = (e: MouseEvent) => {
    if (!isDragging) return
    
    // 添加边界检查，防止卡片被拖出可视区域
    const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - size.width))
    const newY = Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - size.height))
    
    onUpdate({
      x: newX,
      y: newY
    })
  }

  // 处理拖动结束
  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // 处理调整大小开始
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    })
  }

  // 处理调整大小
  const handleResize = (e: MouseEvent) => {
    if (!isResizing) return
    
    const newWidth = Math.max(300, resizeStart.width + (e.clientX - resizeStart.x))
    const newHeight = Math.max(200, resizeStart.height + (e.clientY - resizeStart.y))
    
    onUpdate(
      undefined,
      {
        width: newWidth,
        height: newHeight
      }
    )
  }

  // 处理调整大小结束
  const handleResizeEnd = () => {
    setIsResizing(false)
  }

  // 添加事件监听器 - 这个useEffect始终会被调用
  useEffect(() => {
    // 只有当组件是打开状态时才添加事件监听器
    if (isOpen) {
      if (isDragging) {
        document.addEventListener('mousemove', handleDrag)
        document.addEventListener('mouseup', handleDragEnd)
      }
      
      if (isResizing) {
        document.addEventListener('mousemove', handleResize)
        document.addEventListener('mouseup', handleResizeEnd)
      }
    }
    
    return () => {
      document.removeEventListener('mousemove', handleDrag)
      document.removeEventListener('mouseup', handleDragEnd)
      document.removeEventListener('mousemove', handleResize)
      document.removeEventListener('mouseup', handleResizeEnd)
    }
  }, [isDragging, isResizing, isOpen]) // 添加isOpen到依赖数组中

  if (!isOpen) return null

  return (
    <div 
      ref={cardRef}
      className="feature-card"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      <div 
        className="feature-header"
        onMouseDown={handleDragStart}
      >
        <h3>{title}</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="feature-content">
        {children}
      </div>
      <div 
        className="resize-handle"
        onMouseDown={handleResizeStart}
      />
    </div>
  )
}
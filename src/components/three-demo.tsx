import { useRef, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type DemoTab = 'conversation' | 'video'

interface Message {
  role: 'user' | 'agent'
  text: string
  time: string
}

interface KGNode {
  id: string
  label: string
  type: 'person' | 'location' | 'event' | 'time' | 'object' | 'emotion'
  color: string
  position: [number, number, number]
  connections: string[]
  timestamp: string
}

// Conversation data that builds up the knowledge graph
const conversationFlow: { message: Message; newNodes: KGNode[] }[] = [
  {
    message: { role: 'user', text: '我今天和 Caroline 去了西湖', time: '09:15' },
    newNodes: [
      { id: 'caroline', label: 'Caroline', type: 'person', color: '#e84132', position: [-1.8, 0.8, 0], connections: [], timestamp: '09:15' },
      { id: 'xihu', label: '西湖', type: 'location', color: '#2d6a6a', position: [0.5, 0.6, 0.3], connections: ['caroline'], timestamp: '09:15' },
      { id: 'today', label: '今天', type: 'time', color: '#d4af37', position: [-0.8, -0.5, 0.2], connections: ['caroline', 'xihu'], timestamp: '09:15' },
    ]
  },
  {
    message: { role: 'agent', text: '听起来很棒！西湖很美，你们玩得开心吗？', time: '09:15' },
    newNodes: []
  },
  {
    message: { role: 'user', text: '是的，我们一起喝了龙井茶，她很开心', time: '09:16' },
    newNodes: [
      { id: 'longjing', label: '龙井茶', type: 'object', color: '#6b8e23', position: [1.5, -0.3, 0.1], connections: ['xihu', 'caroline'], timestamp: '09:16' },
      { id: 'happy', label: '开心', type: 'emotion', color: '#ff6b6b', position: [0, 1.2, -0.2], connections: ['caroline'], timestamp: '09:16' },
    ]
  },
  {
    message: { role: 'user', text: '明天我们打算去灵隐寺', time: '09:17' },
    newNodes: [
      { id: 'tomorrow', label: '明天', type: 'time', color: '#d4af37', position: [-1.5, -0.8, 0.4], connections: ['caroline'], timestamp: '09:17' },
      { id: 'lingyin', label: '灵隐寺', type: 'location', color: '#2d6a6a', position: [1.8, 0.9, -0.3], connections: ['caroline', 'tomorrow'], timestamp: '09:17' },
    ]
  },
]

// Video analysis data
const videoFrames = [
  { time: '00:00', description: '视频开始 - 检测到人脸', entities: ['Person: Caroline', 'Location: 室外'] },
  { time: '00:05', description: '场景识别 - 西湖风景', entities: ['Location: 西湖', 'Object: 游船'] },
  { time: '00:12', description: '动作检测 - 品茶', entities: ['Action: 喝茶', 'Object: 茶杯'] },
  { time: '00:18', description: '情感分析 - 正向情绪', entities: ['Emotion: 开心', 'Expression: 微笑'] },
]

// 3D Floating Node
function FloatingNode({ node, visible, isNew }: { node: KGNode; visible: boolean; isNew: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current && visible) {
      const t = state.clock.elapsedTime
      meshRef.current.position.y = node.position[1] + Math.sin(t * 0.5 + node.position[0]) * 0.05
      meshRef.current.rotation.y = t * 0.1
    }
    if (ringRef.current && visible) {
      ringRef.current.rotation.x = state.clock.elapsedTime * 0.3
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.2
    }
  })

  const nodeSize = node.type === 'person' ? 0.15 : 0.1

  return (
    <group position={node.position}>
      {/* Glow ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[nodeSize * 2, 0.008, 16, 32]} />
        <meshBasicMaterial color={node.color} transparent opacity={visible ? 0.25 : 0} />
      </mesh>
      
      {/* Main node */}
      <mesh 
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={visible ? (hovered ? 1.15 : 1) : 0}
      >
        {node.type === 'person' ? (
          <icosahedronGeometry args={[nodeSize, 1]} />
        ) : (
          <sphereGeometry args={[nodeSize, 24, 24]} />
        )}
        <meshStandardMaterial 
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isNew ? 0.8 : (hovered ? 0.4 : 0.2)}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* New node pulse effect */}
      {isNew && visible && (
        <mesh scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[nodeSize, 16, 16]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.15} />
        </mesh>
      )}
    </group>
  )
}

// Connection lines
function ConnectionLines({ nodes, visibleIds }: { nodes: KGNode[]; visibleIds: Set<string> }) {
  const groupRef = useRef<THREE.Group>(null)
  
  const lineObjects = useMemo(() => {
    const lines: THREE.Line[] = []
    const visibleNodes = nodes.filter(n => visibleIds.has(n.id))
    
    visibleNodes.forEach(node => {
      node.connections.forEach(targetId => {
        if (visibleIds.has(targetId)) {
          const target = nodes.find(n => n.id === targetId)
          if (target) {
            const curve = new THREE.QuadraticBezierCurve3(
              new THREE.Vector3(...node.position),
              new THREE.Vector3(
                (node.position[0] + target.position[0]) / 2,
                (node.position[1] + target.position[1]) / 2 + 0.2,
                (node.position[2] + target.position[2]) / 2
              ),
              new THREE.Vector3(...target.position)
            )
            const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(20))
            const material = new THREE.LineBasicMaterial({ 
              color: '#d4af37', 
              transparent: true, 
              opacity: 0.2 
            })
            lines.push(new THREE.Line(geometry, material))
          }
        }
      })
    })
    return lines
  }, [nodes, visibleIds])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      {lineObjects.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  )
}

// Particle atmosphere
function Particles() {
  const pointsRef = useRef<THREE.Points>(null)
  
  const geometry = useMemo(() => {
    const positions = new Float32Array(60 * 3)
    for (let i = 0; i < 60; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015
    }
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial size={0.012} color="#d4af37" transparent opacity={0.3} sizeAttenuation />
    </points>
  )
}

// Main 3D Scene
function KnowledgeGraphScene({ nodes, visibleIds, newNodeIds }: { 
  nodes: KGNode[]
  visibleIds: Set<string>
  newNodeIds: Set<string>
}) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#fff8f0" />
      <pointLight position={[-5, -3, 2]} intensity={0.25} color="#d4af37" />
      
      <Particles />
      
      <group ref={groupRef}>
        <ConnectionLines nodes={nodes} visibleIds={visibleIds} />
        {nodes.map(node => (
          <FloatingNode 
            key={node.id} 
            node={node} 
            visible={visibleIds.has(node.id)}
            isNew={newNodeIds.has(node.id)}
          />
        ))}
      </group>
    </>
  )
}

export function ThreeDemoSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<DemoTab>('conversation')
  const [messageIndex, setMessageIndex] = useState(0)
  const [videoFrameIndex, setVideoFrameIndex] = useState(0)
  const [allNodes, setAllNodes] = useState<KGNode[]>([])
  const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string>>(new Set())
  const [newNodeIds, setNewNodeIds] = useState<Set<string>>(new Set())

  // Build up conversation and knowledge graph
  useEffect(() => {
    if (activeTab !== 'conversation') return
    
    const interval = setInterval(() => {
      setMessageIndex(prev => {
        const next = (prev + 1) % (conversationFlow.length + 2) // +2 for pause
        if (next === 0) {
          // Reset
          setAllNodes([])
          setVisibleNodeIds(new Set())
          setNewNodeIds(new Set())
        } else if (next <= conversationFlow.length) {
          const flowItem = conversationFlow[next - 1]
          if (flowItem.newNodes.length > 0) {
            const newIds = new Set(flowItem.newNodes.map(n => n.id))
            setNewNodeIds(newIds)
            setAllNodes(prev => [...prev, ...flowItem.newNodes])
            setVisibleNodeIds(prev => new Set([...prev, ...newIds]))
            
            // Clear "new" highlight after a moment
            setTimeout(() => setNewNodeIds(new Set()), 1500)
          }
        }
        return next
      })
    }, 2500)

    return () => clearInterval(interval)
  }, [activeTab])

  // Video frame progression
  useEffect(() => {
    if (activeTab !== 'video') return
    
    const interval = setInterval(() => {
      setVideoFrameIndex(prev => (prev + 1) % videoFrames.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [activeTab])

  const currentMessages = conversationFlow.slice(0, Math.min(messageIndex, conversationFlow.length)).map(f => f.message)
  const currentFrame = videoFrames[videoFrameIndex]

  return (
    <section ref={containerRef} className="workflow-demo" id="demo">
      <div className="workflow-demo-inner">
        {/* Header */}
        <div className="workflow-demo-header">
          <motion.span 
            className="workflow-eyebrow"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Live Demo
          </motion.span>
          <motion.h2 
            className="workflow-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Watch memories form in real-time
          </motion.h2>
          <motion.p 
            className="workflow-subtitle"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            From conversations and videos to a living, temporal knowledge graph
          </motion.p>
        </div>

        {/* Tab selector */}
        <div className="workflow-tabs">
          <button 
            className={`workflow-tab ${activeTab === 'conversation' ? 'active' : ''}`}
            onClick={() => { setActiveTab('conversation'); setMessageIndex(0); }}
          >
            <span className="tab-icon">💬</span>
            <span>Conversation</span>
          </button>
          <button 
            className={`workflow-tab ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => { setActiveTab('video'); setVideoFrameIndex(0); }}
          >
            <span className="tab-icon">🎬</span>
            <span>Video Analysis</span>
          </button>
        </div>

        {/* Main demo area */}
        <div className="workflow-stage">
          {/* Input Panel */}
          <div className="workflow-panel workflow-input">
            <div className="panel-header">
              <div className="panel-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <span className="panel-title">{activeTab === 'conversation' ? 'Chat' : 'Video'}</span>
            </div>
            <div className="panel-content">
              <AnimatePresence mode="wait">
                {activeTab === 'conversation' ? (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="chat-container"
                  >
                    {currentMessages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`chat-message ${msg.role}`}
                      >
                        <div className="message-avatar">
                          {msg.role === 'user' ? '👤' : '🤖'}
                        </div>
                        <div className="message-content">
                          <span className="message-time">{msg.time}</span>
                          <p>{msg.text}</p>
                        </div>
                      </motion.div>
                    ))}
                    {currentMessages.length === 0 && (
                      <div className="chat-placeholder">
                        <span>Conversation will appear here...</span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="video"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="video-container"
                  >
                    <div className="video-player">
                      <div className="video-frame">
                        <div className="frame-overlay">
                          <span className="frame-time">{currentFrame.time}</span>
                          <span className="analyzing-badge">⚡ Analyzing</span>
                        </div>
                        <div className="face-detection-box" />
                      </div>
                      <div className="video-timeline">
                        {videoFrames.map((_, i) => (
                          <div 
                            key={i} 
                            className={`timeline-dot ${i === videoFrameIndex ? 'active' : ''} ${i < videoFrameIndex ? 'passed' : ''}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="video-analysis">
                      <div className="analysis-label">Detected Entities</div>
                      <div className="analysis-entities">
                        {currentFrame.entities.map((entity, i) => (
                          <motion.span 
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="entity-tag"
                          >
                            {entity}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Flow Arrow */}
          <div className="workflow-arrow">
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="arrow-icon"
            >
              →
            </motion.div>
            <span className="arrow-label">Extract</span>
          </div>

          {/* Knowledge Graph Panel */}
          <div className="workflow-panel workflow-graph">
            <div className="panel-header">
              <div className="panel-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <span className="panel-title">Temporal Knowledge Graph</span>
            </div>
            <div className="panel-content graph-content">
              <Canvas camera={{ position: [0, 0, 4], fov: 50 }} dpr={[1, 2]}>
                <KnowledgeGraphScene 
                  nodes={allNodes} 
                  visibleIds={visibleNodeIds}
                  newNodeIds={newNodeIds}
                />
              </Canvas>
              
              {/* Legend */}
              <div className="graph-legend">
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#e84132' }} />
                  <span>Person</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#2d6a6a' }} />
                  <span>Location</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#d4af37' }} />
                  <span>Time</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#ff6b6b' }} />
                  <span>Emotion</span>
                </div>
              </div>

              {/* Timestamp indicator */}
              {visibleNodeIds.size > 0 && (
                <div className="graph-timestamp">
                  <span className="timestamp-label">Last updated</span>
                  <span className="timestamp-value">
                    {[...visibleNodeIds].length > 0 && allNodes.find(n => visibleNodeIds.has(n.id))?.timestamp}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

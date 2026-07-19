import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ChevronDown, MessageSquare, ChevronRight } from 'lucide-react';
import initialRoomData from '../../data/room_1.json';
import { useGeminiChat } from '../../hooks/useGeminiChat';
import Scene from './Scene';
import SidePanel from './SidePanel';
import ChatBox from './ChatBox';
import EditModeToolbar from './EditModeToolbar';

export default function Room1_BaoCap({ onRoomChange, prevRoom }) {
  const [roomData, setRoomData] = useState(initialRoomData);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [transformMode, setTransformMode] = useState('translate');
  const [showUI, setShowUI] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [mascotState, setMascotState] = useState('idle');
  const [contextText, setContextText] = useState('');
  const [exitingToRoom, setExitingToRoom] = useState(null);

  // Tính toán hướng bay ra và bay vào của robot mascot
  const getTransitionDirection = (from, to) => {
    const orders = { room1: 1, room2: 2, room3: 3 };
    if (!from || !to) return null;
    return orders[to] > orders[from] ? 'forward' : 'backward';
  };

  const entryDirection = getTransitionDirection(prevRoom, 'room1');
  const exitDirection = exitingToRoom ? getTransitionDirection('room1', exitingToRoom) : null;

  const handleRoomSwitch = (targetRoom) => {
    setDropdownOpen(false);
    setExitingToRoom(targetRoom);
  };

  // Tải nội dung giáo trình khi ứng dụng khởi chạy
  useEffect(() => {
    Promise.all([
      fetch('/data/summary.txt').then(res => res.text()).catch(() => ""),
      fetch('/data/textbook.txt').then(res => res.text()).catch(() => "")
    ]).then(([summary, textbook]) => {
      setContextText(`${summary}\n\n========================================\n\n${textbook}`);
    }).catch(err => {
      console.error('Không thể tải dữ liệu giáo trình:', err);
    });
  }, []);

  // Quản lý trạng thái Mascot chuyển động cử chỉ
  const chatHook = useGeminiChat({ contextText, setSelectedObjectId, setChatOpen });

  useEffect(() => {
    if (chatHook.loading) {
      setMascotState('thinking');
    } else if (selectedObjectId) {
      setMascotState('pointing');
    } else if (chatOpen) {
      setMascotState('welcome');
    } else {
      setMascotState('idle');
    }
  }, [chatHook.loading, selectedObjectId, chatOpen]);

  // Kích hoạt chế độ chỉnh sửa bí mật nếu URL có query tham số ?edit=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true') setIsEditMode(true);
  }, []);

  // Hàm cập nhật vị trí và kích thước từ TransformControls
  const handleUpdateTransform = (id, newPosition, newScale) => {
    setRoomData(prevData => ({
      ...prevData,
      interactive_objects: prevData.interactive_objects.map(obj =>
        obj.id === id ? { ...obj, position: newPosition, scale: newScale } : obj
      )
    }));
  };

  return (
    <div className={`room-container ${exitingToRoom ? 'room-exit-active' : ''}`} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* Thanh Điều hướng Navbar Kính mờ (Glassmorphism) */}
      <header className="museum-navbar">
        <div className="navbar-brand">
          <span className="brand-logo">✦</span>
          <span className="brand-text">Bảo tàng Số 2.5D</span>
        </div>

        <div className="navbar-menu">
          {/* Dropdown Chọn Phòng */}
          <div className="nav-item-dropdown">
            <button className="nav-btn active" onClick={() => setDropdownOpen(!dropdownOpen)}>
              Phòng Trưng Bày <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'rotated' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item active" onClick={() => { setDropdownOpen(false); setSelectedObjectId(null); }}>
                  Phòng 1: Thời Bao Cấp (Đang xem)
                </button>
                <button className="dropdown-item" onClick={() => handleRoomSwitch('room2')}>
                  Phòng 2: Đại hội VI & Đổi mới
                </button>
                <button className="dropdown-item" onClick={() => handleRoomSwitch('room3')}>
                  Phòng 3: Thành tựu 1991–1995
                </button>
              </div>
            )}
          </div>

          <button className="nav-btn" onClick={() => setModalContent({ title: "Trò Chơi Tương Tác", desc: "Trò chơi giải đố, câu hỏi trắc nghiệm lịch sử nhận quà ảo về chủ đề cuộc sống thời Bao Cấp đang được xây dựng nhằm tăng trải nghiệm cho khách tham quan." })}>
            Trò Chơi
          </button>
          <button className="nav-btn" onClick={() => setModalContent({ title: "Phụ Lục AI & Hướng Dẫn Viên Ảo", desc: "Hệ thống AI Agent tự động phân tích sâu về bối cảnh lịch sử, tương tác hỏi đáp trực tuyến và thuyết minh về các hiện vật cho khách tham quan đang được phát triển kết nối." })}>
            Phụ Lục AI
          </button>
        </div>

        <div className="navbar-right">
          {isEditMode ? (
            <div className="editor-controls" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <div className="transform-mode-selector">
                <button className={`mode-btn ${transformMode === 'translate' ? 'active' : ''}`} onClick={() => setTransformMode('translate')}>Di chuyển</button>
                <button className={`mode-btn ${transformMode === 'scale' ? 'active' : ''}`} onClick={() => setTransformMode('scale')}>Co giãn</button>
              </div>
              <button className="toggle-edit-btn active" onClick={() => { setIsEditMode(false); window.history.pushState({}, '', window.location.pathname); }}>
                Tắt Chỉnh Sửa
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <span className="online-badge">● Trực Tuyến</span>
              <button className="toggle-edit-btn" onClick={() => setIsEditMode(true)}>
                Chỉnh Sửa
              </button>
            </div>
          )}
        </div>
      </header>

      {/* R3F Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => { if (!isEditMode) setSelectedObjectId(null); }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 5, 5]} intensity={1} />

        <Suspense fallback={
          <Html center>
            <div className="canvas-loading-spinner">
              <div className="spinner"></div>
              <p>Đang tải bảo tàng...</p>
            </div>
          </Html>
        }>
          <Scene
            roomData={roomData}
            selectedObjectId={selectedObjectId}
            setSelectedObjectId={setSelectedObjectId}
            isEditMode={isEditMode}
            transformMode={transformMode}
            onUpdateTransform={handleUpdateTransform}
            showUI={showUI}
            setShowUI={setShowUI}
            mascotState={mascotState}
            chatOpen={chatOpen}
            onMascotClick={() => setChatOpen(true)}
            entryDirection={entryDirection}
            exitDirection={exitDirection}
            onExitComplete={() => onRoomChange(exitingToRoom)}
          />
        </Suspense>
      </Canvas>

      {/* UI hướng dẫn chung */}
      {!selectedObjectId && !isEditMode && (
        <div className="hint-text">✦ Click vào vật thể 2D để khám phá chi tiết ✦</div>
      )}

      {/* Edit Mode Toolbar */}
      <EditModeToolbar
        isEditMode={isEditMode}
        transformMode={transformMode}
        setTransformMode={setTransformMode}
        setIsEditMode={setIsEditMode}
        roomData={roomData}
        copied={copied}
        setCopied={setCopied}
      />

      {/* Panel thuyết minh hiện vật */}
      <SidePanel
        selectedObjectId={selectedObjectId}
        showUI={showUI}
        isEditMode={isEditMode}
        roomData={roomData}
        onClose={() => setSelectedObjectId(null)}
      />

      {/* Modal Popup */}
      {modalContent && (
        <div className="museum-modal-overlay" onClick={() => setModalContent(null)}>
          <div className="museum-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{modalContent.title}</h2>
            <p className="modal-desc">{modalContent.desc}</p>
            <button className="modal-close-btn" onClick={() => setModalContent(null)}>Đồng ý</button>
          </div>
        </div>
      )}

      {/* Chatbox AI */}
      <ChatBox
        chatOpen={chatOpen}
        setChatOpen={setChatOpen}
        setSelectedObjectId={setSelectedObjectId}
        {...chatHook}
      />

      {/* Nút mũi tên chuyển sang Phòng 2 */}
      {!isEditMode && !selectedObjectId && (
        <button 
          className="room-nav-arrow right ui-interactive" 
          onClick={() => handleRoomSwitch('room2')}
          title="Sang Phòng 2: Đại hội VI"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}

import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import initialRoomData from '../../data/room_3.json';
import { useGeminiChat } from '../../hooks/useGeminiChat';
import Scene from '../room2/Scene';
import SidePanel from './SidePanel';
import ChatBox from '../room1/ChatBox';
import EditModeToolbar from '../room1/EditModeToolbar';

// Cấu hình zoom camera riêng cho từng hiện vật Room 3
const ZOOM_CONFIG = {
  obj_cuonglinh: { zoomDist: 1.1,  camOffsetX: 0.5  }, // Lệch phải -> Hiện vật sang trái
  obj_bieudo:    { zoomDist: 1.25, camOffsetX: 0.65 }, // Lệch phải -> Hiện vật sang trái
  obj_diacau:    { zoomDist: 1.1,  camOffsetX: -0.55}, // Ở bên phải -> Lệch trái -> Hiện vật sang phải
};

// Danh sách hiện vật cho AI chat Room 3
const ARTIFACT_LINKS = [
  { label: 'Cương lĩnh 1991', id: 'obj_cuonglinh' },
  { label: 'Biểu đồ phát triển', id: 'obj_bieudo' },
  { label: 'Quả địa cầu hội nhập', id: 'obj_diacau' },
];

export default function Room3_ThanhTuu({ onRoomChange, prevRoom }) {
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

  // Hướng bay ra và bay vào của robot mascot
  const getTransitionDirection = (from, to) => {
    const orders = { room1: 1, room2: 2, room3: 3 };
    if (!from || !to) return null;
    return orders[to] > orders[from] ? 'forward' : 'backward';
  };

  const entryDirection = getTransitionDirection(prevRoom, 'room3');
  const exitDirection = exitingToRoom ? getTransitionDirection('room3', exitingToRoom) : null;

  const handleRoomSwitch = (targetRoom) => {
    setDropdownOpen(false);
    setExitingToRoom(targetRoom);
  };

  // Tải nội dung giáo trình
  useEffect(() => {
    Promise.all([
      fetch('/data/summary.txt').then(res => res.text()).catch(() => ""),
      fetch('/data/textbook.txt').then(res => res.text()).catch(() => "")
    ]).then(([summary, textbook]) => {
      setContextText(`${summary}\n\n========================================\n\n${textbook}`);
    });
  }, []);

  const chatHook = useGeminiChat({
    contextText,
    setSelectedObjectId,
    setChatOpen,
    welcomeMessage: 'Xin chào! Tôi là hướng dẫn viên tại đây. Phòng này tái hiện các Thành tựu Đổi Mới xuất sắc giai đoạn 1991–1995, giúp đất nước thoát khỏi khủng hoảng kinh tế và bắt đầu hội nhập thế giới. Bạn muốn tìm hiểu điều gì?',
    artifactLinks: ARTIFACT_LINKS,
  });

  useEffect(() => {
    if (chatHook.loading) setMascotState('thinking');
    else if (selectedObjectId) setMascotState('pointing');
    else if (chatOpen) setMascotState('welcome');
    else setMascotState('idle');
  }, [chatHook.loading, selectedObjectId, chatOpen]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true') setIsEditMode(true);
  }, []);

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

      {/* Navbar */}
      <header className="museum-navbar">
        <div className="navbar-brand">
          <span className="brand-logo">✦</span>
          <span className="brand-text">Bảo tàng Số 2.5D</span>
        </div>

        <div className="navbar-menu">
          <div className="nav-item-dropdown">
            <button className="nav-btn active" onClick={() => setDropdownOpen(!dropdownOpen)}>
              Phòng Trưng Bày <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'rotated' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => handleRoomSwitch('room1')}>
                  Phòng 1: Thời Bao Cấp
                </button>
                <button className="dropdown-item" onClick={() => handleRoomSwitch('room2')}>
                  Phòng 2: Đại hội VI & Đổi mới
                </button>
                <button className="dropdown-item active" onClick={() => setDropdownOpen(false)}>
                  Phòng 3: Thành tựu 1991–1995 (Đang xem)
                </button>
              </div>
            )}
          </div>

          <button className="nav-btn" onClick={() => setModalContent({ title: "Trò Chơi Tương Tác", desc: "Trò chơi giải đố lịch sử đang được xây dựng." })}>
            Trò Chơi
          </button>
          <button className="nav-btn" onClick={() => setModalContent({ title: "Phụ Lục AI & Hướng Dẫn Viên Ảo", desc: "Hệ thống AI hướng dẫn viên đang được phát triển." })}>
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
            zoomConfig={ZOOM_CONFIG}
            entryDirection={entryDirection}
            exitDirection={exitDirection}
            onExitComplete={() => onRoomChange(exitingToRoom)}
          />
        </Suspense>
      </Canvas>

      {!selectedObjectId && !isEditMode && (
        <div className="hint-text">✦ Click vào vật thể 2D để khám phá chi tiết ✦</div>
      )}

      <EditModeToolbar
        isEditMode={isEditMode}
        transformMode={transformMode}
        setTransformMode={setTransformMode}
        setIsEditMode={setIsEditMode}
        roomData={roomData}
        copied={copied}
        setCopied={setCopied}
      />

      <SidePanel
        selectedObjectId={selectedObjectId}
        showUI={showUI}
        isEditMode={isEditMode}
        roomData={roomData}
        onClose={() => setSelectedObjectId(null)}
      />

      {modalContent && (
        <div className="museum-modal-overlay" onClick={() => setModalContent(null)}>
          <div className="museum-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{modalContent.title}</h2>
            <p className="modal-desc">{modalContent.desc}</p>
            <button className="modal-close-btn" onClick={() => setModalContent(null)}>Đồng ý</button>
          </div>
        </div>
      )}

      <ChatBox
        chatOpen={chatOpen}
        setChatOpen={setChatOpen}
        setSelectedObjectId={setSelectedObjectId}
        {...chatHook}
      />

      {/* Nút mũi tên sang trái: Quay lại Phòng 2 */}
      {!isEditMode && !selectedObjectId && (
        <button 
          className="room-nav-arrow left ui-interactive" 
          onClick={() => handleRoomSwitch('room2')}
          title="Quay lại Phòng 2: Đại hội VI"
        >
          <ChevronLeft size={24} />
        </button>
      )}
    </div>
  );
}

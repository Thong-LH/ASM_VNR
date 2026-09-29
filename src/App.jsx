import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ChevronDown, ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';

// Room JSON data
import initialRoom1Data from './data/room_main.json';
import initialRoom2Data from './data/room_2.json';

// Room detailed content data
import detailedContent1 from './data/detailedContent';
import detailedContent2 from './data/detailedContent_room2';

// Shared R3F Scene
import Scene from './components/room2/Scene';

// Shared HTML components
import SidePanel from './components/room1/SidePanel';
import ChatBox from './components/room1/ChatBox';
import EditModeToolbar from './components/room1/EditModeToolbar';
import Intro from './components/Intro';

const ROOMS = {
  room1: {
    id: 'room1',
    name: 'Phòng 1: Tư Tưởng Hồ Chí Minh - Đại Đoàn Kết Toàn Dân Tộc',
    shortName: 'Phòng 1: Đại Đoàn Kết',
    initialData: initialRoom1Data,
    detailedContent: detailedContent1,
    tour: ["obj_tree", "obj_book", "obj_diacau"],
    zoomConfig: {
      obj_tree: { zoomDist: 2.3, camOffsetX: 1.5, camOffsetY: 0.0 },
      obj_book: { zoomDist: 3, camOffsetX: -1.91, camOffsetY: -0.07 },
      obj_diacau: { zoomDist: 1.7, camOffsetX: -1.02, camOffsetY: 0.0 },
    }
  },
  room2: {
    id: 'room2',
    name: 'Phòng 2: Kết Luận',
    shortName: 'Phòng 2: Kết Luận',
    initialData: initialRoom2Data,
    detailedContent: detailedContent2,
    tour: ["obj_roadmap"],
    zoomConfig: {
      obj_roadmap: { zoomDist: 1.8, camOffsetX: 0.0, camOffsetY: 0.0 }
    }
  }
};

export default function App() {
  const [isEntered, setIsEntered] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState('room1');
  const [prevRoom, setPrevRoom] = useState(null);
  const [exitingToRoom, setExitingToRoom] = useState(null);

  const [roomsData, setRoomsData] = useState({
    room1: initialRoom1Data,
    room2: initialRoom2Data
  });

  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [isRoadmapFlipped, setIsRoadmapFlipped] = useState(false);
  const [roadmapStage, setRoadmapStage] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [transformMode, setTransformMode] = useState('translate');
  const [showUI, setShowUI] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [mascotState, setMascotState] = useState('idle');

  const currentRoomConfig = ROOMS[currentRoomId] || ROOMS.room1;
  const currentRoomData = roomsData[currentRoomId] || currentRoomConfig.initialData;
  const currentTour = currentRoomConfig.tour || [];

  // Tính toán hướng bay ra và bay vào của robot mascot
  const getTransitionDirection = (from, to) => {
    const orders = { room1: 1, room2: 2 };
    if (!from || !to) return null;
    return orders[to] > orders[from] ? 'forward' : 'backward';
  };

  const entryDirection = getTransitionDirection(prevRoom, currentRoomId);
  const exitDirection = exitingToRoom ? getTransitionDirection(currentRoomId, exitingToRoom) : null;

  // Đọc query param ?edit=true từ URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true') {
      setIsEditMode(true);
    }
  }, []);

  // Chuyển phòng kích hoạt hiệu ứng bay ra của Mascot trước
  const handleRoomSwitch = (targetRoomId) => {
    if (!ROOMS[targetRoomId] || targetRoomId === currentRoomId || exitingToRoom) {
      setDropdownOpen(false);
      return;
    }
    setDropdownOpen(false);
    setSelectedObjectId(null);
    setIsRoadmapFlipped(false);
    setRoadmapStage(0);
    setShowUI(false);
    setTourActive(false);
    setTourIndex(0);
    setChatOpen(false);
    setMascotState('idle');
    setExitingToRoom(targetRoomId);
  };

  // Hoàn tất hiệu ứng bay ra -> chuyển sang phòng mới và kích hoạt hiệu ứng bay vào
  const handleExitComplete = () => {
    if (exitingToRoom) {
      setPrevRoom(currentRoomId);
      setCurrentRoomId(exitingToRoom);
      setExitingToRoom(null);
      setMascotState('idle');
    }
  };

  // Tour tham quan tự động
  const startTour = () => {
    if (currentTour.length === 0) return;
    setChatOpen(false);
    setTourActive(true);
    setTourIndex(0);
    setSelectedObjectId(currentTour[0]);
    setShowUI(true);
    setMascotState('pointing');
  };

  const exitTour = () => {
    setTourActive(false);
    setSelectedObjectId(null);
    setIsRoadmapFlipped(false);
    setShowUI(false);
    setMascotState('idle');
  };

  const handleNext = () => {
    if (tourIndex < currentTour.length - 1) {
      const nextIndex = tourIndex + 1;
      setTourIndex(nextIndex);
      setSelectedObjectId(currentTour[nextIndex]);
    } else if (currentRoomId === 'room1') {
      // 1. Đóng hiện vật, zoom out camera toàn cảnh và đưa mascot về idle
      exitTour();

      // 2. Chờ camera zoom out ra toàn cảnh để người dùng thấy rõ mascot bay đi sang Phòng 2
      setTimeout(() => {
        handleRoomSwitch('room2');
      }, 700);
    } else {
      exitTour();
    }
  };

  const handlePrev = () => {
    if (tourIndex > 0) {
      const prevIndex = tourIndex - 1;
      setTourIndex(prevIndex);
      setSelectedObjectId(currentTour[prevIndex]);
    }
  };

  const handleUpdateTransform = (id, newPosition, newScale) => {
    setRoomsData(prev => ({
      ...prev,
      [currentRoomId]: {
        ...prev[currentRoomId],
        interactive_objects: prev[currentRoomId].interactive_objects.map(obj =>
          obj.id === id ? { ...obj, position: newPosition, scale: newScale } : obj
        )
      }
    }));
  };

  return (
    <div className={`room-container ${exitingToRoom ? 'room-exit-active' : ''}`} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* Navbar */}
      <header className="museum-navbar">
        <div className="navbar-brand">
          <span className="brand-logo">✦</span>
          <span className="brand-text">HCM202</span>
        </div>

        <div className="navbar-menu">
          {/* Dropdown chọn phòng */}
          <div className="nav-item-dropdown">
            <button className="nav-btn active" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <span>🏛️ {currentRoomConfig.shortName}</span>
              <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'rotated' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                {Object.values(ROOMS).map((room) => (
                  <button
                    key={room.id}
                    className={`dropdown-item ${currentRoomId === room.id ? 'active' : ''}`}
                    onClick={() => handleRoomSwitch(room.id)}
                  >
                    {room.name} {currentRoomId === room.id ? '✦' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="nav-btn tour-start-btn"
            onClick={startTour}
            style={{ background: 'rgba(0, 255, 204, 0.15)', color: '#00ffcc', borderColor: '#00ffcc' }}
          >
            🚶 Tour
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
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        onPointerMissed={() => { if (!isEditMode) { setSelectedObjectId(null); setIsRoadmapFlipped(false); } }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 5, 5]} intensity={1} />

        <Suspense fallback={
          <Html center>
            <div className="canvas-loading-spinner">
              <div className="spinner"></div>
              <p>Đang tải không gian trưng bày...</p>
            </div>
          </Html>
        }>
          <Scene
            roomData={currentRoomData}
            selectedObjectId={selectedObjectId}
            setSelectedObjectId={setSelectedObjectId}
            isEditMode={isEditMode}
            transformMode={transformMode}
            onUpdateTransform={handleUpdateTransform}
            showUI={showUI}
            setShowUI={setShowUI}
            mascotState={mascotState}
            chatOpen={chatOpen}
            onMascotClick={() => { setChatOpen(true); setMascotState('welcome'); }}
            zoomConfig={currentRoomConfig.zoomConfig}
            entryDirection={entryDirection}
            exitDirection={exitDirection}
            onExitComplete={handleExitComplete}
            isRoadmapFlipped={isRoadmapFlipped}
            setIsRoadmapFlipped={setIsRoadmapFlipped}
          />
        </Suspense>
      </Canvas>

      {!selectedObjectId && !isEditMode && (
        <div className="hint-text">✦ Click vào hiện vật trên bàn để khám phá chi tiết ✦</div>
      )}

      {/* Nút mũi tên chuyển phòng 2 bên màn hình */}
      {!selectedObjectId && !isEditMode && !exitingToRoom && (
        <>
          {currentRoomId === 'room2' && (
            <button
              className="room-nav-arrow left ui-interactive"
              onClick={() => handleRoomSwitch('room1')}
              title="Về Phòng 1: Đại Đoàn Kết"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {currentRoomId === 'room1' && (
            <button
              className="room-nav-arrow right ui-interactive"
              onClick={() => handleRoomSwitch('room2')}
              title="Sang Phòng 2: Kết Luận"
            >
              <ChevronRight size={28} />
            </button>
          )}
        </>
      )}


      {/* Thanh Edit Mode Toolbar */}
      <EditModeToolbar
        isEditMode={isEditMode}
        transformMode={transformMode}
        setTransformMode={setTransformMode}
        setIsEditMode={setIsEditMode}
        roomData={currentRoomData}
        copied={copied}
        setCopied={setCopied}
      />

      {/* SidePanel thuyết minh hiện vật */}
      <SidePanel
        selectedObjectId={selectedObjectId}
        showUI={showUI}
        isEditMode={isEditMode}
        roomData={currentRoomData}
        onClose={() => { setSelectedObjectId(null); setRoadmapStage(0); setIsRoadmapFlipped(false); }}
        detailedContent={currentRoomConfig.detailedContent}
        tourActive={tourActive}
        tourIndex={tourIndex}
        tourLength={currentTour.length}
        isLastRoom={currentRoomId === 'room2'}
        onNext={handleNext}
        onPrev={handlePrev}
        onExit={exitTour}
        roadmapStage={roadmapStage}
        setRoadmapStage={setRoadmapStage}
      />

      {/* Modal Card */}
      {modalContent && (
        <div className="museum-modal-overlay" onClick={() => setModalContent(null)}>
          <div className="museum-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{modalContent.title}</h2>
            <p className="modal-desc">{modalContent.desc}</p>
            <button className="modal-close-btn" onClick={() => setModalContent(null)}>Đồng ý</button>
          </div>
        </div>
      )}

      {/* Widget Chatbox Trợ lý ảo Nhóm 7 */}
      <ChatBox
        chatOpen={chatOpen}
        setChatOpen={(open) => {
          setChatOpen(open);
          if (!open) setMascotState('idle');
        }}
        setSelectedObjectId={setSelectedObjectId}
        setMascotState={setMascotState}
        startTour={startTour}
        setShowUI={setShowUI}
      />

      {/* Màn hình Intro mở đầu */}
      {!isEntered && (
        <Intro onEnterMuseum={() => {
          setIsEntered(true);
          setMascotState('welcome');
          setChatOpen(true);
        }} />
      )}
    </div>
  );
}

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Room JSON data
import initialRoomData1 from './data/room_1.json';
import initialRoomData2 from './data/room_2.json';
import initialRoomData3 from './data/room_3.json';

// Room detailed content data
import detailedContent1 from './data/detailedContent';
import detailedContent2 from './data/detailedContent_room2';
import detailedContent3 from './data/detailedContent_room3';

// Chat hook
import { useGeminiChat } from './hooks/useGeminiChat';

// Shared R3F Scene
import Scene from './components/room2/Scene';

// Shared HTML components
import SidePanel from './components/room1/SidePanel';
import ChatBox from './components/room1/ChatBox';
import EditModeToolbar from './components/room1/EditModeToolbar';
import Intro from './components/Intro';

const ROOMS_CONFIG = {
  room1: {
    id: 'room1',
    name: 'Phòng 1: Thời Bao Cấp',
    initialData: initialRoomData1,
    detailedContent: detailedContent1,
    artifactLinks: [
      { label: 'Sổ Gạo', id: 'obj_sogao' },
      { label: 'Đồng hồ áp suất', id: 'obj_bangdien' },
      { label: 'Loa Phường', id: 'obj_loa' },
    ],
    welcomeMessage: 'Xin chào! Tôi là hướng dẫn viên tại đây. Giai đoạn 1975–1986 là thời kỳ Bao Cấp — từ cuộc khủng hoảng kinh tế trầm trọng đến những sức ép cải cách trước Đổi Mới. Bạn muốn tìm hiểu điều gì?',
    zoomConfig: {
      obj_sogao: { zoomDist: 1.25, camOffsetX: 0.65 },
      obj_loa: { zoomDist: 1.35, camOffsetX: -0.6 },
      obj_bangdien: { zoomDist: 1.0, camOffsetX: 0.4 },
    }
  },
  room2: {
    id: 'room2',
    name: 'Phòng 2: Đại hội VI & Đổi mới',
    initialData: initialRoomData2,
    detailedContent: detailedContent2,
    artifactLinks: [
      { label: 'Văn kiện Đại hội VI', id: 'obj_vankien' },
      { label: 'Tờ báo Đổi mới', id: 'obj_tobao' },
      { label: 'Sơ đồ Kinh tế', id: 'obj_sodo' },
      { label: 'Radio phát thanh', id: 'obj_radio' },
      { label: 'Nghị quyết Khoán 10', id: 'obj_nghiquyet10' },
      { label: 'Vô tuyến truyền hình', id: 'obj_tv' },
    ],
    welcomeMessage: 'Xin chào! Tôi là hướng dẫn viên tại đây. Phòng này tái hiện giai đoạn bước ngoặt của Đại hội VI (1986) và các chính sách Đổi Mới đầu tiên. Bạn muốn tìm hiểu điều gì?',
    zoomConfig: {
      obj_vankien: { zoomDist: 1.1, camOffsetX: 0.6 },
      obj_tobao: { zoomDist: 1.15, camOffsetX: 0.65 },
      obj_sodo: { zoomDist: 2, camOffsetX: 1.25 }, // Đồng bộ với thay đổi của bạn để dễ cân chỉnh
      obj_radio: { zoomDist: 1.1, camOffsetX: -0.55 },
      obj_nghiquyet10: { zoomDist: 0.95, camOffsetX: 0.55 },
      obj_tv: { zoomDist: 0.52, camOffsetX: 0, camOffsetY: 0.04 },
    }
  },
  room3: {
    id: 'room3',
    name: 'Phòng 3: Thành tựu 1991–1995',
    initialData: initialRoomData3,
    detailedContent: detailedContent3,
    artifactLinks: [
      { label: 'Cương lĩnh 1991', id: 'obj_cuonglinh' },
      { label: 'Biểu đồ phát triển', id: 'obj_bieudo' },
      { label: 'Quả địa cầu hội nhập', id: 'obj_diacau' },
    ],
    welcomeMessage: 'Xin chào! Tôi là hướng dẫn viên tại đây. Phòng này tái hiện các Thành tựu Đổi Mới xuất sắc giai đoạn 1991–1995, giúp đất nước thoát khỏi khủng hoảng kinh tế và bắt đầu hội nhập thế giới. Bạn muốn tìm hiểu điều gì?',
    zoomConfig: {
      obj_cuonglinh: { zoomDist: 1.1, camOffsetX: 0.5 },
      obj_bieudo: { zoomDist: 1.25, camOffsetX: 0.65 },
      obj_diacau: { zoomDist: 1.1, camOffsetX: -0.55 },
    }
  }
};

export default function App() {
  const [currentRoom, setCurrentRoom] = useState('room2'); // Chuyển Room 2 lên đầu
  const [prevRoom, setPrevRoom] = useState(null);
  const [exitingToRoom, setExitingToRoom] = useState(null);
  const [isEntered, setIsEntered] = useState(true); // Tạm tắt màn hình Intro và bỏ qua Room 1 để vào thẳng Room 2

  // Lưu trữ dữ liệu riêng cho 3 phòng để giữ được các thay đổi chỉnh sửa vị trí (edit mode)
  const [roomData1, setRoomData1] = useState(ROOMS_CONFIG.room1.initialData);
  const [roomData2, setRoomData2] = useState(ROOMS_CONFIG.room2.initialData);
  const [roomData3, setRoomData3] = useState(ROOMS_CONFIG.room3.initialData);

  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [transformMode, setTransformMode] = useState('translate');
  const [showUI, setShowUI] = useState(false);
  const [tvZoomActive, setTvZoomActive] = useState(false);
  const videoRef = useRef(null);
  const [tvButtons, setTvButtons] = useState({
    play: { left: 75.7, top: 55.1, width: 2.9, height: 1.8 },
    stop: { left: 79.4, top: 55.1, width: 2.9, height: 1.8 },
    close: { left: 83.1, top: 55.1, width: 2.9, height: 1.8 }
  });
  const [tvEditorOpen, setTvEditorOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [tvExiting, setTvExiting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [mascotState, setMascotState] = useState('idle');
  const [contextText, setContextText] = useState('');

  // Trích xuất cấu hình phòng hiện tại
  const config = ROOMS_CONFIG[currentRoom];
  const activeRoomData = currentRoom === 'room1' ? roomData1 : currentRoom === 'room2' ? roomData2 : roomData3;

  // Tính toán hướng bay đổi phòng
  const getTransitionDirection = (from, to) => {
    const orders = { room1: 1, room2: 2, room3: 3 };
    if (!from || !to) return null;
    return orders[to] > orders[from] ? 'forward' : 'backward';
  };

  const entryDirection = getTransitionDirection(prevRoom, currentRoom);
  const exitDirection = exitingToRoom ? getTransitionDirection(currentRoom, exitingToRoom) : null;

  const handleRoomSwitch = (targetRoom) => {
    if (targetRoom === currentRoom) return;
    setDropdownOpen(false);
    setSelectedObjectId(null); // Đóng hiện vật cũ
    setExitingToRoom(targetRoom);
  };

  const handleExitComplete = () => {
    setPrevRoom(currentRoom);
    setCurrentRoom(exitingToRoom);
    setExitingToRoom(null);
  };

  // Kích hoạt mờ nền đen ngay khi bắt đầu zoom Tivi
  useEffect(() => {
    if (selectedObjectId === 'obj_tv') {
      const timer = setTimeout(() => {
        setTvZoomActive(true);
      }, 50); // Chờ 50ms để React render div rồi mới kích hoạt transition
      return () => clearTimeout(timer);
    } else {
      setTvZoomActive(false);
      setIsVideoPlaying(false); // Reset trạng thái video khi tắt tivi
    }
  }, [selectedObjectId]);

  // Hàm đóng Tivi kèm hiệu ứng Fade-Out mượt mà
  const closeTV = () => {
    setIsVideoPlaying(false); // 1. Mờ dần video về nền đen
    setTvZoomActive(false);   // 2. Mờ dần lớp nền đen toàn màn hình về trong suốt
    setTvExiting(true);       // 3. Kích hoạt class tv-exit-active để mờ dần tivi
    
    // 4. Chờ 800ms cho các transition CSS hoàn tất rồi mới tắt hẳn trạng thái để camera zoom-out
    setTimeout(() => {
      setSelectedObjectId(null);
      setTvExiting(false);
    }, 800);
  };

  // Tải nội dung giáo trình
  useEffect(() => {
    Promise.all([
      fetch('/data/summary.txt').then(res => res.text()).catch(() => ""),
      fetch('/data/textbook.txt').then(res => res.text()).catch(() => "")
    ]).then(([summary, textbook]) => {
      setContextText(`${summary}\n\n========================================\n\n${textbook}`);
    }).catch(err => {
      console.error('Không thể tải giáo trình:', err);
    });
  }, []);

  // Khởi tạo Chatbox AI
  const chatHook = useGeminiChat({
    contextText,
    setSelectedObjectId,
    setChatOpen,
    welcomeMessage: config.welcomeMessage,
    artifactLinks: config.artifactLinks,
  });

  // Đồng bộ cử chỉ mascot
  useEffect(() => {
    if (chatHook.loading) setMascotState('thinking');
    else if (selectedObjectId) setMascotState('pointing');
    else if (chatOpen) setMascotState('welcome');
    else setMascotState('idle');
  }, [chatHook.loading, selectedObjectId, chatOpen]);

  // Query parameter ?edit=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true') setIsEditMode(true);
  }, []);

  const handleUpdateTransform = (id, newPosition, newScale) => {
    const updateFn = (prevData) => ({
      ...prevData,
      interactive_objects: prevData.interactive_objects.map(obj =>
        obj.id === id ? { ...obj, position: newPosition, scale: newScale } : obj
      )
    });

    if (currentRoom === 'room1') setRoomData1(updateFn);
    else if (currentRoom === 'room2') setRoomData2(updateFn);
    else if (currentRoom === 'room3') setRoomData3(updateFn);
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
                <button className={`dropdown-item ${currentRoom === 'room1' ? 'active' : ''}`} onClick={() => handleRoomSwitch('room1')}>
                  Phòng 1: Thời Bao Cấp
                </button>
                <button className={`dropdown-item ${currentRoom === 'room2' ? 'active' : ''}`} onClick={() => handleRoomSwitch('room2')}>
                  Phòng 2: Đại hội VI & Đổi mới
                </button>
                <button className={`dropdown-item ${currentRoom === 'room3' ? 'active' : ''}`} onClick={() => handleRoomSwitch('room3')}>
                  Phòng 3: Thành tựu 1991–1995
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

      {/* R3F Canvas - Đóng vai trò Global Canvas (Gắn chặt duy nhất 1 lần, không bị re-mount) */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]} /* Giới hạn tỉ lệ pixel thiết bị ở mức 1.5x giúp mượt mà 60 FPS trên màn hình Retina/4K */
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
            roomData={activeRoomData}
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
            zoomConfig={config.zoomConfig}
            entryDirection={entryDirection}
            exitDirection={exitDirection}
            onExitComplete={handleExitComplete}
          />
        </Suspense>
      </Canvas>

      {!selectedObjectId && !isEditMode && (
        <div className="hint-text">✦ Click vào vật thể 2D để khám phá chi tiết ✦</div>
      )}

      {/* Thanh Edit Mode Toolbar */}
      <EditModeToolbar
        isEditMode={isEditMode}
        transformMode={transformMode}
        setTransformMode={setTransformMode}
        setIsEditMode={setIsEditMode}
        roomData={activeRoomData}
        copied={copied}
        setCopied={setCopied}
      />

      <SidePanel
        selectedObjectId={selectedObjectId}
        showUI={showUI && selectedObjectId !== 'obj_tv'}
        isEditMode={isEditMode}
        roomData={activeRoomData}
        onClose={() => setSelectedObjectId(null)}
        detailedContent={config.detailedContent}
      />

      {/* Lớp phủ đen mờ dần khi camera phóng vào Tivi */}
      {(selectedObjectId === 'obj_tv' || tvExiting) && (
        <div className={`tv-zoom-bg-overlay ${tvZoomActive ? 'dimmed' : ''}`} />
      )}

      {/* Màn hình phát video tivi cổ */}
      {(selectedObjectId === 'obj_tv' || tvExiting) && showUI && (
        <div className={`tv-video-overlay ${tvExiting ? 'tv-exit-active' : ''}`}>
          <div className="tv-video-container">
            <img src="/assets/tv.png" className="tv-frame-overlay" alt="TV Frame" />
            <div className="tv-screen-video-box">
              <video 
                ref={videoRef}
                src="/assets/video_lichsu.mp4" 
                controls 
                playsInline
                onEnded={closeTV}
                className={`tv-actual-video ${isVideoPlaying ? 'playing' : ''}`}
              />
            </div>
            
            {/* 3 nút bấm vật lý tương tác trực tiếp */}
            <div 
              className="tv-hotspot-btn play"
              style={{
                left: `${tvButtons.play.left}%`,
                top: `${tvButtons.play.top}%`,
                width: `${tvButtons.play.width}%`,
                height: `${tvButtons.play.height}%`,
              }}
              onClick={() => {
                videoRef.current?.play();
                setIsVideoPlaying(true);
              }}
              title="Phát Video (Play)"
            />
            <div 
              className="tv-hotspot-btn stop"
              style={{
                left: `${tvButtons.stop.left}%`,
                top: `${tvButtons.stop.top}%`,
                width: `${tvButtons.stop.width}%`,
                height: `${tvButtons.stop.height}%`,
              }}
              onClick={() => {
                videoRef.current?.pause();
                setIsVideoPlaying(false);
              }}
              title="Dừng Video (Pause)"
            />
            <div 
              className="tv-hotspot-btn close"
              style={{
                left: `${tvButtons.close.left}%`,
                top: `${tvButtons.close.top}%`,
                width: `${tvButtons.close.width}%`,
                height: `${tvButtons.close.height}%`,
              }}
              onClick={closeTV}
              title="Tắt Tivi (Close)"
            />

          </div>

          <button className="tv-close-btn" onClick={closeTV} title="Đóng (Quay lại)">
            ✕
          </button>
        </div>
      )}

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

      {/* Chatbox AI */}
      <ChatBox
        chatOpen={chatOpen}
        setChatOpen={setChatOpen}
        setSelectedObjectId={setSelectedObjectId}
        {...chatHook}
      />

      {/* Nút mũi tên chuyển sang Trái (Lùi lại phòng trước) */}
      {!isEditMode && !selectedObjectId && currentRoom !== 'room1' && (
        <button
          className="room-nav-arrow left ui-interactive"
          onClick={() => handleRoomSwitch(currentRoom === 'room3' ? 'room2' : 'room1')}
          title="Quay lại phòng trước"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Nút mũi tên chuyển sang Phải (Tiến tới phòng tiếp theo) */}
      {!isEditMode && !selectedObjectId && currentRoom !== 'room3' && (
        <button
          className="room-nav-arrow right ui-interactive"
          onClick={() => handleRoomSwitch(currentRoom === 'room1' ? 'room2' : 'room3')}
          title="Tiến tới phòng tiếp theo"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Màn hình Intro mở đầu (Che phủ Canvas chạy ngầm bên dưới) */}
      {!isEntered && (
        <Intro onEnterMuseum={() => setIsEntered(true)} />
      )}
    </div>
  );
}

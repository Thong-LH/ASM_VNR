import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Room JSON data
import initialRoomData1 from './data/room_1.json';
import initialRoomData2 from './data/room_2.json';
import initialRoomData3 from './data/room_3.json';
import initialRoomData4 from './data/room_4.json';

// Room detailed content data
import detailedContent1 from './data/detailedContent';
import detailedContent2 from './data/detailedContent_room2';
import detailedContent3 from './data/detailedContent_room3';
import detailedContent4 from './data/detailedContent_room4';

// Chat hook
import { useGeminiChat } from './hooks/useGeminiChat';

// Shared R3F Scene
import Scene, { preloadRoomAssets } from './components/room2/Scene';

// Shared HTML components
import SidePanel from './components/room1/SidePanel';
import ChatBox from './components/room1/ChatBox';
import EditModeToolbar from './components/room1/EditModeToolbar';
import Intro from './components/Intro';
import QuizGame from './components/quiz/QuizGame';

const ROOM_TOURS = {
  room1: [
    "obj_sogao",
    "obj_saptien",
    "obj_loa"
  ],
  room2: [
    "obj_vankien",
    "obj_tv",
    "obj_tobao",
    "obj_sodo",
    "obj_nghiquyet10",
    "obj_radio"
  ],
  room3: [
    "obj_cuonglinh",
    "obj_bieudo",
    "obj_diacau",
    "obj_hanhtrinh"
  ],
  room4: [
    "obj_roadmap"
  ]
};

const ROOMS_CONFIG = {
  room1: {
    id: 'room1',
    name: 'Phòng 1: Thời Bao Cấp',
    initialData: initialRoomData1,
    detailedContent: detailedContent1,
    artifactLinks: [
      { label: 'Sổ Gạo', id: 'obj_sogao' },
      { label: 'Sấp tiền lạm phát', id: 'obj_saptien' },
      { label: 'Loa Phường', id: 'obj_loa' },
    ],
    welcomeMessage: 'Xin chào! Tôi là hướng dẫn viên tại đây. Giai đoạn 1975–1986 là thời kỳ Bao Cấp — từ cuộc khủng hoảng kinh tế trầm trọng đến những sức ép cải cách trước Đổi Mới. Bạn muốn tìm hiểu điều gì?',
    zoomConfig: {
      obj_sogao: { zoomDist: 1.25, camOffsetX: 0.65 },
      obj_loa: { zoomDist: 1.35, camOffsetX: -0.6 },
      obj_saptien: { zoomDist: 0.45, camOffsetX: 0.25 },
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
      obj_sodo: { zoomDist: 2, camOffsetX: 1.25 },
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
      { label: 'Hành trình Đổi mới', id: 'obj_hanhtrinh' },
    ],
    welcomeMessage: 'Xin chào! Tôi là hướng dẫn viên tại đây. Phòng này tái hiện các Thành tựu Đổi Mới xuất sắc giai đoạn 1991–1995, giúp đất nước thoát khỏi khủng hoảng kinh tế và bắt đầu hội nhập thế giới. Bạn muốn tìm hiểu điều gì?',
    zoomConfig: {
      obj_cuonglinh: { zoomDist: 1.1, camOffsetX: 0.5 },
      obj_bieudo: { zoomDist: 2, camOffsetX: 1.2 },
      obj_diacau: { zoomDist: 1.35, camOffsetX: -0.5, camOffsetY: 0.0 },
      obj_hanhtrinh: { zoomDist: 1, camOffsetX: 0.0, camOffsetY: 0.42 },
    }
  },
  room4: {
    id: 'room4',
    name: 'Phòng 4: Lộ trình Đổi Mới',
    initialData: initialRoomData4,
    detailedContent: detailedContent4,
    artifactLinks: [
      { label: 'Bản đồ Roadmap 10 năm', id: 'obj_roadmap' },
    ],
    welcomeMessage: 'Xin chào! Chào mừng bạn đến với Phòng 4 - Tổng kết Lộ trình Đổi Mới (1986–1996). Bạn hãy bấm vào tấm bảng Roadmap lơ lửng để trải nghiệm chuyến tham quan quét camera chữ Z!',
    zoomConfig: {
      obj_roadmap: { zoomDist: 1.6, camOffsetX: 0.0, camOffsetY: 0.06 }
    }
  }
};

export default function App() {
  const [currentRoom, setCurrentRoom] = useState('room1');
  const [prevRoom, setPrevRoom] = useState(null);
  const [exitingToRoom, setExitingToRoom] = useState(null);
  const [isEntered, setIsEntered] = useState(false);

  // Lưu trữ dữ liệu riêng cho các phòng
  const [roomData1, setRoomData1] = useState(ROOMS_CONFIG.room1.initialData);
  const [roomData2, setRoomData2] = useState(ROOMS_CONFIG.room2.initialData);
  const [roomData3, setRoomData3] = useState(ROOMS_CONFIG.room3.initialData);
  const [roomData4, setRoomData4] = useState(ROOMS_CONFIG.room4.initialData);

  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [roadmapStage, setRoadmapStage] = useState(0); // Chặng Z-Pattern của Roadmap (0: Chưa chọn, 1->4: 4 chặng)
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
  const [tourActive, setTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [pendingTourObject, setPendingTourObject] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [mascotState, setMascotState] = useState('idle');
  const [contextText, setContextText] = useState('');
  const [quizOpen, setQuizOpen] = useState(false);


  const [userZoomOffset, setUserZoomOffset] = useState(0); // Độ lệch Zoom tự do do người dùng cuộn chuột hoặc bấm nút Zoom
  const [userPanOffset, setUserPanOffset] = useState({ x: 0, y: 0 }); // Độ lệch Kéo thả chuột (Mouse Drag Pan)

  // Reset roadmapStage, userZoomOffset & userPanOffset khi hủy chọn hiện vật / đổi chặng
  useEffect(() => {
    if (!selectedObjectId) setRoadmapStage(0);
    setUserZoomOffset(0);
    setUserPanOffset({ x: 0, y: 0 });
  }, [selectedObjectId, roadmapStage]);

  // Hỗ trợ cuộn bánh xe chuột (Mouse Wheel) để Zoom tự do khi xem hiện vật / Roadmap - CHỈ áp dụng ở phòng 4
  useEffect(() => {
    if (!selectedObjectId || isEditMode || currentRoom !== 'room4') return;
    const handleWheel = (e) => {
      const delta = e.deltaY > 0 ? 0.08 : -0.08;
      setUserZoomOffset(prev => Math.min(0.8, Math.max(-0.5, prev + delta)));
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [selectedObjectId, isEditMode, currentRoom]);

  // Hỗ trợ kéo thả chuột (Mouse Drag Pan) - CHỈ kích hoạt tại Phòng 4 (Roadmap)
  useEffect(() => {
    if (!selectedObjectId || isEditMode || currentRoom !== 'room4') return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const handlePointerDown = (e) => {
      // Chỉ kéo thả khi nhấp chuột trên khu vực canvas
      if (e.button !== 0) return;
      // Tránh ăn sự kiện khi nhấp vào các nút UI
      if (e.target.closest('.ui-interactive') || e.target.closest('.roadmap-mini-bar') || e.target.closest('.museum-header')) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      document.body.style.cursor = 'grabbing';
    };

    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = (e.clientX - startX) * 0.0012;
      const deltaY = (e.clientY - startY) * 0.0012;
      startX = e.clientX;
      startY = e.clientY;

      setUserPanOffset(prev => ({
        x: Math.min(0.4, Math.max(-0.4, prev.x - deltaX)),
        y: Math.min(0.3, Math.max(-0.3, prev.y + deltaY))
      }));
    };

    const handlePointerUp = () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.cursor = 'auto';
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [selectedObjectId, isEditMode, currentRoom]);

  // Trích xuất cấu hình phòng hiện tại
  const config = ROOMS_CONFIG[currentRoom];
  const activeRoomData = currentRoom === 'room1' ? roomData1 : currentRoom === 'room2' ? roomData2 : currentRoom === 'room3' ? roomData3 : roomData4;

  // Tính toán hướng bay đổi phòng
  const getTransitionDirection = (from, to) => {
    const orders = { room1: 1, room2: 2, room3: 3, room4: 4 };
    if (!from && to) return 'forward'; // Vào phòng đầu tiên từ Intro -> bay vào 'forward'
    if (!from || !to) return null;
    return orders[to] > orders[from] ? 'forward' : 'backward';
  };

  const entryDirection = getTransitionDirection(prevRoom, currentRoom);
  const exitDirection = exitingToRoom ? getTransitionDirection(currentRoom, exitingToRoom) : null;

  const handleRoomSwitch = (targetRoom) => {
    if (targetRoom === currentRoom) return;
    
    // Tải trước tài nguyên của phòng đích ngay khi mascot bắt đầu bay
    preloadRoomAssets(targetRoom);
    
    setDropdownOpen(false);
    setSelectedObjectId(null); // Đóng hiện vật cũ
    setRoadmapStage(0);
    setTourActive(false); // Reset tour mode khi đổi phòng - Mỗi phòng là 1 tour độc lập
    setTourIndex(0);
    setPendingTourObject(null);
    setExitingToRoom(targetRoom);
  };

  const handleExitComplete = () => {
    setPrevRoom(currentRoom);
    setCurrentRoom(exitingToRoom);
    setExitingToRoom(null);
    setMascotState('welcome');
  };

  // Khởi tạo Gemini Chat Hook
  const chatHook = useGeminiChat({
    activeRoomId: currentRoom,
    activeRoomData: activeRoomData,
    detailedContent: config.detailedContent,
    welcomeMessage: config.welcomeMessage,
    onMascotStateChange: setMascotState
  });

  // Chuyển câu hỏi ngữ cảnh về cho Chatbox khi chọn hiện vật
  useEffect(() => {
    if (selectedObjectId) {
      setMascotState('idle'); // Trả mascotState về idle sau tương tác đầu tiên để kết thúc sẽ về idle
      const currentObj = activeRoomData.interactive_objects.find(o => o.id === selectedObjectId);
      if (currentObj) {
        const fullContent = config.detailedContent[selectedObjectId];
        const text = fullContent
          ? `${fullContent.title}: ${fullContent.paragraphs.join(' ')}`
          : `${currentObj.content.title}: ${currentObj.content.desc}`;
        setContextText(text);
      }
    }
  }, [selectedObjectId, activeRoomData, config.detailedContent]);

  const closeTV = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsVideoPlaying(false);
    setTvZoomActive(false);
    setTvExiting(true);
    setTimeout(() => {
      setSelectedObjectId(null);
      setTvExiting(false);
    }, 400);
  };

  // Xử lý khi video TV kết thúc: nếu đang trong tour thì nhảy sang vật thể kế tiếp, nếu không thì đóng TV
  const handleTVVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsVideoPlaying(false);
    if (tourActive) {
      handleNext();
    } else {
      closeTV();
    }
  };

  // --- HỆ THỐNG DẪN TOUR TỰ ĐỘNG ---
  const startTour = () => {
    setDropdownOpen(false);
    const firstRoomTour = ROOM_TOURS[currentRoom];
    if (firstRoomTour && firstRoomTour.length > 0) {
      setTourActive(true);
      setTourIndex(0);
      setSelectedObjectId(firstRoomTour[0]);
    }
  };

  const exitTour = () => {
    setTourActive(false);
    setTourIndex(0);
    setSelectedObjectId(null);
    setRoadmapStage(0);
  };

  const handleNext = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }

    const tourList = ROOM_TOURS[currentRoom];
    if (!tourList) return;

    if (tourIndex < tourList.length - 1) {
      const nextIndex = tourIndex + 1;
      setTourIndex(nextIndex);
      setSelectedObjectId(tourList[nextIndex]);
    } else {
      // 1. Kết thúc tour phòng hiện tại & bay về trạng thái idle tổng quan của phòng
      exitTour();

      // 2. Tự động chuyển sang phòng tiếp theo (nếu chưa phải phòng cuối) sau 1.2s
      const roomOrder = ['room1', 'room2', 'room3', 'room4'];
      const currentRoomIdx = roomOrder.indexOf(currentRoom);
      if (currentRoomIdx < roomOrder.length - 1) {
        const nextRoom = roomOrder[currentRoomIdx + 1];
        setTimeout(() => {
          handleRoomSwitch(nextRoom);
        }, 1200);
      }
    }
  };

  const handlePrev = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }

    const tourList = ROOM_TOURS[currentRoom];
    if (!tourList) return;

    if (tourIndex > 0) {
      const prevIndex = tourIndex - 1;
      setTourIndex(prevIndex);
      setSelectedObjectId(tourList[prevIndex]);
    }
  };

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
    else if (currentRoom === 'room4') setRoomData4(updateFn);
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
                <button className={`dropdown-item ${currentRoom === 'room4' ? 'active' : ''}`} onClick={() => handleRoomSwitch('room4')}>
                  Phòng 4: Lộ trình Đổi Mới
                </button>
              </div>
            )}
          </div>

          <button className="nav-btn" onClick={() => { setDropdownOpen(false); setQuizOpen(true); }}>
            Trò Chơi
          </button>
          <button className="nav-btn" onClick={() => setModalContent({ title: "Phụ Lục AI & Hướng Dẫn Viên Ảo", desc: "Hệ thống AI hướng dẫn viên đang được phát triển." })}>
            Phụ Lục AI
          </button>
          <button className="nav-btn tour-start-btn" onClick={startTour} style={{ background: 'rgba(0, 255, 204, 0.15)', color: '#00ffcc', borderColor: '#00ffcc' }}>
            🚶 Tham Quan Tour
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

      {/* R3F Canvas - Đóng vai trò Global Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        onPointerMissed={() => { if (!isEditMode) { setSelectedObjectId(null); setRoadmapStage(0); } }}
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
            onMascotClick={() => { setChatOpen(true); setMascotState('welcome'); }}
            zoomConfig={config.zoomConfig}
            entryDirection={entryDirection}
            exitDirection={exitDirection}
            onExitComplete={handleExitComplete}
            roadmapStage={roadmapStage}
            userZoomOffset={userZoomOffset}
            userPanOffset={userPanOffset}
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
        showUI={showUI && selectedObjectId !== 'obj_tv' && selectedObjectId !== 'obj_roadmap'}
        isEditMode={isEditMode}
        roomData={activeRoomData}
        onClose={() => { setSelectedObjectId(null); setRoadmapStage(0); }}
        detailedContent={config.detailedContent}
        tourActive={tourActive}
        tourIndex={tourIndex}
        tourLength={ROOM_TOURS[currentRoom]?.length || 0}
        isLastRoom={currentRoom === 'room4'}
        onNext={handleNext}
        onPrev={handlePrev}
        onExit={exitTour}
        roadmapStage={roadmapStage}
        setRoadmapStage={setRoadmapStage}
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
                preload="auto"
                controls
                playsInline
                onEnded={handleTVVideoEnded}
                className={`tv-actual-video ${isVideoPlaying ? 'playing' : ''}`}
              />
            </div>

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

          {tourActive && (
            <div className="tv-tour-controls">
              <button
                className="tv-tour-btn prev"
                onClick={handlePrev}
                disabled={tourIndex === 0}
              >
                ◀ Trước
              </button>
              <span className="tv-tour-progress-text">
                {tourIndex + 1} / {ROOM_TOURS[currentRoom]?.length || 0}
              </span>
              <button
                className="tv-tour-btn next"
                onClick={handleNext}
              >
                {tourIndex === (ROOM_TOURS[currentRoom]?.length || 0) - 1 && currentRoom !== 'room4' ? "Sang phòng kế ▶" : "Hoàn thành ✕"}
              </button>
              <button className="tv-tour-btn exit" onClick={exitTour}>
                Thoát Tour
              </button>
            </div>
          )}
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
        setChatOpen={(open) => {
          setChatOpen(open);
          if (!open) setMascotState('idle');
        }}
        setSelectedObjectId={setSelectedObjectId}
        {...chatHook}
      />

      {/* Nút mũi tên chuyển sang Trái (Lùi lại phòng trước) */}
      {!isEditMode && !selectedObjectId && currentRoom !== 'room1' && (
        <button
          className="room-nav-arrow left ui-interactive"
          onClick={() => {
            const roomOrder = ['room1', 'room2', 'room3', 'room4'];
            const idx = roomOrder.indexOf(currentRoom);
            if (idx > 0) handleRoomSwitch(roomOrder[idx - 1]);
          }}
          title="Quay lại phòng trước"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Nút mũi tên chuyển sang Phải (Tiến tới phòng tiếp theo) */}
      {!isEditMode && !selectedObjectId && currentRoom !== 'room4' && (
        <button
          className="room-nav-arrow right ui-interactive"
          onClick={() => {
            const roomOrder = ['room1', 'room2', 'room3', 'room4'];
            const idx = roomOrder.indexOf(currentRoom);
            if (idx < roomOrder.length - 1) handleRoomSwitch(roomOrder[idx + 1]);
          }}
          title="Tiến tới phòng tiếp theo"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Mini Bar điều hướng Z-Pattern cho Roadmap (Không dùng SidePanel) */}
      {selectedObjectId === 'obj_roadmap' && showUI && (
        <div
          className="roadmap-mini-bar ui-interactive"
          style={{
            position: 'fixed',
            bottom: '25px', // Trả về cạnh dưới đáy màn hình
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(20, 12, 6, 0.88)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(249, 115, 22, 0.5)',
            borderRadius: '30px',
            padding: '6px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            zIndex: 9999,
            boxShadow: '0 8px 30px rgba(249, 115, 22, 0.25)',
            animation: 'fadeInUp 0.3s ease'
          }}
        >
          {roadmapStage === 0 ? (
            /* Khi mới zoom vào tổng quan: Nút màu CAM rực rỡ */
            <React.Fragment>
              <button
                onClick={() => setRoadmapStage(1)}
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 22px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  boxShadow: '0 3px 14px rgba(249, 115, 22, 0.45)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                🚀 Khám phá Lộ trình chữ Z ▶
              </button>
              <button
                onClick={() => { setSelectedObjectId(null); setRoadmapStage(0); }}
                style={{
                  background: 'transparent',
                  color: '#fdba74',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0 4px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#fdba74'}
                title="Thoát"
              >
                ✕
              </button>
            </React.Fragment>
          ) : (
            /* Khi đang xem từng chặng (1 -> 4): Menu Cam rực rỡ */
            <React.Fragment>
              <button
                onClick={() => setRoadmapStage(prev => Math.max(1, prev - 1))}
                disabled={roadmapStage === 1}
                style={{
                  background: roadmapStage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(249, 115, 22, 0.18)',
                  color: roadmapStage === 1 ? '#4a5568' : '#ffedd5',
                  border: '1px solid rgba(249, 115, 22, 0.35)',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  cursor: roadmapStage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  transition: 'background 0.2s, color 0.2s'
                }}
              >
                ◀ Lùi lại
              </button>

              <span style={{ color: '#ffedd5', fontSize: '0.9rem', fontWeight: '600', minWidth: '220px', textAlign: 'center', letterSpacing: '0.02em' }}>
                {roadmapStage === 1 && "Chặng 1/4: Bối cảnh & Tìm tòi"}
                {roadmapStage === 2 && "Chặng 2/4: Đại hội VI & Đổi mới"}
                {roadmapStage === 3 && "Chặng 3/4: Bứt phá Khoán 10"}
                {roadmapStage === 4 && "Chặng 4/4: Thành tựu & Hội nhập 🎉"}
              </span>

              <button
                onClick={() => {
                  if (roadmapStage < 4) setRoadmapStage(prev => prev + 1);
                  else { setSelectedObjectId(null); setRoadmapStage(0); }
                }}
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '6px 18px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  boxShadow: '0 3px 14px rgba(249, 115, 22, 0.45)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {roadmapStage === 4 ? "Hoàn thành ✕" : "Chặng tiếp ▶"}
              </button>

              {/* Cụm Nút Zoom Tự Do (Hỗ trợ cuộn chuột hoặc bấm nút cho Giáo viên) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(249, 115, 22, 0.15)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '20px', padding: '2px 8px', marginLeft: '4px' }}>
                <button
                  onClick={() => setUserZoomOffset(prev => Math.min(0.8, prev + 0.15))}
                  style={{ background: 'transparent', border: 'none', color: '#fdba74', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', padding: '2px 6px' }}
                  title="Thu nhỏ (- / Cuộn chuột xuống)"
                >
                  🔍-
                </button>
                <span style={{ fontSize: '0.78rem', color: '#ffedd5', fontWeight: 'bold', minWidth: '42px', textAlign: 'center' }}>
                  {Math.round((1 / (1 + userZoomOffset)) * 100)}%
                </span>
                <button
                  onClick={() => setUserZoomOffset(prev => Math.max(-0.5, prev - 0.15))}
                  style={{ background: 'transparent', border: 'none', color: '#fdba74', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', padding: '2px 6px' }}
                  title="Phóng to (+ / Cuộn chuột lên)"
                >
                  🔍+
                </button>
              </div>

              {(userZoomOffset !== 0 || userPanOffset.x !== 0 || userPanOffset.y !== 0) && (
                <button
                  onClick={() => { setUserZoomOffset(0); setUserPanOffset({ x: 0, y: 0 }); }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '15px',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 'bold',
                    marginLeft: '2px',
                    transition: 'background 0.2s'
                  }}
                  title="Đặt lại góc nhìn chuẩn chặng"
                >
                  🎯 Reset
                </button>
              )}

              <button
                onClick={() => { setSelectedObjectId(null); setRoadmapStage(0); }}
                style={{
                  background: 'transparent',
                  color: '#fdba74',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0 4px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#fdba74'}
                title="Thoát"
              >
                ✕
              </button>
            </React.Fragment>
          )}
        </div>
      )}

      {quizOpen && <QuizGame onClose={() => setQuizOpen(false)} />}

      {/* Màn hình Intro mở đầu (Che phủ Canvas chạy ngầm bên dưới) */}
      {!isEntered && (
        <Intro onEnterMuseum={() => {
          setIsEntered(true);
          setMascotState('welcome');
        }} />
      )}
    </div>
  );
}

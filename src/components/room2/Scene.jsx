import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import gsap from 'gsap';
import Background from '../room1/Background';
import InteractivePlane from '../room1/InteractivePlane';
import Mascot from '../room1/Mascot';
import { useTexture } from '@react-three/drei';

// ═══════════════════════════════════════════════════════════════════════════════
// HÀM PRELOAD AN TOÀN — Bọc try-catch tránh crash môi trường Node.js (Vercel Build)
// ═══════════════════════════════════════════════════════════════════════════════
const safePreloadTexture = (url) => {
  try {
    if (typeof window !== 'undefined') {
      useTexture.preload(url);
    }
  } catch (e) {
    console.warn('Preload failed for:', url, e);
  }
};

const preloadRoomAssets = () => {
  try {
    safePreloadTexture('/assets/room2_board_front.png');
    safePreloadTexture('/assets/room2_board_back_v2.jpg');
    safePreloadTexture('/assets/background2.png');
    safePreloadTexture('/assets/background_room.png');
    safePreloadTexture('/assets/tree.png');
    safePreloadTexture('/assets/book.png');
    safePreloadTexture('/assets/truc.png');
    safePreloadTexture('/assets/earth_map_texture.jpg');
    safePreloadTexture('/assets/diacau.png');
  } catch (e) {
    console.warn(`Error running preloadRoomAssets:`, e);
  }
};

// --- Preload Mascot & Room Assets ngay khi khởi chạy app ---
try {
  safePreloadTexture('/assets/mascot_idle.png');
  safePreloadTexture('/assets/mascot_welcome.png');
  safePreloadTexture('/assets/mascot_thinking.png');
  safePreloadTexture('/assets/mascot_pointing.png');
  safePreloadTexture('/assets/earth_map_texture.jpg');
  safePreloadTexture('/assets/room2_board_front.png');
  safePreloadTexture('/assets/room2_board_back_v2.jpg');

  preloadRoomAssets();
} catch (e) {
  console.warn('Initial preload failed:', e);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHỖ CONFIG VỊ TRÍ CAMERA ZOOM VỀ ROBOT KHI MỞ CHATBOX
// ═══════════════════════════════════════════════════════════════════════════════
const CHAT_ZOOM_CONFIG = {
  // 1. Tọa độ Camera khi mở Chat: [X, Y, Z]
  cameraPos: [2.1, -1.3, 1.95],

  // 2. Điểm nhìn của Camera (LookAt): [X, Y, Z]
  // (Đồng bộ X, Y với cameraPos để nhìn thẳng trực diện không bị méo góc)
  cameraLookAt: [2.1, -1.3, 0.6]
};

// Scene Room 2 — camera tự động zoom dựa trên zoomConfig prop
function Scene({
  roomData,
  selectedObjectId,
  setSelectedObjectId,
  isEditMode,
  transformMode,
  onUpdateTransform,
  showUI,
  setShowUI,
  mascotState,
  chatOpen,
  onMascotClick,
  zoomConfig = {},
  entryDirection,
  exitDirection,
  onExitComplete,
  isRoadmapFlipped = false,
  setIsRoadmapFlipped,
  userZoomOffset = 0,
  userPanOffset = { x: 0, y: 0 }
}) {
  const { camera } = useThree();
  const lookAtTarget = useRef(new Vector3(0, 0, 0));

  useFrame(() => {
    camera.lookAt(lookAtTarget.current);
  });

  useEffect(() => {
    if (selectedObjectId && !isEditMode) {
      const targetObj = roomData.interactive_objects.find(obj => obj.id === selectedObjectId);
      if (targetObj) {
        setShowUI(false);
        const [x, y, z] = targetObj.position;

        // Lấy config zoom tùy chỉnh từ zoomConfig (App.jsx), nếu không có mới dùng mặc định
        const cfg = zoomConfig[targetObj.id] || { zoomDist: 1.1, camOffsetX: 0.0, camOffsetY: 0.0 };

        const camOffsetY = cfg.camOffsetY !== undefined ? cfg.camOffsetY : 0;
        const finalZoomDist = Math.max(0.25, (cfg.zoomDist ?? 1.1) + userZoomOffset);
        const finalCamX = x + (cfg.camOffsetX ?? 0) + (userPanOffset?.x || 0);
        const finalCamY = y + camOffsetY + (userPanOffset?.y || 0);

        const targetCamPos = new Vector3(finalCamX, finalCamY, z + finalZoomDist);
        const targetLookAt = new Vector3(finalCamX, finalCamY, z);

        const animDuration = (userZoomOffset !== 0 || (userPanOffset?.x || 0) !== 0 || (userPanOffset?.y || 0) !== 0) ? 0.25 : 0.9;

        gsap.killTweensOf([camera.position, lookAtTarget.current]);
        gsap.to(camera.position, {
          x: targetCamPos.x,
          y: targetCamPos.y,
          z: targetCamPos.z,
          duration: animDuration,
          ease: 'power2.out'
        });
        gsap.to(lookAtTarget.current, {
          x: targetLookAt.x,
          y: targetLookAt.y,
          z: targetLookAt.z,
          duration: animDuration,
          ease: 'power2.out',
          onComplete: () => {
            setShowUI(true);
          }
        });
      }
    } else if (chatOpen && !selectedObjectId && !isEditMode) {
      setShowUI(false);
      const [cx, cy, cz] = CHAT_ZOOM_CONFIG.cameraPos;
      const [lx, ly, lz] = CHAT_ZOOM_CONFIG.cameraLookAt;
      const targetCamPos = new Vector3(cx, cy, cz);
      const targetLookAt = new Vector3(lx, ly, lz);
      gsap.killTweensOf([camera.position, lookAtTarget.current]);
      gsap.to(camera.position, { x: targetCamPos.x, y: targetCamPos.y, z: targetCamPos.z, duration: 1.0, ease: 'power2.inOut' });
      gsap.to(lookAtTarget.current, {
        x: targetLookAt.x, y: targetLookAt.y, z: targetLookAt.z, duration: 1.0, ease: 'power2.inOut',
        onComplete: () => { setShowUI(true); }
      });
    } else {
      setShowUI(false);
      gsap.killTweensOf([camera.position, lookAtTarget.current]);
      gsap.to(camera.position, { x: 0, y: 0, z: 5, duration: 1.0, ease: 'power2.inOut' });
      gsap.to(lookAtTarget.current, { x: 0, y: 0, z: 0, duration: 1.0, ease: 'power2.inOut' });
    }
  }, [selectedObjectId, chatOpen, roomData, isEditMode, camera, setShowUI, zoomConfig, userZoomOffset, userPanOffset]);

  return (
    <group>
      <Background
        url={roomData.background.url}
        selectedObjectId={selectedObjectId}
        isEditMode={isEditMode}
      />

      {roomData.interactive_objects.map((obj) => (
        <InteractivePlane
          key={obj.id}
          id={obj.id}
          imageUrl={obj.image_url}
          position={obj.position}
          scale={obj.scale}
          content={obj.content}
          isSelected={selectedObjectId === obj.id}
          anySelected={!!selectedObjectId}
          onSelect={setSelectedObjectId}
          isEditMode={isEditMode}
          transformMode={transformMode}
          onUpdateTransform={onUpdateTransform}
          showUI={showUI}
          onClose={() => setSelectedObjectId(null)}
          chatOpen={chatOpen}
          isFlipped={isRoadmapFlipped}
          setIsFlipped={setIsRoadmapFlipped}
        />
      ))}

      <Mascot
        key={roomData.background.url}
        selectedObjectId={selectedObjectId}
        roomData={roomData}
        mascotState={mascotState}
        showUI={showUI}
        onClose={() => setSelectedObjectId(null)}
        onMascotClick={onMascotClick}
        isEditMode={isEditMode}
        chatOpen={chatOpen}
        entryDirection={entryDirection}
        exitDirection={exitDirection}
        onExitComplete={onExitComplete}
        isRoadmapFlipped={isRoadmapFlipped}
      />
    </group>
  );
}

export default Scene;

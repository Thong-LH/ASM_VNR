import React, { useRef, useEffect, Suspense } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
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

export const preloadRoomAssets = (roomId) => {
  try {
    if (roomId === 'room1') {
      safePreloadTexture('/assets/background1.png');
      safePreloadTexture('/assets/sogao.png');
      safePreloadTexture('/assets/saptien.png');
      safePreloadTexture('/assets/loa.png');
    } else if (roomId === 'room2') {
      safePreloadTexture('/assets/background2.png');
      safePreloadTexture('/assets/vankien.png');
      safePreloadTexture('/assets/tobao.png');
      safePreloadTexture('/assets/sodo.png');
      safePreloadTexture('/assets/radio.png');
      safePreloadTexture('/assets/nghiquyet10.png');
      safePreloadTexture('/assets/tv.png');
    } else if (roomId === 'room3') {
      safePreloadTexture('/assets/background3.jpeg');
      safePreloadTexture('/assets/cuonglinh.png');
      safePreloadTexture('/assets/bieudo.png');
      safePreloadTexture('/assets/truc.png');
      safePreloadTexture('/assets/diacau.png');
      safePreloadTexture('/assets/hanhtrinh.png');
    } else if (roomId === 'room4') {
      safePreloadTexture('/assets/background4.jpeg');
      safePreloadTexture('/assets/roadmap.jpg');
    }
  } catch (e) {
    console.warn(`Error running preloadRoomAssets for ${roomId}:`, e);
  }
};

// --- Preload Mascot & Room 1 ngay khi khởi chạy app ---
try {
  safePreloadTexture('/assets/mascot_idle.png');
  safePreloadTexture('/assets/mascot_welcome.png');
  safePreloadTexture('/assets/mascot_thinking.png');
  safePreloadTexture('/assets/mascot_pointing.png');
  safePreloadTexture('/assets/earth_map_texture.jpeg');
  
  // Load trước Room 1 để vào app mượt luôn
  preloadRoomAssets('room1');
} catch (e) {
  console.warn('Initial preload failed:', e);
}

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
  roadmapStage = 0,
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

        // Lấy config zoom tùy chỉnh nếu có, nếu không dùng mặc định
        let cfg = zoomConfig[targetObj.id] || { zoomDist: 1.1, camOffsetX: 0.45 };

        // Xử lý GSAP Camera cho 4 chặng Z-Pattern của Roadmap
        if (targetObj.id === 'obj_roadmap' && roadmapStage > 0) {
          if (roadmapStage === 1) cfg = { zoomDist: 0.85, camOffsetX: -0.28, camOffsetY: 0.322 };
          else if (roadmapStage === 2) cfg = { zoomDist: 0.85, camOffsetX: 0.28, camOffsetY: 0.322 };
          else if (roadmapStage === 3) cfg = { zoomDist: 0.85, camOffsetX: -0.28, camOffsetY: -0.25 };
          else if (roadmapStage === 4) cfg = { zoomDist: 0.85, camOffsetX: 0.28, camOffsetY: -0.25 };
        }

        const camOffsetY = cfg.camOffsetY !== undefined ? cfg.camOffsetY : 0;
        const finalZoomDist = Math.max(0.25, cfg.zoomDist + userZoomOffset);

        const finalCamX = x + cfg.camOffsetX + userPanOffset.x;
        const finalCamY = y + camOffsetY + userPanOffset.y;

        const targetCamPos = new Vector3(finalCamX, finalCamY, z + finalZoomDist);
        const targetLookAt = new Vector3(finalCamX, finalCamY, z);

        const animDuration = (userZoomOffset !== 0 || userPanOffset.x !== 0 || userPanOffset.y !== 0) ? 0.25 : 1.2;

        gsap.killTweensOf([camera.position, lookAtTarget.current]);
        gsap.to(camera.position, { x: targetCamPos.x, y: targetCamPos.y, z: targetCamPos.z, duration: animDuration, ease: 'power2.out' });
        gsap.to(lookAtTarget.current, {
          x: targetLookAt.x, y: targetLookAt.y, z: targetLookAt.z, duration: animDuration, ease: 'power2.out',
          onComplete: () => { setShowUI(true); }
        });
      }
    } else if (chatOpen && !selectedObjectId && !isEditMode) {
      setShowUI(false);
      const targetCamPos = new Vector3(2.2 + 0.22, -0.5, 0.6 + 0.97);
      const targetLookAt = new Vector3(2.2 + 0.22, -0.5, 0.6);
      gsap.killTweensOf([camera.position, lookAtTarget.current]);
      gsap.to(camera.position, { x: targetCamPos.x, y: targetCamPos.y, z: targetCamPos.z, duration: 1.2, ease: 'power2.inOut' });
      gsap.to(lookAtTarget.current, {
        x: targetLookAt.x, y: targetLookAt.y, z: targetLookAt.z, duration: 1.2, ease: 'power2.inOut',
        onComplete: () => { setShowUI(true); }
      });
    } else {
      setShowUI(false);
      gsap.killTweensOf([camera.position, lookAtTarget.current]);
      gsap.to(camera.position, { x: 0, y: 0, z: 5, duration: 1.2, ease: 'power2.inOut' });
      gsap.to(lookAtTarget.current, { x: 0, y: 0, z: 0, duration: 1.2, ease: 'power2.inOut' });
    }
  }, [selectedObjectId, chatOpen, roomData, isEditMode, camera, setShowUI, roadmapStage, zoomConfig, userZoomOffset, userPanOffset]);

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
        entryDirection={entryDirection}
        exitDirection={exitDirection}
        onExitComplete={onExitComplete}
        roadmapStage={roadmapStage}
      />
    </group>
  );
}

export default Scene;

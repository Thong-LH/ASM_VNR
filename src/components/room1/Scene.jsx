import React, { useRef, useEffect, Suspense } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Vector3 } from 'three';
import gsap from 'gsap';
import Background from './Background';
import InteractivePlane from './InteractivePlane';
import Mascot from './Mascot';

// Scene chính quản lý camera chuyển động
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
  onExitComplete
}) {
  const { camera } = useThree();
  const lookAtTarget = useRef(new Vector3(0, 0, 0));

  // Camera luôn nhìn vào điểm lookAtTarget
  useFrame(() => {
    camera.lookAt(lookAtTarget.current);
  });

  // Xử lý chuyển động Camera bằng GSAP (Zoom 2.5D vào hiện vật hoặc Robot trợ lý)
  useEffect(() => {
    if (selectedObjectId && !isEditMode) {
      const targetObj = roomData.interactive_objects.find(obj => obj.id === selectedObjectId);
      if (targetObj) {
        setShowUI(false);

        const [x, y, z] = targetObj.position;

        // Đọc cấu hình khoảng cách Zoom và độ lệch Camera từ zoomConfig prop
        const cfg = zoomConfig[targetObj.id] || { zoomDist: 1.0, camOffsetX: 0.4 };
        const zoomDist = cfg.zoomDist ?? 1.0;
        const camOffsetX = cfg.camOffsetX ?? 0.4;

        const targetCamPos = new Vector3(x + camOffsetX, y, z + zoomDist);
        const targetLookAt = new Vector3(x + camOffsetX, y, z);

        gsap.killTweensOf([camera.position, lookAtTarget.current]);

        gsap.to(camera.position, {
          x: targetCamPos.x,
          y: targetCamPos.y,
          z: targetCamPos.z,
          duration: 1.2,
          ease: 'power2.inOut',
        });

        gsap.to(lookAtTarget.current, {
          x: targetLookAt.x,
          y: targetLookAt.y,
          z: targetLookAt.z,
          duration: 1.2,
          ease: 'power2.inOut',
          onComplete: () => { setShowUI(true); }
        });
      }
    } else if (chatOpen && !selectedObjectId && !isEditMode) {
      // Zoom 2.5D vào chú Robot Mascot khi đang ở trạng thái Trò chuyện tự do
      setShowUI(false);

      const targetCamPos = new Vector3(2.2 + 0.22, -0.5, 0.6 + 0.97);
      const targetLookAt = new Vector3(2.2 + 0.22, -0.5, 0.6);

      gsap.killTweensOf([camera.position, lookAtTarget.current]);

      gsap.to(camera.position, {
        x: targetCamPos.x,
        y: targetCamPos.y,
        z: targetCamPos.z,
        duration: 1.2,
        ease: 'power2.inOut',
      });

      gsap.to(lookAtTarget.current, {
        x: targetLookAt.x,
        y: targetLookAt.y,
        z: targetLookAt.z,
        duration: 1.2,
        ease: 'power2.inOut',
        onComplete: () => { setShowUI(true); }
      });
    } else {
      // Khi lùi về toàn cảnh
      setShowUI(false);

      gsap.killTweensOf([camera.position, lookAtTarget.current]);

      gsap.to(camera.position, { x: 0, y: 0, z: 5, duration: 1.2, ease: 'power2.inOut' });
      gsap.to(lookAtTarget.current, { x: 0, y: 0, z: 0, duration: 1.2, ease: 'power2.inOut' });
    }
  }, [selectedObjectId, chatOpen, roomData, isEditMode, camera, setShowUI]);

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
      />
    </group>
  );
}

export default Scene;

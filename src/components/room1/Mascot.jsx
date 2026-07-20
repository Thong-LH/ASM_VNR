import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Vector3, RepeatWrapping } from 'three';
import gsap from 'gsap';

// Component Trợ lý Robot bay 3D với hiệu ứng Sprite Sheet & Đồng hành
function Mascot({
  selectedObjectId,
  roomData,
  mascotState,
  onMascotClick,
  isEditMode,
  entryDirection,
  exitDirection,
  onExitComplete,
  roadmapStage = 0
}) {
  const spriteRef = useRef();

  // Nạp 4 bộ hình ảnh Sprite Sheet cho 4 trạng thái
  const textureIdle = useTexture('/assets/mascot_idle.png');
  const textureWelcome = useTexture('/assets/mascot_welcome.png');
  const textureThinking = useTexture('/assets/mascot_thinking.png');
  const texturePointing = useTexture('/assets/mascot_pointing.png');

  const config = {
    idle: 8,
    welcome: 13,
    thinking: 8,
    pointing: 7
  };

  // State quản lý Hướng nhìn ('RIGHT' | 'LEFT') và Trạng thái hoạt ảnh ('idle' | 'pointing' | 'thinking' | 'welcome')
  const [lookDirection, setLookDirection] = useState('LEFT');
  const [actionState, setActionState] = useState(entryDirection ? 'idle' : mascotState);
  const isTransitioningRef = useRef(false);
  const hasEnteredRef = useRef(false);

  // Vị trí bến đậu mặc định ở góc phải dưới
  const defaultPos = useMemo(() => new Vector3(2.2, -0.5, 0.6), []);

  // Vị trí bắt đầu nếu bay từ phòng khác vào (ENTRY ROOM) - Dùng useRef để cố định lúc mount tránh giật khung hình khi re-render
  const initialPos = useRef([
    entryDirection ? (entryDirection === 'forward' ? -6.0 : 6.0) : defaultPos.x,
    entryDirection ? 1.0 : defaultPos.y,
    defaultPos.z
  ]);

  const activeObject = useMemo(() => {
    if (!selectedObjectId || !roomData) return null;
    return roomData.interactive_objects.find(obj => obj.id === selectedObjectId);
  }, [selectedObjectId, roomData]);

  // Cấu hình Lật hình (Flip) dựa theo Hướng nhìn mong muốn ('RIGHT' hay 'LEFT')
  // - idle & welcome: Mặc định gốc nhìn TRÁI -> Muốn nhìn PHẢI: flip = true (RIGHT); Muốn nhìn TRÁI: flip = false (LEFT).
  // - thinking & pointing: Mặc định gốc nhìn PHẢI -> Muốn nhìn PHẢI: flip = false (LEFT); Muốn nhìn TRÁI: flip = true (LEFT).
  const isIdleFlipped = lookDirection === 'RIGHT';
  const isPointingFlipped = lookDirection === 'LEFT';
  const isThinkingFlipped = lookDirection === 'LEFT';
  const isWelcomeFlipped = lookDirection === 'RIGHT';

  useEffect(() => {
    const multIdle = isIdleFlipped ? -1 : 1;
    const multWelcome = isWelcomeFlipped ? -1 : 1;
    const multThinking = isThinkingFlipped ? -1 : 1;
    const multPointing = isPointingFlipped ? -1 : 1;

    if (textureIdle) {
      textureIdle.wrapS = RepeatWrapping;
      textureIdle.repeat.set(multIdle * (1 / config.idle), 1);
    }
    if (textureWelcome) {
      textureWelcome.wrapS = RepeatWrapping;
      textureWelcome.repeat.set(multWelcome * (1 / config.welcome), 1);
    }
    if (textureThinking) {
      textureThinking.wrapS = RepeatWrapping;
      textureThinking.repeat.set(multThinking * (1 / config.thinking), 1);
    }
    if (texturePointing) {
      texturePointing.wrapS = RepeatWrapping;
      texturePointing.repeat.set(multPointing * (1 / config.pointing), 1);
    }
  }, [
    textureIdle,
    textureWelcome,
    textureThinking,
    texturePointing,
    isIdleFlipped,
    isWelcomeFlipped,
    isThinkingFlipped,
    isPointingFlipped
  ]);


  // --- PHẦN 1: XỬ LÝ BAY VÀO & KHÁM PHÁ HIỆN VẬT TRONG PHÒNG ---
  useEffect(() => {
    if (!spriteRef.current || exitDirection) return;

    let targetX = defaultPos.x;
    let targetY = defaultPos.y;
    let targetZ = defaultPos.z;

    if (selectedObjectId && roomData) {
      const activeObj = roomData.interactive_objects.find(obj => obj.id === selectedObjectId);
      if (activeObj) {
        const isRightSide = activeObj.position[0] > 1.5;
        if (selectedObjectId === 'obj_sodo') {
          targetX = activeObj.position[0] - 1;
          targetY = activeObj.position[1] + 0.15;
          targetZ = activeObj.position[2] + 0.15;
        } else if (selectedObjectId === 'obj_tv') {
          targetX = activeObj.position[0] - 0.95;
          targetY = activeObj.position[1] + 0.15;
          targetZ = activeObj.position[2] + 0.15;
        } else if (selectedObjectId === 'obj_saptien') {
          targetX = activeObj.position[0] - 0.34; // Xích lại gần hơn nữa sang bên phải
          targetY = activeObj.position[1] + 0.07; // Hạ thấp độ cao xuống một chút
          targetZ = activeObj.position[2] + 0.15;
        } else if (selectedObjectId === 'obj_diacau') {
          targetX = activeObj.position[0] + 0.7; // Đứng bên phải quả địa cầu
          targetY = activeObj.position[1] + 0.15;
          targetZ = activeObj.position[2] + 0.15;
        } else if (selectedObjectId === 'obj_bieudo') {
          targetX = activeObj.position[0] - 1; // Đứng dạt hẳn ra biên trái của bảng biểu đồ siêu rộng (3.02)
          targetY = activeObj.position[1] + 0.2;  // Hạ thấp độ cao xuống vì biểu đồ treo khá cao
          targetZ = activeObj.position[2] + 0.15;
        } else if (selectedObjectId === 'obj_hanhtrinh') {
          targetX = activeObj.position[0] - 1; // Đứng dạt xa sang bên trái cuộn giấy hành trình rộng
          targetY = activeObj.position[1] + 0.25;
          targetZ = activeObj.position[2] + 0.15;
        } else if (selectedObjectId === 'obj_roadmap') {
          if (roadmapStage === 1) {
            targetX = activeObj.position[0] - 1.0;
            targetY = activeObj.position[1] + 0.45;
          } else if (roadmapStage === 2) {
            targetX = activeObj.position[0] + 1.0;
            targetY = activeObj.position[1] + 0.45;
          } else if (roadmapStage === 3) {
            targetX = activeObj.position[0] - 1.0;
            targetY = activeObj.position[1] - 0.15;
          } else if (roadmapStage === 4) {
            targetX = activeObj.position[0] + 1.0;
            targetY = activeObj.position[1] - 0.15;
          } else {
            targetX = activeObj.position[0] - 1.2;
            targetY = activeObj.position[1] + 0.1;
          }
          targetZ = activeObj.position[2] + 0.15;
        } else {
          targetX = activeObj.position[0] + (isRightSide ? 0.55 : -0.55);
          targetY = activeObj.position[1] + 0.2;
          targetZ = activeObj.position[2] + 0.15;
        }
      }
    }

    let delay = 0;
    if (!hasEnteredRef.current && entryDirection) {
      delay = 0.5;
      hasEnteredRef.current = true;
    }

    const startX = spriteRef.current ? spriteRef.current.position.x : defaultPos.x;
    const startY = spriteRef.current ? spriteRef.current.position.y : defaultPos.y;

    const deltaX = targetX - startX;
    const deltaY = targetY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const isMovingRight = deltaX > 0;
    const tiltAngle = isMovingRight ? -0.18 : 0.18;

    // Hướng nhìn tiếp đất thuyết minh (Robot đứng bên trái vật thể -> nhìn PHẢI; robot đứng bên phải -> nhìn TRÁI; ở bến đỗ mặc định -> nhìn TRÁI vào phòng)
    const landingDirection = (() => {
      if (!selectedObjectId || !roomData) return 'LEFT';
      const activeObj = roomData.interactive_objects.find(obj => obj.id === selectedObjectId);
      if (!activeObj) return 'LEFT';
      return targetX < activeObj.position[0] ? 'RIGHT' : 'LEFT';
    })();

    gsap.killTweensOf([spriteRef.current.position, spriteRef.current.rotation]);

    // Chỉ chạy GSAP di chuyển khi khoảng cách thực sự lớn (cần di chuyển đến hiện vật mới hoặc vừa vào phòng)
    if (distance > 0.15) {
      isTransitioningRef.current = true;
      stateStartTimeRef.current = null;
      spriteRef.current.rotation.z = tiltAngle;
      setLookDirection(isMovingRight ? 'RIGHT' : 'LEFT'); // Bay sang phải -> nhìn PHẢI; bay sang trái -> nhìn TRÁI
      setActionState('idle'); // Giữ dáng idle khi đang bay

      gsap.to(spriteRef.current.position, {
        x: targetX,
        y: targetY,
        z: targetZ,
        duration: 1.4,
        delay: delay,
        ease: 'power2.out',
        onComplete: () => {
          isTransitioningRef.current = false;
          setLookDirection(landingDirection);
          setActionState(selectedObjectId ? (mascotState === 'thinking' ? 'thinking' : 'pointing') : mascotState);
        }
      });

      gsap.to(spriteRef.current.rotation, {
        z: 0,
        duration: 1.4,
        delay: delay,
        ease: 'power2.out'
      });
    } else {
      // Nếu đã ở rất sát rồi (hoặc do thay đổi state không liên quan vị trí), chỉ cần đổi trạng thái hoạt ảnh, tránh chạy lại GSAP gây khựng/nháy hình
      isTransitioningRef.current = false;
      setLookDirection(landingDirection);
      setActionState(selectedObjectId ? (mascotState === 'thinking' ? 'thinking' : 'pointing') : mascotState);
    }
  }, [selectedObjectId, roomData, exitDirection, entryDirection, defaultPos, roadmapStage]);

  // --- PHẦN 2: XỬ LÝ BAY THOÁT KHỎI MÀN HÌNH KHI ĐỔI PHÒNG (EXIT ROOM) ---
  useEffect(() => {
    if (exitDirection && spriteRef.current) {
      const isExitingForward = exitDirection === 'forward';
      const targetX = isExitingForward ? 6.0 : -6.0;
      const targetY = 1.0;
      const tiltAngle = isExitingForward ? -0.25 : 0.25;

      isTransitioningRef.current = true;
      stateStartTimeRef.current = null;
      setLookDirection(isExitingForward ? 'RIGHT' : 'LEFT'); // Forward = bay sang phải (nhìn PHẢI); Backward = bay sang trái (nhìn TRÁI)
      setActionState('idle');

      gsap.killTweensOf([spriteRef.current.position, spriteRef.current.rotation]);

      gsap.to(spriteRef.current.position, {
        x: targetX,
        y: targetY,
        duration: 1.2,
        ease: 'power2.in',
        onComplete: () => {
          isTransitioningRef.current = false;
          if (onExitComplete) onExitComplete();
        }
      });

      gsap.to(spriteRef.current.rotation, {
        z: tiltAngle,
        duration: 1.2,
        ease: 'power2.in'
      });
    }
  }, [exitDirection, onExitComplete]);

  // Đồng bộ trạng thái đứng yên khi không di chuyển (chỉ chạy khi Mascot đã dừng hoàn toàn)
  useEffect(() => {
    if (isTransitioningRef.current) return;
    if (selectedObjectId) {
      if (mascotState === 'thinking') {
        setActionState('thinking');
      } else {
        setActionState('pointing');
      }
    } else {
      setActionState(mascotState);
    }
  }, [mascotState, selectedObjectId, roadmapStage]);



  const stateStartTimeRef = useRef(null);

  useEffect(() => {
    stateStartTimeRef.current = null;
  }, [actionState]);

  useFrame((state) => {
    if (!spriteRef.current) return;
    const time = state.clock.getElapsedTime();

    if (stateStartTimeRef.current === null) {
      stateStartTimeRef.current = time;
    }

    const elapsed = time - stateStartTimeRef.current;

    // Hiệu ứng nhấp nhô lơ lửng tự nhiên
    spriteRef.current.position.y += Math.sin(time * 2.5) * 0.0015;

    const currentFrame = Math.floor(elapsed * 10);

    if (textureIdle) {
      if (actionState === 'idle') {
        const idx = currentFrame < 6 ? (currentFrame + 2) % 8 : 0;
        textureIdle.offset.x = isIdleFlipped ? (idx + 1) / 8 : idx / 8;
      } else {
        textureIdle.offset.x = isIdleFlipped ? 1 / 8 : 0;
      }
    }
    if (textureWelcome) {
      if (actionState === 'welcome') {
        const idx = Math.min(currentFrame, 12);
        textureWelcome.offset.x = isWelcomeFlipped ? (idx + 1) / 13 : idx / 13;
      } else {
        textureWelcome.offset.x = isWelcomeFlipped ? 1 / 13 : 0;
      }
    }
    if (textureThinking) {
      if (actionState === 'thinking') {
        const idx = Math.min(currentFrame, 7);
        textureThinking.offset.x = isThinkingFlipped ? (idx + 1) / 8 : idx / 8;
      } else {
        textureThinking.offset.x = isThinkingFlipped ? 1 / 8 : 0;
      }
    }
    if (texturePointing) {
      if (actionState === 'pointing') {
        const idx = Math.min(currentFrame, 6);
        texturePointing.offset.x = isPointingFlipped ? (idx + 1) / 7 : idx / 7;
      } else {
        texturePointing.offset.x = isPointingFlipped ? 1 / 7 : 0;
      }
    }
  });

  return (
    <group renderOrder={999}>
      <group
        ref={spriteRef}
        position={initialPos.current}
        renderOrder={999}
        onClick={(e) => {
          e.stopPropagation();
          if (!isEditMode) {
            stateStartTimeRef.current = null;
            setActionState('idle');
            setTimeout(() => setActionState('welcome'), 0);
            onMascotClick();
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (!isEditMode) {
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
        }}
      >
        <sprite scale={[0.65, 0.65, 1]} visible={actionState === 'idle'} renderOrder={999}>
          <spriteMaterial map={textureIdle} transparent={true} toneMapped={false} depthWrite={false} depthTest={false} renderOrder={999} />
        </sprite>
        <sprite scale={[0.65, 0.65, 1]} visible={actionState === 'welcome'} renderOrder={999}>
          <spriteMaterial map={textureWelcome} transparent={true} toneMapped={false} depthWrite={false} depthTest={false} renderOrder={999} />
        </sprite>
        <sprite scale={[0.65, 0.65, 1]} visible={actionState === 'thinking'} renderOrder={999}>
          <spriteMaterial map={textureThinking} transparent={true} toneMapped={false} depthWrite={false} depthTest={false} renderOrder={999} />
        </sprite>
        <sprite scale={[0.65, 0.65, 1]} visible={actionState === 'pointing'} renderOrder={999}>
          <spriteMaterial map={texturePointing} transparent={true} toneMapped={false} depthWrite={false} depthTest={false} renderOrder={999} />
        </sprite>
      </group>
    </group>
  );
}

export default Mascot;

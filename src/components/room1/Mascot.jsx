import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Vector3, RepeatWrapping } from 'three';
import gsap from 'gsap';

// 🎛️ BẢNG CONFIG KHOẢNG FRAME VẪY TAY CỦA ROBOT MASCOT (WELCOME LOOP):
// Bộ sprite sheet welcome có tổng cộng 13 frame (từ 0 đến 12).
// Để tay luôn giơ lên và vẫy liên tục (không bị hạ tay xuống):
// - startFrame: frame bắt đầu chu kỳ vẫy tay ở trên cao
// - endFrame: frame kết thúc chu kỳ vẫy trước khi hạ tay xuống
export const WELCOME_LOOP_CONFIG = {
  startFrame: 2, // Bắt đầu chu kỳ vẫy từ index 2
  endFrame: 9    // Kết thúc chu kỳ vẫy ở index 9
};

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
  roadmapStage = 0,
  chatOpen = false,
  isRoadmapFlipped = false
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
  const [lookDirection, setLookDirection] = useState(chatOpen ? 'RIGHT' : 'LEFT');
  const [actionState, setActionState] = useState(entryDirection ? 'idle' : mascotState);
  const isTransitioningRef = useRef(false);
  const hasEnteredRef = useRef(false);

  // Vị trí bến đậu mặc định ở góc phải dưới (đã hạ thấp và dời sang phải)
  const defaultPos = useMemo(() => new Vector3(2, -1.5, 0.6), []);

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
        if (selectedObjectId === 'obj_tree') {
          targetX = activeObj.position[0] - 0.5; // Đứng bên trái chậu măng tre, hướng nhìn sang phải
          targetY = activeObj.position[1] + 0.2;
          targetZ = activeObj.position[2] + 0.15;
        } else if (selectedObjectId === 'obj_book') {
          targetX = activeObj.position[0] + 0.65; // Đứng bên phải chồng sách lý luận
          targetY = activeObj.position[1] + 0.2;
          targetZ = activeObj.position[2] + 0.15;
        } else if (selectedObjectId === 'obj_diacau') {
          targetX = activeObj.position[0] + 0.5; // Đứng bên phải quả địa cầu / trục
          targetY = activeObj.position[1] - 0.05;
          targetZ = activeObj.position[2] + 0.15;
        } else if (selectedObjectId === 'obj_roadmap') {
          targetX = activeObj.position[0] - 1.2; // Đứng bên phải bảng 3D phòng 2
          targetY = activeObj.position[1] - 0.15;
          targetZ = activeObj.position[2] + 0.15;
        } else {
          targetX = activeObj.position[0] + (isRightSide ? 0.55 : -0.55);
          targetY = activeObj.position[1] + 0.2;
          targetZ = activeObj.position[2] + 0.15;
        }
      }
    }

    if (!hasEnteredRef.current && entryDirection) {
      hasEnteredRef.current = true;
    }

    const startX = spriteRef.current ? spriteRef.current.position.x : defaultPos.x;
    const startY = spriteRef.current ? spriteRef.current.position.y : defaultPos.y;

    const deltaX = targetX - startX;
    const deltaY = targetY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const isMovingRight = deltaX > 0;
    const tiltAngle = isMovingRight ? -0.18 : 0.18;

    // Hướng nhìn tiếp đất thuyết minh (Robot đứng bên trái vật thể -> nhìn PHẢI; robot đứng bên phải -> nhìn TRÁI; ở bến đỗ mặc định: mở chat -> nhìn PHẢI sang ô chat, đóng chat -> nhìn TRÁI vào phòng)
    const landingDirection = (() => {
      if (chatOpen && !selectedObjectId) return 'RIGHT';
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
        duration: 1.2,
        ease: 'power2.out',
        onComplete: () => {
          isTransitioningRef.current = false;
          setLookDirection(landingDirection);
          if (isRoadmapFlipped) {
            setActionState('welcome');
          } else {
            setActionState(selectedObjectId ? (mascotState === 'thinking' ? 'thinking' : 'pointing') : mascotState);
          }
        }
      });

      gsap.to(spriteRef.current.rotation, {
        z: 0,
        duration: 1.2,
        ease: 'power2.out'
      });
    } else {
      // Nếu đã ở rất sát rồi (hoặc do thay đổi state không liên quan vị trí), chỉ cần đổi trạng thái hoạt ảnh, tránh chạy lại GSAP gây khựng/nháy hình
      isTransitioningRef.current = false;
      setLookDirection(landingDirection);
      if (isRoadmapFlipped) {
        setActionState('welcome');
      } else {
        setActionState(selectedObjectId ? (mascotState === 'thinking' ? 'thinking' : 'pointing') : mascotState);
      }
    }
  }, [selectedObjectId, roomData, exitDirection, entryDirection, defaultPos, mascotState, chatOpen, isRoadmapFlipped]);

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

  // Đồng bộ trạng thái đứng yên và hướng nhìn khi không di chuyển (chỉ chạy khi Mascot đã dừng hoàn toàn)
  useEffect(() => {
    if (isTransitioningRef.current) return;
    if (chatOpen && !selectedObjectId) {
      setLookDirection('RIGHT');
    } else if (!selectedObjectId) {
      setLookDirection('LEFT');
    }

    if (isRoadmapFlipped) {
      setActionState('welcome');
    } else if (selectedObjectId) {
      if (mascotState === 'thinking') {
        setActionState('thinking');
      } else {
        setActionState('pointing');
      }
    } else {
      setActionState(mascotState);
    }
  }, [mascotState, selectedObjectId, chatOpen, isRoadmapFlipped]);



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
        let idx = 0;
        if (isRoadmapFlipped) {
          // CHỈ KHI LẬT ĐẾN BẢNG "XIN CẢM ƠN": Vẫy tay liên tục trên cao
          const { startFrame, endFrame } = WELCOME_LOOP_CONFIG;
          const loopLength = Math.max(1, endFrame - startFrame + 1);
          if (currentFrame < startFrame) {
            idx = currentFrame; // Lần đầu giơ tay lên từ 0 -> startFrame
          } else {
            // Sau đó chỉ lặp lại trong khoảng tay giơ cao vẫy liên tục
            idx = startFrame + ((currentFrame - startFrame) % loopLength);
          }
        } else {
          // CÁC TÌNH HUỐNG XIN CHÀO BÌNH THƯỜNG (Click mở guide / Chatbot): Chạy 1 lượt bình thường
          idx = Math.min(currentFrame, 12);
        }
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

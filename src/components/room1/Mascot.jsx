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
  onExitComplete
}) {
  const spriteRef = useRef();

  // Nạp 4 bộ hình ảnh Sprite Sheet cho 4 trạng thái
  const textureIdle = useTexture('/assets/mascot_idle.png');
  const textureWelcome = useTexture('/assets/mascot_welcome.png');
  const textureThinking = useTexture('/assets/mascot_thinking.png');
  const texturePointing = useTexture('/assets/mascot_pointing.png');

  // Khai báo số lượng khung hình của từng tệp Sprite Sheet nằm ngang
  const config = {
    idle: 8,
    welcome: 13,
    thinking: 8,
    pointing: 7
  };

  const [currentFacing, setCurrentFacing] = useState('right'); // Mặc định là 'right' để robot nhìn sang Trái

  const activeObject = useMemo(() => {
    if (!selectedObjectId || !roomData) return null;
    return roomData.interactive_objects.find(obj => obj.id === selectedObjectId);
  }, [selectedObjectId, roomData]);

  // Hướng nhìn mong muốn khi robot đứng yên
  const desiredFacing = useMemo(() => {
    if (!activeObject) return 'right'; // Mặc định đứng yên quay mặt sang trái (tương ứng giá trị 'right' trong hệ tọa độ của sprite sheet)
    return activeObject.position[0] > 1.5 ? 'left' : 'right';
  }, [activeObject]);

  // Đồng bộ hướng nhìn khi ở trạng thái nghỉ
  useEffect(() => {
    if (!exitDirection) {
      setCurrentFacing(desiredFacing);
    }
  }, [desiredFacing, exitDirection]);

  // welcome có mặc định hướng Trái (cần lật để hướng Phải). Các động tác còn lại mặc định hướng Phải
  const isIdleFlipped = currentFacing === 'left';
  const isWelcomeFlipped = currentFacing === 'right';
  const isThinkingFlipped = currentFacing === 'left';
  const isPointingFlipped = currentFacing === 'left';

  // Cấu hình lặp lại texture cho cả 4 ảnh ngang
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
  }, [textureIdle, textureWelcome, textureThinking, texturePointing, isIdleFlipped, isWelcomeFlipped, isThinkingFlipped, isPointingFlipped]);

  // Vị trí bến đậu mặc định ở góc phải dưới
  const defaultPos = new Vector3(2.2, -0.5, 0.6);

  const stateStartTimeRef = useRef(null);

  // Khi đổi trạng thái Mascot, reset mốc thời gian bắt đầu
  useEffect(() => {
    stateStartTimeRef.current = null;
  }, [mascotState]);

  useFrame((state) => {
    if (!spriteRef.current) return;
    const time = state.clock.getElapsedTime();

    if (stateStartTimeRef.current === null) {
      stateStartTimeRef.current = time;
    }

    const elapsed = time - stateStartTimeRef.current;

    // 1. Hiệu ứng nhấp nhô lơ lửng tự nhiên
    spriteRef.current.position.y += Math.sin(time * 2.5) * 0.0015;

    // 2. Chạy hoạt ảnh dừng ở khung hình cuối cùng (Không lặp lại)
    const currentFrame = Math.floor(elapsed * 10);

    if (textureIdle) {
      if (mascotState === 'idle') {
        const idx = currentFrame < 6 ? (currentFrame + 2) % 8 : 0;
        textureIdle.offset.x = isIdleFlipped ? (idx + 1) / 8 : idx / 8;
      } else {
        textureIdle.offset.x = isIdleFlipped ? 1 / 8 : 0;
      }
    }
    if (textureWelcome) {
      if (mascotState === 'welcome') {
        const idx = Math.min(currentFrame, 12);
        textureWelcome.offset.x = isWelcomeFlipped ? (idx + 1) / 13 : idx / 13;
      } else {
        textureWelcome.offset.x = isWelcomeFlipped ? 1 / 13 : 0;
      }
    }
    if (textureThinking) {
      if (mascotState === 'thinking') {
        const idx = Math.min(currentFrame, 7);
        textureThinking.offset.x = isThinkingFlipped ? (idx + 1) / 8 : idx / 8;
      } else {
        textureThinking.offset.x = isThinkingFlipped ? 1 / 8 : 0;
      }
    }
    if (texturePointing) {
      if (mascotState === 'pointing') {
        const idx = Math.min(currentFrame, 6);
        texturePointing.offset.x = isPointingFlipped ? (idx + 1) / 7 : idx / 7;
      } else {
        texturePointing.offset.x = isPointingFlipped ? 1 / 7 : 0;
      }
    }
  });

  const hasEnteredRef = useRef(false);

  // Di chuyển mượt mà Mascot đến gần hiện vật đang chọn
  useEffect(() => {
    if (!spriteRef.current || exitDirection) return; // Không bay tới vật thể nếu đang bay ra đổi phòng

    let targetX = defaultPos.x;
    let targetY = defaultPos.y;
    let targetZ = defaultPos.z;

    if (selectedObjectId) {
      const activeObject = roomData.interactive_objects.find(obj => obj.id === selectedObjectId);
      if (activeObject) {
        const isRightAligned = activeObject.position[0] > 1.5;
        if (selectedObjectId === 'obj_sodo') {
          // Đẩy Mascot lệch hẳn sang trái để chỉ thấy một phần và không che sơ đồ
          targetX = activeObject.position[0] - 1;
          targetY = activeObject.position[1] + 0.15;
          targetZ = activeObject.position[2] + 0.15;
        } else if (selectedObjectId === 'obj_tv') {
          // Đẩy Mascot lệch trái xa hơn tivi một chút để không che màn hình
          targetX = activeObject.position[0] - 0.95;
          targetY = activeObject.position[1] + 0.15;
          targetZ = activeObject.position[2] + 0.15;
        } else {
          targetX = activeObject.position[0] + (isRightAligned ? 0.55 : -0.55);
          targetY = activeObject.position[1] + 0.2;
          targetZ = activeObject.position[2] + 0.15;
        }
      }
    }

    let delay = 0;
    if (!hasEnteredRef.current && entryDirection) {
      delay = 0.5;
      hasEnteredRef.current = true;
    }

    const currentX = spriteRef.current.position.x;
    const distance = Math.abs(targetX - currentX);
    const isMovingRight = targetX > currentX;
    const tiltAngle = (distance > 0.2) ? (isMovingRight ? -0.25 : 0.25) : 0;

    gsap.killTweensOf([spriteRef.current.position, spriteRef.current.rotation]);

    // Áp dụng góc nghiêng người ngay từ đầu nếu di chuyển xa
    if (distance > 0.2) {
      spriteRef.current.rotation.z = tiltAngle;
      setCurrentFacing(isMovingRight ? 'left' : 'right'); // Quay mặt theo hướng di chuyển (trái/phải map ngược với tọa độ sprite)
    }

    gsap.to(spriteRef.current.position, {
      x: targetX,
      y: targetY,
      z: targetZ,
      duration: 1.4, // Giảm thời gian bay vào/di chuyển xuống 1.4s cho nhanh nhẹn hơn
      delay: delay,
      ease: 'power2.out',
      onComplete: () => {
        setCurrentFacing(desiredFacing); // Trả lại hướng nhìn mặc định khi tiếp đất
      }
    });

    gsap.to(spriteRef.current.rotation, {
      z: 0, // Trở lại đứng thẳng khi tiếp cận đích
      duration: 1.4,
      delay: delay,
      ease: 'power2.out'
    });
  }, [selectedObjectId, roomData, exitDirection, entryDirection, desiredFacing]);

  // Hoạt ảnh robot bay ra khỏi màn hình khi đổi phòng
  useEffect(() => {
    if (exitDirection && spriteRef.current) {
      const targetX = exitDirection === 'forward' ? 6.0 : -6.0;
      const targetY = 1.0;
      const tiltAngle = exitDirection === 'forward' ? -0.25 : 0.25;
      const nextFacing = exitDirection === 'forward' ? 'left' : 'right'; // Quay mặt theo hướng bay đi (forward bay phải -> map 'left', backward bay trái -> map 'right')

      setCurrentFacing(nextFacing);
      gsap.killTweensOf([spriteRef.current.position, spriteRef.current.rotation]);

      gsap.to(spriteRef.current.position, {
        x: targetX,
        y: targetY,
        duration: 1.2, // Giảm thời gian bay ra xuống 1.2s cho dứt khoát
        ease: 'power2.in',
        onComplete: () => {
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

  // Vị trí bắt đầu nếu bay từ phòng khác sang
  const startX = entryDirection ? (entryDirection === 'forward' ? -6.0 : 6.0) : defaultPos.x;
  const startY = entryDirection ? 1.0 : defaultPos.y;

  return (
    <group>
      <group
        ref={spriteRef}
        position={[startX, startY, defaultPos.z]}
        onClick={(e) => {
          e.stopPropagation();
          if (!selectedObjectId && !isEditMode) {
            onMascotClick();
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (!selectedObjectId && !isEditMode) {
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
        }}
      >
        <sprite scale={[0.65, 0.65, 1]} visible={mascotState === 'idle'}>
          <spriteMaterial map={textureIdle} transparent={true} toneMapped={false} depthWrite={false} />
        </sprite>
        <sprite scale={[0.65, 0.65, 1]} visible={mascotState === 'welcome'}>
          <spriteMaterial map={textureWelcome} transparent={true} toneMapped={false} depthWrite={false} />
        </sprite>
        <sprite scale={[0.65, 0.65, 1]} visible={mascotState === 'thinking'}>
          <spriteMaterial map={textureThinking} transparent={true} toneMapped={false} depthWrite={false} />
        </sprite>
        <sprite scale={[0.65, 0.65, 1]} visible={mascotState === 'pointing'}>
          <spriteMaterial map={texturePointing} transparent={true} toneMapped={false} depthWrite={false} />
        </sprite>
      </group>
    </group>
  );
}

export default Mascot;

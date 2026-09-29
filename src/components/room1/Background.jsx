import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { ClampToEdgeWrapping } from 'three';
import gsap from 'gsap';

// Component render mặt phẳng nền 3D tự động phủ kín màn hình (Responsive Plane)
function Background({ url, selectedObjectId, isEditMode }) {
  const { width: canvasWidth, height: canvasHeight } = useThree((state) => state.size);
  const bgRef = useRef();

  // Nạp texture ảnh nền
  const baseTexture = useTexture(url);

  // Tạo bản sao riêng cho ảnh nền và cấu hình tỉ lệ hiển thị
  const texture = React.useMemo(() => {
    if (!baseTexture) return null;
    const tex = baseTexture.clone();
    tex.wrapS = ClampToEdgeWrapping;
    tex.wrapT = ClampToEdgeWrapping;
    // Đặt hệ số bao phủ mở rộng (1.5x) để tránh viền đen khi camera di chuyển lệch tâm
    const factor = 1.5;
    tex.repeat.set(factor, factor);
    tex.offset.set((1 - factor) / 2, (1 - factor) / 2);
    tex.needsUpdate = true;
    return tex;
  }, [baseTexture]);

  // Tính toán kích thước nền cố định độc lập với khoảng cách Z của camera
  const aspect = canvasWidth / canvasHeight;
  const initialDistance = 5;
  const fovInRadians = (50 * Math.PI) / 180;
  const viewHeight = 2 * initialDistance * Math.tan(fovInRadians / 2);

  // Tăng kích thước Mesh hình học lên 1.5 lần nhưng kết cấu hình ảnh ở trung tâm vẫn đúng 1.0x nhờ UV Repeat/Offset
  const bgScale = [viewHeight * aspect * 1.5, viewHeight * 1.5, 1];

  // Hiệu ứng Spotlight: Làm mờ tối nền khi vật phẩm được chọn
  useEffect(() => {
    if (bgRef.current && bgRef.current.material) {
      const targetColor = isEditMode ? 1.0 : (selectedObjectId ? 0.08 : 1.0);
      gsap.to(bgRef.current.material.color, {
        r: targetColor,
        g: targetColor,
        b: targetColor,
        duration: 1.0,
        ease: 'power2.out',
      });
    }
  }, [selectedObjectId, isEditMode]);

  return (
    <mesh ref={bgRef} position={[0, 0, 0]} scale={bgScale}>
      <planeGeometry />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

export default Background;

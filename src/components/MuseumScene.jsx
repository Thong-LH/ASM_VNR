import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Vector3 } from 'three';
import gsap from 'gsap';
import InteractableObject from './InteractableObject';

// Component con hiển thị mặt phẳng nền 3D
function BackgroundPlane({ url, selectedObjectId }) {
  const bgRef = useRef();

  // Nạp texture ảnh nền
  let texture;
  try {
    texture = useTexture(url);
  } catch (error) {
    // Nếu nạp ảnh lỗi (ví dụ chưa có file), ThreeJS sẽ hiển thị màu trơn
    console.warn("Background texture failed to load, falling back to flat color.");
  }

  // Hiệu ứng Spotlight: làm tối nền khi có vật phẩm được chọn
  useEffect(() => {
    if (bgRef.current && bgRef.current.material) {
      const targetColor = selectedObjectId ? 0.08 : 1.0;
      
      gsap.to(bgRef.current.material.color, {
        r: targetColor,
        g: targetColor,
        b: targetColor,
        duration: 1.2,
        ease: 'power2.out',
      });
    }
  }, [selectedObjectId]);

  return (
    <mesh ref={bgRef} position={[0, 0, -1.5]} scale={[12, 8, 1]}>
      <planeGeometry />
      {texture ? (
        <meshBasicMaterial map={texture} toneMapped={false} />
      ) : (
        <meshBasicMaterial color="#111622" />
      )}
    </mesh>
  );
}

export default function MuseumScene({ objects, selectedObjectId, onSelectObject, cameraInitial, background }) {
  const { camera } = useThree();
  
  // Lưu trữ điểm nhìn của Camera (mặc định là tâm vũ trụ [0, 0, 0])
  const lookAtTarget = useRef(new Vector3(0, 0, 0));

  // Cập nhật hướng camera mỗi frame dựa trên lookAtTarget
  useFrame(() => {
    camera.lookAt(lookAtTarget.current);
  });

  useEffect(() => {
    if (selectedObjectId) {
      // Tìm vật thể được click chọn
      const targetObj = objects.find(obj => obj.id === selectedObjectId);
      if (targetObj) {
        // Tọa độ zoom camera lấy từ JSON (tọa độ camera zoom cận cảnh)
        const targetCamPos = new Vector3(...targetObj.zoom_offset);
        // Điểm nhìn của camera lúc này sẽ hướng hơi lệch về phía vật thể
        const targetLookAt = new Vector3(...targetObj.position);

        // Hủy các tween cũ để tránh xung đột
        gsap.killTweensOf([camera.position, lookAtTarget.current]);

        // Animate di chuyển camera
        gsap.to(camera.position, {
          x: targetCamPos.x,
          y: targetCamPos.y,
          z: targetCamPos.z,
          duration: 1.5,
          ease: 'power3.inOut',
        });

        // Animate thay đổi điểm nhìn
        gsap.to(lookAtTarget.current, {
          x: targetLookAt.x,
          y: targetLookAt.y,
          z: targetLookAt.z,
          duration: 1.5,
          ease: 'power3.inOut',
        });
      }
    } else {
      // Reset về góc nhìn toàn cảnh ban đầu
      const [initX, initY, initZ] = cameraInitial.position;

      gsap.killTweensOf([camera.position, lookAtTarget.current]);

      // Trả vị trí camera về mặc định
      gsap.to(camera.position, {
        x: initX,
        y: initY,
        z: initZ,
        duration: 1.2,
        ease: 'power2.inOut',
      });

      // Trả điểm nhìn về tâm [0, 0, 0]
      gsap.to(lookAtTarget.current, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.2,
        ease: 'power2.inOut',
      });
    }
  }, [selectedObjectId, objects, cameraInitial, camera]);

  return (
    <group>
      {/* Tấm nền ảnh 3D phía sau */}
      <BackgroundPlane url={background} selectedObjectId={selectedObjectId} />

      {/* Render danh sách các vật phẩm 2D Parallax phía trước */}
      {objects.map((obj) => (
        <InteractableObject
          key={obj.id}
          id={obj.id}
          imageUrl={obj.image}
          position={obj.position}
          scale={obj.scale || [1, 1, 1]}
          rotation={obj.rotation || [0, 0, 0]}
          onClick={() => onSelectObject(obj.id)}
          isSelected={selectedObjectId === obj.id}
        />
      ))}
    </group>
  );
}

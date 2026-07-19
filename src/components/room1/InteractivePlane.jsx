import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { TransformControls, useTexture } from '@react-three/drei';
import { Vector3, RepeatWrapping } from 'three';

// Component chứa vật thể tương tác 2D
function InteractivePlane({
  id,
  imageUrl,
  position,
  scale,
  isSelected,
  onSelect,
  isEditMode,
  transformMode,
  onUpdateTransform,
  chatOpen
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Tính toán scale tuyệt đối (luôn dương) để tránh culling mặt trong ThreeJS
  const absScale = [Math.abs(scale[0]), scale[1], scale[2]];
  const isFlipped = scale[0] < 0;

  // Nạp texture của ảnh vật phẩm
  const baseTexture = useTexture(imageUrl);

  // Tạo texture riêng biệt cho từng đối tượng và tự động lật UV (mirror) nếu scale X âm
  const texture = React.useMemo(() => {
    if (!baseTexture) return null;
    const tex = baseTexture.clone();
    if (isFlipped) {
      tex.wrapS = RepeatWrapping;
      tex.repeat.x = -1;
      tex.offset.x = 1;
    } else {
      tex.repeat.x = 1;
      tex.offset.x = 0;
    }
    tex.needsUpdate = true;
    return tex;
  }, [baseTexture, isFlipped]);

  const shaderRef = useRef();

  // Hiệu ứng Hover dạng Lerp (Mượt mà như lò xo - Spring) & cập nhật shader uTime
  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }

    if (meshRef.current && !isEditMode) {
      const targetScaleFactor = (hovered && !chatOpen && !isSelected) ? 1.05 : 1.0;
      const targetScale = new Vector3(
        absScale[0] * targetScaleFactor,
        absScale[1] * targetScaleFactor,
        absScale[2]
      );
      meshRef.current.scale.lerp(targetScale, 0.15);
    }
  });

  // Reset hover state when selected
  useEffect(() => {
    if (isSelected) {
      setHovered(false);
    }
  }, [isSelected]);

  // Thay đổi cursor chuột khi hover
  useEffect(() => {
    if (hovered && !isEditMode && !chatOpen && !isSelected) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'auto';
    }
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered, isEditMode, chatOpen, isSelected]);

  // Xử lý sự kiện kéo thả & co giãn trong Edit Mode
  const handleObjectChange = () => {
    if (meshRef.current) {
      const pos = meshRef.current.position;
      const scl = meshRef.current.scale;

      const originalSignX = Math.sign(scale[0]);
      const roundedPos = [
        Math.round(pos.x * 100) / 100,
        Math.round(pos.y * 100) / 100,
        Math.round(pos.z * 100) / 100
      ];
      const roundedScale = [
        Math.round(scl.x * originalSignX * 100) / 100,
        Math.round(scl.y * 100) / 100,
        Math.round(scl.z * 100) / 100
      ];
      onUpdateTransform(id, roundedPos, roundedScale);
    }
  };

  return (
    <group>
      <Suspense fallback={
        <mesh position={position} scale={absScale}>
          <planeGeometry />
          <meshBasicMaterial color="#ff5e3a" transparent opacity={0.2} />
        </mesh>
      }>
        <mesh
          ref={meshRef}
          position={position}
          scale={absScale}
          onClick={(e) => {
            e.stopPropagation();
            if (!isEditMode && !chatOpen && !isSelected) onSelect(id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (!isEditMode && !chatOpen && !isSelected) setHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            if (!isEditMode && !chatOpen) setHovered(false);
          }}
        >
          <planeGeometry />
          {id === 'obj_tv' ? (
            <shaderMaterial
              ref={shaderRef}
              transparent
              toneMapped={false}
              uniforms={{
                uMap: { value: texture },
                uTime: { value: 0 }
              }}
              vertexShader={`
                varying vec2 vUv;
                void main() {
                  vUv = uv;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
              `}
              fragmentShader={`
                uniform sampler2D uMap;
                uniform float uTime;
                varying vec2 vUv;
                
                float random(vec2 co) {
                  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                void main() {
                  vec4 texColor = texture2D(uMap, vUv);
                  // Tăng ngưỡng lọc lên 0.12 và yêu cầu kênh Green phải đủ sáng (> 0.15)
                  // Giúp tránh tuyệt đối việc ăn vào các vùng phản quang màu xám ở mép phải TV
                  float greenness = texColor.g - max(texColor.r, texColor.b);
                  if (greenness > 0.12 && texColor.g > 0.15) {
                    // Tạo nhiễu hạt TV (Static noise) đen trắng động
                    float grain = random(vUv * fract(sin(uTime)));
                    gl_FragColor = vec4(vec3(grain), texColor.a);
                  } else {
                    gl_FragColor = texColor;
                  }
                }
              `}
            />
          ) : (
            <meshBasicMaterial map={texture} transparent toneMapped={false} />
          )}
        </mesh>
      </Suspense>

      {/* Widget hỗ trợ kéo thả & co giãn vật thể trong chế độ Edit Mode */}
      {isEditMode && (
        <TransformControls
          object={meshRef}
          mode={transformMode}
          showZ={false}
          onObjectChange={handleObjectChange}
        />
      )}
    </group>
  );
}

export default InteractivePlane;

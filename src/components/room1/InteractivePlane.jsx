import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { TransformControls, useTexture } from '@react-three/drei';
import { Vector3, RepeatWrapping } from 'three';

// 🎛️ BẢNG ĐIỀU CHỈNH TƯƠNG QUAN QUẢ CẦU & KHUNG ĐẾ (Chỉnh trực tiếp các số ở đây):
const GLOBE_CONFIG = {
  offset: [-0.02, 0.135, 0.01], // Vị trí [X, Y, Z] quả cầu so với khung (X: trái/phải, Y: lên/xuống, Z: nổi trước/sau)
  scale: 0.25,              // Kích thước / Bán kính quả cầu 3D (ví dụ: 0.25, 0.265, 0.28...)
  tiltAngle: -0.5          // Góc nghiêng trục (đơn vị rad, -0.41 rad tương đương 23.5 độ)
};

// Component Quả địa cầu 3D ghép khung (Kẹp chả: Chân đế 2D + Quả cầu 3D xoay)
function Globe3DObject({
  id,
  position,
  scale,
  isSelected,
  anySelected,
  onSelect,
  isEditMode,
  transformMode,
  onUpdateTransform,
  chatOpen
}) {
  const groupRef = useRef();
  const sphereRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0.003 });

  const absScale = [Math.abs(scale[0]), scale[1], scale[2]];

  const standTexture = useTexture('/assets/truc.png');
  const mapTexture = useTexture('/assets/earth_map_texture.jpeg');

  // Quay tự do quanh 1 trục nghiêng độc nhất và giảm tốc quán tính khi thả chuột
  useFrame((state, delta) => {
    if (sphereRef.current) {
      if (!isDragging) {
        sphereRef.current.rotation.y += velocityRef.current.y;
        velocityRef.current.y *= 0.95;
        if (Math.abs(velocityRef.current.y) < 0.002) {
          velocityRef.current.y = 0.002;
        }
      }
    }

    if (groupRef.current && !isEditMode) {
      const targetScaleFactor = (hovered && !chatOpen && !isSelected && !anySelected) ? 1.05 : 1.0;
      const targetScale = new Vector3(
        absScale[0] * targetScaleFactor,
        absScale[1] * targetScaleFactor,
        absScale[2]
      );
      groupRef.current.scale.lerp(targetScale, 0.15);
    }
  });

  // Cursor style
  useEffect(() => {
    if (hovered && !isEditMode && !chatOpen && !isSelected && !anySelected) {
      document.body.style.cursor = isDragging ? 'grabbing' : 'grab';
    } else {
      document.body.style.cursor = 'auto';
    }
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered, isEditMode, chatOpen, isSelected, anySelected, isDragging]);

  const handleSpherePointerDown = (e) => {
    e.stopPropagation();
    if (!isEditMode && !chatOpen) {
      setIsDragging(true);
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleSpherePointerUp = (e) => {
    if (e) e.stopPropagation();
    setIsDragging(false);
  };

  const handleSpherePointerMove = (e) => {
    if (isDragging && sphereRef.current) {
      e.stopPropagation();
      const deltaX = e.clientX - prevMouseRef.current.x;
      // Khóa trục X, chỉ cho phép xoay quanh 1 trục Y của khung nghiêng
      velocityRef.current.y = deltaX * 0.005;
      sphereRef.current.rotation.y += velocityRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleObjectChange = () => {
    if (groupRef.current) {
      const pos = groupRef.current.position;
      const scl = groupRef.current.scale;

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
      <group
        ref={groupRef}
        position={position}
        scale={absScale}
        onClick={(e) => {
          e.stopPropagation();
          if (!isEditMode && !chatOpen && !anySelected) onSelect(id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (!isEditMode && !chatOpen && (!anySelected || isSelected)) setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          if (!isEditMode && !chatOpen) {
            setHovered(false);
            setIsDragging(false);
          }
        }}
      >
        {/* Đèn chiếu sáng riêng biệt làm nổi bật chi tiết bản đồ quả địa cầu */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 3, 5]} intensity={1.8} color="#fff8e7" />

        {/* 1. Mặt sau / Đế (truc.png) - Tỉ lệ chuẩn 667x374 (1.7834:1) không bị bóp méo */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.7834, 1]} />
          <meshBasicMaterial map={standTexture} transparent toneMapped={false} />
        </mesh>

        {/* 2. Quả cầu 3D xoay thật nằm ở trung tâm vòng khung nghiêng */}
        {/* onPointerDown/Move/Up chỉ đặt trên sphere để chỉ drag khi kéo đúng vào quả cầu */}
        <group position={GLOBE_CONFIG.offset} rotation={[0, 0, GLOBE_CONFIG.tiltAngle]}>
          <mesh
            ref={sphereRef}
            scale={[GLOBE_CONFIG.scale, GLOBE_CONFIG.scale, GLOBE_CONFIG.scale]}
            onPointerDown={handleSpherePointerDown}
            onPointerUp={handleSpherePointerUp}
            onPointerMove={handleSpherePointerMove}
            onPointerOut={(e) => { e.stopPropagation(); setIsDragging(false); }}
          >
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial
              map={mapTexture}
              roughness={0.3}
              metalness={0.1}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>

      {isEditMode && (
        <TransformControls
          object={groupRef}
          mode={transformMode}
          showZ={false}
          onObjectChange={handleObjectChange}
        />
      )}
    </group>
  );
}

// Component Cuộn giấy Hành trình Đổi mới (obj_hanhtrinh)
function HanhTrinhObject({
  id,
  position,
  scale,
  isSelected,
  anySelected,
  onSelect,
  isEditMode,
  transformMode,
  onUpdateTransform,
  chatOpen
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const texture = useTexture('/assets/hanhtrinh.png');
  const absScale = [Math.abs(scale[0]), scale[1], scale[2]];

  // Hiệu ứng Lerp mở cuộn giấy (Unroll) mượt mà bằng R3F useFrame
  useFrame((state) => {
    if (meshRef.current && !isEditMode) {
      const targetScaleFactor = (hovered && !chatOpen && !isSelected) ? 1.05 : 1.0;
      
      const targetScale = isSelected
        ? new Vector3(1.4, 0.78, 1) // Kích thước phóng mở phẳng cực đại trong Canvas 3D
        : new Vector3(absScale[0] * targetScaleFactor, 0.045, 1); // Cuộn giấy cuộn tròn dẹt trên bàn

      const targetPos = isSelected
        ? new Vector3(position[0], position[1] + 0.38, position[2] + 0.05) // Dịch lên cao hẳn khi phóng mở
        : new Vector3(position[0], position[1], position[2]); // Vị trí nằm trên bàn

      meshRef.current.scale.lerp(targetScale, 0.12);
      meshRef.current.position.lerp(targetPos, 0.12);
    }
  });

  // Cursor style
  useEffect(() => {
    if (hovered && !isEditMode && !chatOpen && !isSelected) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'auto';
    }
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered, isEditMode, chatOpen, isSelected]);

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
      <mesh
        ref={meshRef}
        position={position}
        scale={[absScale[0], 0.045, 1]} // Khởi tạo dẹt trên bàn
        onClick={(e) => {
          e.stopPropagation();
          if (!isEditMode && !chatOpen && !anySelected) onSelect(id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (!isEditMode && !chatOpen && (!anySelected || isSelected)) setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          if (!isEditMode && !chatOpen) setHovered(false);
        }}
      >
        <planeGeometry />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>

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

// Component Bảng Roadmap lơ lửng (obj_roadmap)
function RoadmapFloatingObject({
  id,
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

  const texture = useTexture('/assets/roadmap.jpg');
  const absScale = [Math.abs(scale[0]), scale[1], scale[2]];

  // Hiệu ứng lơ lửng (Idle Floating) nhẹ nhàng dạng hình sin
  useFrame((state) => {
    if (meshRef.current && !isEditMode) {
      const targetScaleFactor = (hovered && !chatOpen && !isSelected) ? 1.05 : 1.0;
      const floatY = !isSelected ? Math.sin(state.clock.getElapsedTime() * 1.5) * 0.04 : 0;

      const targetScale = new Vector3(
        absScale[0] * targetScaleFactor,
        absScale[1] * targetScaleFactor,
        absScale[2]
      );
      const targetPos = new Vector3(
        position[0],
        position[1] + floatY,
        position[2]
      );

      meshRef.current.scale.lerp(targetScale, 0.15);
      meshRef.current.position.lerp(targetPos, 0.15);
    }
  });

  // Cursor style
  useEffect(() => {
    if (hovered && !isEditMode && !chatOpen && !isSelected) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'auto';
    }
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered, isEditMode, chatOpen, isSelected]);

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
        <planeGeometry args={[1.8, 1]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>

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

// Component chứa vật thể tương tác 2D & 3D
function InteractivePlane({
  id,
  imageUrl,
  position,
  scale,
  isSelected,
  anySelected,
  onSelect,
  isEditMode,
  transformMode,
  onUpdateTransform,
  chatOpen
}) {
  if (id === 'obj_diacau') {
    return (
      <Globe3DObject
        id={id}
        position={position}
        scale={scale}
        isSelected={isSelected}
        anySelected={anySelected}
        onSelect={onSelect}
        isEditMode={isEditMode}
        transformMode={transformMode}
        onUpdateTransform={onUpdateTransform}
        chatOpen={chatOpen}
      />
    );
  }

  if (id === 'obj_hanhtrinh') {
    return (
      <HanhTrinhObject
        id={id}
        position={position}
        scale={scale}
        isSelected={isSelected}
        anySelected={anySelected}
        onSelect={onSelect}
        isEditMode={isEditMode}
        transformMode={transformMode}
        onUpdateTransform={onUpdateTransform}
        chatOpen={chatOpen}
      />
    );
  }

  if (id === 'obj_roadmap') {
    return (
      <RoadmapFloatingObject
        id={id}
        position={position}
        scale={scale}
        isSelected={isSelected}
        onSelect={onSelect}
        isEditMode={isEditMode}
        transformMode={transformMode}
        onUpdateTransform={onUpdateTransform}
        chatOpen={chatOpen}
      />
    );
  }

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
            if (!isEditMode && !chatOpen && !anySelected) onSelect(id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (!isEditMode && !chatOpen && (!anySelected || isSelected)) setHovered(true);
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
                
                // Hàm tạo cát nhiễu chuẩn hóa, tương thích 100% mọi trình duyệt và GPU
                float random(vec2 uv) {
                  return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453123);
                }
                
                void main() {
                  vec4 texColor = texture2D(uMap, vUv);
                  float greenness = texColor.g - max(texColor.r, texColor.b);
                  if (greenness > 0.12 && texColor.g > 0.15) {
                    // Trộn uTime với tọa độ UV để thay đổi hạt nhiễu liên tục theo khung hình
                    float n = random(vUv * 600.0 + vec2(sin(uTime * 8.0), cos(uTime * 5.0)));
                    // Hạt cát nhiễu xám đặc trưng của TV cổ
                    vec3 noiseColor = vec3(0.06 + n * 0.12);
                    gl_FragColor = vec4(noiseColor, texColor.a);
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

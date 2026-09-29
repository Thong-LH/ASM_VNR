import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { TransformControls, useTexture } from '@react-three/drei';
import { Vector3, RepeatWrapping } from 'three';
import gsap from 'gsap';

// 🎛️ BẢNG ĐIỀU CHỈNH TƯƠNG QUAN QUẢ CẦU & KHUNG ĐẾ (Chỉnh trực tiếp các số ở đây):
const GLOBE_CONFIG = {
  offset: [-0.02, 0.135, 0.01], // Vị trí [X, Y, Z] quả cầu so với khung (X: trái/phải, Y: lên/xuống, Z: nổi trước/sau)
  scale: 0.25,                  // Kích thước / Bán kính quả cầu 3D (ví dụ: 0.25, 0.265, 0.28...)
  tiltAngle: -0.5,              // Góc nghiêng trục trái/phải (trục Z, -0.5 rad ≈ 28.6 độ)
  pitchAngle: 0.24,              // Góc chúi xuống / ngửa lên (trục X: tăng số DƯƠNG như 0.2, 0.4 để CHÚI XUỐNG; số ÂM để NGỬA LÊN)
  spinSpeed: 0.002,             // Hướng & tốc độ tự quay (đổi dấu âm -0.002 để đảo ngược chiều quay)
  initialRotationY: 0.0         // Góc xoay ngang ban đầu của bề mặt quả cầu (rad)
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
  const velocityRef = useRef({ x: 0, y: GLOBE_CONFIG.spinSpeed });

  const absScale = [Math.abs(scale[0]), scale[1], scale[2]];

  const standTexture = useTexture('/assets/truc.png');
  const mapTexture = useTexture('/assets/earth_map_texture.jpg');

  // Quay tự do quanh 1 trục nghiêng độc nhất và giảm tốc quán tính khi thả chuột
  useFrame((state, delta) => {
    if (sphereRef.current) {
      if (!isDragging) {
        sphereRef.current.rotation.y += velocityRef.current.y;
        velocityRef.current.y *= 0.95;
        const minSpeed = Math.abs(GLOBE_CONFIG.spinSpeed);
        if (Math.abs(velocityRef.current.y) < minSpeed) {
          velocityRef.current.y = GLOBE_CONFIG.spinSpeed;
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
          if (!isEditMode && !chatOpen && !isSelected) onSelect(id);
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
        <group position={GLOBE_CONFIG.offset} rotation={[GLOBE_CONFIG.pitchAngle, 0, GLOBE_CONFIG.tiltAngle]}>
          <mesh
            ref={sphereRef}
            rotation={[0, GLOBE_CONFIG.initialRotationY, 0]}
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

// 🎛️ BẢNG CONFIG KÍCH THƯỚC [CHIỀU RỘNG, CHIỀU CAO] 2 MẶT BẢNG 3D PHÒNG 2:
// Bạn có thể chỉnh trực tiếp các số tại đây:
export const ROADMAP_BOARD_CONFIG = {
  // Mặt trước (Ảnh 1 - Sơ đồ): [Chiều rộng, Chiều cao]
  frontSize: [2.246, 1],

  // Mặt sau (Ảnh 2 - Lời cảm ơn): [Chiều rộng, Chiều cao]
  // Tỉ lệ gốc chuẩn: 2.13 : 1 (Tăng số đầu để kéo rộng ngang, tăng số sau để kéo dài dọc)
  backSize: [2.13, 1]
};

// Component Bảng Lật 3D 2 Mặt (obj_roadmap)
function RoadmapFloatingObject({
  id,
  imageUrl,
  position,
  scale,
  isSelected,
  onSelect,
  isEditMode,
  transformMode,
  onUpdateTransform,
  chatOpen,
  isFlipped = false,
  setIsFlipped
}) {
  const groupRef = useRef();
  const flipperRef = useRef();
  const [hovered, setHovered] = useState(false);

  const frontTexture = useTexture(imageUrl || '/assets/room2_board_front.png');
  const backTexture = useTexture('/assets/room2_board_back_v2.jpg');

  const absScale = [Math.abs(scale[0]), scale[1], scale[2]];

  // Hiệu ứng GSAP lật 3D quanh trục Y khi isFlipped thay đổi
  useEffect(() => {
    if (flipperRef.current) {
      const targetY = isFlipped ? Math.PI : 0;
      gsap.to(flipperRef.current.rotation, {
        y: targetY,
        duration: 0.75,
        ease: 'power2.inOut'
      });
    }
  }, [isFlipped]);

  // Hiệu ứng lơ lửng (Idle Floating) nhẹ nhàng khi chưa chọn
  useFrame((state) => {
    if (groupRef.current && !isEditMode) {
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

      groupRef.current.scale.lerp(targetScale, 0.15);
      groupRef.current.position.lerp(targetPos, 0.15);
    }
  });

  // Cursor pointer khi hover
  useEffect(() => {
    if (hovered && !isEditMode && !chatOpen) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'auto';
    }
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered, isEditMode, chatOpen]);

  const handlePointerClick = (e) => {
    e.stopPropagation();
    if (isEditMode || chatOpen) return;
    if (!isSelected) {
      onSelect(id);
    } else {
      // Đang zoom vào bảng -> click để lật mặt
      if (setIsFlipped) {
        setIsFlipped(prev => !prev);
      }
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
        onClick={handlePointerClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (!isEditMode && !chatOpen) setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          if (!isEditMode && !chatOpen) setHovered(false);
        }}
      >
        {/* Khung xoay 3D lật 2 mặt */}
        <group ref={flipperRef}>
          {/* 1. Mặt trước (Ảnh 1) */}
          <mesh position={[0, 0, 0.003]}>
            <planeGeometry args={ROADMAP_BOARD_CONFIG.frontSize} />
            <meshBasicMaterial map={frontTexture} transparent toneMapped={false} />
          </mesh>

          {/* 2. Mặt sau (Ảnh 2 - Lời cảm ơn), Xoay 180 độ quanh Y */}
          <mesh position={[0, 0, -0.003]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={ROADMAP_BOARD_CONFIG.backSize} />
            <meshBasicMaterial map={backTexture} transparent toneMapped={false} />
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
  chatOpen,
  isFlipped: isBoardFlipped,
  setIsFlipped: setIsBoardFlipped
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
        imageUrl={imageUrl}
        position={position}
        scale={scale}
        isSelected={isSelected}
        onSelect={onSelect}
        isEditMode={isEditMode}
        transformMode={transformMode}
        onUpdateTransform={onUpdateTransform}
        chatOpen={chatOpen}
        isFlipped={isBoardFlipped}
        setIsFlipped={setIsBoardFlipped}
      />
    );
  }

  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Tính toán scale tuyệt đối (luôn dương) để tránh culling mặt trong ThreeJS
  const absScale = [Math.abs(scale[0]), scale[1], scale[2]];
  const isScaleNegativeX = scale[0] < 0;

  // Nạp texture của ảnh vật phẩm
  const baseTexture = useTexture(imageUrl);

  // Tạo texture riêng biệt cho từng đối tượng và tự động lật UV (mirror) nếu scale X âm
  const texture = React.useMemo(() => {
    if (!baseTexture) return null;
    const tex = baseTexture.clone();
    if (isScaleNegativeX) {
      tex.wrapS = RepeatWrapping;
      tex.repeat.x = -1;
      tex.offset.x = 1;
    } else {
      tex.repeat.x = 1;
      tex.offset.x = 0;
    }
    tex.needsUpdate = true;
    return tex;
  }, [baseTexture, isScaleNegativeX]);

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
                    float n = random(vUv * 600.0 + vec2(sin(uTime * 15.0), cos(uTime * 10.0)));
                    // Tăng độ sáng (từ 0.25 đến 0.65) giúp hạt cát nhiễu nổi bật và rõ nét hơn
                    vec3 noiseColor = vec3(0.25 + n * 0.4);
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

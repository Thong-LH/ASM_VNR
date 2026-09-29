import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Image, Html, TransformControls, useTexture } from '@react-three/drei';
import { Vector3, Color, RepeatWrapping, ClampToEdgeWrapping } from 'three';
import gsap from 'gsap';
import { CornerUpLeft, Edit2, Play, Copy, Check, ChevronDown, MessageSquare, Send, Settings, X } from 'lucide-react';
import initialRoomData from '../data/room_1.json';

// Component render mặt phẳng nền 3D tự động phủ kín màn hình (Responsive Plane)
function Background({ url, selectedObjectId, isEditMode }) {
  const { width: canvasWidth, height: canvasHeight } = useThree((state) => state.size);
  const bgRef = useRef();

  // Nạp texture ảnh nền
  const baseTexture = useTexture(url);

  // Tạo bản sao riêng cho ảnh nền và cấu hình tỉ lệ hiển thị (giữ kích thước gốc ở tâm, kéo dài viền ngoài)
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
  const viewHeight = 2 * initialDistance * Math.tan(fovInRadians / 2); // ~4.66

  // Tăng kích thước Mesh hình học lên 1.5 lần nhưng kết cấu hình ảnh ở trung tâm vẫn đúng 1.0x nhờ UV Repeat/Offset
  const bgScale = [viewHeight * aspect * 1.5, viewHeight * 1.5, 1];

  // Hiệu ứng Spotlight: Làm mờ tối nền khi vật phẩm được chọn
  useEffect(() => {
    if (bgRef.current && bgRef.current.material) {
      // Khi ở chế độ Edit, giữ nền sáng rõ để dễ căn chỉnh
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

// Component chứa vật thể tương tác
function InteractivePlane({
  id,
  imageUrl,
  position,
  scale,
  content,
  isSelected,
  onSelect,
  isEditMode,
  transformMode,
  onUpdateTransform,
  showUI,
  onClose,
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

  // Hiệu ứng Hover dạng Lerp (Mượt mà như lò xo - Spring)
  useFrame(() => {
    if (meshRef.current && !isEditMode) {
      // Phóng to 5% khi hover (nếu không ở trong chế độ chat), ngược lại về scale gốc
      const targetScaleFactor = (hovered && !chatOpen) ? 1.05 : 1.0;
      const targetScale = new Vector3(
        absScale[0] * targetScaleFactor,
        absScale[1] * targetScaleFactor,
        absScale[2]
      );
      meshRef.current.scale.lerp(targetScale, 0.15);
    }
  });

  // Thay đổi cursor chuột khi hover
  useEffect(() => {
    if (hovered && !isEditMode && !chatOpen) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'auto';
    }
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered, isEditMode, chatOpen]);

  // Xử lý sự kiện kéo thả & co giãn trong Edit Mode
  const handleObjectChange = () => {
    if (meshRef.current) {
      const pos = meshRef.current.position;
      const scl = meshRef.current.scale;

      // Giữ nguyên dấu của scale X để phản ánh đúng chiều lật trong JSON
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
            if (!isEditMode && !chatOpen) onSelect(id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (!isEditMode && !chatOpen) setHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            if (!isEditMode && !chatOpen) setHovered(false);
          }}
        >
          <planeGeometry />
          <meshBasicMaterial map={texture} transparent toneMapped={false} />
        </mesh>
      </Suspense>

      {/* Widget hỗ trợ kéo thả & co giãn vật thể trong chế độ Edit Mode */}
      {isEditMode && (
        <TransformControls
          object={meshRef}
          mode={transformMode}
          showZ={false} // Khóa trục Z để kéo thả 2D trên mặt phẳng X, Y
          onObjectChange={handleObjectChange}
        />
      )}
    </group>
  );
}

// Component Trợ lý Robot bay 3D với hiệu ứng Sprite Sheet & Đồng hành
function Mascot({ selectedObjectId, roomData, mascotState, showUI, onClose, onMascotClick, isEditMode }) {
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

  // Xác định hướng nhìn mong muốn của Robot (hướng về phía hiện vật hoặc hướng về phía ô chat)
  const desiredFacing = useMemo(() => {
    return selectedObjectId === 'obj_loa' ? 'left' : 'right';
  }, [selectedObjectId]);

  //welcome có mặc định hướng Trái (cần lật để hướng Phải). Các động tác còn lại mặc định hướng Phải (cần lật để hướng Trái).
  const isIdleFlipped = desiredFacing === 'left';
  const isWelcomeFlipped = desiredFacing === 'right';
  const isThinkingFlipped = desiredFacing === 'left';
  const isPointingFlipped = desiredFacing === 'left';

  // Cấu hình lặp lại texture cho cả 4 ảnh ngang khi component mount hoặc thay đổi hướng quay
  useEffect(() => {
    const multIdle = isIdleFlipped ? -1 : 1;
    const multWelcome = isWelcomeFlipped ? -1 : 1;
    const multThinking = isThinkingFlipped ? -1 : 1;
    const multPointing = isPointingFlipped ? -1 : 1;

    if (textureIdle) {
      textureIdle.wrapS = RepeatWrapping;
      textureIdle.repeat.set(multIdle * (1 / 8), 1);
    }
    if (textureWelcome) {
      textureWelcome.wrapS = RepeatWrapping;
      textureWelcome.repeat.set(multWelcome * (1 / 13), 1);
    }
    if (textureThinking) {
      textureThinking.wrapS = RepeatWrapping;
      textureThinking.repeat.set(multThinking * (1 / 8), 1);
    }
    if (texturePointing) {
      texturePointing.wrapS = RepeatWrapping;
      texturePointing.repeat.set(multPointing * (1 / 7), 1);
    }
  }, [textureIdle, textureWelcome, textureThinking, texturePointing, desiredFacing]);

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

    // Ghi nhận mốc thời gian bắt đầu trạng thái mới
    if (stateStartTimeRef.current === null) {
      stateStartTimeRef.current = time;
    }

    const elapsed = time - stateStartTimeRef.current;

    // 1. Tạo hiệu ứng nhấp nhô lơ lửng tự nhiên cho nhóm Robot
    spriteRef.current.position.y += Math.sin(time * 2.5) * 0.0015;

    // 2. Chạy hoạt ảnh dừng ở khung hình cuối cùng (Không lặp lại) và bù trừ UV nếu lật ngược
    const currentFrame = Math.floor(elapsed * 10);

    if (textureIdle) {
      if (mascotState === 'idle') {
        // Bắt đầu xoay từ sprite 3 (index 2), và dừng hẳn ở sprite 1 (index 0) khi vừa quay tới nơi (ở frame 6) để không bị giật hình
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

  // Di chuyển mượt mà Mascot đến gần hiện vật đang chọn bằng cách di chuyển nhóm bọc ngoài
  useEffect(() => {
    if (!spriteRef.current) return;

    let targetX = defaultPos.x;
    let targetY = defaultPos.y;
    let targetZ = defaultPos.z;

    if (selectedObjectId) {
      const activeObject = roomData.interactive_objects.find(obj => obj.id === selectedObjectId);
      if (activeObject) {
        // Nếu là loa phường ở rìa phải, đậu ở bên phải loa (X + 0.55) sát hơn một chút để tránh bị khuất màn hình
        const isLoa = activeObject.id === 'obj_loa';
        targetX = activeObject.position[0] + (isLoa ? 0.55 : -0.55);
        targetY = activeObject.position[1] + 0.2;
        targetZ = activeObject.position[2] + 0.15;
      }
    }

    gsap.killTweensOf(spriteRef.current.position);
    gsap.to(spriteRef.current.position, {
      x: targetX,
      y: targetY,
      z: targetZ,
      duration: 1.2,
      ease: 'power2.out'
    });
  }, [selectedObjectId, roomData]);

  const activeObject = useMemo(() => {
    if (!selectedObjectId) return null;
    return roomData.interactive_objects.find(obj => obj.id === selectedObjectId);
  }, [selectedObjectId, roomData]);

  return (
    <group>
      <group
        ref={spriteRef}
        position={[defaultPos.x, defaultPos.y, defaultPos.z]}
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
        {/* Sprite Idle */}
        <sprite scale={[0.65, 0.65, 1]} visible={mascotState === 'idle'}>
          <spriteMaterial map={textureIdle} transparent={true} toneMapped={false} depthWrite={false} />
        </sprite>

        {/* Sprite Welcome */}
        <sprite scale={[0.65, 0.65, 1]} visible={mascotState === 'welcome'}>
          <spriteMaterial map={textureWelcome} transparent={true} toneMapped={false} depthWrite={false} />
        </sprite>

        {/* Sprite Thinking */}
        <sprite scale={[0.65, 0.65, 1]} visible={mascotState === 'thinking'}>
          <spriteMaterial map={textureThinking} transparent={true} toneMapped={false} depthWrite={false} />
        </sprite>

        {/* Sprite Pointing */}
        <sprite scale={[0.65, 0.65, 1]} visible={mascotState === 'pointing'}>
          <spriteMaterial map={texturePointing} transparent={true} toneMapped={false} depthWrite={false} />
        </sprite>
      </group>
    </group>
  );
}

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
  onMascotClick
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
        setShowUI(false); // Ẩn UI tạm thời trong lúc di chuyển camera

        const [x, y, z] = targetObj.position;

        // Thiết lập lệch camera tùy theo vật thể để dành không gian cho bảng thông tin
        // Sổ gạo (obj_sogao) và Đồng hồ (obj_saptien) lệch phải -> Đẩy vật thể sang trái màn hình
        // Loa phường (obj_loa) lệch trái -> Đẩy vật thể sang phải màn hình
        // Cấu hình khoảng cách Zoom và độ lệch Camera tùy chỉnh cho từng hiện vật để tránh đè lấp nội dung
        let zoomDist = 1.0;
        let camOffsetX = 0.5;

        if (targetObj.id === 'obj_sogao') {
          zoomDist = 1.25;
          camOffsetX = 0.65; // Đẩy sổ gạo sát biên trái hơn khi zoom xa
        } else if (targetObj.id === 'obj_loa') {
          zoomDist = 1.35;
          camOffsetX = -0.6; // Đẩy loa phường sát biên phải hơn khi zoom xa
        } else if (targetObj.id === 'obj_saptien') {
          zoomDist = 1.0;
          camOffsetX = 0.4;  // Đẩy đồng hồ sát biên trái khi zoom gần
        }

        const targetCamPos = new Vector3(x + camOffsetX, y, z + zoomDist);
        const targetLookAt = new Vector3(x + camOffsetX, y, z);

        gsap.killTweensOf([camera.position, lookAtTarget.current]);

        // Zoom vị trí camera
        gsap.to(camera.position, {
          x: targetCamPos.x,
          y: targetCamPos.y,
          z: targetCamPos.z,
          duration: 1.2,
          ease: 'power2.inOut',
        });

        // Xoay hướng nhìn camera về tâm vật thể
        gsap.to(lookAtTarget.current, {
          x: targetLookAt.x,
          y: targetLookAt.y,
          z: targetLookAt.z,
          duration: 1.2,
          ease: 'power2.inOut',
          onComplete: () => {
            setShowUI(true); // Hiện lại UI sau khi camera đã di chuyển xong
          }
        });
      }
    } else if (chatOpen && !selectedObjectId && !isEditMode) {
      // Zoom 2.5D vào chú Robot Mascot khi đang ở trạng thái Trò chuyện tự do
      setShowUI(false);

      // Điểm đậu mặc định của Robot: [2.2, -0.5, 0.6]
      // Lệch camera sang PHẢI vừa phải (X + 0.22) để Robot đứng gần Khung Chat hơn, zoom gần hơn (Z + 0.85)
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
        onComplete: () => {
          setShowUI(true);
        }
      });
    } else {
      // Khi lùi về toàn cảnh
      setShowUI(false);

      gsap.killTweensOf([camera.position, lookAtTarget.current]);

      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 5,
        duration: 1.2,
        ease: 'power2.inOut',
      });

      gsap.to(lookAtTarget.current, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.2,
        ease: 'power2.inOut',
      });
    }
  }, [selectedObjectId, chatOpen, roomData, isEditMode, camera, setShowUI]);

  return (
    <group>
      {/* Background Plane */}
      <Background
        url={roomData.background.url}
        selectedObjectId={selectedObjectId}
        isEditMode={isEditMode}
      />

      {/* Render các vật thể 2D tương tác */}
      {roomData.interactive_objects.map((obj) => (
        <InteractivePlane
          key={obj.id}
          id={obj.id}
          imageUrl={obj.image_url}
          position={obj.position}
          scale={obj.scale}
          content={obj.content}
          isSelected={selectedObjectId === obj.id}
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
        selectedObjectId={selectedObjectId}
        roomData={roomData}
        mascotState={mascotState}
        showUI={showUI}
        onClose={() => setSelectedObjectId(null)}
        onMascotClick={onMascotClick}
        isEditMode={isEditMode}
      />
    </group>
  );
}

const detailedContent = {
  obj_sogao: {
    title: "Khủng hoảng Lương thực",
    subtitle: "Phao cứu sinh thời bao cấp",
    imageUrl: "/assets/baocap.png",
    paragraphs: [
      "Trong giai đoạn trước Đổi Mới (1976-1985), nền kinh tế Việt Nam rơi vào tình trạng khủng hoảng lương thực vô cùng trầm trọng. Do cơ chế kế hoạch hóa tập trung và ngăn sông cấm chợ, việc phân phối lương thực hoàn toàn phụ thuộc vào Nhà nước.",
      "Cuốn sổ gạo được xem là vật bất ly thân, 'phao cứu sinh' quyết định sự sống còn của mỗi gia đình. Để mua được vài kilôgam gạo mốc hay ngô hột, người dân phải xếp hàng từ tờ mờ sáng, đôi khi phải đặt gạch, nón lá để giữ chỗ suốt nhiều tiếng đồng hồ.",
      "Cơ chế tem phiếu này chỉ thực sự bị xóa bỏ khi Đại hội VI (12/1986) quyết định thực hiện đường lối Đổi Mới toàn diện, chuyển đổi sang nền kinh tế hàng hóa nhiều thành phần vận hành theo cơ chế thị trường."
    ]
  },
  obj_saptien: {
    title: "Lạm Phát Phi Mã 774%",
    subtitle: "Đỉnh điểm khủng hoảng Giá - Lương - Tiền 1986",
    paragraphs: [
      "Sau cuộc cải cách Giá - Lương - Tiền đầy bất ổn cuối năm 1985, nền tài chính quốc gia lâm vào tình trạng mất kiểm soát. Đồng tiền mất giá phi mã từng giờ, kéo theo làn sóng đầu cơ tích trữ hàng hóa nghiêm trọng.",
      "Đỉnh điểm vào năm 1986, chỉ số lạm phát của Việt Nam chạm mốc lịch sử kinh hoàng: 774%. Đây là con số phản ánh rõ nét nhất sự kiệt quệ của mô hình kinh tế cũ, khi giá cả tăng vọt khiến đời sống của người lao động và cán bộ công nhân viên chức vô cùng khốn đốn.",
      "Cơn sốt lạm phát 774% này chính là sức ép to lớn buộc Đảng và Nhà nước phải dũng cảm nhìn thẳng vào sự thật, đưa ra những quyết sách Đổi Mới mang tính bước ngoặt lịch sử tại Đại hội VI."
    ]
  },
  obj_loa: {
    title: "Sức ép Cải tổ & Đổi mới",
    subtitle: "Luồng gió thời đại và khát vọng chuyển mình",
    paragraphs: [
      "Chiếc loa phường thời bao cấp không chỉ là công cụ tuyên truyền các chính sách phân phối tem phiếu, mà còn là phương tiện kết nối người dân với những tin tức chuyển động quốc tế.",
      "Vào những năm cuối thập niên 1980, sức ép đổi mới đè nặng từ cả bên trong lẫn bên ngoài. Trong nước, đời sống nhân dân kiệt quệ dẫn tới nhiều vi phạm pháp luật và làn sóng vượt biên. Trên thế giới, cuộc cách mạng khoa học - kỹ thuật đang bùng nổ mạnh mẽ, đồng thời Liên Xô và các nước XHCN bắt đầu tiến hành công cuộc cải tổ (Perestroika).",
      "Trước bối cảnh sống còn đó, khát vọng đổi mới đã trở thành ý chí chung của toàn dân tộc, mở đường cho những cải cách sâu rộng đưa đất nước hội nhập quốc tế và phát triển phồn vinh."
    ]
  }
};

export default function Room1_BaoCap() {
  const [roomData, setRoomData] = useState(initialRoomData);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [transformMode, setTransformMode] = useState('translate'); // 'translate' | 'scale'
  const [showUI, setShowUI] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Chatbox AI states
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Xin chào! Tôi là hướng dẫn viên tại đây. Giai đoạn 1986–1996 là một trong những chương lịch sử đặc biệt nhất của Việt Nam — từ khủng hoảng kinh tế trầm trọng đến bước ngoặt Đổi Mới. Bạn muốn tìm hiểu điều gì?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextText, setContextText] = useState('');
  const [customApiKey, setCustomApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [mascotState, setMascotState] = useState('idle'); // 'idle' | 'welcome' | 'thinking' | 'pointing'

  const chatEndRef = useRef(null);

  // Hàm phân tích cú pháp tin nhắn: trích xuất các link vật phẩm để render riêng ở dưới, và highlight từ khóa trong văn bản chính
  const parseMessage = (text) => {
    if (!text) return { body: '', links: [] };
    const links = [];
    const linkRegex = /\[(.*?)\]\((obj_.*?)\)/g;
    let match;

    // Trích xuất các liên kết hiện vật
    const matches = [...text.matchAll(linkRegex)];
    for (const m of matches) {
      links.push({ label: m[1], objId: m[2] });
    }

    // Làm sạch văn bản: Loại bỏ các thẻ link [Label](obj_id)
    let cleanedText = text.replace(/\[.*?\]\(obj_.*?\)/g, '');

    // Tinh chỉnh văn bản sau khi xóa link: loại bỏ các cụm giới thiệu liên kết thừa ở cuối câu
    cleanedText = cleanedText.trim();
    cleanedText = cleanedText.replace(/(?:Xem thêm hiện vật liên quan tại|Xem thêm hiện vật tại|Xem thêm hiện vật|Xem thêm tại|Bấm vào|Bấm để xem|Xem hiện vật liên quan|Xem hiện vật tại|Xem hiện vật|Xem tại)\s*$/, '');
    cleanedText = cleanedText.trim();
    cleanedText = cleanedText.replace(/[:\-–—\s]+$/, '');
    cleanedText = cleanedText.trim();

    // Parse highlight từ khóa **bold** trong cleanedText
    const tokens = [];
    let currentIdx = 0;
    const highlightRegex = /\*\*(.*?)\*\*/g;
    let hMatch;

    while ((hMatch = highlightRegex.exec(cleanedText)) !== null) {
      const matchText = hMatch[0];
      const matchIndex = hMatch.index;

      if (matchIndex > currentIdx) {
        tokens.push(cleanedText.substring(currentIdx, matchIndex));
      }

      tokens.push(
        <strong key={matchIndex} className="chat-keyword-highlight">
          {hMatch[1]}
        </strong>
      );
      currentIdx = highlightRegex.lastIndex;
    }

    if (currentIdx < cleanedText.length) {
      tokens.push(cleanedText.substring(currentIdx));
    }

    return {
      body: tokens.length > 0 ? tokens : cleanedText,
      links
    };
  };

  // Quản lý trạng thái Mascot chuyển động cử chỉ
  useEffect(() => {
    if (loading) {
      setMascotState('thinking');
    } else if (selectedObjectId) {
      setMascotState('pointing');
    } else if (chatOpen) {
      setMascotState('welcome');
    } else {
      setMascotState('idle');
    }
  }, [loading, selectedObjectId, chatOpen]);

  // Tải cả file tóm tắt và giáo trình khi ứng dụng khởi chạy
  useEffect(() => {
    Promise.all([
      fetch('/data/summary.txt').then(res => res.text()).catch(() => ""),
      fetch('/data/textbook.txt').then(res => res.text()).catch(() => "")
    ]).then(([summary, textbook]) => {
      setContextText(`${summary}\n\n========================================\n\n${textbook}`);
    }).catch(err => {
      console.error('Không thể tải dữ liệu giáo trình:', err);
    });
  }, []);

  // Cuộn xuống cuối tin nhắn mới
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Bộ máy trả lời offline khi chưa nhập API Key
  const getMockResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('khoán 10') || q.includes('nông nghiệp') || q.includes('khoan 10')) {
      return "Theo tài liệu Chương 3: **Khoán 10** được ban hành vào ngày 5/4/1988 (Nghị quyết số 10-NQ/TW của Bộ Chính trị) về đổi mới quản lý kinh tế nông nghiệp. Nội dung cốt lõi là giao quyền **tự chủ sản xuất** cho hộ nông dân và khoán ruộng ổn định trong 15 năm. Nhờ vậy, từ chỗ thiếu đói, đến năm 1989 Việt Nam đã sản xuất đủ ăn và lần đầu tiên xuất khẩu gạo ra thế giới. Bạn có thể xem thêm hiện vật liên quan tại [Sổ Gạo](obj_sogao).";
    }
    if (q.includes('lạm phát') || q.includes('774') || q.includes('phi mã')) {
      return "Theo tài liệu: Cuối giai đoạn 1975-1986, **lạm phát phi mã** lên đến mức đỉnh điểm 774% vào năm 1986. Tiền mất giá nghiêm trọng, sản xuất đình đốn. Nhờ công cuộc **Đổi mới** sau đó, lạm phát giảm dần: từ 67.1% năm 1991 xuống còn 12.7% năm 1995, giúp đất nước chính thức thoát khỏi khủng hoảng kinh tế - xã hội. Xem thêm hiện vật tại [Sấp tiền lạm phát](obj_saptien).";
    }
    if (q.includes('đại hội 6') || q.includes('đại hội vi') || q.includes('đổi mới') || q.includes('1986')) {
      return "**Đại hội VI** (12/1986) khởi xướng đường lối **Đổi mới toàn diện**, chuyển từ nền kinh tế kế hoạch tập trung bao cấp sang **kinh tế hàng hóa nhiều thành phần**. Để biết thêm về phương tiện tuyên truyền và bối cảnh quốc tế lúc đó, hãy xem [Loa Phường](obj_loa).";
    }
    if (q.includes('sổ gạo') || q.includes('lương thực') || q.includes('bao cấp')) {
      return "Thời **Bao Cấp** (1975-1986), lương thực hàng hóa vô cùng khan hiếm. **Sổ gạo** là phao cứu sinh duy nhất của người dân. Bạn có thể bấm vào [Sổ Gạo](obj_sogao) để quan sát cận cảnh hiện vật này.";
    }
    if (q.includes('mục tiêu') || q.includes('2025') || q.includes('2030') || q.includes('2045')) {
      return "Đại hội XIII đề ra mục tiêu chiến lược phát triển đất nước qua các mốc thời gian: \n- Đến năm 2025: Là nước đang phát triển, có công nghiệp theo hướng hiện đại, vượt qua mức thu nhập trung bình thấp.\n- Đến năm 2030: Là nước đang phát triển, có công nghiệp hiện đại, thu nhập trung bình cao.\n- Đến năm 2045: Trở thành nước phát triển, có thu nhập cao theo định hướng xã hội chủ nghĩa.";
    }

    // Tìm kiếm từ khóa theo từng dòng trong tài liệu giáo trình
    if (contextText) {
      const lines = contextText.split('\n');
      const matchedLines = lines.filter(line =>
        line.length > 20 && q.split(' ').some(word => word.length > 3 && line.toLowerCase().includes(word))
      );
      if (matchedLines.length > 0) {
        return "Tìm thấy thông tin liên quan trong giáo trình:\n\n" + matchedLines.slice(0, 2).join('\n\n');
      }
    }

    return "Tôi là **Hướng dẫn viên ảo**. Hiện tại bạn chưa thiết lập Gemini API Key (hãy click biểu tượng ⚙️ ở đầu khung chat để dán Key miễn phí từ Google AI Studio).\n\nTuy nhiên, dựa trên tóm tắt chương học, tôi có thể giải đáp các câu hỏi chứa từ khóa như: **Đại hội VI**, **Khoán 10**, **Lạm phát 774%**, thời **Bao Cấp**... Bạn có thể khám phá các hiện vật bằng cách bấm: [Sổ Gạo](obj_sogao), [Sấp tiền lạm phát](obj_saptien), hoặc [Loa Phường](obj_loa).";
  };

  // Hàm xử lý gửi tin nhắn
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userQuery = userInput.trim();
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setUserInput('');
    setLoading(true);


    if (customApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${customApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: userQuery }]
                }
              ],
              systemInstruction: {
                parts: [
                  {
                    text: `Bạn là một hướng dẫn viên am hiểu lịch sử tại Bảo tàng Lịch sử Đổi Mới của Việt Nam. Hãy trả lời như một người thực sự hiểu biết — tự nhiên, sinh động, không bao giờ nhắc đến "tài liệu", "văn bản", hay "được cung cấp". Bạn đơn giản là biết những điều này.

Tuân thủ các quy tắc sau:
1. Đi thẳng vào trả lời, không chào hỏi lại ở đầu. Ngắn gọn, súc tích, dưới 180 từ.
2. Chỉ in đậm tối đa 3-4 từ khóa lịch sử quan trọng nhất bằng cú pháp **từ_khóa**. Không lạm dụng.
3. Nếu câu trả lời liên quan đến hiện vật đang trưng bày, thêm liên kết RIÊNG ở dòng CUỐI, KHÔNG nhúng vào giữa câu văn:
[Sổ Gạo](obj_sogao)
[Đồng hồ áp suất](obj_saptien)
[Loa Phường](obj_loa)
4. Nếu câu hỏi nằm ngoài phạm vi lịch sử Việt Nam giai đoạn 1986–nay, hãy lịch sự từ chối.

Kiến thức nền của bạn:
---
${contextText}
---`
                  }
                ]
              }
            })
          }
        );

        if (!response.ok) {
          throw new Error('API request failed');
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          const reply = data.candidates[0].content.parts[0].text;
          setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', text: 'Xin lỗi, tôi gặp sự cố khi giải mã phản hồi.' }]);
        }
      } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, { role: 'assistant', text: 'Có lỗi xảy ra khi kết nối với API Gemini. Vui lòng kiểm tra lại API Key.' }]);
      } finally {
        setLoading(false);
      }
    } else {
      setTimeout(() => {
        const reply = getMockResponse(userQuery);
        setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
        setLoading(false);
      }, 700);
    }
  };

  // Kích hoạt chế độ chỉnh sửa bí mật nếu URL có query tham số ?edit=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true') {
      setIsEditMode(true);
    }
  }, []);

  // Hàm cập nhật cả vị trí và kích thước kéo thả/co giãn từ TransformControls
  const handleUpdateTransform = (id, newPosition, newScale) => {
    setRoomData(prevData => {
      const updatedObjects = prevData.interactive_objects.map(obj => {
        if (obj.id === id) {
          return { ...obj, position: newPosition, scale: newScale };
        }
        return obj;
      });
      return { ...prevData, interactive_objects: updatedObjects };
    });
  };

  // Sao chép JSON đã cập nhật vào clipboard để paste đè lên file room_1.json
  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(roomData, null, 2))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <div className="room-container" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* Thanh Điều hướng Navbar Kính mờ (Glassmorphism) */}
      <header className="museum-navbar">
        <div className="navbar-brand">
          <span className="brand-logo">✦</span>
          <span className="brand-text">Bảo tàng Số 2.5D</span>
        </div>

        <div className="navbar-menu">
          {/* Dropdown Chọn Phòng */}
          <div className="nav-item-dropdown">
            <button
              className="nav-btn active"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Phòng Trưng Bày <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'rotated' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item active"
                  onClick={() => {
                    setDropdownOpen(false);
                    setSelectedObjectId(null); // Quay về toàn cảnh
                  }}
                >
                  Phòng 1: Thời Bao Cấp (Đang xem)
                </button>
                <button
                  className="dropdown-item disabled"
                  onClick={() => {
                    setDropdownOpen(false);
                    setModalContent({
                      title: "Phòng 2: Thời Mở Cửa",
                      desc: "Không gian trưng bày tái hiện thời kỳ Đổi Mới và Mở Cửa Kinh Tế (sau năm 1986) đang trong quá trình thiết kế và sẽ sớm ra mắt."
                    });
                  }}
                >
                  Phòng 2: Thời Mở Cửa (Sắp ra mắt)
                </button>
                <button
                  className="dropdown-item disabled"
                  onClick={() => {
                    setDropdownOpen(false);
                    setModalContent({
                      title: "Phòng 3: Kỷ Nguyên Số",
                      desc: "Không gian trưng bày tương tác về làn sóng Công nghệ thông tin và Kỷ nguyên số hóa tại Việt Nam đang được phát triển."
                    });
                  }}
                >
                  Phòng 3: Kỷ Nguyên Số (Sắp ra mắt)
                </button>
              </div>
            )}
          </div>

          <button
            className="nav-btn"
            onClick={() => {
              setModalContent({
                title: "Trò Chơi Tương Tác",
                desc: "Trò chơi giải đố, câu hỏi trắc nghiệm lịch sử nhận quà ảo về chủ đề cuộc sống thời Bao Cấp đang được xây dựng nhằm tăng trải nghiệm cho khách tham quan."
              });
            }}
          >
            Trò Chơi
          </button>

          <button
            className="nav-btn"
            onClick={() => {
              setModalContent({
                title: "Phụ Lục AI & Hướng Dẫn Viên Ảo",
                desc: "Hệ thống AI Agent tự động phân tích sâu về bối cảnh lịch sử, tương tác hỏi đáp trực tuyến và thuyết minh về các hiện vật cho khách tham quan đang được phát triển kết nối."
              });
            }}
          >
            Phụ Lục AI
          </button>
        </div>

        <div className="navbar-right">
          {/* Chỉ hiển thị bộ chỉnh sửa nếu URL kích hoạt tham số ẩn ?edit=true */}
          {isEditMode ? (
            <div className="editor-controls" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <div className="transform-mode-selector">
                <button
                  className={`mode-btn ${transformMode === 'translate' ? 'active' : ''}`}
                  onClick={() => setTransformMode('translate')}
                >
                  Di chuyển
                </button>
                <button
                  className={`mode-btn ${transformMode === 'scale' ? 'active' : ''}`}
                  onClick={() => setTransformMode('scale')}
                >
                  Co giãn
                </button>
              </div>
              <button
                className="toggle-edit-btn active"
                onClick={() => {
                  setIsEditMode(false);
                  window.history.pushState({}, '', window.location.pathname); // Xóa query param
                }}
              >
                Tắt Chỉnh Sửa
              </button>
            </div>
          ) : (
            <span className="online-badge">● Trực Tuyến</span>
          )}
        </div>
      </header>

      {/* R3F Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => {
          if (!isEditMode) setSelectedObjectId(null);
        }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 5, 5]} intensity={1} />

        <Suspense fallback={
          <Html center>
            <div className="canvas-loading-spinner">
              <div className="spinner"></div>
              <p>Đang tải bảo tàng...</p>
            </div>
          </Html>
        }>
          <Scene
            roomData={roomData}
            selectedObjectId={selectedObjectId}
            setSelectedObjectId={setSelectedObjectId}
            isEditMode={isEditMode}
            transformMode={transformMode}
            onUpdateTransform={handleUpdateTransform}
            showUI={showUI}
            setShowUI={setShowUI}
            mascotState={mascotState}
            chatOpen={chatOpen}
            onMascotClick={() => setChatOpen(true)}
          />
        </Suspense>
      </Canvas>

      {/* UI hướng dẫn chung */}
      {!selectedObjectId && !isEditMode && (
        <div className="hint-text">
          ✦ Click vào vật thể 2D để khám phá chi tiết ✦
        </div>
      )}

      {/* Bảng xuất tọa độ JSON ở chế độ Edit Mode */}
      {isEditMode && (
        <div className="editor-export-panel">
          <p>🔧 Chế độ Chỉnh sửa: Sử dụng các nút bấm ở trên đầu để chuyển đổi giữa kéo di chuyển vị trí và co giãn kích thước.</p>
          <button className="copy-json-btn" onClick={handleCopyJSON}>
            {copied ? <Check size={16} color="#00ff66" /> : <Copy size={16} />}
            {copied ? 'Đã sao chép JSON mới!' : 'Copy cấu hình JSON mới'}
          </button>
        </div>
      )}
      {/* 2D Description Side Panel (Hiện vật thuyết minh) */}
      {selectedObjectId && showUI && !isEditMode && (
        <div className={`museum-side-panel ui-interactive ${selectedObjectId === 'obj_loa' ? 'left-aligned' : ''}`}>
          <button className="side-panel-close-btn" onClick={() => setSelectedObjectId(null)}>
            <X size={18} />
          </button>

          <div className="side-panel-content">
            <span className="panel-badge">Hiện Vật Trưng Bày</span>
            <h2 className="panel-title">
              {detailedContent[selectedObjectId]?.title ||
                roomData.interactive_objects.find(o => o.id === selectedObjectId)?.content.title}
            </h2>
            <h4 className="panel-subtitle">
              {detailedContent[selectedObjectId]?.subtitle || ""}
            </h4>

            <div className="panel-divider"></div>

            <div className="panel-body">
              {detailedContent[selectedObjectId]?.paragraphs.map((p, idx) => (
                <p key={idx} className="panel-paragraph">{p}</p>
              ))}
            </div>

            <button className="panel-action-btn" onClick={() => setSelectedObjectId(null)}>
              Hoàn tất khám phá
            </button>
          </div>
        </div>
      )}



      {/* Modal Popup Thông báo tính năng đang phát triển */}
      {modalContent && (
        <div className="museum-modal-overlay" onClick={() => setModalContent(null)}>
          <div className="museum-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{modalContent.title}</h2>
            <p className="modal-desc">{modalContent.desc}</p>
            <button className="modal-close-btn" onClick={() => setModalContent(null)}>
              Đồng ý
            </button>
          </div>
        </div>
      )}

      {/* Widget Chatbox AI (Bên góc phải) */}
      <div className="ai-chat-widget">
        {chatOpen && (
          <div className="chat-window">
            {/* Header của Khung Chat */}
            <div className="chat-header">
              <div className="chat-header-info">
                <span className="chat-title">Hướng dẫn viên ảo</span>
                <span className="chat-subtitle">● Sẵn sàng hỗ trợ</span>
              </div>
              <div className="chat-header-actions">
                <button
                  className="chat-action-btn"
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  title="Cài đặt API Key"
                >
                  <Settings size={16} />
                </button>
                <button
                  className="chat-action-btn"
                  onClick={() => setChatOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Panel Nhập API Key */}
            {showKeyInput && (
              <div className="api-key-panel">
                <input
                  type="password"
                  className="api-key-input"
                  placeholder="Nhập Gemini API Key từ AI Studio..."
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                />
                <button
                  className="api-key-save-btn"
                  onClick={() => {
                    localStorage.setItem('gemini_api_key', customApiKey);
                    setShowKeyInput(false);
                    alert('Đã lưu API Key thành công!');
                  }}
                >
                  Lưu
                </button>
              </div>
            )}

            {/* Lịch sử tin nhắn */}
            <div className="chat-history">
              {messages.map((msg, index) => {
                const { body, links } = parseMessage(msg.text);
                return (
                  <div key={index} className={`chat-msg ${msg.role}`}>
                    <div className="msg-bubble" style={{ whiteSpace: 'pre-line' }}>
                      {body}
                    </div>
                    {links && links.length > 0 && (
                      <div className="chat-msg-links">
                        <span className="links-label">Hiện vật liên quan:</span>
                        {links.map((link, lIdx) => (
                          <button
                            key={lIdx}
                            className="chat-direct-link-btn"
                            onClick={() => {
                              setSelectedObjectId(link.objId);
                              setChatOpen(false); // Đóng chatbox khi di chuyển xem hiện vật để tuân thủ quy tắc
                            }}
                          >
                            {link.label} 🔍
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {loading && (
                <div className="chat-loading">
                  AI đang tra cứu tài liệu
                  <span className="chat-dot"></span>
                  <span className="chat-dot"></span>
                  <span className="chat-dot"></span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Ô nhập tin nhắn */}
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="chat-input"
                placeholder="Hỏi về thời Bao Cấp, Khoán 10, CNH-HĐH..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={loading || !userInput.trim()}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

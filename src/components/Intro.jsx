import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import './Intro.css';

export default function Intro({ onEnterMuseum }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFadedOut, setIsFadedOut] = useState(false);

  // Chế độ chỉnh sửa: 'sliders' (kéo trượt) hoặc 'photoshop' (chấm điểm vẽ đa giác)
  const [mode, setMode] = useState('sliders');
  const [showEditor, setShowEditor] = useState(false);

  // States cho chế độ Sliders
  const [top, setTop] = useState(65.0);
  const [left, setLeft] = useState(50.4);
  const [width, setWidth] = useState(403);
  const [height, setHeight] = useState(521);
  const [radius, setRadius] = useState(201);

  // States cho chế độ Chấm điểm Photoshop (Lưu tọa độ % của các điểm click)
  const [points, setPoints] = useState([]);

  // Lắng nghe URL parameter ?edit=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true') {
      setShowEditor(true);
    }
  }, []);

  const handleOpenDoor = () => {
    if (showEditor) return; // Đang chỉnh sửa thì không cho kích hoạt chuyển cảnh
    if (isOpen) return;
    
    setIsOpen(true);

    // Xây dựng GSAP Timeline chuyển cảnh Portal bay xuyên qua cửa
    const tl = gsap.timeline({
      onComplete: () => {
        setIsFadedOut(true);
        // Chờ 0.5s sau khi mờ hoàn toàn để unmount màn hình Intro sạch sẽ
        setTimeout(() => {
          onEnterMuseum();
        }, 500);
      }
    });

    // 1. Ẩn nhanh chữ và nút cân chỉnh (0.4 giây)
    tl.to('.intro-header, .editor-toggle-btn, .intro-hint', {
      opacity: 0,
      y: (i, el) => {
        if (el.classList.contains('intro-header')) return -60;
        return 0;
      },
      duration: 0.4,
      ease: 'power2.out'
    }, 0); // Bắt đầu ngay lập tức tại mốc thời gian 0

    // 2. Mở quay 2 cánh cửa gỗ 3D (1.5 giây)
    tl.to('.door-leaf.left', {
      rotateY: -115,
      duration: 1.5,
      ease: 'power2.inOut'
    }, 0); // Bắt đầu xoay cửa ngay lập tức cùng lúc ẩn chữ

    tl.to('.door-leaf.right', {
      rotateY: 115,
      duration: 1.5,
      ease: 'power2.inOut'
    }, '<'); // '<' cho chạy song song cùng lúc với cánh trái

    // 3. Phóng to bức tường (scale: 20) từ tâm vòm cửa để camera đi xuyên vào trong
    tl.to('.intro-wall', {
      scale: 20,
      duration: 1.6,
      ease: 'expo.in'
    }, '-=0.8'); // Bắt đầu zoom sớm khi cửa đang xoay gần xong
  };

  // Thêm điểm khi click trong chế độ Photoshop
  const handleWallClick = (e) => {
    if (mode !== 'photoshop' || !showEditor) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPoints([...points, { x, y }]);
  };

  // Hàm sắp xếp các điểm theo góc cực (polar angle) tăng dần xoay quanh trọng tâm (centroid)
  // Giúp kết nối các điểm theo vòng tròn khép kín, tránh đan chéo đường thẳng gây "nát" ảnh
  const getSortedPoints = (rawPoints) => {
    if (rawPoints.length < 3) return rawPoints;
    
    // 1. Tính trọng tâm (Average Center)
    const cx = rawPoints.reduce((sum, p) => sum + p.x, 0) / rawPoints.length;
    const cy = rawPoints.reduce((sum, p) => sum + p.y, 0) / rawPoints.length;

    // 2. Sắp xếp điểm theo góc quay cực từ -PI đến PI
    return [...rawPoints].sort((a, b) => {
      const angleA = Math.atan2(a.y - cy, a.x - cx);
      const angleB = Math.atan2(b.y - cy, b.x - cx);
      return angleA - angleB;
    });
  };

  // Tính toán các style động dựa vào chế độ hiện tại
  let doorStyle = {};
  let leftLeafStyle = {};
  let rightLeafStyle = {};
  let generatedCSS = '';

  const sortedPoints = getSortedPoints(points);
  const usePhotoshopClip = mode === 'photoshop' && sortedPoints.length >= 3;

  if (usePhotoshopClip) {
    // Chế độ chấm điểm Photoshop (dùng danh sách điểm đã được sắp xếp vòng tròn)
    const xs = sortedPoints.map(p => p.x);
    const ys = sortedPoints.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const w = maxX - minX;
    const h = maxY - minY;

    doorStyle = {
      left: `${minX}%`,
      top: `${minY}%`,
      width: `${w}%`,
      height: `${h}%`,
      transform: 'none', // Không dùng translate(-50%, -50%) để định vị tuyệt đối theo góc trên-trái
    };

    const relativePoints = sortedPoints.map(p => {
      const rx = (((p.x - minX) / w) * 100).toFixed(1);
      const ry = (((p.y - minY) / h) * 100).toFixed(1);
      return `${rx}% ${ry}%`;
    }).join(', ');

    const clipPathVal = `polygon(${relativePoints})`;
    doorStyle.clipPath = clipPathVal;



    // Đưa ra mã CSS tương ứng để copy
    generatedCSS = `.door-frame {
  left: ${minX.toFixed(2)}%;
  top: ${minY.toFixed(2)}%;
  width: ${w.toFixed(2)}%;
  height: ${h.toFixed(2)}%;
  transform: none;
  clip-path: ${clipPathVal};
}
.door-leaf.left, .door-leaf.right {
  border-radius: 0;
}`;
  } else {
    // Chế độ kéo trượt Sliders thường
    doorStyle = {
      top: `${top}%`,
      left: `${left}%`,
      width: `${width}px`,
      height: `${height}px`,
    };
    leftLeafStyle = { borderRadius: `${radius}px 0 0 0` };
    rightLeafStyle = { borderRadius: `0 ${radius}px 0 0` };

    generatedCSS = `.door-frame {
  top: ${top}%;
  left: ${left}%;
  width: ${width}px;
  height: ${height}px;
}
.door-leaf.left {
  border-radius: ${radius}px 0 0 0;
}
.door-leaf.right {
  border-radius: 0 ${radius}px 0 0;
}`;
  }

  return (
    <div className={`intro-container ${isFadedOut ? 'fade-out' : ''}`}>
      
      {/* Nút bật/tắt bảng cân chỉnh nhanh */}
      <button className="editor-toggle-btn" onClick={() => setShowEditor(!showEditor)}>
        {showEditor ? 'Đóng Cân Chỉnh' : 'Cân Chỉnh Cửa (OCD)'}
      </button>

      {/* Bảng điều khiển Slider Cân chỉnh cửa */}
      {showEditor && (
        <div className="door-editor-panel">
          <div className="door-editor-title">
            <span>CÂN CHỈNH CỬA (OCD TOOL)</span>
            <button 
              style={{ background: 'none', border: 'none', color: '#ff5100', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
              onClick={() => {
                setTop(65.0);
                setLeft(50.4);
                setWidth(403);
                setHeight(521);
                setRadius(201);
                setPoints([]);
              }}
            >
              Reset
            </button>
          </div>

          {/* Chọn chế độ cân chỉnh */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button 
              className={`mode-btn ${mode === 'sliders' ? 'active' : ''}`}
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ff5100', background: mode === 'sliders' ? '#ff5100' : 'none', color: '#fff' }}
              onClick={() => setMode('sliders')}
            >
              Kéo Sliders
            </button>
            <button 
              className={`mode-btn ${mode === 'photoshop' ? 'active' : ''}`}
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ff5100', background: mode === 'photoshop' ? '#ff5100' : 'none', color: '#fff' }}
              onClick={() => setMode('photoshop')}
            >
              Chấm Photoshop
            </button>
          </div>

          {mode === 'sliders' ? (
            <>
              <div className="editor-row">
                <label>
                  <span>Chiều cao (Height)</span>
                  <span>{height}px</span>
                </label>
                <input 
                  type="range" min="300" max="600" step="1" 
                  value={height} onChange={(e) => setHeight(parseInt(e.target.value))} 
                />
              </div>

              <div className="editor-row">
                <label>
                  <span>Chiều rộng (Width)</span>
                  <span>{width}px</span>
                </label>
                <input 
                  type="range" min="200" max="450" step="1" 
                  value={width} onChange={(e) => {
                    const w = parseInt(e.target.value);
                    setWidth(w);
                    setRadius(Math.floor(w / 2));
                  }} 
                />
              </div>

              <div className="editor-row">
                <label>
                  <span>Vị trí Dọc (Top)</span>
                  <span>{top}%</span>
                </label>
                <input 
                  type="range" min="40" max="65" step="0.1" 
                  value={top} onChange={(e) => setTop(parseFloat(e.target.value))} 
                />
              </div>

              <div className="editor-row">
                <label>
                  <span>Vị trí Ngang (Left)</span>
                  <span>{left}%</span>
                </label>
                <input 
                  type="range" min="45" max="55" step="0.1" 
                  value={left} onChange={(e) => setLeft(parseFloat(e.target.value))} 
                />
              </div>
            </>
          ) : (
            <div style={{ fontSize: '0.75rem', color: '#ccc', marginBottom: '1rem', lineHeight: '1.4' }}>
              👉 <strong>Hướng dẫn:</strong> Click trực tiếp lên ảnh bức tường gạch để thêm các điểm bao quanh ô cửa (tối thiểu 3 điểm). Click vào một nốt tròn để xóa nốt đó. Cửa sẽ tự động cắt ghép khít khao theo hình đa giác của bạn!
              <div style={{ marginTop: '0.5rem', color: '#ffcc00' }}>
                Số điểm đã chấm: <strong>{points.length}</strong>
              </div>
            </div>
          )}

          <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.5rem' }}>
            * Copy đoạn CSS này sau khi đã cân chỉnh khít:
          </div>
          
          <div className="editor-output" title="Click để chọn tất cả và copy">
            {points.length < 3 && mode === 'photoshop' ? '/* Hãy chấm ít nhất 3 điểm trên ảnh nền */' : generatedCSS}
          </div>
        </div>
      )}

      {/* Lớp nền Bức tường cổ vàng */}
      <div className="intro-wall" style={{ position: 'relative' }} onClick={handleWallClick}>
        
        {/* Lớp phủ SVG vẽ các điểm chấm dạng Photoshop */}
        {mode === 'photoshop' && showEditor && (
          <svg className="editor-svg-overlay">
            {/* Vẽ khối đa giác kết nối các điểm đã được sắp xếp trật tự */}
            {sortedPoints.length > 1 && (
              <polygon
                points={sortedPoints.map(p => `${p.x}%,${p.y}%`).join(' ')}
                fill="rgba(255, 81, 0, 0.25)"
                stroke="#ff5100"
                strokeWidth="2"
              />
            )}
            {/* Vẽ các điểm tròn đầu mút */}
            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={`${p.x}%`}
                cy={`${p.y}%`}
                r="6"
                fill="#00ffcc"
                stroke="#0d0f12"
                strokeWidth="2.5"
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Click trực tiếp vào điểm tròn để xóa
                  setPoints(points.filter((_, i) => i !== idx));
                }}
              />
            ))}
          </svg>
        )}

        {/* Header - Chủ đề giới thiệu */}
        <div className={`intro-header ${isOpen ? 'slide-up' : ''}`}>
          <h1 className="intro-title">ĐỔI MỚI TOÀN DIỆN</h1>
          <p className="intro-subtitle">
            Đưa đất nước ra khỏi khủng hoảng kinh tế - xã hội (1986–1996)
          </p>
        </div>


        {/* Khung cửa đôi 3D */}
        <div 
          className={`door-frame ${isOpen ? 'open' : ''}`} 
          style={doorStyle}
          onClick={handleOpenDoor}
        >
          {/* Cánh cửa bên trái */}
          <div 
            className="door-leaf left" 
            style={leftLeafStyle} 
          />
          <div 
            className="door-leaf right" 
            style={rightLeafStyle} 
          />
        </div>

        {/* Dòng chữ gợi ý mờ nhạt */}
        <div className={`intro-hint ${isOpen ? 'fade-out' : ''}`}>
          Nhấn vào cánh cửa để mở ra lịch sử
        </div>

      </div>
    </div>
  );
}

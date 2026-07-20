import React, { useState } from 'react';
import gsap from 'gsap';
import './Intro.css';

export default function Intro({ onEnterMuseum }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFadedOut, setIsFadedOut] = useState(false);

  const handleOpenDoor = () => {
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

    // 1. Ẩn nhanh chữ và gợi ý (0.4 giây)
    tl.to('.intro-header, .intro-hint', {
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

  const doorStyle = {
    top: '65%',
    left: '50.4%',
    width: '403px',
    height: '521px',
  };
  const leftLeafStyle = { borderRadius: '201px 0 0 0' };
  const rightLeafStyle = { borderRadius: '0 201px 0 0' };

  return (
    <div className={`intro-container ${isFadedOut ? 'fade-out' : ''}`}>
      
      {/* Lớp nền Bức tường cổ vàng */}
      <div className="intro-wall" style={{ position: 'relative' }}>
        
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

import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Panel thuyết minh hiện vật bên phải/trái màn hình (được tái sử dụng cho tất cả các phòng)
function SidePanel({ selectedObjectId, showUI, isEditMode, roomData, onClose, detailedContent, tourActive, tourIndex, tourLength, isLastRoom, onNext, onPrev, onExit, roadmapStage = 0, setRoadmapStage }) {
  const [lightboxImage, setLightboxImage] = React.useState(null);

  if (!selectedObjectId || !showUI || isEditMode || !detailedContent) return null;

  // obj_hanhtrinh: Hiển thị chỉ mini-bar tour ở giữa màn hình, mờ mặc định, rõ khi hover
  if (selectedObjectId === 'obj_hanhtrinh') {
    return (
      <React.Fragment>
        <button
          className="side-panel-close-btn ui-interactive hanhtrinh-close-btn"
          onClick={tourActive ? onExit : onClose}
          style={{ position: 'fixed', top: 20, right: 24, zIndex: 3000, opacity: 0.35, transition: 'opacity 0.35s ease' }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.35}
        >
          <X size={18} />
        </button>
        {tourActive && (
          <div className="museum-tour-mini-bar ui-interactive hanhtrinh-tour-bar">
            <button
              className="tour-mini-btn prev"
              onClick={onPrev}
              disabled={tourIndex === 0}
              title="Hiện vật trước"
            >
              ◀ Trước
            </button>
            <span className="tour-mini-progress">{tourIndex + 1} / {tourLength}</span>
            <button
              className="tour-mini-btn next primary"
              onClick={onNext}
              title={tourIndex === tourLength - 1 && !isLastRoom ? "Sang phòng kế tiếp" : "Hoàn thành tour"}
            >
              {tourIndex === tourLength - 1 && !isLastRoom ? "Sang phòng kế ▶" : "Hoàn thành ✕"}
            </button>
            <button className="tour-mini-btn exit" onClick={onExit} title="Thoát Tour">✕</button>
          </div>
        )}
      </React.Fragment>
    );
  }

  // Nếu hiện vật nằm ở góc bên phải, ta lật Panel thuyết minh sang trái để không bị đè lên nhau
  const isRightAlignedObj = selectedObjectId === 'obj_loa' || selectedObjectId === 'obj_radio' || selectedObjectId === 'obj_diacau';

  // Lấy dữ liệu theo chặng nếu là obj_roadmap
  const roadmapData = detailedContent['obj_roadmap'];
  const currentStageData = (selectedObjectId === 'obj_roadmap' && roadmapStage > 0)
    ? roadmapData?.stages?.find(s => s.id === roadmapStage)
    : null;

  const title = currentStageData?.title || detailedContent[selectedObjectId]?.title || roomData.interactive_objects.find(o => o.id === selectedObjectId)?.content.title;
  const subtitle = currentStageData?.subtitle || detailedContent[selectedObjectId]?.subtitle || "";
  const paragraphs = currentStageData?.paragraphs || detailedContent[selectedObjectId]?.paragraphs || [];

  return (
    <React.Fragment>
      <div className={`museum-side-panel ui-interactive ${isRightAlignedObj ? 'left-aligned' : ''} ${tourActive ? 'tour-active-adjust' : ''}`}>
        <button className="side-panel-close-btn" onClick={tourActive ? onExit : onClose}>
          <X size={18} />
        </button>

        <div className="side-panel-content">
          <span className="panel-badge">
            {selectedObjectId === 'obj_roadmap' && roadmapStage > 0 ? `Lộ Trình Z-Pattern — ${roadmapStage}/4` : "Hiện Vật Trưng Bày"}
          </span>
          <h2 className="panel-title">{title}</h2>
          <h4 className="panel-subtitle">{subtitle}</h4>

          <div className="panel-divider"></div>

          <div className="panel-body">
            {paragraphs.map((p, idx) => {
              const isTargetParagraph = selectedObjectId === 'obj_sogao'
                ? (p.includes("Lương thực, thực phẩm") || p.includes("đôi khi phải đặt gạch"))
                : (idx === 0);

              return (
                <React.Fragment key={idx}>
                  <p className="panel-paragraph">{p}</p>
                  {isTargetParagraph && detailedContent[selectedObjectId]?.imageUrl && selectedObjectId !== 'obj_roadmap' && (
                    <div
                      className="panel-image-container"
                      style={{
                        margin: '1.2rem auto',
                        width: '75%',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.15)',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        transition: 'transform 0.2s, border-color 0.2s'
                      }}
                      onClick={() => setLightboxImage(detailedContent[selectedObjectId].imageUrl)}
                      title="Click để phóng to xem chi tiết"
                    >
                      <img
                        src={detailedContent[selectedObjectId].imageUrl}
                        alt={detailedContent[selectedObjectId].title}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Nút kích hoạt / chuyển chặng Z-Pattern cho Roadmap */}
            {selectedObjectId === 'obj_roadmap' && setRoadmapStage && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                {roadmapStage === 0 && (
                  <button
                    onClick={() => setRoadmapStage(1)}
                    style={{
                      background: 'linear-gradient(135deg, #00ffcc 0%, #00b386 100%)',
                      color: '#0a192f',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(0, 255, 204, 0.3)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    ▶ Bắt đầu Chuyến tham quan Z-Pattern
                  </button>
                )}
                {roadmapStage > 0 && roadmapStage < 4 && (
                  <button
                    onClick={() => setRoadmapStage(roadmapStage + 1)}
                    style={{
                      background: 'linear-gradient(135deg, #ff7b00 0%, #ff4500 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(255, 123, 0, 0.3)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {roadmapStage === 1 && "▶ Sang Chặng 2: Đại hội VI"}
                    {roadmapStage === 2 && "▶ Sang Chặng 3: Bứt phá Khoán 10"}
                    {roadmapStage === 3 && "▶ Sang Chặng 4: Thành tựu & Hội nhập"}
                  </button>
                )}
                {roadmapStage === 4 && (
                  <button
                    onClick={() => { setRoadmapStage(0); onClose(); }}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    🎉 Hoàn thành Chuyến tham quan
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thanh công cụ mini-tour nằm tách biệt trực quan ở phía dưới khối nội dung */}
      {tourActive && (
        <div className={`museum-tour-mini-bar ui-interactive ${isRightAlignedObj ? 'left-aligned' : ''}`}>
          <button
            className="tour-mini-btn prev"
            onClick={onPrev}
            disabled={tourIndex === 0}
            title="Hiện vật trước"
          >
            ◀ Trước
          </button>

          <span className="tour-mini-progress">
            {tourIndex + 1} / {tourLength}
          </span>

          <button
            className="tour-mini-btn next primary"
            onClick={onNext}
            title={tourIndex === tourLength - 1 && !isLastRoom ? "Sang phòng kế tiếp" : "Hoàn thành tour"}
          >
            {tourIndex === tourLength - 1 && !isLastRoom ? "Sang phòng kế ▶" : "Hoàn thành ✕"}
          </button>

          <button
            className="tour-mini-btn exit"
            onClick={onExit}
            title="Thoát Tour"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hộp Modal Lightbox phóng to ảnh khi click - Dùng React Portal để thoát ly khung giới hạn của SidePanel */}
      {lightboxImage && createPortal(
        <div
          className="lightbox-overlay ui-interactive"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.93)',
            zIndex: 999999, // Đảm bảo đè lên mọi lớp 3D và UI khác
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'fadeIn 0.25s ease'
          }}
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="lightbox-content"
            style={{
              position: 'relative',
              maxWidth: '92vw',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage}
              alt="Phóng to ảnh tư liệu"
              style={{
                width: '75vw',     // Ép ảnh phóng to lên chiếm 75% chiều rộng màn hình (to gấp 3 lần cũ)
                maxWidth: '2000px', // Ngưỡng rộng tối đa để ảnh sắc nét
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 12px 45px rgba(0,0,0,0.9)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}
            />
            <p style={{ color: '#cbd5e0', marginTop: '1.2rem', fontSize: '0.95rem', fontStyle: 'italic', letterSpacing: '0.05em' }}>
              ✦ Click bất kỳ đâu phía ngoài để đóng ảnh ✦
            </p>
            <button
              style={{
                position: 'absolute',
                top: '-45px',
                right: '0',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                color: 'white',
                padding: '6px 16px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'background 0.2s'
              }}
              onClick={() => setLightboxImage(null)}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              Đóng ✕
            </button>
          </div>
        </div>,
        document.body
      )}
    </React.Fragment>
  );
}

export default SidePanel;

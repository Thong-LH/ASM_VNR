import React from 'react';
import { Maximize2, Plus } from 'lucide-react';

/**
 * ThreeStageTimeline Component
 * Biểu đồ 3 Giai đoạn Lịch sử:
 * - Khung dán ảnh chân dung (trên cùng)
 * - Tên nhân vật/giai đoạn (ở giữa)
 * - Tam giác 2.5D thu gọn chứa Logo biểu tượng
 * - Tia sáng sợi siêu mỏng 1.5px mờ dần về vô cùng (Infinite Fade-out Laser Threads)
 * - Không có header hay thanh ray đáy dư thừa
 *
 * @param {Object} images - { stage1: string, stage2: string, stage3: string } (optional photo URLs)
 * @param {Function} onPhotoClick - callback khi click vào ảnh phóng to
 */
const DEFAULT_STAGE_IMAGES = {
  stage1: '/assets/stage1_tuyen_ngon_cong_san.png',
  stage2: '/assets/stage2_luan_cuong_lenin.jpg',
  stage3: '/assets/stage3_duong_kach_menh.png'
};

export default function ThreeStageTimeline({ images = {}, onPhotoClick }) {
  const activeImages = {
    stage1: images.stage1 !== undefined ? images.stage1 : DEFAULT_STAGE_IMAGES.stage1,
    stage2: images.stage2 !== undefined ? images.stage2 : DEFAULT_STAGE_IMAGES.stage2,
    stage3: images.stage3 !== undefined ? images.stage3 : DEFAULT_STAGE_IMAGES.stage3
  };

  const handleImageClick = (stageKey, title) => {
    const url = activeImages[stageKey];
    if (url && onPhotoClick) {
      onPhotoClick({ url, title });
    }
  };

  return (
    <div className="three-stage-timeline-wrapper">
      {/* 3 Cột Giai đoạn */}
      <div className="three-stage-grid">
        {/* ==================== GIAI ĐOẠN 01 (EMERALD) ==================== */}
        <div className="stage-column stage-1">
          {/* KHUNG DÁN HÌNH ẢNH */}
          <div className="stage-photo-slot-wrap">
            <div
              className={`stage-photo-slot ${activeImages.stage1 ? 'has-image' : ''}`}
              onClick={() => handleImageClick('stage1', 'Tác phẩm: Tuyên ngôn của Đảng Cộng sản — C.Mác & Ph.Ăng-ghen (1848)')}
              title={activeImages.stage1 ? 'Click phóng to tài liệu' : 'Khung dán ảnh Mác - Ăng-ghen'}
            >
              {activeImages.stage1 ? (
                <div className="stage-photo-img-wrap">
                  <img src={activeImages.stage1} alt="C.Mác & Ph.Ăng-ghen" className="stage-photo-img" />
                  <div className="stage-photo-zoom-btn">
                    <Maximize2 size={13} />
                  </div>
                </div>
              ) : (
                <div className="stage-photo-placeholder">
                  <div className="stage-photo-plus-icon">
                    <Plus size={16} strokeWidth={2.5} />
                  </div>
                  <span className="stage-photo-slot-label">+ DÁN HÌNH ẢNH</span>
                  <span className="stage-photo-sublabel">Mác - Ăng-ghen</span>
                </div>
              )}
            </div>
          </div>

          {/* TÊN NHÂN VẬT ĐẶT DƯỚI ẢNH, TRÊN TAM GIÁC */}
          <h4 className="stage-person-name">C.MÁC & PH.ĂNG-GHEN</h4>

          {/* BỆ 2.5D TAM GIÁC NGƯỢC THU GỌN - CHỈ CHỨA LOGO */}
          <div className="stage-prism-container">
            {/* Nắp vát 3D đục */}
            <div className="stage-prism-top-lid">
              <svg className="stage-prism-top-lid-poly" viewBox="0 0 120 10" preserveAspectRatio="none">
                <polygon points="10,0 110,0 120,10 0,10" fill="#144e39" stroke="#34d399" strokeWidth="1.2" />
                <line x1="60" y1="0" x2="60" y2="10" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                <line x1="10" y1="0" x2="110" y2="0" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
              </svg>
            </div>

            {/* Thân lăng kính tam giác ngược thu gọn */}
            <div className="stage-prism-body-wrap">
              <div className="stage-prism-triangle-3d">
                <div className="prism-facet-left"></div>
                <div className="prism-facet-right"></div>
                <div className="prism-center-ridge"></div>

                {/* Chỉ chứa Logo biểu tượng */}
                <div className="prism-logo-wrap">
                  <div className="stage-prism-icon-box">
                    <svg className="stage-crest-svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M19.4 13a7.87 7.87 0 0 0 .05-1 7.87 7.87 0 0 0-.05-1l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1a7.96 7.96 0 0 0-1.73-1l-.38-2.65A.488.488 0 0 0 13.92 2h-4c-.25 0-.46.18-.49.43l-.38 2.65c-.63.25-1.22.59-1.73 1l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.45 11c-.04.33-.05.67-.05 1s.01.67.05 1l-2.11 1.65c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.41 1.1.75 1.73 1l.38 2.65c.03.25.24.43.49.43h4c.25 0 .46-.18.49-.43l.38-2.65c.63-.26 1.21-.59 1.73-1l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64L19.4 13zm-7.4 3.5c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5 4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Khung viền vector */}
              <svg className="stage-prism-wireframe-svg" viewBox="0 0 120 78" preserveAspectRatio="none">
                <polygon points="0,0 120,0 60,78" fill="none" stroke="#34d399" strokeWidth="1.6" />
                <line x1="60" y1="0" x2="60" y2="78" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
              </svg>
            </div>

            {/* TIA SÁNG SỢI SIÊU MỎNG PHÁT SÁNG VÀ MỜ DẦN VỀ VÔ HẠN */}
            <div className="stage-infinite-beam-container">
              <div className="stage-beam-emitter emerald"></div>
              <div className="stage-beam-laser-thread emerald"></div>
              <div className="stage-beam-aura emerald"></div>
            </div>
          </div>
        </div>

        {/* ==================== GIAI ĐOẠN 02 (TEAL) ==================== */}
        <div className="stage-column stage-2">
          {/* KHUNG DÁN HÌNH ẢNH */}
          <div className="stage-photo-slot-wrap">
            <div
              className={`stage-photo-slot ${activeImages.stage2 ? 'has-image' : ''}`}
              onClick={() => handleImageClick('stage2', 'Tác phẩm: Sơ thảo Luận cương về vấn đề dân tộc và thuộc địa — V.I. Lênin (1920)')}
              title={activeImages.stage2 ? 'Click phóng to tài liệu' : 'Khung dán ảnh Lênin'}
            >
              {activeImages.stage2 ? (
                <div className="stage-photo-img-wrap">
                  <img src={activeImages.stage2} alt="V.I. Lênin" className="stage-photo-img" />
                  <div className="stage-photo-zoom-btn">
                    <Maximize2 size={13} />
                  </div>
                </div>
              ) : (
                <div className="stage-photo-placeholder">
                  <div className="stage-photo-plus-icon teal">
                    <Plus size={16} strokeWidth={2.5} />
                  </div>
                  <span className="stage-photo-slot-label teal">+ DÁN HÌNH ẢNH</span>
                  <span className="stage-photo-sublabel teal">V.I. Lênin</span>
                </div>
              )}
            </div>
          </div>

          {/* TÊN NHÂN VẬT */}
          <h4 className="stage-person-name teal">V.I. LÊNIN</h4>

          {/* BỆ 2.5D TAM GIÁC NGƯỢC THU GỌN - CHỈ CHỨA LOGO */}
          <div className="stage-prism-container">
            {/* Nắp vát 3D đục */}
            <div className="stage-prism-top-lid">
              <svg className="stage-prism-top-lid-poly" viewBox="0 0 120 10" preserveAspectRatio="none">
                <polygon points="10,0 110,0 120,10 0,10" fill="#104444" stroke="#2dd4bf" strokeWidth="1.2" />
                <line x1="60" y1="0" x2="60" y2="10" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                <line x1="10" y1="0" x2="110" y2="0" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
              </svg>
            </div>

            {/* Thân lăng kính tam giác ngược thu gọn */}
            <div className="stage-prism-body-wrap">
              <div className="stage-prism-triangle-3d">
                <div className="prism-facet-left"></div>
                <div className="prism-facet-right"></div>
                <div className="prism-center-ridge"></div>

                {/* Chỉ chứa Logo biểu tượng */}
                <div className="prism-logo-wrap">
                  <div className="stage-prism-icon-box teal">
                    <svg className="stage-crest-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3.6 9h16.8M3.6 15h16.8M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18" />
                      <path d="M7 12h10" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Khung viền vector */}
              <svg className="stage-prism-wireframe-svg" viewBox="0 0 120 78" preserveAspectRatio="none">
                <polygon points="0,0 120,0 60,78" fill="none" stroke="#2dd4bf" strokeWidth="1.6" />
                <line x1="60" y1="0" x2="60" y2="78" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
              </svg>
            </div>

            {/* TIA SÁNG SỢI SIÊU MỎNG PHÁT SÁNG VÀ MỜ DẦN VỀ VÔ HẠN */}
            <div className="stage-infinite-beam-container">
              <div className="stage-beam-emitter teal"></div>
              <div className="stage-beam-laser-thread teal"></div>
              <div className="stage-beam-aura teal"></div>
            </div>
          </div>
        </div>

        {/* ==================== GIAI ĐOẠN 03 (ORANGE / GOLD - ĐỈNH CAO) ==================== */}
        <div className="stage-column stage-3">
          {/* KHUNG DÁN HÌNH ẢNH */}
          <div className="stage-photo-slot-wrap">
            <div
              className={`stage-photo-slot orange ${activeImages.stage3 ? 'has-image' : ''}`}
              onClick={() => handleImageClick('stage3', 'Tác phẩm: Đường Kách Mệnh — Nguyễn Ái Quốc / Hồ Chí Minh (1927)')}
              title={activeImages.stage3 ? 'Click phóng to tài liệu' : 'Khung dán ảnh Bác Hồ'}
            >
              <div className="stage-crown-star-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.6 6.3 6.8.6-5.1 4.5 1.5 6.6-5.8-3.4-5.8 3.4 1.5-6.6-5.1-4.5 6.8-.6L12 2z" />
                </svg>
              </div>

              {activeImages.stage3 ? (
                <div className="stage-photo-img-wrap">
                  <img src={activeImages.stage3} alt="Hồ Chí Minh" className="stage-photo-img" />
                  <div className="stage-photo-zoom-btn">
                    <Maximize2 size={13} />
                  </div>
                </div>
              ) : (
                <div className="stage-photo-placeholder">
                  <div className="stage-photo-plus-icon orange">
                    <Plus size={16} strokeWidth={2.5} />
                  </div>
                  <span className="stage-photo-slot-label orange">+ DÁN HÌNH ẢNH</span>
                  <span className="stage-photo-sublabel orange">Hồ Chí Minh</span>
                </div>
              )}
            </div>
          </div>

          {/* TÊN NHÂN VẬT */}
          <h4 className="stage-person-name orange">HỒ CHÍ MINH</h4>

          {/* BỆ 2.5D TAM GIÁC NGƯỢC THU GỌN - CHỈ CHỨA LOGO */}
          <div className="stage-prism-container">
            {/* Nắp vát 3D đục */}
            <div className="stage-prism-top-lid">
              <svg className="stage-prism-top-lid-poly" viewBox="0 0 120 10" preserveAspectRatio="none">
                <polygon points="10,0 110,0 120,10 0,10" fill="#542107" stroke="#f97316" strokeWidth="1.3" />
                <line x1="60" y1="0" x2="60" y2="10" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
                <line x1="10" y1="0" x2="110" y2="0" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
              </svg>
            </div>

            {/* Thân lăng kính tam giác ngược thu gọn */}
            <div className="stage-prism-body-wrap">
              <div className="stage-prism-triangle-3d">
                <div className="prism-facet-left"></div>
                <div className="prism-facet-right"></div>
                <div className="prism-center-ridge"></div>

                {/* Chỉ chứa Logo biểu tượng */}
                <div className="prism-logo-wrap">
                  <div className="stage-prism-icon-box orange">
                    <svg className="stage-crest-svg" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#fde047' }}>
                      <path d="M12 1.75l3.18 6.45 7.12 1.04-5.15 5.02 1.22 7.09L12 18l-6.37 3.35 1.22-7.09-5.15-5.02 7.12-1.04L12 1.75z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Khung viền vector */}
              <svg className="stage-prism-wireframe-svg" viewBox="0 0 120 78" preserveAspectRatio="none">
                <polygon points="0,0 120,0 60,78" fill="none" stroke="#f97316" strokeWidth="1.8" />
                <line x1="60" y1="0" x2="60" y2="78" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
              </svg>
            </div>

            {/* TIA SÁNG SỢI SIÊU MỎNG PHÁT SÁNG VÀ MỜ DẦN VỀ VÔ HẠN */}
            <div className="stage-infinite-beam-container">
              <div className="stage-beam-emitter orange"></div>
              <div className="stage-beam-laser-thread orange"></div>
              <div className="stage-beam-aura orange"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

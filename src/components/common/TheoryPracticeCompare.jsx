import React from 'react';

/**
 * TheoryPracticeCompare Component
 * Phong cách Typography Bảo tàng Cổ điển (Editorial Pure Typography)
 * - Cột trái: Đối chiếu thực tiễn (Công nhân, Nông dân, Tư sản dân tộc & Nhân sĩ)
 * - Cột phải: Bước ngoặt Logic (Mô hình kinh điển phương Tây vs Sáng tạo Hồ Chí Minh)
 * - Thuần chữ phân cấp nghệ thuật, không dùng tag viên thuốc (Pill/Capsule badges)
 */
export default function TheoryPracticeCompare() {
  return (
    <div className="tp-editorial-container">
      {/* ==================== CỘT TRÁI: ĐỐI CHIẾU THỰC TIỄN ==================== */}
      <div className="tp-editorial-col left-col">
        <div className="tp-col-title-wrap">
          <h4 className="tp-col-main-title">THỰC TIỄN VIỆT NAM ĐẦU THẾ KỶ XX</h4>
        </div>

        <div className="tp-text-list">
          {/* MỤC 1: CÔNG NHÂN */}
          <div className="tp-text-item">
            <div className="tp-item-headline">
              <span className="tp-bullet emerald">•</span>
              <span className="tp-item-name emerald">CÔNG NHÂN (~1%):</span>
            </div>
            <p className="tp-item-desc">
              Tiên phong lãnh đạo nhưng số lượng quá mỏng; xuất thân từ nông dân.
            </p>
          </div>

          {/* MỤC 2: NÔNG DÂN */}
          <div className="tp-text-item">
            <div className="tp-item-headline">
              <span className="tp-bullet amber">•</span>
              <span className="tp-item-name amber">NÔNG DÂN (~90%):</span>
            </div>
            <p className="tp-item-desc">
              Bị bần cùng hóa, tước đoạt tư liệu sản xuất; chịu chung cảnh áp bức.
            </p>
          </div>

          {/* MỤC 3: TƯ SẢN DÂN TỘC & NHÂN SĨ */}
          <div className="tp-text-item">
            <div className="tp-item-headline">
              <span className="tp-bullet purple">•</span>
              <span className="tp-item-name purple">TƯ SẢN DÂN TỘC & NHÂN SĨ:</span>
            </div>
            <p className="tp-item-desc">
              Bị tư bản Pháp chèn ép, mang lòng yêu nước; bài xích cực đoan sẽ đẩy họ về phía kẻ thù.
            </p>
          </div>
        </div>
      </div>

      {/* ĐƯỜNG PHÂN CÁCH DỌC */}
      <div className="tp-editorial-divider"></div>

      {/* ==================== CỘT PHẢI: BƯỚC NGOẶT LOGIC ==================== */}
      <div className="tp-editorial-col right-col">
        <div className="tp-col-title-wrap">
          <h4 className="tp-col-main-title">VẬN DỤNG SÁNG TẠO</h4>
        </div>

        <div className="tp-logic-flow-wrap">
          {/* KHỐI 1: MÔ HÌNH KINH ĐIỂN PHƯƠNG TÂY */}
          <div className="tp-logic-block western-block">
            <h5 className="tp-logic-heading western">MÔ HÌNH KINH ĐIỂN PHƯƠNG TÂY:</h5>
            <div className="tp-vertical-flow western">
              <div className="tp-flow-line">
                <span className="tp-flow-text">Đấu tranh giai cấp</span>
              </div>
              <div className="tp-flow-arrow-down">▼</div>
              <div className="tp-flow-line">
                <span className="tp-flow-text">Giải phóng giai cấp</span>
              </div>
              <div className="tp-flow-arrow-down">▼</div>
              <div className="tp-flow-line">
                <span className="tp-flow-text">Giải phóng con người</span>
              </div>
            </div>
          </div>

          {/* VẠCH NGĂN NẰM NGANG NGHỆ THUẬT */}
          <div className="tp-logic-separator"></div>

          {/* KHỐI 2: SÁNG TẠO HỒ CHÍ MINH */}
          <div className="tp-logic-block hcm-block">
            <h5 className="tp-logic-heading hcm">SÁNG TẠO HỒ CHÍ MINH:</h5>
            <div className="tp-vertical-flow hcm">
              <div className="tp-flow-line hcm-base">
                <span className="tp-flow-text hcm-all">ĐẠI ĐOÀN KẾT TOÀN DÂN</span>
              </div>
              <div className="tp-flow-arrow-down hcm">▼</div>
              <div className="tp-flow-line hcm-key">
                <span className="tp-flow-text hcm-gold">★ GIẢI PHÓNG DÂN TỘC</span>
                <span className="tp-flow-subtext">(Tiền đề trước hết)</span>
              </div>
              <div className="tp-flow-arrow-down hcm">▼</div>
              <div className="tp-flow-line hcm-end">
                <span className="tp-flow-text">Giải phóng giai cấp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

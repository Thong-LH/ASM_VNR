import React from 'react';
import { Maximize2 } from 'lucide-react';

/**
 * GlobeCoreLessons Component
 * Phong cách Typography & Thẻ Trưng bày Bảo tàng Cao cấp
 * - Cột trái (56%): 3 Thẻ bài học kinh nghiệm cốt lõi (Trải đều chiều cao)
 * - Cột phải (44%): Khung ảnh tư liệu lưu trữ Quốc gia (Trải đều chiều cao)
 */
export default function GlobeCoreLessons({ data, onPhotoClick }) {
  const photo = data?.archivalPhoto || {
    url: "/assets/bai_hoc_dai_doan_ket.webp",
    title: "Đại hội Đoàn kết toàn dân tộc / Mặt trận Tổ quốc Việt Nam",
    description: "Mốc son khẳng định ý chí thống nhất non sông, quy tụ muôn triệu con tim yêu nước dưới ngọn cờ chung của độc lập và chủ nghĩa xã hội."
  };

  const lessons = [
    {
      id: 1,
      num: "01",
      accent: "emerald",
      title: "PHÁT HUY NGUỒN LỰC TOÀN DÂN",
      desc: "Mở rộng khối đại đoàn kết mọi tầng lớp, đồng bào trong và ngoài nước; khơi dậy toàn diện tiềm năng từ kiều bào, trí thức, doanh nhân và các tổ chức tôn giáo."
    },
    {
      id: 2,
      num: "02",
      accent: "amber",
      title: "TẠO SỰ ĐỒNG THUẬN XÃ HỘI",
      desc: "Lấy ấm no, hạnh phúc và lợi ích chính đáng của nhân dân làm điểm tựa gốc; giải quyết hài hòa quan hệ lợi ích giữa các giai tầng để giữ vững lòng dân."
    },
    {
      id: 3,
      num: "03",
      accent: "purple",
      title: "KIÊN QUYẾT BẢO VỆ KHỐI ĐOÀN KẾT",
      desc: "Tăng cường sức đề kháng và bản lĩnh tư tưởng; chủ động nhận diện, kiên quyết đấu tranh phản bác các quan điểm sai trái, thù địch gây chia rẽ dân tộc."
    }
  ];

  return (
    <div className="tp-editorial-container globe-lessons-editorial">
      {/* ==================== CỘT TRÁI: 3 BÀI HỌC KINH NGHIỆM DẠNG CARD ==================== */}
      <div className="tp-editorial-col left-col">
        <div className="tp-col-title-wrap">
          <span className="tp-col-pre-title">ĐÚC KẾT THỰC TIỄN</span>
          <h4 className="tp-col-main-title">3 BÀI HỌC KINH NGHIỆM CỐT LÕI</h4>
        </div>

        <div className="globe-cards-list">
          {lessons.map((item) => (
            <div key={item.id} className={`globe-lesson-card ${item.accent}`}>
              <div className="globe-card-header">
                <span className={`globe-card-num ${item.accent}`}>{item.num}.</span>
                <h5 className={`globe-card-title ${item.accent}`}>{item.title}</h5>
              </div>
              <p className="globe-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ĐƯỜNG PHÂN CÁCH DỌC */}
      <div className="tp-editorial-divider"></div>

      {/* ==================== CỘT PHẢI: KHUNG ẢNH TƯ LIỆU TRẢI ĐẦY ==================== */}
      <div className="tp-editorial-col right-col">
        <div className="tp-col-title-wrap">
          <span className="tp-col-pre-title">TƯ LIỆU LỊCH SỬ</span>
          <h4 className="tp-col-main-title">ĐẠI HỘI ĐOÀN KẾT TOÀN DÂN TỘC</h4>
        </div>

        <div className="globe-editorial-photo-box">
          <div
            className="tree-panel-img-wrap archive"
            onClick={() => onPhotoClick && onPhotoClick({ url: photo.url, note: photo.description || photo.title })}
            title="Click phóng to hình ảnh tư liệu"
          >
            <img
              src={photo.url}
              alt={photo.title || "Tư liệu lịch sử Đại hội Đoàn kết toàn dân tộc"}
              className="tree-panel-img archive"
            />
            <div className="tree-panel-zoom-icon-btn" title="Phóng to">
              <Maximize2 size={16} />
            </div>
          </div>

          <div className="tree-panel-caption">
            {photo.description || "Mốc son khẳng định ý chí thống nhất non sông, quy tụ muôn triệu con tim yêu nước dưới ngọn cờ chung của độc lập và chủ nghĩa xã hội."}
          </div>
        </div>
      </div>
    </div>
  );
}

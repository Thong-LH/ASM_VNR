import React from 'react';
import { X } from 'lucide-react';

// Widget Chatbox AI (Góc phải màn hình - Trợ lý ảo Nhóm 7)
function ChatBox({
  chatOpen,
  setChatOpen,
  setSelectedObjectId,
  setMascotState,
  startTour,
  setShowUI
}) {
  const handleSelectObject = (objId) => {
    setChatOpen(false);
    if (setSelectedObjectId) setSelectedObjectId(objId);
    if (setShowUI) setShowUI(true);
    if (setMascotState) setMascotState('pointing');
  };

  const handleStartTour = () => {
    setChatOpen(false);
    if (startTour) startTour();
  };

  if (!chatOpen) return null;

  return (
    <div className="ai-chat-widget">
      <div className="chat-window">
        {/* Header của Khung Chat */}
        <div className="chat-header">
          <div className="chat-header-info">
            <span className="chat-title">Trợ lý ảo Nhóm 7</span>
            <span className="chat-subtitle">● Sẵn sàng hỗ trợ</span>
          </div>
          <div className="chat-header-actions">
            <button
              className="chat-action-btn"
              onClick={() => {
                setChatOpen(false);
                if (setMascotState) setMascotState('idle');
              }}
              title="Đóng khung chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Lịch sử & Nội dung Trợ lý ảo trình bày liền mạch */}
        <div className="chat-history">
          <div className="chat-msg assistant" style={{ maxWidth: '100%' }}>
            <div className="msg-bubble" style={{ fontSize: '0.94rem', lineHeight: '1.6', width: '100%' }}>
              <p style={{ margin: '0 0 0.75rem 0' }}>
                Chào các bạn! Mình là <strong>trợ lý ảo của Nhóm 7</strong> đây. Chào mừng các bạn đến với không gian tương tác tìm hiểu <strong>Tư tưởng Hồ Chí Minh</strong>!
              </p>
              <p style={{ margin: '0 0 0.75rem 0' }}>
                Hôm nay, chúng ta sẽ cùng nhau giải mã một nguồn lực nội sinh mang sức mạnh vô địch của Cách mạng Việt Nam: <strong style={{ color: '#ffd700' }}>Đại đoàn kết toàn dân tộc</strong>.
              </p>
              <p style={{ margin: '0 0 0.9rem 0' }}>
                Bạn đã sẵn sàng chưa? Hãy nhấp vào các danh mục dưới đây hoặc click trực tiếp vào từng kỷ vật trên mặt bàn để khám phá hành trình nhé:
              </p>

              {/* Danh sách nút danh mục liền mạch, không icon, không tóm tắt */}
              <div className="chat-seamless-actions">
                <button
                  type="button"
                  className="chat-item-link-btn"
                  onClick={() => handleSelectObject('obj_tree')}
                >
                  Phần 1: Cấu Trúc &amp; Bí Quyết Quy Tụ
                </button>

                <button
                  type="button"
                  className="chat-item-link-btn"
                  onClick={() => handleSelectObject('obj_book')}
                >
                  Phần 2: Bước Ngoặt Lý Luận Lịch Sử
                </button>

                <button
                  type="button"
                  className="chat-item-link-btn"
                  onClick={() => handleSelectObject('obj_diacau')}
                >
                  Phần 3: Hành Trang Hướng Tới Tương Lai
                </button>

                <button
                  type="button"
                  className="chat-item-link-btn tour-btn"
                  onClick={handleStartTour}
                >
                  [BẮT ĐẦU KHÁM PHÁ NGAY]
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;

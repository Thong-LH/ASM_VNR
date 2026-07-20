import { useState, useEffect, useRef } from 'react';

// Custom hook quản lý toàn bộ logic AI Chat với Gemini
// artifactLinks: [{ label: 'Tên hiện vật', id: 'obj_xxx' }]
export function useGeminiChat({ contextText, setSelectedObjectId, setChatOpen, welcomeMessage, artifactLinks, onMascotStateChange }) {
  const defaultWelcome = welcomeMessage || 'Xin chào! Tôi là hướng dẫn viên tại đây. Giai đoạn 1986–1996 là một trong những chương lịch sử đặc biệt nhất của Việt Nam — từ khủng hoảng kinh tế trầm trọng đến bước ngoặt Đổi Mới. Bạn muốn tìm hiểu điều gì?';
  const defaultArtifactLinks = artifactLinks || [
    { label: 'Sổ Gạo', id: 'obj_sogao' },
    { label: 'Sấp tiền lạm phát', id: 'obj_saptien' },
    { label: 'Loa Phường', id: 'obj_loa' },
  ];
  const artifactLinksText = defaultArtifactLinks.map(a => `[${a.label}](${a.id})`).join('\n');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: defaultWelcome }
  ]);

  // Reset tin nhắn khi chuyển phòng (nhận welcomeMessage mới)
  useEffect(() => {
    setMessages([
      { role: 'assistant', text: defaultWelcome }
    ]);
  }, [defaultWelcome]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const chatEndRef = useRef(null);

  // Cuộn xuống cuối tin nhắn mới
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Hàm phân tích cú pháp tin nhắn: trích xuất các link vật phẩm để render riêng ở dưới, và highlight từ khóa trong văn bản chính
  const parseMessage = (text) => {
    if (!text) return { body: '', links: [] };
    const links = [];
    const linkRegex = /\[(.*?)\]\((obj_.*?)\)/g;

    // Trích xuất các liên kết hiện vật
    const matches = [...text.matchAll(linkRegex)];
    for (const m of matches) {
      links.push({ label: m[1], objId: m[2] });
    }

    // Làm sạch văn bản: Loại bỏ các thẻ link [Label](obj_id)
    let cleanedText = text.replace(/\[.*?\]\(obj_.*?\)/g, '');

    // Tinh chỉnh văn bản sau khi xóa link
    cleanedText = cleanedText.trim();
    cleanedText = cleanedText.replace(/(?:Xem thêm hiện vật liên quan tại|Xem thêm hiện vật tại|Xem thêm hiện vật|Xem thêm tại|Bấm vào|Bấm để xem|Xem hiện vật liên quan|Xem hiện vật tại|Xem hiện vật|Xem tại)\s*$/, '');
    cleanedText = cleanedText.trim();
    cleanedText = cleanedText.replace(/[:\-–—\s]+$/, '');
    cleanedText = cleanedText.trim();

    // Parse highlight từ khóa **bold**
    const tokens = [];
    let currentIdx = 0;
    const highlightRegex = /\*\*(.*?)\*\*/g;
    let hMatch;

    while ((hMatch = highlightRegex.exec(cleanedText)) !== null) {
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

  // Bộ máy trả lời offline khi chưa nhập API Key
  const getMockResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('khoán 10') || q.includes('nông nghiệp') || q.includes('khoan 10')) {
      return "Theo tài liệu Chương 3: **Khoán 10** được ban hành vào ngày 5/4/1988 (Nghị quyết số 10-NQ/TW của Bộ Chính trị) về đổi mới quản lý kinh tế nông nghiệp. Nội dung cốt lõi là giao quyền **tự chủ sản xuất** cho hộ nông dân và khoán ruộng ổn định trong 15 năm. Nhờ vậy, từ chỗ thiếu đói, đến năm 1989 Việt Nam đã sản xuất đủ ăn và lần đầu tiên xuất khẩu gạo ra thế giới.\n[Sổ Gạo](obj_sogao)";
    }
    if (q.includes('lạm phát') || q.includes('774') || q.includes('phi mã')) {
      return "Cuối giai đoạn 1975-1986, **lạm phát phi mã** lên đến mức đỉnh điểm 774% vào năm 1986. Tiền mất giá nghiêm trọng, sản xuất đình đốn. Nhờ công cuộc **Đổi mới** sau đó, lạm phát giảm dần: từ 67.1% năm 1991 xuống còn 12.7% năm 1995, giúp đất nước chính thức thoát khỏi khủng hoảng kinh tế - xã hội.\n[Sấp tiền lạm phát](obj_saptien)";
    }
    if (q.includes('đại hội 6') || q.includes('đại hội vi') || q.includes('đổi mới') || q.includes('1986')) {
      return "**Đại hội VI** (12/1986) khởi xướng đường lối **Đổi mới toàn diện**, chuyển từ nền kinh tế kế hoạch tập trung bao cấp sang **kinh tế hàng hóa nhiều thành phần**.\n[Loa Phường](obj_loa)";
    }
    if (q.includes('sổ gạo') || q.includes('lương thực') || q.includes('bao cấp')) {
      return "Thời **Bao Cấp** (1975-1986), lương thực hàng hóa vô cùng khan hiếm. **Sổ gạo** là phao cứu sinh duy nhất của người dân.\n[Sổ Gạo](obj_sogao)";
    }
    if (q.includes('mục tiêu') || q.includes('2025') || q.includes('2030') || q.includes('2045')) {
      return "Đại hội XIII đề ra mục tiêu chiến lược:\n- Đến năm 2025: Vượt qua mức thu nhập trung bình thấp.\n- Đến năm 2030: Thu nhập trung bình cao.\n- Đến năm 2045: Trở thành nước phát triển, thu nhập cao theo định hướng xã hội chủ nghĩa.";
    }

    if (contextText) {
      const lines = contextText.split('\n');
      const matchedLines = lines.filter(line =>
        line.length > 20 && q.split(' ').some(word => word.length > 3 && line.toLowerCase().includes(word))
      );
      if (matchedLines.length > 0) {
        return "Tìm thấy thông tin liên quan:\n\n" + matchedLines.slice(0, 2).join('\n\n');
      }
    }

    return "Tôi là **Hướng dẫn viên ảo**. Hiện tại bạn chưa thiết lập Gemini API Key (hãy click biểu tượng ⚙️ ở đầu khung chat để dán Key miễn phí từ Google AI Studio).\n\nBạn có thể hỏi về: **Đại hội VI**, **Khoán 10**, **Lạm phát 774%**, thời **Bao Cấp**...\n[Sổ Gạo](obj_sogao)\n[Sấp tiền lạm phát](obj_saptien)\n[Loa Phường](obj_loa)";
  };

  // Hàm xử lý gửi tin nhắn
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userQuery = userInput.trim();
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setUserInput('');
    setLoading(true);
    if (onMascotStateChange) onMascotStateChange('thinking');

    if (customApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${customApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: userQuery }] }],
              systemInstruction: {
                parts: [{
                  text: `Bạn là một hướng dẫn viên am hiểu lịch sử tại Bảo tàng Lịch sử Đổi Mới của Việt Nam. Hãy trả lời như một người thực sự hiểu biết — tự nhiên, sinh động, không bao giờ nhắc đến "tài liệu", "văn bản", hay "được cung cấp". Bạn đơn giản là biết những điều này.

Tuân thủ các quy tắc sau:
1. Đi thẳng vào trả lời, không chào hỏi lại ở đầu. Ngắn gọn, súc tích, dưới 180 từ.
2. Chỉ in đậm tối đa 3-4 từ khóa lịch sử quan trọng nhất bằng cú pháp **từ_khóa**. Không lạm dụng.
3. Nếu câu trả lời liên quan đến hiện vật đang trưng bày, thêm liên kết RIÊNG ở dòng CUỐI, KHÔNG nhúng vào giữa câu văn:
${artifactLinksText}
4. Nếu câu hỏi nằm ngoài phạm vi lịch sử Việt Nam giai đoạn 1986–nay, hãy lịch sự từ chối.

Kiến thức nền của bạn:
---
${contextText}
---`
                }]
              }
            })
          }
        );

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          setMessages(prev => [...prev, { role: 'assistant', text: data.candidates[0].content.parts[0].text }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', text: 'Xin lỗi, tôi gặp sự cố khi giải mã phản hồi.' }]);
        }
      } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, { role: 'assistant', text: 'Có lỗi xảy ra khi kết nối với API Gemini. Vui lòng kiểm tra lại API Key.' }]);
      } finally {
        setLoading(false);
        if (onMascotStateChange) onMascotStateChange('welcome');
      }
    } else {
      setTimeout(() => {
        const reply = getMockResponse(userQuery);
        setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
        setLoading(false);
        if (onMascotStateChange) onMascotStateChange('welcome');
      }, 700);
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', customApiKey);
    setShowKeyInput(false);
    alert('Đã lưu API Key thành công!');
  };

  return {
    messages,
    userInput,
    setUserInput,
    loading,
    customApiKey,
    setCustomApiKey,
    showKeyInput,
    setShowKeyInput,
    chatEndRef,
    parseMessage,
    handleSendMessage,
    saveApiKey,
  };
}

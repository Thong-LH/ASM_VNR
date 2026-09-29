import React from 'react';
import { createPortal } from 'react-dom';
import { X, Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import ThreeStageTimeline from '../common/ThreeStageTimeline';
import TheoryPracticeCompare from '../common/TheoryPracticeCompare';
import GlobeCoreLessons from '../common/GlobeCoreLessons';

// Panel thuyết minh hiện vật bên phải/trái màn hình (được tái sử dụng cho tất cả các phòng)
function SidePanel({ selectedObjectId, showUI, isEditMode, roomData, onClose, detailedContent, tourActive, tourIndex, tourLength, isLastRoom, onNext, onPrev, onExit, roadmapStage = 0, setRoadmapStage, isRoadmapFlipped = false, setIsRoadmapFlipped }) {
  const [lightboxImage, setLightboxImage] = React.useState(null);
  const [treeTab, setTreeTab] = React.useState(1);
  const [activeSubTab, setActiveSubTab] = React.useState(1);
  const [tab2ImgIdx, setTab2ImgIdx] = React.useState(0);

  const bookSec1Ref = React.useRef(null);
  const bookSec2Ref = React.useRef(null);

  const scrollToBookSec1 = () => {
    bookSec1Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const scrollToBookSec2 = () => {
    bookSec2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Reset tab về 1 khi đổi hiện vật
  React.useEffect(() => {
    setTreeTab(1);
    setActiveSubTab(1);
    setTab2ImgIdx(0);
  }, [selectedObjectId]);

  if (!selectedObjectId || !showUI || isEditMode || !detailedContent || selectedObjectId === 'obj_roadmap') return null;

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
              {tourIndex === tourLength - 1 && !isLastRoom ? "Sang phòng kế ▶" : "Tiếp >"}
            </button>
            <button className="tour-mini-btn exit" onClick={onExit} title="Thoát Tour">✕</button>
          </div>
        )}
      </React.Fragment>
    );
  }

  // Nếu hiện vật nằm ở góc bên phải, ta lật Panel thuyết minh sang trái để không bị đè lên nhau
  const isRightAlignedObj = selectedObjectId === 'obj_loa' || selectedObjectId === 'obj_radio' || selectedObjectId === 'obj_diacau' || selectedObjectId === 'obj_book';

  // Lấy dữ liệu cho obj_tree (3 tabs)
  const isTree = selectedObjectId === 'obj_tree' && detailedContent['obj_tree']?.tabs;
  const treeData = isTree ? detailedContent['obj_tree'] : null;
  const currentTreeTab = isTree ? (treeData.tabs.find(t => t.id === treeTab) || treeData.tabs[0]) : null;
  const activeSub = (isTree && treeTab === 2)
    ? (currentTreeTab?.subTabs?.find(s => s.id === activeSubTab) || currentTreeTab?.subTabs?.[0])
    : null;

  // Lấy dữ liệu cho obj_book
  const isBook = selectedObjectId === 'obj_book';
  const bookData = isBook ? detailedContent['obj_book'] : null;

  // Lấy dữ liệu cho obj_diacau (Quả địa cầu - 3 bài học cốt lõi & tư liệu)
  const isDiaCau = selectedObjectId === 'obj_diacau';
  const diaCauData = isDiaCau ? detailedContent['obj_diacau'] : null;

  // Lấy dữ liệu theo chặng nếu là obj_roadmap
  const roadmapData = detailedContent['obj_roadmap'];
  const totalStages = roadmapData?.stages?.length || 2;
  const currentStageData = (selectedObjectId === 'obj_roadmap' && roadmapStage > 0)
    ? roadmapData?.stages?.find(s => s.id === roadmapStage)
    : null;

  const title = isTree
    ? (currentTreeTab?.title || treeData.title)
    : (currentStageData?.title || detailedContent[selectedObjectId]?.title || roomData.interactive_objects.find(o => o.id === selectedObjectId)?.content.title);

  const subtitle = isTree
    ? (currentTreeTab?.subtitle || treeData.subtitle)
    : (currentStageData?.subtitle || detailedContent[selectedObjectId]?.subtitle || "");

  const paragraphs = currentStageData?.paragraphs || detailedContent[selectedObjectId]?.paragraphs || [];

  return (
    <React.Fragment>
      <div className={`museum-side-panel ui-interactive ${isTree || isBook || isDiaCau ? 'tree-panel-mode' : ''} ${isDiaCau ? 'diacau-panel-mode' : ''} ${isRightAlignedObj ? 'left-aligned' : ''} ${tourActive ? 'tour-active-adjust' : ''}`}>
        <button className="side-panel-close-btn" onClick={tourActive ? onExit : onClose}>
          <X size={18} />
        </button>

        <div className="side-panel-content">
          {/* Hàng trên cùng: Badge bên trái, Tab bên phải (cho Chậu Măng Tre) */}
          <div className="sidepanel-header-top-row">
            <span className="panel-badge">
              {isTree
                ? `HIỆN VẬT: ${treeData.artifactName || 'CHẬU MĂNG TRE'}`
                : isBook
                ? `HIỆN VẬT: ${bookData?.artifactName || 'QUYỂN SÁCH LÝ LUẬN'}`
                : isDiaCau
                ? `HIỆN VẬT: ${diaCauData?.artifactName || 'QUẢ ĐỊA CẦU HỘI NHẬP'}`
                : (selectedObjectId === 'obj_roadmap' && roadmapStage > 0 ? `Lộ Trình — Phần ${roadmapStage}/${totalStages}` : 'Hiện Vật Trưng Bày')}
            </span>

            {/* Thanh chuyển đổi 3 Tab cho Chậu Tre */}
            {isTree && (
              <div className="sidepanel-tabs-bar" role="tablist">
                {treeData.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`sidepanel-tab-btn ${treeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setTreeTab(tab.id)}
                    title={tab.title}
                  >
                    <span>Tab {tab.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <h2 className="panel-title">{title}</h2>
          <h4 className="panel-subtitle">{subtitle}</h4>

          <div className="panel-divider"></div>

          <div className="panel-body">
            {isTree ? (
              treeTab === 1 ? (
                <div className="tree-tab1-layout">
                  <div className="tree-panel-grid">
                    {/* Cột trái: Sơ đồ tương tác */}
                    <div className="tree-panel-left">
                      <div
                        className="tree-panel-img-wrap"
                        onClick={() => setLightboxImage({ url: currentTreeTab.diagram.image, note: currentTreeTab.diagram.caption })}
                        title="Click phóng to xem chi tiết"
                      >
                        <img
                          src={currentTreeTab.diagram.image}
                          alt={currentTreeTab.diagram.caption}
                          className="tree-panel-img"
                        />
                        <div className="tree-panel-zoom-icon-btn" title="Phóng to" style={{ position: 'absolute', bottom: 10, right: 10 }}>
                          <Maximize2 size={16} />
                        </div>
                      </div>
                      <div className="tree-panel-caption">
                        {currentTreeTab.diagram.caption}
                      </div>
                    </div>

                    {/* Cột phải: Ảnh tư liệu */}
                    <div className="tree-panel-right">
                      <div
                        className="tree-panel-img-wrap archive"
                        onClick={() => setLightboxImage({ url: currentTreeTab.archive.image, note: currentTreeTab.archive.caption })}
                        title="Click phóng to ảnh"
                      >
                        <img
                          src={currentTreeTab.archive.image}
                          alt={currentTreeTab.archive.caption}
                          className="tree-panel-img archive"
                        />
                        <div className="tree-panel-zoom-icon-btn" title="Phóng to" style={{ position: 'absolute', bottom: 10, right: 10 }}>
                          <Maximize2 size={16} />
                        </div>
                      </div>
                      <div className="tree-panel-caption">
                        {currentTreeTab.archive.caption}
                      </div>
                    </div>
                  </div>

                  {/* Trích dẫn lịch sử Bác Hồ full-width lấp đầy toàn bộ không gian bên dưới */}
                  {currentTreeTab.quote && (
                    <blockquote className="tree-panel-quote">
                      <div className="tree-quote-big-mark">“</div>
                      <p className="tree-quote-content">"{currentTreeTab.quote.text}"</p>
                      <footer className="tree-quote-author">— {currentTreeTab.quote.author}</footer>
                    </blockquote>
                  )}
                </div>
            ) : treeTab === 2 ? (
              <div className="tab2-container">
                {/* Thanh Sub-navigation 3 Căn Cứ */}
                <div className="tab2-subnav-bar">
                  {currentTreeTab.subTabs?.map((sub) => (
                    <button
                      key={sub.id}
                      className={`tab2-subnav-btn ${activeSubTab === sub.id ? 'active' : ''}`}
                      onClick={() => {
                        setActiveSubTab(sub.id);
                        setTab2ImgIdx(0);
                      }}
                    >
                      <span className="tab2-subnav-title">{sub.navLabel}</span>
                    </button>
                  ))}
                </div>

                {/* Nội dung chi tiết của Căn cứ đang chọn */}
                {activeSub && (
                  <div className="tab2-content-flow">
                    {/* Header căn cứ: Title + Slogan */}
                    <div className="tab2-flow-header">
                      <h3 className="tab2-flow-title">{activeSub.title}</h3>
                      {activeSub.slogan && (
                        <div className="tab2-flow-slogan">"{activeSub.slogan}"</div>
                      )}
                    </div>

                    {/* SUB-TAB 1: MÂU THUẪN DÂN TỘC */}
                    {activeSub.id === 1 && (
                      <div className="tab2-sub1-layout">
                        {/* Hàng 3 ảnh tư liệu đặt ngang bằng nhau trải rộng 100% */}
                        <div className="tab2-gallery-strip">
                          {activeSub.images?.map((img, i) => (
                            <div
                              key={i}
                              className="tab2-strip-item"
                              onClick={() => setLightboxImage(img)}
                              title="Click phóng to ảnh"
                            >
                              <div className="tab2-strip-img-wrap">
                                <img src={img.url} alt={img.caption} className="tab2-strip-img" />
                                <div className="tree-panel-zoom-icon-btn">
                                  <Maximize2 size={15} />
                                </div>
                              </div>
                              <div className="tab2-strip-caption">{img.caption}</div>
                            </div>
                          ))}
                        </div>

                        {/* 2 Khung trích dẫn lịch sử đặt song song ở dưới */}
                        {activeSub.quotes && (
                          <div className="tab2-quotes-row">
                            {activeSub.quotes.map((q, qIdx) => (
                              <div key={qIdx} className="tab2-quote-card">
                                <span className="tab2-quote-badge">{q.source}</span>
                                <p className="tab2-quote-text">"{q.text}"</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUB-TAB 2: TƯƠNG QUAN LỰC LƯỢNG */}
                    {activeSub.id === 2 && (
                      <div className="tab2-sub2-layout">
                        {/* Cột trái: Infographic riêng */}
                        <div className="tab2-sub2-left">
                          {activeSub.images?.[0] && (
                            <div
                              className="tab2-strip-item infor-item"
                              onClick={() => setLightboxImage(activeSub.images[0])}
                              title="Click phóng to infographic"
                            >
                              <div className="tab2-sub2-infor-wrap">
                                <img
                                  src={activeSub.images[0].url}
                                  alt={activeSub.images[0].caption}
                                  className="tab2-sub2-infor-img"
                                />
                                <div className="tree-panel-zoom-icon-btn">
                                  <Maximize2 size={16} />
                                </div>
                              </div>
                              <div className="tab2-strip-caption">{activeSub.images[0].caption}</div>
                            </div>
                          )}
                        </div>

                        {/* Cột phải: 2 hình ở trên dưới nhau */}
                        <div className="tab2-sub2-right">
                          {activeSub.images?.slice(1).map((img, i) => (
                            <div
                              key={i}
                              className="tab2-strip-item"
                              onClick={() => setLightboxImage(img)}
                              title="Click phóng to ảnh"
                            >
                              <div className="tab2-sub2-stacked-wrap">
                                <img
                                  src={img.url}
                                  alt={img.caption}
                                  className={`tab2-sub2-stacked-img ${i === 1 ? 'pos-xe-goong' : 'pos-mo-than'}`}
                                />
                                <div className="tree-panel-zoom-icon-btn">
                                  <Maximize2 size={15} />
                                </div>
                              </div>
                              <div className="tab2-strip-caption">{img.caption}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 3: TRUYỀN THỐNG DÂN TỘC */}
                    {activeSub.id === 3 && (
                      <div className="tab2-sub3-layout">
                        {/* Khung trích dẫn vàng Bác Hồ full-width */}
                        {activeSub.highlightQuote && (
                          <div className="tab2-heritage-quote-banner">
                            <div className="tab2-quote-big-mark">“</div>
                            <p className="tab2-quote-core-text">
                              {activeSub.highlightQuote.text.split('\n').map((line, lIdx) => (
                                <React.Fragment key={lIdx}>
                                  {line}
                                  {lIdx < activeSub.highlightQuote.text.split('\n').length - 1 && <br />}
                                </React.Fragment>
                              ))}
                            </p>
                            <div className="tab2-quote-core-author">— {activeSub.highlightQuote.author}</div>
                          </div>
                        )}

                        {/* Hàng 2 ảnh tư liệu: Hội nghị Diên Hồng & Bác Hồ với nông dân */}
                        {activeSub.images && activeSub.images.length > 0 && (
                          <div className="tab2-gallery-strip dual">
                            {activeSub.images.map((img, i) => (
                              <div
                                key={i}
                                className="tab2-strip-item"
                                onClick={() => setLightboxImage(img)}
                                title="Click phóng to ảnh"
                              >
                                <div className="tab2-strip-img-wrap">
                                  <img
                                    src={img.url}
                                    alt={img.caption}
                                    className={`tab2-strip-img ${i === 1 ? 'pos-bac-ho' : 'pos-dien-hong'}`}
                                  />
                                  <div className="tree-panel-zoom-icon-btn">
                                    <Maximize2 size={15} />
                                  </div>
                                </div>
                                <div className="tab2-strip-caption">{img.caption}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : treeTab === 3 ? (
              <div className="tab3-grid-layout">
                {/* CỘT TRÁI (44%): LÝ LUẬN & SƠ ĐỒ NGUYÊN TẮC (RENDER DẠNG ẢNH + ZOOM LIGHTBOX) */}
                <div className="tab3-col-left">
                  <div className="tab3-theory-header">
                    <h3 className="tab3-theory-title">{currentTreeTab.principle?.title || 'Phương châm "Cầu đồng tồn dị"'}</h3>
                  </div>

                  {/* Sơ đồ nguyên tắc được render dạng ảnh bảo tàng, có nút phóng to và click mở lightbox zoom */}
                  <div
                    className="tab3-diagram-card"
                    onClick={() => setLightboxImage(currentTreeTab.diagramImage || { url: '/assets/so_do_cau_dong_ton_di.png', caption: 'Sơ đồ nguyên tắc: Phương châm "Cầu đồng tồn dị"' })}
                    title="Click phóng to sơ đồ toàn màn hình"
                  >
                    <div className="tab3-diagram-img-wrap">
                      <img
                        src={currentTreeTab.diagramImage?.url || '/assets/so_do_cau_dong_ton_di.png'}
                        alt={currentTreeTab.diagramImage?.caption || 'Sơ đồ Cầu đồng tồn dị'}
                        className="tab3-diagram-img"
                      />
                      <div className="tree-panel-zoom-icon-btn">
                        <Maximize2 size={16} />
                      </div>
                    </div>
                    <div className="tab3-diagram-caption">
                      {currentTreeTab.diagramImage?.caption || 'Sơ đồ nguyên tắc phương châm "Cầu đồng tồn dị" — Lấy Tổ quốc trên hết làm điểm tương đồng tối cao.'}
                    </div>
                  </div>

                  {/* BOX TRÍCH DẪN BÁC HỒ: Font Serif nghiêng, viền trái vàng đồng */}
                  <blockquote className="tab3-quote-card">
                    <p className="tab3-quote-text">
                      "{currentTreeTab.principle?.quote?.text || 'Ai có tài, có đức, có sức, có lòng phụng sự Tổ quốc và phục vụ nhân dân thì ta đoàn kết với họ.'}"
                    </p>
                    <footer className="tab3-quote-author">
                      — {currentTreeTab.principle?.quote?.author || 'Chủ tịch Hồ Chí Minh'}
                    </footer>
                  </blockquote>
                </div>

                {/* CỘT PHẢI (56%): MINH CHỨNG THỰC TIỄN - ĐỦ 4 THẺ HIỆN VẬT DẠNG GRID 2x2 LẤP ĐẦY KHÔNG GIAN */}
                <div className="tab3-col-right">
                  <div className="tab3-proofs-grid">
                    {currentTreeTab.proofImages?.map((item, idx) => (
                      <div
                        key={idx}
                        className="tab3-photo-item"
                        onClick={() => setLightboxImage(item)}
                        title="Click phóng to ảnh"
                      >
                        <div className="tab3-photo-frame">
                          <img
                            src={item.url}
                            alt={item.caption}
                            className={`tab3-photo-img proof-img-${idx + 1}`}
                          />
                          <div className="tree-panel-zoom-icon-btn">
                            <Maximize2 size={14} />
                          </div>
                        </div>
                        <div className="tab3-photo-caption">
                          {item.caption}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="tree-panel-placeholder">
                <p className="tree-placeholder-text">Nội dung của tab này đang được cập nhật...</p>
                <button className="sidepanel-tab-btn" onClick={() => setTreeTab(1)}>Quay lại Tab 1</button>
              </div>
            )
          ) : isBook ? (
            <div className="book-scroll-sections-container">
              {/* SECTION 1: TIẾN TRÌNH 3 GIAI ĐOẠN LÝ LUẬN */}
              <section ref={bookSec1Ref} className="book-scroll-section stage-timeline-section">
                <div className="book-timeline-container">
                  <ThreeStageTimeline
                    onPhotoClick={(item) => setLightboxImage({ url: item.url, note: item.title || item.note || item.caption })}
                  />
                </div>
              </section>

              {/* SECTION 2: BỐ CỤC 2 CỘT THỰC TIỄN & BƯỚC NGOẶT LOGIC */}
              <section ref={bookSec2Ref} className="book-scroll-section compare-section">
                <TheoryPracticeCompare data={detailedContent['obj_book']?.practiceSection} />
              </section>
            </div>
          ) : isDiaCau ? (
            <GlobeCoreLessons
              data={diaCauData}
              onPhotoClick={(item) => setLightboxImage({ url: item.url, note: item.note || item.title || item.caption })}
            />
          ) : (
            paragraphs.map((p, idx) => {
              const activeDetail = detailedContent[selectedObjectId];
              let paragraphImages = [];

              if (activeDetail?.images && Array.isArray(activeDetail.images)) {
                paragraphImages = activeDetail.images.filter(img => img.paragraphIndex === idx);
              }

              if (paragraphImages.length === 0 && activeDetail?.imageUrl && selectedObjectId !== 'obj_roadmap') {
                const isTargetParagraph = selectedObjectId === 'obj_sogao'
                  ? (p.includes("Lương thực, thực phẩm") || p.includes("đôi khi phải đặt gạch"))
                  : (idx === 0);

                if (isTargetParagraph) {
                  paragraphImages = [{
                    url: activeDetail.imageUrl,
                    note: activeDetail.imageNote || null
                  }];
                }
              }

              return (
                <React.Fragment key={idx}>
                  <p className="panel-paragraph">{p}</p>

                  {paragraphImages.map((imgItem, imgIdx) => (
                    <div
                      key={imgIdx}
                      className="panel-image-container"
                      style={{
                        margin: '1.2rem auto',
                        width: '100%',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.18)',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                        transition: 'transform 0.2s, border-color 0.2s',
                        background: '#ffffff'
                      }}
                      onClick={() => setLightboxImage(imgItem)}
                      title="Click để phóng to xem chi tiết"
                    >
                      <img
                        src={imgItem.url}
                        alt={title}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                      {imgItem.note && (
                        <div
                          className="panel-image-note"
                          style={{
                            padding: '8px 12px',
                            fontSize: '0.85rem',
                            color: '#e2e8f0',
                            fontStyle: 'italic',
                            lineHeight: '1.45',
                            textAlign: 'center',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(0, 0, 0, 0.5)'
                          }}
                        >
                          {imgItem.note}
                        </div>
                      )}
                    </div>
                  ))}
                </React.Fragment>
              );
            }))}

            {/* Nút kích hoạt / chuyển phần cho Roadmap */}
            {selectedObjectId === 'obj_roadmap' && setRoadmapStage && totalStages > 0 && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                {roadmapStage === 0 && (
                  <button
                    onClick={() => setRoadmapStage(1)}
                    style={{
                      background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 22px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(234, 88, 12, 0.35)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    ▶ Bắt đầu Khám phá (Phần 1)
                  </button>
                )}
                {roadmapStage > 0 && roadmapStage < totalStages && (
                  <button
                    onClick={() => setRoadmapStage(roadmapStage + 1)}
                    style={{
                      background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(234, 88, 12, 0.35)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {`▶ Sang Phần ${roadmapStage + 1}: ${roadmapData?.stages?.[roadmapStage]?.title || ''}`}
                  </button>
                )}
                {roadmapStage >= totalStages && (
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
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    🎉 Hoàn thành Khám phá
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 🧭 THANH ĐIỀU HƯỚNG TOUR (ĐỘC LẬP NGOÀI SIDEPANEL) */}
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
            title="Tiếp tục"
          >
            Tiếp tục &gt;
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

      {/* Hộp Modal Lightbox phóng to ảnh có hỗ trợ Zoom & Kéo thả (Pan) */}
      {lightboxImage && (
        <LightboxModal
          lightboxImage={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </React.Fragment>
  );
}

// Sub-component cho Modal Lightbox với tính năng Zoom & Pan (Kéo thả & Cuộn chuột Zoom)
function LightboxModal({ lightboxImage, onClose }) {
  const [zoomScale, setZoomScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartRef = React.useRef({ x: 0, y: 0 });
  const posStartRef = React.useRef({ x: 0, y: 0 });

  const imgUrl = typeof lightboxImage === 'string' ? lightboxImage : lightboxImage?.url;
  const imgNote = typeof lightboxImage === 'object' ? lightboxImage?.note : null;

  React.useEffect(() => {
    setZoomScale(1);
    setPosition({ x: 0, y: 0 });
  }, [lightboxImage]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoomScale(prev => {
      const nextScale = Math.min(Math.max(1, prev + delta), 4);
      if (nextScale === 1) setPosition({ x: 0, y: 0 });
      return nextScale;
    });
  };

  const handleMouseDown = (e) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...position };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomScale <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: posStartRef.current.x + dx,
      y: posStartRef.current.y + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (zoomScale > 1) {
      setZoomScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setZoomScale(2);
    }
  };

  const zoomIn = () => setZoomScale(prev => Math.min(4, prev + 0.35));
  const zoomOut = () => setZoomScale(prev => {
    const next = Math.max(1, prev - 0.35);
    if (next === 1) setPosition({ x: 0, y: 0 });
    return next;
  });
  const resetZoom = () => {
    setZoomScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return createPortal(
    <div
      className="lightbox-overlay ui-interactive"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.94)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        animation: 'fadeIn 0.25s ease'
      }}
      onClick={onClose}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        className="lightbox-content"
        style={{
          position: 'relative',
          maxWidth: '94vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Zoom & Control Toolbar */}
        <div style={{
          position: 'absolute',
          top: '-54px',
          right: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(249, 115, 22, 0.45)',
          borderRadius: '24px',
          padding: '4px 14px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
          zIndex: 10
        }}>
          <button
            onClick={zoomOut}
            disabled={zoomScale <= 1}
            style={{
              background: 'transparent',
              border: 'none',
              color: zoomScale <= 1 ? '#64748b' : '#fdba74',
              cursor: zoomScale <= 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}
            title="Thu nhỏ (- / Cuộn chuột xuống)"
          >
            <ZoomOut size={16} />
          </button>

          <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 'bold', minWidth: '45px', textAlign: 'center' }}>
            {Math.round(zoomScale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            disabled={zoomScale >= 4}
            style={{
              background: 'transparent',
              border: 'none',
              color: zoomScale >= 4 ? '#64748b' : '#fdba74',
              cursor: zoomScale >= 4 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}
            title="Phóng to (+ / Cuộn chuột lên / Cuộn đúp)"
          >
            <ZoomIn size={16} />
          </button>

          {zoomScale > 1 && (
            <button
              onClick={resetZoom}
              style={{
                background: 'rgba(239, 68, 68, 0.25)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '16px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: '600',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Đặt lại độ zoom 100%"
            >
              <RotateCcw size={12} /> Đặt lại
            </button>
          )}

          <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }}></div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f87171',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 6px'
            }}
            title="Đóng ảnh"
          >
            <X size={17} />
          </button>
        </div>

        {/* Khung Ảnh hỗ trợ Zoom & Kéo thả (Pan) */}
        <div
          style={{
            overflow: 'hidden',
            borderRadius: '10px',
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 12px 45px rgba(0,0,0,0.9)',
            background: '#0a0a0a',
            cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
          }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
        >
          <img
            src={imgUrl}
            alt="Phóng to ảnh tư liệu"
            style={{
              width: '85vw',
              maxWidth: '2000px',
              height: 'auto',
              maxHeight: '78vh',
              objectFit: 'contain',
              display: 'block',
              transform: `scale(${zoomScale}) translate(${position.x / zoomScale}px, ${position.y / zoomScale}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
            draggable={false}
          />
        </div>

        {imgNote && (
          <div style={{
            color: '#ffedd5',
            marginTop: '0.8rem',
            fontSize: '0.98rem',
            fontStyle: 'italic',
            textAlign: 'center',
            maxWidth: '85vw',
            lineHeight: '1.5',
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '10px 20px',
            borderRadius: '8px',
            border: '1px solid rgba(249, 115, 22, 0.4)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
          }}>
            {imgNote}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default SidePanel;

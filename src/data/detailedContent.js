// Nội dung thuyết minh chi tiết cho từng hiện vật trưng bày - Không gian Trưng bày Lịch sử
const detailedContent = {
  obj_tree: {
    title: "Phần 1: Cấu Trúc & Bí Quyết Quy Tụ",
    subtitle: "Chủ thể và Lý do Hồ Chí Minh mở rộng khối đại đoàn kết",
    artifactName: "CHẬU MĂNG TRE",
    imageUrl: "/assets/tree.png",
    paragraphs: [
      "Hình ảnh cây tre từ lâu đã gắn liền với tâm hồn, khí phách và bản sắc văn hóa của người Việt Nam qua bao thế hệ.",
      "Mầm tre vươn lên xanh tốt, mộc mạc mà dẻo dai chính là ẩn dụ cho sức sống bất diệt, tinh thần vượt khó của dân tộc qua bao thăng trầm lịch sử.",
      "Cây tre nhắc nhở về sự kiên định, đoàn kết và sức bật mạnh mẽ — những phẩm chất cốt lõi giúp đất nước luôn vững vàng và không ngừng chuyển mình đổi mới."
    ],
    tabs: [
      {
        id: 1,
        tabTitle: "Tab 1",
        slideLabel: "Slide 2.1",
        title: "Phần 2.1: Cấu Trúc Khối Đại Đoàn Kết",
        subtitle: "Xác định chủ thể, nền tảng và hạt nhân lãnh đạo theo tư tưởng Hồ Chí Minh.",
        diagram: {
          image: "/assets/so_do_dai_doan_ket.png",
          caption: "Cấu trúc khối Đại đoàn kết toàn dân tộc",
          rings: [
            {
              ringName: "Vòng ngoài cùng",
              tag: "Chủ thể",
              title: "Chủ thể: Toàn thể nhân dân",
              detail: "Mọi con dân nước Việt, con Rồng cháu Tiên có lòng yêu nước; không phân biệt giai cấp, dân tộc, tôn giáo, lứa tuổi, già trẻ, gái trai, giàu nghèo.",
              color: "#f59f00",
              bgColor: "rgba(245, 159, 0, 0.12)"
            },
            {
              ringName: "Vòng ở giữa",
              tag: "Nền tảng",
              title: "Nền tảng: Liên minh Công – Nông – Trí",
              detail: "Gốc rễ tạo nên sức mạnh đại đoàn kết: Liên minh Công nhân – Nông dân – Trí thức.",
              icons: ["⚙️ Bánh răng", "🌾 Bông lúa", "📖 Quyển sách"],
              color: "#e67700",
              bgColor: "rgba(230, 119, 0, 0.15)"
            },
            {
              ringName: "Vòng trung tâm",
              tag: "Hạt nhân",
              title: "Hạt nhân: Đảng Cộng sản Việt Nam",
              detail: "Giữ vai trò lãnh đạo, bảo đảm định hướng cách mạng, giữ cho khối đoàn kết đi đúng hướng.",
              color: "#e03131",
              bgColor: "rgba(224, 49, 49, 0.18)"
            }
          ]
        },
        archive: {
          image: "/assets/bac_ho_dan_toc.jpg",
          caption: "Ảnh tư liệu: Bác Hồ với đồng bào các dân tộc thiểu số.",
          sourceUrl: "https://ttdn.vn/nghien-cuu-trao-doi/ly-luan-thuc-tien/bac-ho-voi-dong-bao-cac-dan-toc-thieu-so-va-khoi-dai-doan-ket-cac-dan-toc-97791"
        },
        quote: {
          text: "Đó là nền gốc của đại đoàn kết. Nó cũng như cái nền của nhà, gốc của cây.",
          author: "Hồ Chí Minh — Đại hội thống nhất Việt Minh - Liên Việt, 1955"
        }
      },
      {
        id: 2,
        tabTitle: "Tab 2",
        slideLabel: "Slide 2.2",
        title: "Phần 2.2: Vì Sao Mở Rộng Khối Đại Đoàn Kết?",
        subtitle: "Bốn căn cứ lịch sử, tương quan lực lượng, truyền thống và phương châm quy tụ.",
        subTabs: [
          {
            id: 1,
            navLabel: "Căn cứ 1: Mâu thuẫn dân tộc",
            title: "Mâu thuẫn dân tộc > Mâu thuẫn giai cấp",
            slogan: "Công nhân hay nông dân, đều chung một nỗi khổ mất nước.",
            images: [
              {
                url: "/assets/phu_cao_su.jpg",
                caption: "Phu cao su làm việc dưới sự giám sát của chủ đồn điền người Pháp.",
                sourceUrl: "https://congdoancaosu.vn/cay-cao-su-o-viet-nam-duoi-goc-nhin-lich-su-sinh-thai-1897-1975-7/"
              },
              {
                url: "/assets/nong_dan_dap_de.webp",
                caption: "Nông dân Bắc Kỳ đi phu, gánh đất đắp đê thời Pháp thuộc.",
                sourceUrl: "https://tiasang.com.vn/de-dinh-hinh-van-minh-song-hong-4999977.html"
              },
              {
                url: "/assets/lan_khuoi_nam.jpg",
                caption: "Lán Khuổi Nậm (Pác Bó, Hà Quảng, Cao Bằng), nơi Nguyễn Ái Quốc chủ trì Hội nghị Trung ương 8 (10–19/5/1941).",
                sourceUrl: "https://baotanglichsu.vn/DataFiles/2021/10/News/Ti%E1%BA%BFng%20Vi%E1%BB%87t/18.10.2021/Lanh%20tu%20Nguyen%20Ai%20Quoc/3.jpg"
              }
            ],
            quotes: [
              {
                source: "Đường Kách mệnh (1927)",
                text: "Dân tộc cách mệnh thì chưa phân giai cấp, nghĩa là sĩ, nông, công, thương đều nhất trí chống lại cường quyền."
              },
              {
                source: "Hội nghị Trung ương 8 (5/1941)",
                text: "Quyền lợi của bộ phận, của giai cấp phải đặt dưới sự sinh tử, tồn vong của quốc gia, của dân tộc."
              }
            ]
          },
          {
            id: 2,
            navLabel: "Căn cứ 2: Tương quan lực lượng",
            title: "Tương quan lực lượng thực tế",
            slogan: "Công nhân giữ vai trò lãnh đạo nhưng bắt buộc phải liên minh toàn dân tộc.",
            images: [
              {
                url: "/assets/infographic_100_nguoi.png",
                caption: "Năm 1929, cứ 100 người Việt Nam chỉ có khoảng 1 người là công nhân."
              },
              {
                url: "/assets/cong_nhan_mo_than.jpg",
                caption: "Mỏ than lộ thiên ở Hòn Gai (Quảng Ninh) thời Pháp thuộc.",
                sourceUrl: "https://baoquangninh.vn/khai-thac-than-thoi-ky-phap-thuoc-post3349315.html"
              },
              {
                url: "/assets/cong_nhan_xe_goong.jpg",
                caption: "Công nhân vùng mỏ Hòn Gai thời Pháp thuộc.",
                sourceUrl: "https://media.quangninh.gov.vn/618ca5c4-79b3-478a-8adb-4184369067f7/Libraries/HinhAnhBaiViet/Dung/N%C4%83m%202025/Th%C3%A1ng%204/22042025dungh%E1%BB%9Di%20Ph%C3%A1p%20thu%E1%BB%99c%20qua%20%E1%BA%A312.jpg"
              }
            ]
          },
          {
            id: 3,
            navLabel: "Căn cứ 3: Lấy dân làm gốc",
            title: "Truyền thống 'Lấy dân làm gốc'",
            slogan: "Lòng yêu nước nồng nàn là mẫu số chung kết nối muôn triệu người Việt Nam.",
            images: [
              {
                url: "/assets/hoi_nghi_dien_hong.jpeg",
                caption: "Hội nghị Diên Hồng thời Trần: các bô lão đồng thanh hô “Đánh!” trước cuộc kháng chiến chống quân Nguyên Mông.",
                sourceUrl: "https://cdn2.tuoitre.vn/plo/image/Uploaded/nguyenthao/2024_02_08/hoi-nghi-dien-hong-5430.jpeg"
              },
              {
                url: "/assets/bac_ho_nong_dan.jpg",
                caption: "Chủ tịch Hồ Chí Minh thăm hỏi bà con nông dân trên đồng lúa.",
                sourceUrl: "https://www.qdnd.vn/tu-lieu-ho-so/ngay-nay-nam-xua/28-9-1945-bac-ho-keu-goi-se-com-nhuong-ao-672387"
              }
            ],
            highlightQuote: {
              text: "Dễ trăm lần không dân cũng chịu,\nKhó vạn lần dân liệu cũng xong.",
              author: "Chủ tịch Hồ Chí Minh"
            }
          },
          {
            id: 4,
            navLabel: "Căn cứ 4: Cầu đồng tồn dị",
            title: 'Phương châm "Cầu đồng tồn dị" & Thắng lợi',
            slogan: "Lấy Tổ quốc trên hết làm điểm tương đồng tối cao.",
            principle: {
              title: 'Phương châm "Cầu đồng tồn dị"',
              quote: {
                text: "Ai có tài, có đức, có sức, có lòng phụng sự Tổ quốc và phục vụ nhân dân thì ta đoàn kết với họ.",
                author: "Chủ tịch Hồ Chí Minh"
              }
            },
            diagramImage: {
              url: "/assets/so_do_cau_dong_ton_di.png",
              caption: 'Sơ đồ nguyên tắc phương châm "Cầu đồng tồn dị" — Lấy Tổ quốc trên hết làm điểm tương đồng tối cao.'
            },
            proofImages: [
              {
                tag: "Thắng lợi đỉnh cao",
                url: "/assets/mit_tinh_nha_hat_lon.jpg",
                caption: "Mít tinh tại Quảng trường Nhà hát Lớn Hà Nội ngày 19/8/1945",
                sourceUrl: "https://special.vietnamplus.vn/wp-content/uploads/2021/03/ttxvn0901hc-1578581941-20.jpg"
              },
              {
                tag: "Chính phủ đại đoàn kết",
                url: "/assets/dai_bieu_quoc_hoi_1946.jpg",
                caption: "Chủ tịch Hồ Chí Minh cùng đại biểu các tầng lớp nhân dân trong “Tuần lễ vàng”, tháng 9/1945.",
                sourceUrl: "https://icdn.dantri.com.vn/dansinh/2024/08/29/anh-4-4-1724867091962.jpg"
              },
              {
                tag: "Trọng dụng hiền tài",
                url: "/assets/bac_ho_huynh_thuc_khang.jpg",
                caption: "Chủ tịch Hồ Chí Minh và cụ Huỳnh Thúc Kháng cùng các thành viên Chính phủ, năm 1946.",
                sourceUrl: "https://file.qdnd.vn/data/images/0/2016/09/30/phucthang/30092016ttrucban63.jpg?w=578"
              },
              {
                tag: "Quy tụ lòng dân",
                url: "/assets/tuan_le_vang.jpg",
                caption: "Không khí “Tuần lễ vàng” tại Hà Nội, tháng 9/1945.",
                sourceUrl: "https://i.ex-cdn.com/vietnamfinance.vn/files/f1/news/tunglam/2019/8/29/vnf-tuan-le-vang.jpg"
              }
            ]
          }
        ]
      }
    ]
  },
  obj_book: {
    title: "Phần 2: Bước Ngoặt Lý Luận Lịch Sử",
    subtitle: "Tiến trình phát triển tư tưởng & Sự vận dụng sáng tạo học thuyết Mác - Lênin",
    artifactName: "QUYỂN SÁCH LÝ LUẬN",
    imageUrl: "/assets/book.png",
    paragraphs: [],
    practiceSection: {
      leftColumn: {
        title: "Thực tiễn Việt Nam đầu thế kỷ XX",
        classes: [
          {
            tag: "CÔNG NHÂN (~1%)",
            role: "Lực lượng tiên phong",
            desc: "Tiên phong lãnh đạo nhưng lực lượng quá mỏng, xuất thân từ nông dân.",
            colorTheme: "emerald"
          },
          {
            tag: "NÔNG DÂN (~90%)",
            role: "Lực lượng đông đảo nhất",
            desc: "Bị tước đoạt tư liệu sản xuất, cùng chung cảnh ngộ vô sản hóa.",
            colorTheme: "amber"
          },
          {
            tag: "TƯ SẢN DÂN TỘC & NHÂN SĨ",
            role: "Tầng lớp yêu nước",
            desc: "Bị tư bản Pháp chèn ép, giàu lòng yêu nước",
            warning: "Nếu bài xích giai cấp cực đoan sẽ đẩy họ về phía thực dân.",
            colorTheme: "purple"
          }
        ]
      },
      rightColumn: {
        title: "Sơ đồ luồng: Vận dụng sáng tạo",
        flows: [
          {
            id: "western",
            tag: "MÔ HÌNH KINH ĐIỂN PHƯƠNG TÂY",
            subnote: "Xã hội tư bản phát triển - Mâu thuẫn giai cấp gay gắt",
            steps: [
              "Đấu tranh giai cấp",
              "Giải phóng giai cấp",
              "Giải phóng con người"
            ]
          },
          {
            id: "hcm",
            tag: "SÁNG TẠO HỒ CHÍ MINH TẠI VIỆT NAM",
            subnote: "Xã hội thuộc địa nửa phong kiến - Mâu thuẫn dân tộc là chủ yếu",
            steps: [
              "Đại đoàn kết toàn dân",
              "Giải phóng dân tộc (Tiên quyết)",
              "Giải phóng giai cấp"
            ]
          }
        ]
      }
    }
  },
  obj_diacau: {
    title: "Phần 3: Hành Trang Hướng Tới Tương Lai",
    subtitle: "Ba bài học kinh nghiệm cốt lõi & Giá trị trường tồn của khối Đại đoàn kết toàn dân tộc",
    artifactName: "QUẢ ĐỊA CẦU HỘI NHẬP",
    imageUrl: "/assets/bai_hoc_dai_doan_ket.webp",
    lessons: [
      {
        id: "01",
        title: "PHÁT HUY NGUỒN LỰC TOÀN DÂN",
        bullets: [
          "Mở rộng khối đại đoàn kết mọi tầng lớp, đồng bào trong và ngoài nước.",
          "Khơi dậy sức mạnh toàn diện từ kiều bào, doanh nhân và các tổ chức tôn giáo."
        ],
        quote: "Chung tay vì khát vọng Dân giàu, nước mạnh, dân chủ, công bằng, văn minh."
      },
      {
        id: "02",
        title: "TẠO SỰ ĐỒNG THUẬN XÃ HỘI",
        bullets: [
          "Lấy ấm no, hạnh phúc và lợi ích chính đáng của nhân dân làm điểm tựa gốc.",
          "Hài hòa lợi ích giữa các tầng lớp xã hội, bảo đảm quyền lợi hợp pháp của từng cá nhân."
        ],
        quote: "Đồng thuận bền vững bắt nguồn từ lòng dân và sự công bằng."
      },
      {
        id: "03",
        title: "KIÊN QUYẾT BẢO VỆ KHỐI ĐOÀN KẾT",
        bullets: [
          "Tăng cường sức đề kháng và bản lĩnh tư tưởng trước âm mưu 'diễn biến hòa bình'.",
          "Chủ động nhận diện, kiên quyết đấu tranh phản bác quan điểm sai trái, thù địch."
        ],
        quote: "Giữ vững trận địa tư tưởng để bảo vệ thành quả đại đoàn kết."
      }
    ],
    archivalPhoto: {
      url: "/assets/bai_hoc_dai_doan_ket.webp",
      tag: "TƯ LIỆU LỊCH SỬ",
      title: "Đại hội Đoàn kết toàn dân tộc / Mặt trận Tổ quốc Việt Nam",
      description: "Mốc son khẳng định ý chí thống nhất non sông, quy tụ vạn triệu con tim yêu nước dưới ngọn cờ chung của độc lập và chủ nghĩa xã hội."
    },
    paragraphs: [
      "Kế thừa tư tưởng Hồ Chí Minh về đại đoàn kết toàn dân tộc, ba bài học kinh nghiệm cốt lõi tiếp tục là kim chỉ nam cho sự nghiệp xây dựng, bảo vệ và phát triển đất nước trong kỷ nguyên mới.",
      "Phát huy tối đa nguồn lực toàn dân, củng cố sự đồng thuận xã hội và kiên quyết bảo vệ vững chắc trận địa tư tưởng của khối đại đoàn kết."
    ]
  }
};

export default detailedContent;

import { useTexture } from '@react-three/drei';

// Danh sách toàn bộ tài nguyên hình ảnh bảo tàng cần nạp sẵn vào bộ nhớ đệm
export const CRITICAL_ASSETS = [
  // 1. Phông nền các phòng
  '/assets/background_room.png',
  '/assets/background2.png',

  // 2. Hiện vật 3D Phòng 1
  '/assets/tree.png',
  '/assets/book.png',
  '/assets/truc.png',
  '/assets/earth_map_texture.jpg',

  // 3. Hiện vật 3D Phòng 2 (Bảng lật 2 mặt)
  '/assets/room2_board_front.png',
  '/assets/room2_board_back_v2.jpg',

  // 4. Sprite sheets của Mascot
  '/assets/mascot_idle.png',
  '/assets/mascot_welcome.png',
  '/assets/mascot_thinking.png',
  '/assets/mascot_pointing.png',

  // 5. Ảnh sơ đồ & tư liệu lịch sử quan trọng
  '/assets/so_do_cau_dong_ton_di.png',
  '/assets/so_do_dai_doan_ket.png',
  '/assets/timeline_three_stages.jpg',
  '/assets/stage1_tuyen_ngon_cong_san.png',
  '/assets/stage2_luan_cuong_lenin.jpg',
  '/assets/stage3_duong_kach_menh.png',
  '/assets/bac_ho_dan_toc.jpg',
  '/assets/bac_ho_huynh_thuc_khang.jpg',
  '/assets/bac_ho_nong_dan.jpg',
  '/assets/cong_nhan_mo_than.jpg',
  '/assets/cong_nhan_xe_goong.jpg',
  '/assets/dai_bieu_quoc_hoi_1946.jpg',
  '/assets/hoi_nghi_dien_hong.jpeg',
  '/assets/infographic_100_nguoi.png',
  '/assets/lan_khuoi_nam.jpg',
  '/assets/mit_tinh_nha_hat_lon.jpg',
  '/assets/tuan_le_vang.jpg'
];

/**
 * Preload toàn bộ assets cho cả Three.js và Trình duyệt
 */
export const preloadAllMuseumAssets = () => {
  if (typeof window === 'undefined') return;

  // 1. Nạp trước qua DOM Image (Lưu vào Browser HTTP Cache)
  CRITICAL_ASSETS.forEach(url => {
    try {
      const img = new Image();
      img.src = url;
    } catch (e) {
      console.warn('DOM Image Preload failed for:', url, e);
    }
  });

  // 2. Nạp trước qua Three.js Drei Texture Cache
  CRITICAL_ASSETS.forEach(url => {
    try {
      useTexture.preload(url);
    } catch (e) {
      console.warn('ThreeJS Texture Preload failed for:', url, e);
    }
  });
};

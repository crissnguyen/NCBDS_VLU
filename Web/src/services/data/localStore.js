import { CONFIG } from './config';

const INITIAL_NEWS = [
  {
    id: 'mock_1',
    title: 'Thị trường bất động sản Nha Trang khởi sắc năm 2026',
    excerpt: 'Nhiều phân khúc căn hộ và đất nền ven biển ghi nhận lượng giao dịch tăng trưởng mạnh mẽ trong quý đầu năm.',
    content: 'Theo báo cáo mới nhất, thị trường bất động sản Nha Trang đang có những bước tiến vượt bậc nhờ hạ tầng giao thông kết nối liên vùng được hoàn thiện và dòng vốn FDI đổ mạnh vào du lịch nghỉ dưỡng...',
    category: 'Thị trường',
    featured: true,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    isSynced: false
  },
  {
    id: 'mock_2',
    title: 'Quy hoạch chi tiết phân khu đô thị dọc sông Cái Nha Trang',
    excerpt: 'Tập trung phát triển công viên cây xanh kết hợp các dự án nhà ở thương mại cao cấp ven sông.',
    content: 'Đồ án quy hoạch phân khu dọc sông Cái hướng tới việc giãn dân và kiến tạo hành lang xanh sinh thái kết hợp du lịch đường thủy nội địa cho thành phố biển Nha Trang...',
    category: 'Quy hoạch',
    featured: false,
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isSynced: false
  }
];

const INITIAL_PROPERTIES = [
  {
    id: 'mock_property_1',
    title: 'Căn hộ 2PN Lộc Thọ view biển',
    price: '2.85 tỷ',
    location: 'Nha Trang, Khánh Hòa',
    beds: 2,
    baths: 2,
    area: 68,
    description: 'Căn hộ nằm tại khu vực trung tâm Lộc Thọ, thuận tiện di chuyển ra biển, quảng trường và các tiện ích du lịch. Không gian phù hợp để ở, khai thác cho thuê hoặc đầu tư giữ tài sản dài hạn.',
    transactionType: 'sale',
    propertyType: 'apartment',
    legalStatus: 'pink-book',
    status: 'Approved',
    authorId: 'local_demo_sale',
    author: { name: 'Sale Demo', email: 'sale.demo@estateai.vn' },
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSynced: false
  },
  {
    id: 'mock_property_2',
    title: 'Nhà phố Phước Hải full nội thất',
    price: '4.9 tỷ',
    location: 'Phước Hải, Nha Trang',
    beds: 3,
    baths: 3,
    area: 85,
    description: 'Nhà phố hoàn thiện nội thất, bố trí công năng gọn gàng cho gia đình trẻ. Khu vực dân cư hiện hữu, gần trường học, chợ và trục đường kết nối vào trung tâm.',
    transactionType: 'sale',
    propertyType: 'house',
    legalStatus: 'red-book',
    status: 'Approved',
    authorId: 'local_demo_sale',
    author: { name: 'Sale Demo', email: 'sale.demo@estateai.vn' },
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    isSynced: false
  },
  {
    id: 'mock_property_3',
    title: 'Căn hộ studio trung tâm cho thuê',
    price: '9 triệu/tháng',
    location: 'Vĩnh Hải, Nha Trang',
    beds: 1,
    baths: 1,
    area: 42,
    description: 'Studio sáng thoáng, đã có nội thất cơ bản, phù hợp khách thuê dài hạn hoặc chuyên gia làm việc tại Nha Trang. Khu vực yên tĩnh, dễ tiếp cận tiện ích sinh hoạt hằng ngày.',
    transactionType: 'rent',
    propertyType: 'apartment',
    legalStatus: 'contract',
    status: 'Approved',
    authorId: 'local_demo_sale',
    author: { name: 'Sale Demo', email: 'sale.demo@estateai.vn' },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    isSynced: false
  },
  {
    id: 'mock_property_4',
    title: 'Đất nền gần trục Võ Nguyên Giáp',
    price: '1.95 tỷ',
    location: 'Diên Khánh, Khánh Hòa',
    beds: null,
    baths: null,
    area: 105,
    description: 'Lô đất vuông vức, đường vào thuận tiện, phù hợp xây nhà ở hoặc giữ đầu tư trung hạn. Khu vực hưởng lợi từ hạ tầng kết nối Nha Trang và các đô thị vệ tinh.',
    transactionType: 'sale',
    propertyType: 'land',
    legalStatus: 'red-book',
    status: 'Pending',
    authorId: 'local_demo_sale',
    author: { name: 'Sale Demo', email: 'sale.demo@estateai.vn' },
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
    ],
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
    isSynced: false
  },
  {
    id: 'mock_property_5',
    title: 'Villa nghỉ dưỡng hồ bơi riêng',
    price: '12.5 tỷ',
    location: 'Cam Ranh, Khánh Hòa',
    beds: 4,
    baths: 5,
    area: 220,
    description: 'Villa nghỉ dưỡng thiết kế mở, có hồ bơi riêng và không gian sân vườn rộng. Phù hợp cho khách tìm sản phẩm second home hoặc khai thác lưu trú cao cấp.',
    transactionType: 'sale',
    propertyType: 'house',
    legalStatus: 'pink-book',
    status: 'Approved',
    authorId: 'local_demo_sale',
    author: { name: 'Sale Demo', email: 'sale.demo@estateai.vn' },
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=1200&q=80'
    ],
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
    isSynced: false
  },
  {
    id: 'mock_property_6',
    title: 'Căn hộ đang chờ duyệt để test admin',
    price: '3.2 tỷ',
    location: 'Vĩnh Trường, Nha Trang',
    beds: 2,
    baths: 2,
    area: 72,
    description: 'Tin mẫu trạng thái chờ duyệt, dùng để kiểm tra giao diện phê duyệt của admin trong môi trường local.',
    transactionType: 'sale',
    propertyType: 'apartment',
    legalStatus: 'pink-book',
    status: 'Pending',
    authorId: 'local_demo_sale',
    author: { name: 'Sale Demo', email: 'sale.demo@estateai.vn' },
    images: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'
    ],
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    updatedAt: new Date(Date.now() - 18000000).toISOString(),
    isSynced: false
  }
];

const INITIAL_CONTACTS = [
  {
    id: 'mock_contact_1',
    name: 'Nguyễn Văn A',
    email: 'nva@gmail.com',
    phone: '0912345678',
    subject: 'Tư vấn căn hộ Lộc Thọ view biển',
    message: 'Chào bạn, tôi đang quan tâm căn hộ Lộc Thọ view biển có giá 2.85 tỷ. Cho hỏi pháp lý đã có sổ hồng chưa và có hỗ trợ vay ngân hàng không?',
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'mock_contact_2',
    name: 'Trần Thị B',
    email: 'ttb@yahoo.com',
    phone: '0988888888',
    subject: 'Ký gửi nhà đất Nha Trang',
    message: 'Tôi muốn ký gửi căn nhà phố 3 tầng tại Phước Hải để bán gấp trước mùa mưa.',
    status: 'Replied',
    replyText: 'Chào chị B, bên em đã nhận được thông tin. Sẽ có nhân viên liên hệ để kiểm tra thực tế nhà phố và hỗ trợ làm hồ sơ ký gửi ạ.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

const INITIAL_LEADS = [
  {
    id: 'lead_1',
    name: 'Đặng Hoàng Nam',
    phone: '0988 123 456',
    email: 'hoangnam.capital@gmail.com',
    type: 'vip_buyer', // vip_buyer, vip_renter, high_visitor, hot_lead
    totalPurchases: 4,
    totalRentals: 1,
    totalVisits: 168,
    budget: '20 - 45 tỷ',
    preferredType: 'Biệt thự, Căn hộ cao cấp',
    preferredLocation: 'Nha Trang ven biển, TP.HCM',
    leadScore: 96,
    assignedSale: 'Nguyễn Duy Đức',
    status: 'consulting', // hot, consulting, viewing, closed, nurturing
    lastActive: '15 phút trước',
    notes: 'Nhà đầu tư lớn, vừa chốt 1 căn biệt thự tháng trước, đang tìm thêm căn thứ 2 ven biển tài chính 30 tỷ.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lead_2',
    name: 'Lê Thị Bích Phượng',
    phone: '0903 892 114',
    email: 'phuong.le@vinasea.com',
    type: 'vip_renter',
    totalPurchases: 0,
    totalRentals: 5,
    totalVisits: 112,
    budget: '35 - 70 triệu/tháng',
    preferredType: 'Shophouse, Căn hộ 3PN',
    preferredLocation: 'Bình Thạnh, TP.HCM & Cầu Giấy',
    leadScore: 91,
    assignedSale: 'Trần Hữu Phúc',
    status: 'viewing',
    lastActive: '2 giờ trước',
    notes: 'Doanh nghiệp thuê dài hạn cho chuyên gia nước ngoài và văn phòng đại diện. Cần thuê thêm 2 căn trong tháng tới.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'lead_3',
    name: 'Vũ Minh Trí',
    phone: '0918 776 230',
    email: 'minhtri.tech@outlook.com',
    type: 'high_visitor',
    totalPurchases: 1,
    totalRentals: 0,
    totalVisits: 215,
    budget: '3 - 6 tỷ',
    preferredType: 'Đất nền thổ cư, Nhà phố',
    preferredLocation: 'Cam Lâm, Khánh Hòa',
    leadScore: 88,
    assignedSale: 'Nguyễn Duy Đức',
    status: 'hot',
    lastActive: 'Hôm nay',
    notes: 'Khách hàng truy cập website mỗi ngày (xem tin Đất nền Cam Lâm hơn 14 lần tuần này). Đã lưu 6 tin quan tâm.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'lead_4',
    name: 'Phạm Quang Khải',
    phone: '0975 432 999',
    email: 'khai.pham@vietreal.vn',
    type: 'vip_buyer',
    totalPurchases: 3,
    totalRentals: 2,
    totalVisits: 145,
    budget: '15 - 30 tỷ',
    preferredType: 'Shophouse thương mại',
    preferredLocation: 'Thủ Đức, TP.HCM & Long Biên',
    leadScore: 94,
    assignedSale: 'Hoàng Anh Tuấn',
    status: 'closed',
    lastActive: 'Hôm qua',
    notes: 'Nhà đầu tư chuyên săn shophouse khai thác dòng tiền cho thuê. Độ tin cậy và nguồn tài chính cực mạnh.',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'lead_5',
    name: 'Trần Thanh Thảo',
    phone: '0938 665 120',
    email: 'thaotran.design@gmail.com',
    type: 'high_visitor',
    totalPurchases: 0,
    totalRentals: 2,
    totalVisits: 98,
    budget: '15 - 25 triệu/tháng',
    preferredType: 'Căn hộ 2PN Full nội thất',
    preferredLocation: 'Quận Cầu Giấy, Hà Nội',
    leadScore: 82,
    assignedSale: 'Lê Thị Kim Ngân',
    status: 'consulting',
    lastActive: '3 ngày trước',
    notes: 'Quan tâm dự án D\'Capitale và Masteri, thường xuyên so sánh giá thuê các dự án trung tâm.',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'lead_6',
    name: 'Ngô Văn Hùng',
    phone: '0909 332 118',
    email: 'hung.ngo79@yahoo.com',
    type: 'hot_lead',
    totalPurchases: 0,
    totalRentals: 0,
    totalVisits: 54,
    budget: '18 - 25 tỷ',
    preferredType: 'Nhà phố liền kề',
    preferredLocation: 'Sala Đại Quang Minh, TP.HCM',
    leadScore: 85,
    assignedSale: 'Nguyễn Duy Đức',
    status: 'hot',
    lastActive: '10 phút trước',
    notes: 'Khách hàng tiềm năng mới gửi yêu cầu xem trực tiếp pháp lý căn Sala. Có tài chính sẵn sàng giải ngân nhanh.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  }
];

export const localStore = {
  get: (key) => {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        if (key === CONFIG.LOCAL_KEYS.NEWS) {
          localStore.set(key, INITIAL_NEWS);
          return INITIAL_NEWS;
        }
        if (key === CONFIG.LOCAL_KEYS.PROPERTIES) {
          localStore.set(key, INITIAL_PROPERTIES);
          return INITIAL_PROPERTIES;
        }
        if (key === CONFIG.LOCAL_KEYS.CONTACTS) {
          localStore.set(key, INITIAL_CONTACTS);
          return INITIAL_CONTACTS;
        }
        if (key === CONFIG.LOCAL_KEYS.LEADS) {
          localStore.set(key, INITIAL_LEADS);
          return INITIAL_LEADS;
        }
        return [];
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length === 0 && key === CONFIG.LOCAL_KEYS.PROPERTIES) {
        localStore.set(key, INITIAL_PROPERTIES);
        return INITIAL_PROPERTIES;
      }
      if (Array.isArray(parsed) && parsed.length === 0 && key === CONFIG.LOCAL_KEYS.NEWS) {
        localStore.set(key, INITIAL_NEWS);
        return INITIAL_NEWS;
      }
      if (Array.isArray(parsed) && parsed.length === 0 && key === CONFIG.LOCAL_KEYS.CONTACTS) {
        localStore.set(key, INITIAL_CONTACTS);
        return INITIAL_CONTACTS;
      }
      if (Array.isArray(parsed) && parsed.length === 0 && key === CONFIG.LOCAL_KEYS.LEADS) {
        localStore.set(key, INITIAL_LEADS);
        return INITIAL_LEADS;
      }
      return parsed;
    } catch (e) {
      console.error('Lỗi đọc local storage:', e);
      return [];
    }
  },

  set: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Lỗi ghi local storage:', e);
      return false;
    }
  },

  insert: (key, item) => {
    const list = localStore.get(key);
    const newItem = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isSynced: false,
      ...item
    };
    list.unshift(newItem);
    localStore.set(key, list);
    return newItem;
  },

  update: (key, id, updatedData) => {
    const list = localStore.get(key);
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedData, isSynced: false };
      localStore.set(key, list);
      return list[index];
    }
    return null;
  },

  delete: (key, id) => {
    const list = localStore.get(key);
    const filtered = list.filter(item => item.id !== id);
    localStore.set(key, filtered);
    return true;
  }
};

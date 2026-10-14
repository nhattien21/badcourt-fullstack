const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Court = require('./models/Court');
const Booking = require('./models/Booking');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Court.deleteMany();
    await Booking.deleteMany();

    // 1. Tài khoản thử nghiệm
    const admin = await User.create({
      fullName: 'Quản Trị Viên',
      phoneNumber: '0901234567',
      email: 'admin@badminton.com',
      password: 'password123',
      role: 'ADMIN'
    });

    const customers = await User.create([
      {
        fullName: 'Nguyễn Văn A',
        phoneNumber: '0987654321',
        email: 'khachhang@gmail.com',
        password: 'password123',
        role: 'CUSTOMER'
      },
      {
        fullName: 'Trần Thị Mai',
        phoneNumber: '0912345678',
        email: 'mai.tran@gmail.com',
        password: 'password123',
        role: 'CUSTOMER'
      },
      {
        fullName: 'Lê Hoàng Long',
        phoneNumber: '0933456789',
        email: 'long.le@gmail.com',
        password: 'password123',
        role: 'CUSTOMER'
      },
      {
        fullName: 'Phạm Đức Huy',
        phoneNumber: '0977889900',
        email: 'huy.pham@gmail.com',
        password: 'password123',
        role: 'CUSTOMER'
      }
    ]);

    // 2. Danh sách 60 sân cầu lông (Giữ nguyên vẹn 100%)
    const courtsData = [
      // ========================================================
      // 10 SÂN ĐẦU TIÊN: MIỄN PHÍ 100% CHO HỌC SINH - SINH VIÊN
      // ========================================================
      {
        name: 'Sân Cầu Lông ĐH Thủy Lợi (Miễn phí HSSV)',
        type: 'STANDARD',
        pricePerHour: 0,
         images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQahEJAK_C4tFMVRO0TeAxUhZZ3HbslojjTJg1gg_tQJw&s=10', // Ảnh đại diện sân
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRELmZRWr3fQpd_MBBfyAGyUBmfgGLgBZsjRGehgV5K6A&s=10', // Góc chụp thảm & lưới
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOvWqSbNfgyxcogR0CboQZ-bcoZ2m7dgZN2eqid4pPCg&s=10', // Khán đài / toàn cảnh
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQahEJAK_C4tFMVRO0TeAxUhZZ3HbslojjTJg1gg_tQJw&s=10'  // Khu vực nghỉ / khởi động
    ],
        status: 'AVAILABLE',
        description: 'Ngõ 95 Chùa Bộc, Trung Liệt, Đống Đa, Hà Nội. [Ưu đãi đặc biệt] Miễn phí 100% giờ chơi cho Học sinh - Sinh viên khi xuất trình thẻ HSSV hợp lệ.'
      },
      {
        name: 'Sân Cầu Lông ĐH Ngoại Thương (Miễn phí HSSV)',
        type: 'STANDARD',
        pricePerHour: 0,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_ySYMcQZDbDibvvwTXzAbKL4BMSAVXRB5U1ZlAAL9tg&s=10'],
        status: 'AVAILABLE',
        description: 'Số 91 Chùa Láng, Láng Thượng, Đống Đa, Hà Nội. [Ưu đãi HSSV] Miễn phí sân tập phong trào rèn luyện thể chất cho học sinh, sinh viên các trường.'
      },
      {
        name: 'Sân Cầu Lông Học Viện Ngân Hàng (Miễn phí HSSV)',
        type: 'STANDARD',
        pricePerHour: 0,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlJ9sw9aoFXbDrzn6O41_nBv2mVXDnjzO2kSBenldmvQ&s=10'],
        status: 'AVAILABLE',
        description: 'Số 12 Chùa Bộc, Quang Trung, Đống Đa, Hà Nội. [Tài trợ HSSV] Miễn phí hoàn toàn tiền thuê sân cho học sinh sinh viên đến giao lưu tập luyện.'
      },
      {
        name: 'Sân Cầu Lông ĐH Sư Phạm TP.HCM (Miễn phí HSSV)',
        type: 'STANDARD',
        pricePerHour: 0,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXnutj93A2p2r57chofTiucb8SxU1MiGK3Zuydl97o3w&s=10'],
        status: 'AVAILABLE',
        description: '280 An Dương Vương, Phường 4, Quận 5, TP.HCM. Nhà thi đấu đa năng mở cửa miễn phí cho học sinh - sinh viên rèn luyện sức khỏe.'
      },
      {
        name: 'Sân Cầu Lông ĐH Bách Khoa Hà Nội (Miễn phí HSSV)',
        type: 'STANDARD',
        pricePerHour: 0,
        images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800'],
        status: 'AVAILABLE',
        description: 'Số 1 Đại Cồ Việt, Bách Khoa, Hai Bà Trưng, Hà Nội. Khu liên hợp thể thao ĐH Bách Khoa tài trợ miễn phí khung giờ tập cho sinh viên.'
      },
      {
        name: 'Sân Cầu Lông ĐH Sư Phạm TDTT Hà Nội (Miễn phí HSSV)',
        type: 'STANDARD',
        pricePerHour: 0,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBUM574YDUvxE0nHmsamYniKqZ-r3MTAfL_LenrOLmsA&s=10'],
        status: 'AVAILABLE',
        description: 'Phụng Châu, Chương Mỹ, Hà Nội. Hỗ trợ miễn phí đặt sân tập luyện cho các giải đấu và hoạt động học sinh sinh viên toàn thành phố.'
      },
      {
        name: 'Sân Cầu Lông Nhà Thiếu Nhi Quận 1 (Miễn phí HSSV)',
        type: 'STANDARD',
        pricePerHour: 0,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU82qkpPLBCEayIZjxC7WdCQEZfPy8tMgdI5NzUcS-Hg&s=10'],
        status: 'AVAILABLE',
        description: 'Số 7 Cô Bắc, Phường Cầu Ông Lãnh, Quận 1, TP.HCM. Không gian thể thao cộng đồng ưu đãi 0đ cho học sinh, thanh thiếu niên dưới 22 tuổi.'
      },
      {
        name: 'Sân Cầu Lông THCS Khương Thượng (Miễn phí HSSV)',
        type: 'STANDARD',
        pricePerHour: 0,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTddymhKhkr4_53CYrwKFv7IkMlGr6Tc340yJRYwcFPsQ&s=10'],
        status: 'AVAILABLE',
        description: 'Ngõ 10 Tôn Thất Tùng, Khương Thượng, Đống Đa, Hà Nội. Hỗ trợ câu lạc bộ cầu lông học sinh sinh viên sinh hoạt miễn phí ngoài giờ học.'
      },
      {
        name: 'Sân Cầu Lông Cung Thiếu Nhi Hà Nội (Miễn phí HSSV)',
        type: 'STANDARD',
        pricePerHour: 0,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRM72SxU48IBBFxmnkOPF7CeGCeunpq0zii6VIdaDHovw&s=10'],
        status: 'AVAILABLE',
        description: '36-38 Lý Thái Tổ, Lý Thái Tổ, Hoàn Kiếm, Hà Nội. Miễn phí cho học sinh sinh viên đam mê cầu lông có đăng ký trước.'
      },
      {
        name: 'Sân Cầu Lông KTX Đại học Quốc Gia TP.HCM (Miễn phí HSSV)',
        type: 'STANDARD',
        pricePerHour: 0,
        images: ['https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=800'],
        status: 'AVAILABLE',
        description: 'Khu B ĐHQG, Phường Đông Hòa, Dĩ An, TP.HCM. Cụm sân thảm nhựa thể thao phục vụ hoàn toàn miễn phí cho sinh viên làng đại học.'
      },

      // ========================================================
      // 50 SÂN CẦU LÔNG THỰC TẾ TIẾP THEO (CÓ GIÁ THEO KHUNG GIỜ)
      // ========================================================
      {
        name: 'Câu Lạc Bộ Cầu Lông Tây Hồ',
        type: 'VIP',
        pricePerHour: 120000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkJwEn2SK_f1MuX6PiFmxmi-u-_gdWsO6JkjOuNwPLUA&s=10'],
        status: 'AVAILABLE',
        description: 'Số 10 Thụy Khuê, Tây Hồ, Hà Nội. Sân thảm chuyên dụng thi đấu, đèn chống lóa hiện đại.'
      },
      {
        name: 'Sân Cầu Lông Swin - THPT Cầu Giấy',
        type: 'STANDARD',
        pricePerHour: 110000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIWLM8HZvzI1sx3HwVBRnTb3kzNNIhcXuT0sEmc5pCtg&s=10'],
        status: 'AVAILABLE',
        description: 'Số 8 ngõ 118 Nguyễn Khánh Toàn, Cầu Giấy, Hà Nội. Trần cao 11m, thảm PVC đạt chuẩn.'
      },
      {
        name: 'Sân Cầu Lông Phúc Long - 76 An Dương',
        type: 'VIP',
        pricePerHour: 130000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGzhfZHRSGo269T3yIvzRLhaTCEvuVGExfSoJdE0GJGA&s'],
        status: 'AVAILABLE',
        description: 'Cơ sở 1: Số 9a ngõ 76 ngách 35 An Dương, Tây Hồ, Hà Nội. Quy mô 7 sân thảm Yonex.'
      },
      {
        name: 'Phúc Long Badminton - 460 Trần Quý Cáp',
        type: 'STANDARD',
        pricePerHour: 100000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3-xur0ZBuS3Mgoz45YXnb7I2TBSAnAldJ5-cZ5_6TeA&s=10'],
        status: 'AVAILABLE',
        description: 'Phố Trần Quý Cáp, Văn Miếu, Đống Đa, Hà Nội. Phục vụ liên tục từ 05:00 đến 24:00.'
      },
      {
        name: 'Sân Cầu Lông Đức Thảo 52 Tân Ấp',
        type: 'STANDARD',
        pricePerHour: 90000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6mx3wanQxUBrs0E1TWdfoXReCrpM8aLndrEt2jYwH0g&s=10'],
        status: 'AVAILABLE',
        description: '52 Tân Ấp, Phúc Xá, Ba Đình, Hà Nội. Giá bình dân, bãi đỗ xe máy thuận tiện.'
      },
      {
        name: 'Sân Cầu Lông 115 Quán Thánh',
        type: 'STANDARD',
        pricePerHour: 100000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyWPSOr5Ix-lDeGSVomOgy6_fzi2q6c0OTLNnple2aZw&s=10'],
        status: 'AVAILABLE',
        description: '115 Quán Thánh, Ba Đình, Hà Nội. Thảm PVC cao cấp độ bám tốt, 5 sân tiêu chuẩn.'
      },
      {
        name: 'Sân Cầu Lông Cung Thể Thao Quần Ngựa',
        type: 'VIP',
        pricePerHour: 150000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEuMP2hwyvQEOHrq5jFWjXpeWcIuwhdTz6hRpgJL8zww&s=10'],
        status: 'AVAILABLE',
        description: '30 Văn Cao, Liễu Giai, Ba Đình, Hà Nội. Địa điểm tổ chức các giải đấu chuyên nghiệp.'
      },
      {
        name: 'Sân Cầu Lông Duy Hưng - Đốc Ngữ',
        type: 'STANDARD',
        pricePerHour: 100000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW9PSTc5iK43k8hekk69hYW3eDr2TWb762fpWD50nS9Q&s=10'],
        status: 'AVAILABLE',
        description: '120 Đốc Ngữ, Vĩnh Phúc, Ba Đình, Hà Nội. Không gian yên tĩnh, có quầy nước và chỗ tắm.'
      },
      {
        name: 'Sân Cầu Lông Ban Cơ Yếu Chính Phủ',
        type: 'STANDARD',
        pricePerHour: 95000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQVedJJbrkEsP2Q4nKOb_9dqNPzMuSy-JJn0JWSjSXww&s=10'],
        status: 'AVAILABLE',
        description: '107 Nguyễn Chí Thanh, Láng Thượng, Đống Đa, Hà Nội. Trần cao, hệ thống chiếu sáng chuẩn.'
      },
      {
        name: 'Sân Cầu Lông Fleet Hồ Đắc Di',
        type: 'VIP',
        pricePerHour: 130000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGicX94nYWst3xyHVI3SSY2oypg1zx6QPbF3Kce-dgZQ&s=10'],
        status: 'AVAILABLE',
        description: 'Ngõ 141 Hồ Đắc Di, Nam Đồng, Đống Đa, Hà Nội. Thảm Fleet xịn độ đàn hồi tuyệt hảo.'
      },
      {
        name: 'Sân Cầu Lông 178 Đường Láng',
        type: 'STANDARD',
        pricePerHour: 90000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIWLM8HZvzI1sx3HwVBRnTb3kzNNIhcXuT0sEmc5pCtg&s=10'],
        status: 'AVAILABLE',
        description: '178 Đường Láng, Thịnh Quang, Đống Đa, Hà Nội. Sân chơi phong trào đông vui, nhộn nhịp.'
      },
      {
        name: 'Sân Cầu Lông Bộ Công An 1194 Đường Láng',
        type: 'STANDARD',
        pricePerHour: 85000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3-xur0ZBuS3Mgoz45YXnb7I2TBSAnAldJ5-cZ5_6TeA&s=10'],
        status: 'AVAILABLE',
        description: '1194 Đường Láng, Láng Thượng, Đống Đa, Hà Nội. An ninh đảm bảo, vệ sinh sạch sẽ.'
      },
      {
        name: 'Sân Cầu Lông Minh Toàn CS2',
        type: 'STANDARD',
        pricePerHour: 110000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpr3r-t_2x3o1soYkVo9IMGnvhvafaX-Vq0rEV5hB7kg&s'],
        status: 'AVAILABLE',
        description: 'Ngõ 282 Nguyễn Xiển, Thanh Xuân, Hà Nội. Mặt sân nhựa chống trượt, trần thông thoáng.'
      },
      {
        name: 'Sân Cầu Lông 1991 Club',
        type: 'VIP',
        pricePerHour: 135000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMCBtcGEQ6uNAXH0pcSkQ-_63fp5VImEXbi5eBBmqJ2Q&s=10'],
        status: 'AVAILABLE',
        description: 'Ngách 86 ngõ 286 Nguyễn Xiển, Tân Triều, Thanh Trì, Hà Nội. Đèn LED cao cấp chống chói.'
      },
      {
        name: 'Sân Cầu Lông Vũ Hữu - Trung Văn',
        type: 'STANDARD',
        pricePerHour: 80000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNUwU_T3aKbXrwD9DVAUVuD4IhYJZF1mwhxxjmGBizhg&s=10'],
        status: 'AVAILABLE',
        description: '266 Vũ Hữu, Trung Văn, Nam Từ Liêm, Hà Nội. Màn che chống gió, giá thuê hợp lý.'
      },
      {
        name: 'Sân Cầu Lông Nhà Thi Đấu Cầu Giấy',
        type: 'VIP',
        pricePerHour: 150000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNWxeSHUT99ZCRWjETSdN1JZrrOqL0Y3tlzI-V11TbnQ&s=10'],
        status: 'AVAILABLE',
        description: 'Số 35 Trần Quý Kiên, Dịch Vọng, Cầu Giấy, Hà Nội. Cụm 9 sân thi đấu chuyên nghiệp.'
      },
      {
        name: 'Sân Cầu Lông Dương Đình Nghệ',
        type: 'STANDARD',
        pricePerHour: 110000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTL7bcOztu8kitf7AobCrh_nGbr0N7CDnb9EBO3d4_1yw&s=10'],
        status: 'AVAILABLE',
        description: '86 Dương Đình Nghệ, Yên Hòa, Cầu Giấy, Hà Nội. Vị trí trung tâm thuận tiện di chuyển.'
      },
      {
        name: 'Sân Cầu Lông Lãng Yên - Hai Bà Trưng',
        type: 'STANDARD',
        pricePerHour: 85000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUf2RFS7QFjHaiFH5PyiyQr8GBkAioMgADpZCaOtij0A&s=10'],
        status: 'AVAILABLE',
        description: '123/2 Lãng Yên, Thanh Lương, Hai Bà Trưng, Hà Nội. Thích hợp cho người mới tập làm quen.'
      },
      {
        name: 'Sân Cầu Lông Minh Khai 521',
        type: 'STANDARD',
        pricePerHour: 95000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIWLM8HZvzI1sx3HwVBRnTb3kzNNIhcXuT0sEmc5pCtg&s=10'],
        status: 'AVAILABLE',
        description: '521 Minh Khai, Vĩnh Tuy, Hai Bà Trưng, Hà Nội. Cụm 7 sân nhỏ có phòng thay đồ đầy đủ.'
      },
      {
        name: 'Sân Cầu Lông Công Viên Thống Nhất',
        type: 'STANDARD',
        pricePerHour: 90000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSamVlwuyzVHC1KTOSQg299D2sEG4yC8lo5Hi6b0Rd8Eg&s=10'],
        status: 'AVAILABLE',
        description: 'Phố Trần Nhân Tông, Lê Đại Hành, Hai Bà Trưng, Hà Nội. Không khí trong lành, mát mẻ.'
      },
      {
        name: 'Sân Cầu Lông Trường THCS Giảng Võ',
        type: 'STANDARD',
        pricePerHour: 100000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8tIzntAD-p3Q8xBDbooawed20fEdNhOspbGWQwW6b3A&s=10'],
        status: 'AVAILABLE',
        description: '105 Ngõ 12 Núi Trúc, Giảng Võ, Ba Đình, Hà Nội. Sân nhà thể chất thoáng mát sạch đẹp.'
      },
      {
        name: 'Sân Cầu Lông Tiến Dinh Sport',
        type: 'VIP',
        pricePerHour: 140000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9FzABcnIubHjxXrcNY9jVNyDoTEffNVUFza1_GVN0KQ&s=10'],
        status: 'AVAILABLE',
        description: 'Tòa B 488 Minh Khai, Vĩnh Tuy, Hai Bà Trưng, Hà Nội. 10 sân hiện đại, dịch vụ chuyên nghiệp.'
      },
      {
        name: 'Sân Cầu Lông La Khê - Hà Đông',
        type: 'STANDARD',
        pricePerHour: 95000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFckgiicj5e_DYukEGlCw1qYLZ5F-Fl1NVP2wFZlvkMw&s=10'],
        status: 'AVAILABLE',
        description: 'Làng La Khê, Hà Đông, Hà Nội. Sân rộng rãi, thích hợp người chơi khu vực Hà Đông.'
      },
      {
        name: 'Sân Cầu Lông Vina Badminton Thanh Trì',
        type: 'STANDARD',
        pricePerHour: 100000,
        images: ['https://img.thegioithethao.vn/thumbs/san-cau-long/ha-noi/thanh-tri/san-cau-long-vina-badminton-tong-cuc-5/san-cau-long-vina-badminton-tong-cuc-5-1_1_thumb_150.webp'],
        status: 'AVAILABLE',
        description: 'Khu Đô Thị Tổng Cục 5, Tân Triều, Thanh Trì, Hà Nội. Cụm sân mới hoàn thiện sạch đẹp.'
      },
      {
        name: 'Sân Cầu Lông HG Thanh Trì',
        type: 'STANDARD',
        pricePerHour: 90000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoGHo76RLsb8iX_26bqy8KnO_unRmlvE3H3-aT7MMpng&s=10'],
        status: 'AVAILABLE',
        description: 'Ngõ 512 Ngọc Hồi, Vĩnh Quỳnh, Thanh Trì, Hà Nội. 5 sân thảm mới, mở cửa từ 05:00 sáng.'
      },
      {
        name: 'Sân Cầu Lông Trường Việt Hưng Long Biên',
        type: 'STANDARD',
        pricePerHour: 95000,
        images: ['https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=800'],
        status: 'AVAILABLE',
        description: 'Phố Hoa Lâm, Ngô Gia Tự, Long Biên, Hà Nội. Sân phù hợp cho gia đình và nhóm bạn tập luyện.'
      },
      {
        name: 'Sân Cầu Lông Lê Văn Hiến Bắc Từ Liêm',
        type: 'STANDARD',
        pricePerHour: 85000,
        images: ['https://sportnet.vn/uploads/venue/1086/san-cau-long-truong-th-viet-hung-album--1725434363.jpeg','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQws48Pqyb2I2dMy2OZfl6XHnTsgDgJjduVM9BZW9ECEw&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5Hm1joyQ8QF_63TL5Hhp1_O9_3x8seyqro3DneOHMag&s=10'],
        status: 'AVAILABLE',
        description: 'Số 58 Lê Văn Hiến, Đông Ngạc, Bắc Từ Liêm, Hà Nội. 4 sân hoạt động liên tục các ngày trong tuần.'
      },
      {
        name: 'Sân Cầu Lông Xuân Đỉnh',
        type: 'STANDARD',
        pricePerHour: 90000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSczbTVX67hurdWkODWwKsSn5N6n_3eoQ-lWirCtesycw&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgGksOqWtB_G5a0Tfcfydm2ShxRP4QQumir9r7PflXGA&s','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVfYiFJZh1eqYCEzKCDm9z_n0r1viVQBzY7qhiTznpkA&s=10'],
        status: 'AVAILABLE',
        description: '176 Xuân Đỉnh, Bắc Từ Liêm, Hà Nội. Có khu nghỉ ngơi và nhà vệ sinh khép kín sạch sẽ.'
      },
      {
        name: 'Sân Cầu Lông BOP Phạm Hồng Thái',
        type: 'STANDARD',
        pricePerHour: 95000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpB7slk-c143g8PEd6gkr5Kt93Simy2yp6uFY4BMk_8g&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIR_e14o2s2VuUY9brJ0s8h3NfVIzm_uluXD5sV8_4kA&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa2gSz381IUMG8cc-7T_KcUF3J2mfJFHHCTBIBtbZGgQ&s=10'],
        status: 'AVAILABLE',
        description: 'Số 1 Nguyễn Văn Ngọc, Cống Vị, Ba Đình, Hà Nội. Sân thảm cao su êm ái, bảo vệ khớp gối.'
      },
      {
        name: 'Sân Cầu Lông Kỳ Hòa Quận 10',
        type: 'VIP',
        pricePerHour: 120000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2kD6gDzRi_Nts70ZyPVzFvEUy5pHZpTSMNgzsKPqg0Q&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsK8bDV54IDvrwehTvcZ3m2jULQS6UerlCD4rGkczQ6w&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2kD6gDzRi_Nts70ZyPVzFvEUy5pHZpTSMNgzsKPqg0Q&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRCVuaqV2QTC7uxugB82u7cKeMtxRap-aBKVf88SEIew&s=10'],
        status: 'AVAILABLE',
        description: '238 Đường 3 Tháng 2, Phường 12, Quận 10, TP.HCM. Cụm sân trung tâm nổi tiếng nhất TP.HCM.'
      },
      {
        name: 'Sân Cầu Lông Nhà Thi Đấu Phú Thọ',
        type: 'VIP',
        pricePerHour: 150000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi3P0fuNoXGWCGEnkQzJ0c7SKijSZqJnFdRoFcOgU7NA&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbrWHkoUPTnEbKdJuweSKUqW2Hls4YXVToUeKPLjZdlg&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOP9lmKnUbFTKS_HmXUxDQaTvnDmtgWnhl8eHm1FAoGA&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtwO-EXueZLSVR4LLGrczhUjk47MqzDCrPwGfyg3TFcQ&s=10'],
        status: 'AVAILABLE',
        description: 'Lầu 1, Số 1 Lữ Gia, Phường 15, Quận 11, TP.HCM. Sân chuẩn thi đấu quốc tế, khán đài lớn.'
      },
      {
        name: 'Sân Cầu Lông Cung Văn Hóa Lao Động',
        type: 'STANDARD',
        pricePerHour: 95000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt_3B4k3p41fGOYkFueZnMswtxwKdQCKXUD8XZY22utA&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVI4i05Er9lO8B90gWwiVT-VkDnqyZSIZLc-gfgZSrqQ&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD21AhAxtRgLVE1_uzqd18eJhjFf9XjQhhMD6gXhLKOw&s=10','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3aHMGSTGoA7KMZpNiyUs9MkeXp23SBL_QNtXDCJM3nQ&s=10'],
        status: 'AVAILABLE',
        description: 'Số 55B Nguyễn Thị Minh Khai, Bến Thành, Quận 1, TP.HCM. 4 sân tiêu chuẩn, vị trí quận 1 tiện lợi.'
      },
      {
        name: 'Sân Cầu Lông Tao Đàn',
        type: 'VIP',
        pricePerHour: 130000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8tIzntAD-p3Q8xBDbooawed20fEdNhOspbGWQwW6b3A&s=10'],
        status: 'AVAILABLE',
        description: 'Số 1 Huyền Trân Công Chúa, Bến Thành, Quận 1, TP.HCM. 8 sân tiêu chuẩn, view công viên mát mẻ.'
      },
      {
        name: 'Sân Cầu Lông Nhà Thi Đấu Nguyễn Du',
        type: 'VIP',
        pricePerHour: 140000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9lA9GSRubymH7fdqGXdS5sqCsLi6Y8AyEhLtsHybgXw&s=10'],
        status: 'AVAILABLE',
        description: '116 Nguyễn Du, Bến Thành, Quận 1, TP.HCM. Sàn gỗ lót thảm thi đấu đẳng cấp cao.'
      },
      {
        name: 'Sân Cầu Lông Xí Nghiệp Toa Xe Sài Gòn',
        type: 'STANDARD',
        pricePerHour: 90000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMGfR4W6vdWwhWssfJFfRFc24c4p1p9pZcm6046vEmcA&s=10'],
        status: 'AVAILABLE',
        description: 'Hẻm 540 Cách Mạng Tháng 8, Phường 11, Quận 3, TP.HCM. 3 sân thảm tốt, mở cửa đến 23:00.'
      },
      {
        name: 'Sân Cầu Lông Lam Sơn Quận 5',
        type: 'STANDARD',
        pricePerHour: 100000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvq-AtZNu1CSU-IlMQRm1dTIyleae7AVi7Cj2tN7hZNQ&s'],
        status: 'AVAILABLE',
        description: 'Số 1 Trần Bình Trọng, Phường 4, Quận 5, TP.HCM. Không gian rộng thoáng, bãi xe ô tô.'
      },
      {
        name: 'Sân Cầu Lông Long Viên Quận 7',
        type: 'STANDARD',
        pricePerHour: 110000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMGfR4W6vdWwhWssfJFfRFc24c4p1p9pZcm6046vEmcA&s=10'],
        status: 'AVAILABLE',
        description: '414/13 Trần Xuân Soạn, Tân Hưng, Quận 7, TP.HCM. Sân sạch sẽ, có căn tin phục vụ đồ uống.'
      },
      {
        name: 'Sân Cầu Lông T793 Trần Xuân Soạn',
        type: 'STANDARD',
        pricePerHour: 100000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo30nlV8p1_Yl7ksZ5zm4o7b_C6IPr0wDnOYab0BkEKA&s=10'],
        status: 'AVAILABLE',
        description: 'Hẻm 793 Trần Xuân Soạn, Tân Hưng, Quận 7, TP.HCM. Phục vụ xuyên suốt từ 05:30 đến 24:00.'
      },
      {
        name: 'Sân Cầu Lông Hưng Phú Quận 8',
        type: 'STANDARD',
        pricePerHour: 80000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGAVj6c4uMyACcAQY9-QHXDws0mmN6mGiYRh3iyZhRwA&s=10'],
        status: 'AVAILABLE',
        description: 'Số 833 Hưng Phú, Phường 10, Quận 8, TP.HCM. Mức giá thuê rẻ, phù hợp học sinh và sinh viên.'
      },
      {
        name: 'Sân Cầu Lông Bông Sao Quận 8',
        type: 'STANDARD',
        pricePerHour: 80000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlWNIr5hC-Aa1wrbGfr7wggaASOHDuXbeeN5UR9ZLEAw&s=10'],
        status: 'AVAILABLE',
        description: 'Số 58/10 Bông Sao, Phường 5, Quận 8, TP.HCM. Sân tập phong trào vui vẻ, thân thiện.'
      },
      {
        name: 'Sân Cầu Lông Trung Tâm TDTT 291',
        type: 'VIP',
        pricePerHour: 130000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtmS_2N4ZesjVvLKsJQivhf7sTfEgFaqKb_c2t5IHkZQ&s=10'],
        status: 'AVAILABLE',
        description: '285/291 Cách Mạng Tháng 8, Phường 12, Quận 10, TP.HCM. Mở cửa 24/24 các ngày trong tuần.'
      },
      {
        name: 'Sân Cầu Lông Lê Quý Đôn Quận 11',
        type: 'STANDARD',
        pricePerHour: 95000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2kD6gDzRi_Nts70ZyPVzFvEUy5pHZpTSMNgzsKPqg0Q&s=10'],
        status: 'AVAILABLE',
        description: '343D Lạc Long Quân, Phường 5, Quận 11, TP.HCM. 4 sân thảm cao su êm ái chống chấn thương.'
      },
      {
        name: 'Sân Cầu Lông Cối Đá Bình Thạnh',
        type: 'STANDARD',
        pricePerHour: 100000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcrk7kmX_REIq1KKuByRBYXCuYNubf5W31sK1UhCT3vw&s'],
        status: 'AVAILABLE',
        description: 'Hẻm 818 Xô Viết Nghệ Tĩnh, Phường 25, Bình Thạnh, TP.HCM. Sân thoáng, bãi đỗ xe rộng.'
      },
      {
        name: 'Sân Cầu Lông Bình Minh Bình Thạnh',
        type: 'STANDARD',
        pricePerHour: 105000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_Oq0kHnsJ1lPLAZyh4HjgJRCnNNdpqiXPysqYPbuPjQ&s=10'],
        status: 'AVAILABLE',
        description: 'Số 24 Bùi Đình Túy, Phường 26, Bình Thạnh, TP.HCM. Phục vụ giao lưu cầu lông hàng ngày.'
      },
      {
        name: 'Sân Cầu Lông Thảo Lan Gò Vấp',
        type: 'STANDARD',
        pricePerHour: 95000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCWRZnNniZme6-iZgLL5h6lr_62dxPTLGxLuBNlIFh6A&s=10'],
        status: 'AVAILABLE',
        description: '187 Nguyễn Oanh, Phường 17, Gò Vấp, TP.HCM. Cụm sân đông đúc phong trào bậc nhất Gò Vấp.'
      },
      {
        name: 'Sân Cầu Lông Khang An Gò Vấp',
        type: 'VIP',
        pricePerHour: 125000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9lA9GSRubymH7fdqGXdS5sqCsLi6Y8AyEhLtsHybgXw&s=10',
                 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUL-L9sN9jqfDRgyJ3IzO2ItZA5KMSs5hLatErUSFJOw&s=10',
                 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPwBjD6Say_McSDaY74WhSZrelLrOsinxNYXAcBa2GgVBQ9aMnJ-XYu7s&s=10'
        ],
        status: 'AVAILABLE',
        description: '18A Phan Văn Trị, Phường 10, Gò Vấp, TP.HCM. Sân thảm xịn tiêu chuẩn câu lạc bộ.'
      },
      {
        name: 'Sân Cầu Lông Châu Dương Gò Vấp',
        type: 'STANDARD',
        pricePerHour: 90000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRPUEpW1R3V0jKBaM28z7WytIwYXdA4WRUr9EL4Fhpwg&s=10',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmz5FO8b14iplPrXXCCQzP8lKtI3PKUMKlhUG-mZHorw&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmz5FO8b14iplPrXXCCQzP8lKtI3PKUMKlhUG-mZHorw&s'
        ],
        status: 'AVAILABLE',
        description: '16 Đường số 53, Phường 14, Gò Vấp, TP.HCM. Giá thuê bình dân, hỗ trợ thuê vợt cầu lông.'
      },
      {
        name: 'Sân Cầu Lông Đa Môn Quận 6',
        type: 'STANDARD',
        pricePerHour: 85000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3IeMA_ZTg7i0XqR9lTZMljBqrNx1AQNP7v0vnb1Ub6g&s=10'],
        status: 'AVAILABLE',
        description: 'Đường Hùng Vương, Phường 13, Quận 6, TP.HCM. Sân tập luyện thể thao quen thuộc khu Chợ Lớn.'
      },
      {
        name: 'Sân Cầu Lông Nhân Tâm Quận 6',
        type: 'STANDARD',
        pricePerHour: 85000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMGfR4W6vdWwhWssfJFfRFc24c4p1p9pZcm6046vEmcA&s=10'],
        status: 'AVAILABLE',
        description: 'Số 63 Đường số 22, Phường 11, Quận 6, TP.HCM. Sân sạch sẽ, có hệ thống quạt làm mát.'
      },
      {
        name: 'Sân Cầu Lông Trung Học Thủy Sản Bình Tân',
        type: 'STANDARD',
        pricePerHour: 80000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz_ZZhAUXuRKIiRIuvDwkJB2rrFiuIhW5pQzcTaI68_g&s=10'],
        status: 'AVAILABLE',
        description: '5 Đường số 1, Bình Hưng Hòa, Bình Tân, TP.HCM. Sân trường học thoáng mát, đỗ xe an toàn.'
      },
      {
        name: 'Sân Cầu Lông Cẩm Nhung Gò Vấp',
        type: 'STANDARD',
        pricePerHour: 90000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtA-N7N4bn8PzzlIg4QlxZP3S9Cm7LnjzRSo93o6xw6g&s=10'],
        status: 'AVAILABLE',
        description: '90/981B Đường 26/3, Phường 17, Gò Vấp, TP.HCM. Có phòng tắm nóng lạnh cho người chơi.'
      },
      {
        name: 'Sân Cầu Lông Trường Nguyễn Văn Nghi',
        type: 'STANDARD',
        pricePerHour: 80000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaPVUXEWTnmueymCi0DlMn7_awvCLG68rZbf427q234A&s=10'],
        status: 'AVAILABLE',
        description: '37 Nguyễn Văn Nghi, Phường 7, Gò Vấp, TP.HCM. Sân mở cửa sớm từ 05:30 sáng.'
      },
      {
        name: 'Sân Cầu Lông An Khánh - TP. Thủ Đức',
        type: 'VIP',
        pricePerHour: 140000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQLoAZU4ATOglMfndue1RvQzr32j6_WrZrzcEH5Br9qQ&s=10'],
        status: 'AVAILABLE',
        description: 'Đường Lương Định Của, Phường An Khánh, TP. Thủ Đức, TP.HCM. 8 sân thi đấu cao cấp.'
      },
      {
        name: 'Sân Cầu Lông Thảo Điền Club',
        type: 'VIP',
        pricePerHour: 160000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2kD6gDzRi_Nts70ZyPVzFvEUy5pHZpTSMNgzsKPqg0Q&s=10'],
        status: 'AVAILABLE',
        description: 'Quốc Hương, Phường Thảo Điền, TP. Thủ Đức, TP.HCM. Dịch vụ cao cấp, quầy bar thể thao.'
      },
      {
        name: 'Sân Cầu Lông Nhà Thi Đấu Tân Bình',
        type: 'VIP',
        pricePerHour: 130000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3FXhHvh1MC8W27fKRD7OAOMVfadNL6hxTz5qa1rNPJg&s=10'],
        status: 'AVAILABLE',
        description: '448 Hoàng Văn Thụ, Phường 4, Tân Bình, TP.HCM. Địa điểm diễn ra nhiều giải đấu thành phố.'
      },
      {
        name: 'Sân Cầu Lông Hoàng Hoa Thám Ba Đình',
        type: 'STANDARD',
        pricePerHour: 95000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtlMQhvr_sPhzLPI-v99MysoZ-V7mAzKquM0eEnZhX_Q&s=10'],
        status: 'AVAILABLE',
        description: 'Ngõ 285 Hoàng Hoa Thám, Ba Đình, Hà Nội. Sân tập rèn luyện sức khỏe gần công viên Bách Thảo.'
      },
      {
        name: 'Sân Cầu Lông Định Công Hoàng Mai',
        type: 'STANDARD',
        pricePerHour: 90000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCjPpkPn6n893iny87rMAsQ-7Byom6ppusF_iq5x8Cmw&s=10'],
        status: 'AVAILABLE',
        description: 'Khu đô thị Định Công, Hoàng Mai, Hà Nội. Sân thảm mới, quầy nước đầy đủ giải khát.'
      },
      {
        name: 'Sân Cầu Lông Linh Đàm Hoàng Mai',
        type: 'STANDARD',
        pricePerHour: 100000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLfoPfaBLLcFWiun9qa5C_E2727XW91hEePee0fiJb9Q&s=10'],
        status: 'AVAILABLE',
        description: 'Bán đảo Linh Đàm, Hoàng Mai, Hà Nội. Khu vực sinh hoạt thể thao sôi nổi của cư dân Linh Đàm.'
      },
      {
        name: 'Sân Cầu Lông Mai Dịch Cầu Giấy',
        type: 'STANDARD',
        pricePerHour: 95000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEfuOitriIu737QmMrAbUVJ8pOUAA_DGPDTOcRygaWWg&s=10'],
        status: 'AVAILABLE',
        description: 'Phố Mai Dịch, Cầu Giấy, Hà Nội. Sân thảm cao su êm ái, đỗ xe ô tô và xe máy thuận tiện.'
      },
      {
        name: 'Sân Cầu Lông Vĩnh Tuy Hai Bà Trưng',
        type: 'STANDARD',
        pricePerHour: 90000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhJG4lFXJk7mtlmfGV1mwhV8do5fsuAKvCF8jGcLDuyg&s=10'],
        status: 'MAINTENANCE',
        description: 'Chân cầu Vĩnh Tuy, Hai Bà Trưng, Hà Nội. Sân đang trong quá trình bảo dưỡng sàn và thảm.'
      }
    ];

    const createdCourts = await Court.insertMany(courtsData);

    // 3. TẠO CÁC ĐƠN ĐẶT SÂN VÀO DATABASE CHO ADMIN
    const sampleBookings = [];
    const dateStr = '2026-10-11';

    // Chọn ra 12 sân để tạo dữ liệu lịch đặt mẫu
    const targetCourts = createdCourts.slice(0, 12);
    targetCourts.forEach((court, cIdx) => {
      const user = customers[cIdx % customers.length];
      const rate = court.pricePerHour === 0 ? 0 : court.pricePerHour;

      // Đơn sáng (10:00 - 12:00)
      sampleBookings.push({
        user: user._id,
        court: court._id,
        bookingDate: dateStr,
        startTime: '10:00',
        endTime: '12:00',
        durationHours: 2,
        totalPrice: rate * 2,
        status: 'CONFIRMED',
        note: `Khách: ${user.fullName} - Đặt lịch tập sáng`
      });

      // Đơn chiều (14:00 - 16:00)
      sampleBookings.push({
        user: user._id,
        court: court._id,
        bookingDate: dateStr,
        startTime: '14:00',
        endTime: '16:00',
        durationHours: 2,
        totalPrice: rate * 2,
        status: 'CONFIRMED',
        note: `Khách: ${user.fullName} - Giao lưu phong trào`
      });

      // Đơn tối giờ vàng (18:00 - 20:00) cho sân có phí
      if (court.pricePerHour > 0) {
        sampleBookings.push({
          user: user._id,
          court: court._id,
          bookingDate: dateStr,
          startTime: '18:00',
          endTime: '20:00',
          durationHours: 2,
          totalPrice: (rate + 20000) * 2,
          status: 'COMPLETED',
          note: `Khách: ${user.fullName} - Lịch cố định tối`
        });
      }
    });

    await Booking.insertMany(sampleBookings);

    console.log(`✅ Đã nạp thành công ${createdCourts.length} sân và ${sampleBookings.length} đơn đặt sân vào Database!`);
    console.log(`🎁 Trong đó có 10 sân đầu tiên Miễn Phí 100% cho Học Sinh - Sinh Viên!`);
    process.exit();
  } catch (error) {
    console.error(`❌ Lỗi nạp dữ liệu: ${error.message}`);
    process.exit(1);
  }
};

importData();
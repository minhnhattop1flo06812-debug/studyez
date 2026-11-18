# StudyEz

Website ôn tập lớp 6–9. Người học đăng nhập hoặc tạo tài khoản bằng email, Google hoặc Facebook trước khi vào phần học. Tiến độ, XP, chuỗi học, ảnh đại diện, bản nháp bài tập và lượt dùng thử lưu theo ID tài khoản trong Supabase.

## Kết nối tài khoản

1. Tạo dự án Supabase. Mở **SQL Editor** và chạy tệp `supabase/studyez.sql`. Quyền đọc và ghi tiến độ được giới hạn theo ID của phiên đăng nhập.
2. Sao chép `.env.example` thành `.env.local`. Điền URL dự án vào `VITE_SUPABASE_URL` và Publishable key vào `VITE_SUPABASE_PUBLISHABLE_KEY`. Giữ khóa quản trị và khóa bí mật của các nhà cung cấp trong trang quản trị.
3. Trong **Authentication → URL Configuration**, đặt **Site URL** thành địa chỉ web chính thức và thêm các địa chỉ web chính xác được phép nhận chuyển hướng, kể cả URL dùng khi chạy thử. Ví dụ `http://localhost:5173/`. Giữ cả đường dẫn nếu web chạy ở thư mục con.
4. Trong **Authentication → Sign In / Providers**, bật Email. Bật tùy chọn xác nhận email nếu muốn người dùng xác minh hộp thư trước khi đăng nhập. Thiết lập SMTP cho lượng người dùng của web.
5. Bật [Google](https://supabase.com/docs/guides/auth/social-sign-in/auth-google) và [Facebook](https://supabase.com/docs/guides/auth/social-sign-in/auth-facebook). Sao chép URL callback từ trang của từng nhà cung cấp trong Supabase vào thiết lập OAuth trên Google Cloud và Meta. Nhập thông tin ứng dụng Google và Facebook trực tiếp vào trang quản trị Supabase. Kiểm tra quyền truy cập của ứng dụng Google/Meta trước khi mời người dùng ngoài nhóm thử nghiệm.
6. Chạy `npm ci` và `npm run dev` để thử. Khi đưa web lên máy chủ, chạy `npm run build` và phục vụ thư mục `dist/` qua HTTPS.

Nếu dùng bản đóng gói một tệp `StudyEz.html`, điền hai thẻ meta `studyez-supabase-url` và `studyez-supabase-publishable-key` ngay đầu tệp, đặt tệp trên máy chủ và thêm URL của tệp vào danh sách chuyển hướng của Supabase. Bản mở trực tiếp từ máy dùng để xem giao diện đăng nhập.

Tài khoản mới bắt đầu với 0 XP. Dữ liệu cũ từng dùng chung trên một trình duyệt chưa xác định được chủ tài khoản, nên bản mới không tự nhập. Bài đăng Hỏi Đáp do người dùng thêm lưu riêng theo tài khoản như dữ liệu cá nhân. Chức năng hội viên hiện là mô phỏng.

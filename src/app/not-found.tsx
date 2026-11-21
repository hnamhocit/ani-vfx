import { PageStatus } from "@/components/shared/PageStatus";

export default function NotFound() {
  return (
    <PageStatus
      code="404"
      title="Không tìm thấy trang"
      description="Đường dẫn này có thể đã thay đổi hoặc anime bạn tìm không còn tồn tại."
    />
  );
}

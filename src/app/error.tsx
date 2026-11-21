"use client";

import { PageStatus } from "@/components/shared/PageStatus";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <PageStatus
      code="Lỗi tải trang"
      title="Không thể hiển thị trang này"
      description="Bạn có thể thử tải lại trang hoặc quay về trang chủ."
      onRetry={retry}
    />
  );
}

"use client";

import { PageStatus } from "@/components/shared/PageStatus";
import "./globals.css";

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="vi" className="dark">
      <body>
        <title>Lỗi tải ứng dụng | AniVFX</title>
        <PageStatus
          code="Lỗi ứng dụng"
          title="Không thể mở AniVFX"
          description="Thử tải lại để kết nối lại với ứng dụng."
          onRetry={retry}
        />
      </body>
    </html>
  );
}

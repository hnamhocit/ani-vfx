"use client";

import { AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";

export default function CallbackPage() {
  const router = useRouter();
  const { handleAuthCallback } = useUserStore();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [userName, setUserName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function processCallback() {
      try {
        const result = await handleAuthCallback(
          `${window.location.origin}/callback`,
        );

        if (!isMounted) return;
        setUserName(result.user.name || result.user.email || "Thành viên");
        setStatus("success");

        // Redirect back to home after 1.2s
        setTimeout(() => {
          router.push("/");
        }, 1200);
      } catch (err: unknown) {
        if (!isMounted) return;
        const message =
          err instanceof Error
            ? err.message
            : "Không thể hoàn tất xác thực từ VNTEZ IAM.";
        setErrorMessage(message);
        setStatus("error");
      }
    }

    processCallback();

    return () => {
      isMounted = false;
    };
  }, [handleAuthCallback, router]);

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#111320] border border-purple-500/30 shadow-2xl text-center space-y-6">
        {status === "loading" && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-black text-white">
              Đang xác thực với VNTEZ IAM...
            </h2>
            <p className="text-xs text-zinc-400">
              Vui lòng đợi giây lát trong khi chúng tôi hoàn tất đăng nhập an
              toàn.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white flex items-center justify-center gap-1.5">
                <span>Chào mừng, {userName}!</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-emerald-300">
                Đăng nhập VNTEZ thành công. Đang chuyển hướng về trang chủ...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400 shadow-lg">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">
                Xác thực không thành công
              </h2>
              <p className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 p-3 rounded-xl leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition"
              >
                Về trang chủ
              </Link>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

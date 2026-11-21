import Link from "next/link";

export function PageStatus({
  code,
  title,
  description,
  onRetry,
}: {
  code: string;
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <main className="grid min-h-svh place-items-center bg-[#0b0c10] p-6 text-center text-zinc-100">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-purple-500/20 bg-[#121422] p-6 shadow-xl sm:p-10">
        <p className="text-sm font-bold text-purple-300">{code}</p>
        <h1 className="font-heading text-2xl font-black sm:text-3xl">
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="cursor-pointer rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-500"
            >
              Thử lại
            </button>
          )}
          <Link
            href="/"
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold hover:bg-white/10"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}

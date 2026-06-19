import { MotionWrapper } from "@/components/layout/MotionWrapper"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { Header } from "@/components/layout/Header"
import { ReviewForm } from "@/components/review/ReviewForm"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <MotionWrapper>
        <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-indigo-500/30">
          <Header />
          <main className="w-full max-w-[1700px] mx-auto px-6 md:px-10 pb-8">
            {children}
          </main>
          <ReviewForm />
        </div>
      </MotionWrapper>
    </QueryProvider>
  )
}

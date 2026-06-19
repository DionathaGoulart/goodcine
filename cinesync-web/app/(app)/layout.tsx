import { MotionWrapper } from "@/components/layout/MotionWrapper"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { ReviewForm } from "@/components/review/ReviewForm"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <MotionWrapper>
        <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30 overflow-hidden flex">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 h-screen overflow-y-auto bg-zinc-950">
          <Navbar />
          <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-8 lg:p-10 relative">
            {children}
          </main>
        </div>
        <ReviewForm />
      </div>
      </MotionWrapper>
    </QueryProvider>
  )
}

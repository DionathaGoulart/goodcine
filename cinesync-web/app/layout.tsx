import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "CineSync",
    template: "%s · CineSync",
  },
  description: "Descubra, rastreie e compartilhe filmes e séries com seus amigos.",
  keywords: ["filmes", "séries", "streaming", "recomendações", "cinema"],
  openGraph: {
    title: "CineSync",
    description: "Descubra, rastreie e compartilhe filmes e séries com seus amigos.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body>{children}</body>
    </html>
  )
}

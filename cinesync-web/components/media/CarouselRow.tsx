"use client"

import { ReactNode } from "react"
import { motion } from "motion/react"
import { Film, Tv, LucideIcon } from "lucide-react"
import { TMDBMedia } from "@/lib/tmdb/types"
import { MediaCarousel } from "./MediaCarousel"

interface CarouselRowProps {
  title: string
  subtitle?: string
  type: "movie" | "tv"
  items: TMDBMedia[]
  isLoading?: boolean
  icon?: LucideIcon
  accentColor?: string
}

export function CarouselRow({
  title,
  subtitle,
  type,
  items,
  isLoading,
  icon: Icon,
  accentColor = "indigo",
}: CarouselRowProps) {
  const TypeIcon = type === "movie" ? Film : Tv
  const typeLabel = type === "movie" ? "Filmes" : "Séries"
  const typeBg = type === "movie" ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" : "bg-purple-500/15 text-purple-400 border-purple-500/30"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-3"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className={type === "movie" ? "text-indigo-400" : "text-purple-400"} />}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${typeBg}`}>
                <TypeIcon size={11} />
                {typeLabel}
              </span>
            </div>
            {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>

      <MediaCarousel items={items} type={type} isLoading={isLoading} />
    </motion.div>
  )
}

"use client"

import { useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeft, ChevronRight, Film, Tv } from "lucide-react"
import { MediaCard } from "./MediaCard"
import { TMDBMedia } from "@/lib/tmdb/types"

interface MediaCarouselProps {
  items: TMDBMedia[]
  type?: "movie" | "tv"
  isLoading?: boolean
}

const CARD_WIDTH = 180 // px aproximado por card
const SCROLL_AMOUNT = 5 // cards por clique

function SkeletonCard() {
  return (
    <motion.div
      className="shrink-0 w-[160px] sm:w-[180px] rounded-xl overflow-hidden bg-zinc-800/60 border border-zinc-700/30"
      animate={{ opacity: [0.4, 0.75, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="aspect-[2/3] w-full bg-zinc-700/50" />
    </motion.div>
  )
}

export function MediaCarousel({ items, type, isLoading }: MediaCarouselProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = useCallback(() => {
    const el = ref.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }, [])

  const scroll = (dir: "left" | "right") => {
    const el = ref.current
    if (!el) return
    const amount = CARD_WIDTH * SCROLL_AMOUNT
    el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" })
    setTimeout(updateScrollState, 400)
  }

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-hidden px-1">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-zinc-500 text-sm">
        Nenhum título disponível no momento.
      </div>
    )
  }

  return (
    <div className="relative group/carousel">
      {/* Botão esquerdo */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-10 w-14 flex items-center justify-center bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shadow-xl">
              <ChevronLeft size={18} className="text-white" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Botão direito */}
      <AnimatePresence>
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-10 w-14 flex items-center justify-center bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shadow-xl">
              <ChevronRight size={18} className="text-white" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Track scrollável */}
      <div
        ref={ref}
        onScroll={updateScrollState}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-2 px-1 scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((media, i) => (
          <motion.div
            key={`${media.id}-${i}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.3 }}
            className="shrink-0 w-[160px] sm:w-[180px]"
          >
            <MediaCard media={media} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

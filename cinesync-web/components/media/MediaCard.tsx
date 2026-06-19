"use client"

import { useState } from "react"
import { motion } from "motion/react"
import Link from "next/link"
import { TMDBMedia } from "@/lib/tmdb/types"
import { Star, Plus } from "lucide-react"
import { MediaTrackingModal } from "./MediaTrackingModal"

// Utilitário para view-transition
export function ViewTransition({ name, children, className }: {
  name: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div style={{ viewTransitionName: name } as React.CSSProperties} className={className}>
      {children}
    </div>
  )
}

export function MediaCard({ media }: { media: TMDBMedia }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const imageUrl = media.poster_path
    ? `https://image.tmdb.org/t/p/w342${media.poster_path}`
    : null

  const title = media.title || media.name || "Sem título"
  const year = (media.release_date || media.first_air_date || "").slice(0, 4)
  const href = media.media_type === "tv" ? `/series/${media.id}` : `/movie/${media.id}`
  const rating = media.vote_average ?? 0

  const handleAddToList = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsModalOpen(true)
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.06, zIndex: 10 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        className="relative rounded-lg overflow-hidden bg-zinc-900 shadow-lg cursor-pointer"
        style={{ transformOrigin: "center bottom" }}
      >
        <Link href={href} className="block">
          <ViewTransition name={`media-${media.id}`} className="aspect-[2/3] w-full relative bg-zinc-800">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-zinc-600 text-xs text-center px-2">{title}</span>
              </div>
            )}

            {/* Rating badge */}
            {rating > 0 && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-yellow-400 text-xs font-bold">
                <Star size={10} fill="currentColor" />
                {rating.toFixed(1)}
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-250 flex flex-col justify-end p-3">
              <p className="text-white font-semibold text-xs line-clamp-2 leading-snug mb-2">
                {title}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-xs">{year}</span>
                <div className="flex items-center gap-1.5">
                  {/* Botão de adicionar à lista */}
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAddToList}
                    className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/40 transition-colors"
                    title="Adicionar à lista"
                  >
                    <Plus size={12} className="text-white" />
                  </motion.button>
                </div>
              </div>
            </div>
          </ViewTransition>
        </Link>
      </motion.div>

      <MediaTrackingModal 
        media={media}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

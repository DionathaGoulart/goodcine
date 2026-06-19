"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { TMDBMedia } from "@/lib/tmdb/types"
import { Star } from "lucide-react"

// Utilitário para envolver elementos e aplicar o view-transition-name
export function ViewTransition({ name, children, className }: { name: string, children: React.ReactNode, className?: string }) {
  return (
    <div style={{ viewTransitionName: name } as any} className={className}>
      {children}
    </div>
  )
}

export function MediaCard({ media }: { media: TMDBMedia }) {
  const imageUrl = media.poster_path 
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : '/placeholder-poster.jpg' // fallback
    
  const title = media.title || media.name || 'Título Indisponível'
  const year = media.release_date 
    ? media.release_date.split('-')[0] 
    : (media.first_air_date ? media.first_air_date.split('-')[0] : '')
  
  const href = media.media_type === 'movie' ? `/movie/${media.id}` : `/series/${media.id}`

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative group rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/50 shadow-xl"
    >
      {/* @ts-ignore - viewTransition property on Link is experimental */}
      <Link href={href} transitionTypes={['slide-in-from-right']} className="block">
        <ViewTransition name={`media-${media.id}`} className="aspect-[2/3] w-full relative overflow-hidden bg-zinc-800">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight drop-shadow-md">{title}</h3>
            <div className="flex items-center justify-between mt-3">
              <span className="text-zinc-300 text-xs font-medium bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">{year}</span>
              <div className="flex items-center gap-1 text-yellow-500 bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
                <Star size={12} fill="currentColor" />
                <span className="text-xs font-bold">{media.vote_average.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </ViewTransition>
      </Link>
    </motion.div>
  )
}

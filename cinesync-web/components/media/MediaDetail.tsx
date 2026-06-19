"use client"

import { motion } from "motion/react"
import { TMDBDetail } from "@/lib/tmdb/types"
import { ViewTransition } from "./MediaCard"
import { Star, Clock, Calendar } from "lucide-react"
import { MediaActions } from "./MediaActions"

export function MediaDetail({ media }: { media: TMDBDetail }) {
  const imageUrl = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : '/placeholder-poster.jpg'
  const backdropUrl = media.backdrop_path ? `https://image.tmdb.org/t/p/original${media.backdrop_path}` : null
  
  const title = media.title || media.name || ''
  const year = media.release_date ? media.release_date.split('-')[0] : (media.first_air_date ? media.first_air_date.split('-')[0] : '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full relative"
    >
      {/* Backdrop Header estético com fade out vertical */}
      {backdropUrl && (
        <div className="absolute top-[-4rem] left-[-4rem] right-[-4rem] h-[60vh] z-0 overflow-hidden opacity-30 pointer-events-none">
          <img 
            src={backdropUrl} 
            alt="Backdrop" 
            className="w-full h-full object-cover blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/80 to-zinc-950" />
        </div>
      )}

      <div className="relative z-10 pt-[10vh] sm:pt-[20vh] max-w-6xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          
          {/* Poster com ViewTransition matching the ID from MediaCard */}
          <div className="w-56 sm:w-72 shrink-0 shadow-2xl rounded-2xl overflow-hidden border border-zinc-800">
            <ViewTransition name={`media-${media.id}`}>
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full h-auto object-cover"
              />
            </ViewTransition>
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-2 drop-shadow-md">
              {title}
            </h1>
            
            {media.tagline && (
              <p className="text-xl text-indigo-400 font-medium italic mb-6 drop-shadow-sm">
                "{media.tagline}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-zinc-300 text-sm mb-8 font-medium">
              {year && (
                <div className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
                  <Calendar size={16} className="text-indigo-400" />
                  <span>{year}</span>
                </div>
              )}
              {media.runtime && (
                <div className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
                  <Clock size={16} className="text-indigo-400" />
                  <span>{media.runtime} min</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg text-yellow-500">
                <Star size={16} fill="currentColor" />
                <span className="font-bold">{media.vote_average.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {media.genres.map(g => (
                <span key={g.id} className="px-4 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm font-semibold tracking-wide">
                  {g.name}
                </span>
              ))}
            </div>

            <div className="mb-10">
              <h3 className="text-2xl font-bold text-white mb-4">Sinopse</h3>
              <p className="text-zinc-300 text-lg leading-relaxed max-w-3xl">
                {media.overview || "Nenhuma sinopse disponível para este título."}
              </p>
            </div>

            <MediaActions media={media} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Heart, ListPlus, Eye, Check } from "lucide-react"
import { useMediaActions } from "@/lib/hooks/useMediaActions"
import { TMDBMedia } from "@/lib/tmdb/types"

interface MediaActionsProps {
  media: TMDBMedia
  initialStatus?: string
  initialLiked?: boolean | null
}

export function MediaActions({ media, initialStatus, initialLiked }: MediaActionsProps) {
  const { upsertUserMedia } = useMediaActions()
  // Controlamos o estado localmente para feedback instantâneo (optimistic UI)
  const [liked, setLiked] = useState(initialLiked)
  const [status, setStatus] = useState(initialStatus)

  const handleLike = () => {
    const newLiked = !liked
    setLiked(newLiked)
    upsertUserMedia.mutate({ media, liked: newLiked })
  }

  const handleStatus = (newStatus: 'watching' | 'watched' | 'want_to_watch') => {
    setStatus(newStatus)
    upsertUserMedia.mutate({ media, status: newStatus })
  }

  return (
    <div className="flex flex-wrap items-center gap-4 mt-8">
      <motion.button
        animate={liked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        onClick={handleLike}
        className={`p-3.5 rounded-full flex items-center justify-center transition-all border shadow-lg ${
          liked 
            ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-red-500/20' 
            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-400/30'
        }`}
      >
        <Heart fill={liked ? "currentColor" : "none"} size={24} />
      </motion.button>

      <div className="flex bg-zinc-900 border border-zinc-800 rounded-full p-1.5 shadow-xl">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleStatus('want_to_watch')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            status === 'want_to_watch' ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <ListPlus size={18} />
          <span className="hidden sm:inline">Quero ver</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleStatus('watching')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            status === 'watching' ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Eye size={18} />
          <span className="hidden sm:inline">Assistindo</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleStatus('watched')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            status === 'watched' ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Check size={18} />
          <span className="hidden sm:inline">Assistido</span>
        </motion.button>
      </div>
    </div>
  )
}

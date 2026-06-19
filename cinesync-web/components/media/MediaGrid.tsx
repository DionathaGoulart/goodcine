"use client"

import { motion } from "motion/react"
import { MediaCard } from "./MediaCard"
import { TMDBMedia } from "@/lib/tmdb/types"

const container = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1, 
    transition: { staggerChildren: 0.07 } 
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function MediaGrid({ items }: { items: TMDBMedia[] }) {
  if (items.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-zinc-500">
        <p className="text-lg font-medium">Nenhum título encontrado.</p>
      </div>
    )
  }

  return (
    <motion.ul 
      variants={container} 
      initial="hidden" 
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
    >
      {items.map(media => (
        <motion.li key={media.id} variants={item}>
          <MediaCard media={media} />
        </motion.li>
      ))}
    </motion.ul>
  )
}

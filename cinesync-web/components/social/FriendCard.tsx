"use client"

import { motion } from "motion/react"
import Link from "next/link"

export function FriendCard({ friend }: { friend: any }) {
  return (
    <Link href={`/profile/${friend.username}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-5 transition-all hover:bg-zinc-800/80 cursor-pointer shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/30"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex shrink-0 items-center justify-center text-white text-2xl font-bold shadow-inner">
          {friend.avatar_url ? (
            <img src={friend.avatar_url} alt={friend.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            friend.username.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h3 className="text-white font-bold text-xl">{friend.username}</h3>
          <p className="text-sm text-indigo-400 font-medium mt-1">Ver perfil</p>
        </div>
      </motion.div>
    </Link>
  )
}

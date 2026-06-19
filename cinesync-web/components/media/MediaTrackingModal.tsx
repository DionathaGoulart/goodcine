"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Calendar, Check, Loader2, Star, ThumbsUp, ThumbsDown, HeartCrack, Heart } from "lucide-react"
import { TMDBMedia } from "@/lib/tmdb/types"
import { useMediaActions } from "@/lib/hooks/useMediaActions"

type TrackingStatus = "want_to_watch" | "watching" | "watched" | null
type RatingReaction = "loved" | "good" | "bad" | "hated" | null

interface MediaTrackingModalProps {
  media: TMDBMedia | null
  isOpen: boolean
  onClose: () => void
  initialStatus?: TrackingStatus
}

export function MediaTrackingModal({ media, isOpen, onClose, initialStatus = null }: MediaTrackingModalProps) {
  const { upsertUserMedia } = useMediaActions()

  const [status, setStatus] = useState<TrackingStatus>(initialStatus)
  const [reaction, setReaction] = useState<RatingReaction>(null)
  
  const [watchedLongAgo, setWatchedLongAgo] = useState(false)
  const [startedAt, setStartedAt] = useState<string>(new Date().toISOString().split('T')[0])
  const [finishedAt, setFinishedAt] = useState<string>(new Date().toISOString().split('T')[0])
  
  const [season, setSeason] = useState<string>("")
  const [isRewatch, setIsRewatch] = useState(false)

  // Reset state when media changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus(initialStatus)
      setReaction(null)
      setWatchedLongAgo(false)
      setStartedAt(new Date().toISOString().split('T')[0])
      setFinishedAt(new Date().toISOString().split('T')[0])
      setSeason("")
      setIsRewatch(false)
    }
  }, [isOpen, initialStatus, media])

  if (!media) return null

  const isMovie = media.media_type === "movie"

  const handleSave = () => {
    if (!status) return

    const payload: any = {
      media,
      status,
    }

    if (status === "watched" || status === "watching") {
      if (reaction) payload.ratingReaction = reaction
      
      if (!watchedLongAgo) {
        payload.startedAt = startedAt ? new Date(startedAt).toISOString() : null
        if (status === "watched") {
          payload.finishedAt = finishedAt ? new Date(finishedAt).toISOString() : null
        }
      }

      // Add watch history data if it's a TV show or a rewatch
      if (!isMovie || isRewatch) {
        payload.watchHistory = {
          seasonNumber: season ? parseInt(season) : undefined,
          isRewatch,
          startedAt: !watchedLongAgo && startedAt ? new Date(startedAt).toISOString() : null,
          finishedAt: !watchedLongAgo && status === "watched" && finishedAt ? new Date(finishedAt).toISOString() : null,
        }
      }
    }

    upsertUserMedia.mutate(payload, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  const reactions = [
    { id: "loved", label: "Amei", icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500" },
    { id: "good", label: "Bom", icon: ThumbsUp, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500" },
    { id: "bad", label: "Ruim", icon: ThumbsDown, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500" },
    { id: "hated", label: "Odiei", icon: HeartCrack, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500" },
  ] as const

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white truncate pr-4">
                {media.title || media.name}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-5 space-y-6 overflow-y-auto">
              
              {/* Status Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-400">Status</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setStatus("want_to_watch")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      status === "want_to_watch" ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    Quero Assistir
                  </button>
                  
                  {!isMovie && (
                    <button
                      onClick={() => setStatus("watching")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        status === "watching" ? "bg-amber-500 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      Assistindo
                    </button>
                  )}
                  
                  <button
                    onClick={() => setStatus("watched")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      status === "watched" ? "bg-green-500 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    Assistido
                  </button>
                </div>
              </div>

              {/* Advanced Options (Only if watching or watched) */}
              <AnimatePresence>
                {(status === "watching" || status === "watched") && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-6 overflow-hidden"
                  >
                    
                    {/* TV Show Options */}
                    {!isMovie && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-400">Temporada (Opcional)</label>
                        <input 
                          type="number" 
                          min="1"
                          placeholder="Ex: 1"
                          value={season}
                          onChange={e => setSeason(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    {/* Reaction Rating (Only if watched) */}
                    {status === "watched" && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-400">Sua Avaliação</label>
                        <div className="grid grid-cols-4 gap-2">
                          {reactions.map(r => {
                            const isSelected = reaction === r.id
                            return (
                              <button
                                key={r.id}
                                onClick={() => setReaction(isSelected ? null : r.id)}
                                className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all ${
                                  isSelected 
                                    ? `${r.bg} ${r.border} ${r.color}` 
                                    : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                                }`}
                              >
                                <r.icon size={24} className={isSelected ? "" : "opacity-70"} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{r.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="space-y-4 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={watchedLongAgo}
                            onChange={(e) => setWatchedLongAgo(e.target.checked)}
                            className="peer appearance-none w-5 h-5 border-2 border-zinc-600 rounded cursor-pointer checked:bg-indigo-500 checked:border-indigo-500 transition-colors"
                          />
                          <Check size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className="text-sm text-zinc-300 select-none">
                          Já assisti (não lembro as datas)
                        </span>
                      </label>

                      {!watchedLongAgo && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                              <Calendar size={12} /> Começou em
                            </label>
                            <input 
                              type="date"
                              value={startedAt}
                              onChange={e => setStartedAt(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          
                          {status === "watched" && (
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                                <Calendar size={12} /> Terminou em
                              </label>
                              <input 
                                type="date"
                                value={finishedAt}
                                onChange={e => setFinishedAt(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {status === "watched" && (
                         <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-zinc-800/50">
                         <div className="relative flex items-center justify-center">
                           <input 
                             type="checkbox" 
                             checked={isRewatch}
                             onChange={(e) => setIsRewatch(e.target.checked)}
                             className="peer appearance-none w-5 h-5 border-2 border-zinc-600 rounded cursor-pointer checked:bg-indigo-500 checked:border-indigo-500 transition-colors"
                           />
                           <Check size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                         </div>
                         <span className="text-sm text-zinc-300 select-none">
                           Estou reassistindo
                         </span>
                       </label>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
              <button
                onClick={handleSave}
                disabled={!status || upsertUserMedia.isPending}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {upsertUserMedia.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Check size={18} />
                    Salvar na Lista
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

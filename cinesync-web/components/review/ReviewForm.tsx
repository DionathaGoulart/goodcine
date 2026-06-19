"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useAppStore } from "@/lib/stores/useAppStore"
import { createClient } from "@/lib/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { X, Star, Send } from "lucide-react"

export function ReviewForm() {
  const { isReviewModalOpen, activeMediaIdForReview, closeReviewModal } = useAppStore()
  const [content, setContent] = useState("")
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const supabase = createClient()
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || rating === 0) return

    setIsSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user && activeMediaIdForReview) {
      await supabase.from('reviews').upsert({
        user_id: user.id,
        media_id: activeMediaIdForReview,
        content,
        rating,
      }, { onConflict: 'user_id,media_id' })
      
      queryClient.invalidateQueries({ queryKey: ['reviews', activeMediaIdForReview] })
    }
    
    setIsSubmitting(false)
    setContent("")
    setRating(0)
    closeReviewModal()
  }

  return (
    <AnimatePresence>
      {isReviewModalOpen && activeMediaIdForReview && (
        <motion.div 
          key="review-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={closeReviewModal}
        >
          <motion.div
            key="review-modal-content"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-zinc-800/50 bg-zinc-900/50">
              <h2 className="text-xl font-bold text-white tracking-tight">Escrever Review</h2>
              <button onClick={closeReviewModal} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-8 flex flex-col items-center bg-zinc-900/50 py-4 rounded-2xl border border-zinc-800/50">
                <p className="text-zinc-400 text-sm mb-3 font-semibold uppercase tracking-wider">Sua nota</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <motion.button
                      type="button"
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none p-1"
                    >
                      <Star 
                        size={28} 
                        className={`transition-colors drop-shadow-md ${
                          star <= (hoverRating || rating) ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-700'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Sua opinião</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="w-full h-32 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 resize-none transition-all shadow-inner"
                  placeholder="O que achou deste título? Compartilhe seus pensamentos..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={closeReviewModal}
                  className="px-5 py-2.5 rounded-xl text-zinc-400 font-bold hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting || !content.trim() || rating === 0}
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                >
                  <Send size={18} />
                  <span>Publicar</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

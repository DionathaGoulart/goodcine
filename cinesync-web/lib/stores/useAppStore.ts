import { create } from 'zustand'

interface AppState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (isOpen: boolean) => void
  
  // Modal de Review
  isReviewModalOpen: boolean
  activeMediaIdForReview: string | null
  openReviewModal: (mediaId: string) => void
  closeReviewModal: () => void
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  isReviewModalOpen: false,
  activeMediaIdForReview: null,
  openReviewModal: (mediaId) => set({ isReviewModalOpen: true, activeMediaIdForReview: mediaId }),
  closeReviewModal: () => set({ isReviewModalOpen: false, activeMediaIdForReview: null })
}))

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { CardData, UserStats, DashboardState } from "@/types";

export function useDashboard() {
  // useDashboard hook initializing
  
  const { data: session, update } = useSession();
  
  // useSession completed
  
  const [state, setState] = useState<DashboardState>({
    recentCards: [],
    loading: false,
    error: "",
    stats: {
      totalCards: 0,
      lastGenerated: null,
    },
    newCard: null,
  });

  // Defensive check to ensure recentCards is always an array
  const safeState = {
    ...state,
    recentCards: Array.isArray(state.recentCards) ? state.recentCards : []
  };

  const fetchRecentCards = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/cards");
      if (response.ok) {
        const result = await response.json();
        const cards = result.data || result; // Handle both wrapped and unwrapped responses
        setState(prev => ({ ...prev, recentCards: Array.isArray(cards) ? cards : [] }));
      }
    } catch (err) {
      console.error("Failed to fetch recent cards:", err);
    }
  }, []);

  const fetchUserStats = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/cards");
      if (response.ok) {
        const cards = await response.json();
        const stats: UserStats = {
          totalCards: cards.length,
          lastGenerated: cards.length > 0 ? cards[0].id : null,
        };
        setState(prev => ({ ...prev, stats }));
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  const generateCard = useCallback(async (selectedApis?: string[]): Promise<void> => {
    // Generate card function called

    if (!session || session.user.coinBalance < 15) {
      // Insufficient coins or no session
      setState(prev => ({ 
        ...prev, 
        error: "You need 15 coins to generate a new card." 
      }));
      return;
    }

    if (state.loading) {
      // Already loading, blocking duplicate call
      return;
    }

    // Setting loading state and clearing previous data
    setState(prev => ({
      ...prev,
      loading: true,
      error: "",
      newCard: null,
    }));

    try {
      // Making request to generate card
      
      const requestBody: { selectedApis?: string[] } = {}
      if (selectedApis && selectedApis.length === 2) {
        requestBody.selectedApis = selectedApis
        // Sending selected APIs to backend
      }
      
      const response = await fetch("/api/cards/generate", { 
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      // API response received

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned invalid response format");
      }

      const data = await response.json();
      // Response data parsed

      if (response.ok && data.success) {
        // Card generation successful, updating state
        setState(prev => ({
          ...prev,
          newCard: data.data,
          recentCards: [data.data, ...(Array.isArray(prev.recentCards) ? prev.recentCards : [])],
          error: "",
        }));
        
        // Fetching updated user stats and refreshing session
        await fetchUserStats();
        
        // Refresh the session to update coin balance in Navbar
        await update();
        // All post-generation updates complete
      } else {
        // Handle error response from API
        const errorMessage = data.error?.message || data.message || "Failed to generate card";
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Error during card generation:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      console.log('⚠️ [useDashboard] Setting error state:', errorMessage);
      setState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      // Setting loading=false, generation complete
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [session, state.loading, fetchUserStats, update]);

  const clearNewCard = useCallback(() => {
    setState(prev => ({ ...prev, newCard: null }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: "" }));
  }, []);

  useEffect(() => {
    // useEffect triggered
    
    if (session) {
      // Session exists, fetching data
      fetchRecentCards();
      fetchUserStats();
    } else {
      // No session, skipping data fetch
    }
  }, [session, fetchRecentCards, fetchUserStats]);

  // Card management handlers
  const updateCard = useCallback(async (cardId: string, updates: Partial<CardData>): Promise<void> => {
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        // Update local state
        setState(prev => ({
          ...prev,
          recentCards: prev.recentCards.map(card => 
            card.id === cardId ? { ...card, ...updates } : card
          )
        }));
      } else {
        console.error('Failed to update card:', response.statusText);
      }
    } catch (err) {
      console.error('Error updating card:', err);
    }
  }, []);

  const deleteCard = useCallback(async (cardId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update local state
        setState(prev => ({
          ...prev,
          recentCards: prev.recentCards.filter(card => card.id !== cardId),
          stats: {
            ...prev.stats,
            totalCards: prev.stats.totalCards - 1
          }
        }));
      } else {
        console.error('Failed to delete card:', response.statusText);
      }
    } catch (err) {
      console.error('Error deleting card:', err);
    }
  }, []);

  // Computed values
  const hasLowBalance = session?.user.coinBalance !== undefined && session.user.coinBalance < 15;
  const completionRate = Math.round((state.stats.totalCards / 190) * 100);
  const isNearCompletion = completionRate >= 80;
  const hasNoCards = state.stats.totalCards === 0;

  return {
    ...safeState,
    session,
    hasLowBalance,
    completionRate,
    isNearCompletion,
    hasNoCards,
    generateCard,
    clearNewCard,
    clearError,
    fetchRecentCards,
    fetchUserStats,
    updateCard,
    deleteCard,
  };
}
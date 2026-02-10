import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";

const getApiUrl = () => getApiBaseUrl();
const getAuthToken = () => useAuthStore.getState().token;

// ==================== Types ====================

export interface RankingUser {
  id: string | number;
  name: string;
  avatar?: string;
}

export interface RankingItem {
  rank: number;
  user: RankingUser;
  score: number;
  submitted_at: string;
}

export interface PackageRankingResponse {
  success: boolean;
  data: {
    package_id: number;
    package_name: string;
    items: RankingItem[];
    my_rank: number | null;
  };
}

// Dashboard Statistics Types
export interface UserSummary {
  active_packages: number;
  in_progress_attempts: number;
  completed_practices: number;
  completed_tryouts: number;
  average_score_percent: number;
  current_rank: number | null;
  rank_package_id: number | null;
  rank_package_name: string | null;
  study_time_minutes: number;
}

export interface LearningProgress {
  practice_questions_percent: number;
  tryout_completion_percent: number;
  materials_studied_percent: number;
}

export interface ActivePackage {
  package_id: number;
  name: string;
  type: string;
  category_id: number;
  starts_at: string;
  ends_at: string | null;
  status: string;
  is_free: boolean;
}

export interface RecentActivity {
  attempt_id: number;
  package_id: number;
  package_name: string;
  package_type: string;
  score_percent: number;
  correct_count: number;
  total_questions: number;
  submitted_at: string;
}

export interface StatisticsDashboardResponse {
  success: boolean;
  data: {
    summary: UserSummary;
    learning_progress: LearningProgress;
    active_packages: ActivePackage[];
    recent_activity: RecentActivity[];
  };
}

// ==================== API Functions ====================

/**
 * Fetch user statistics dashboard
 * Digunakan untuk halaman dashboard utama user
 * - Ringkasan aktivitas user (paket aktif, progress, skor)
 * - Menampilkan ranking user pada tryout / akbar terakhir
 */
export const fetchUserStatisticsDashboard = async (): Promise<StatisticsDashboardResponse | null> => {
  try {
    const apiBaseUrl = getApiUrl();
    const token = getAuthToken();

    if (!token) {
      console.warn("No auth token available");
      return null;
    }

    const response = await fetch(`${apiBaseUrl}/user/statistics-dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch statistics dashboard");
    }

    const data: StatisticsDashboardResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching statistics dashboard:", error);
    return null;
  }
};

/**
 * Fetch rankings for a specific package
 * Digunakan untuk halaman leaderboard tryout / akbar
 * - Ranking dihitung berdasarkan skor terbaik tiap user
 * - Satu user hanya muncul satu kali
 * - Urutan: score DESC, submitted_at ASC
 */
export const fetchPackageRankings = async (
  packageId: string | number,
  limit: number = 100
): Promise<PackageRankingResponse | null> => {
  try {
    const apiBaseUrl = getApiUrl();
    const token = getAuthToken();

    if (!token) {
      console.warn("No auth token available");
      return null;
    }

    const response = await fetch(
      `${apiBaseUrl}/packages/${packageId}/ranking?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch package rankings");
    }

    const data: PackageRankingResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching package rankings:", error);
    return null;
  }
};

// ==================== Utility Functions ====================

/**
 * Format time from seconds to human readable format (e.g., "5m", "2h 30m")
 */
export const formatTimeSpent = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Get rank icon and styling based on rank position
 */
export const getRankDisplayInfo = (rank: number | null) => {
  if (rank === null) {
    return {
      icon: null,
      style: "bg-card",
      label: "Not Ranked",
    };
  }

  if (rank === 1) {
    return {
      icon: "trophy",
      style: "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200",
      label: "🥇 1st Place",
    };
  }

  if (rank === 2) {
    return {
      icon: "medal",
      style: "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200",
      label: "🥈 2nd Place",
    };
  }

  if (rank === 3) {
    return {
      icon: "award",
      style: "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200",
      label: "🥉 3rd Place",
    };
  }

  return {
    icon: null,
    style: "bg-card",
    label: `#${rank}`,
  };
};

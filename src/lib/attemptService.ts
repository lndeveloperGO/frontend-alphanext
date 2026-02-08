import { getApiBaseUrl } from "./env";
import { useAuthStore } from "@/stores/authStore";

/**
 * API Service untuk mengelola attempts
 * Semua request menggunakan Authorization header dengan Bearer token
 */

// Types
export interface StartAttemptResponse {
  success: boolean;
  data: {
    attempt_id: number;
    package_id: number;
    status: "in_progress" | "submitted" | "expired";
    started_at: string;
    ends_at: string;
    remaining_seconds: number;
  };
}

export interface AttemptSummary {
  attempt_id: number;
  status: "in_progress" | "submitted" | "expired";
  remaining_seconds: number;
  total_score: number;
  progress: {
    total: number;
    done: number;
    undone: number;
    marked: number;
  };
  nav: Array<{
    question_id: number;
    done: boolean;
    marked: boolean;
  }>;
}

export interface AttemptSummaryResponse {
  success: boolean;
  data: AttemptSummary;
}

export interface QuestionData {
  no: number;
  question_id: number;
  question: string;
  options: Array<{
    id: number;
    label: string;
    text: string;
  }>;
  selected_option_id: number | null;
  is_marked: boolean;
  remaining_seconds: number;
  status: "in_progress" | "submitted" | "expired";
}

export interface QuestionResponse {
  success: boolean;
  data: QuestionData;
}

export interface AnswerResponse {
  success: boolean;
  data: {
    question_id: number;
    selected_option_id: number;
  };
}

export interface MarkResponse {
  success: boolean;
  data: {
    question_id: number;
    is_marked: boolean;
  };
}

export interface SubmitResponse {
  success: boolean;
  data: {
    attempt_id: number;
    status: "submitted";
    submitted_at: string;
    total_score: number;
    summary: {
      total_questions: number;
      answered: number;
      unanswered: number;
      progress_percent: number;
    };
  };
}

export interface AttemptHistory {
  id: number;
  package_id: number;
  status: "in_progress" | "submitted" | "expired";
  started_at: string;
  ends_at: string;
  submitted_at: string | null;
  total_score: number;
  package: {
    id: number;
    name: string;
    type: "latihan" | "tryout" | "akbar";
    category_id: number;
  };
}

export interface AttemptHistoryResponse {
  success: boolean;
  data: {
    current_page: number;
    data: AttemptHistory[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

// Helper to get auth token
const getAuthToken = (): string => {
  const { token } = useAuthStore.getState();
  return token || "";
};

// Helper to create headers with auth
const getHeaders = (): HeadersInit => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  };
};

// API Functions
export const attemptService = {
  /**
   * Start a new attempt
   * POST /api/packages/{package_id}/attempts
   */
  async startAttempt(packageId: number): Promise<StartAttemptResponse> {
    const response = await fetch(
      `${getApiBaseUrl()}/packages/${packageId}/attempts`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to start attempt: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get attempt summary and navigation
   * GET /api/attempts/{attempt_id}
   */
  async getAttemptSummary(attemptId: number): Promise<AttemptSummaryResponse> {
    const response = await fetch(
      `${getApiBaseUrl()}/attempts/${attemptId}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch attempt: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get a specific question
   * GET /api/attempts/{attempt_id}/questions/{no}
   */
  async getQuestion(attemptId: number, questionNo: number): Promise<QuestionResponse> {
    const response = await fetch(
      `${getApiBaseUrl()}/attempts/${attemptId}/questions/${questionNo}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch question: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Submit an answer
   * POST /api/attempts/{attempt_id}/answers
   */
  async submitAnswer(
    attemptId: number,
    questionId: number,
    optionId: number
  ): Promise<AnswerResponse> {
    const response = await fetch(
      `${getApiBaseUrl()}/attempts/${attemptId}/answers`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          question_id: questionId,
          option_id: optionId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to submit answer: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Mark or unmark a question
   * POST /api/attempts/{attempt_id}/mark
   */
  async markQuestion(attemptId: number, questionId: number): Promise<MarkResponse> {
    const response = await fetch(
      `${getApiBaseUrl()}/attempts/${attemptId}/mark`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          question_id: questionId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark question: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Submit the attempt (finish)
   * POST /api/attempts/{attempt_id}/submit
   */
  async submitAttempt(attemptId: number): Promise<SubmitResponse> {
    const response = await fetch(
      `${getApiBaseUrl()}/attempts/${attemptId}/submit`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to submit attempt: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get user's attempt history
   * GET /api/user/attempts
   */
  async getUserAttempts(): Promise<AttemptHistoryResponse> {
    const response = await fetch(`${getApiBaseUrl()}/user/attempts`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch attempts: ${response.statusText}`);
    }

    return response.json();
  },
};

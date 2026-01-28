import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";

const getApiUrl = () => getApiBaseUrl();

export interface QuestionOption {
  id?: number;
  question_id?: number;
  label: string;
  text: string;
  score_value: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Question {
  id: number;
  category_id: number;
  question: string;
  explanation?: string;
  created_at?: string;
  updated_at?: string;
  options_count?: number;
  type?: string;
  difficulty?: string;
  category: Category;
  options?: QuestionOption[];
}

export interface CreateQuestionInput {
  category_id: number;
  question: string;
  explanation?: string;
}

export interface UpdateQuestionInput {
  category_id?: number;
  question?: string;
  explanation?: string;
}

export interface CreateOptionInput {
  label: string;
  text: string;
  score_value: number;
}

export interface UpdateOptionInput {
  label?: string;
  text?: string;
  score_value?: number;
}

export interface BulkQuestionItem {
  category_id: number;
  question: string;
  explanation?: string;
  options: CreateOptionInput[];
}

export interface BulkCreateQuestionInput {
  items: BulkQuestionItem[];
}

export interface BulkCreateResponse {
  success: number;
  failed: number;
  message: string;
  data?: {
    created: Question[];
    errors?: Array<{ index: number; error: string }>;
  };
}

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const questionService = {
  // List all questions
  async getQuestions(): Promise<Question[]> {
    const response = await fetch(`${getApiUrl()}/admin/questions`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }

    const data = await response.json();
    return data.data.data || [];
  },

  // Get questions filtered by category
  async getQuestionsByCategory(categoryId: number): Promise<Question[]> {
    const allQuestions = await this.getQuestions();
    return allQuestions.filter((q) => q.category_id === categoryId);
  },

  // Get single question with options
  async getQuestion(id: number): Promise<Question> {
    const response = await fetch(`${getApiUrl()}/admin/questions/${id}`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch question ${id}`);
    }

    const data = await response.json();
    return data.data || data;
  },

  // Create question
  async createQuestion(input: CreateQuestionInput): Promise<Question> {
    const response = await fetch(`${getApiUrl()}/admin/questions`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create question");
    }

    const data = await response.json();
    return data.data.data || data;
  },

  // Update question
  async updateQuestion(
    id: number,
    input: UpdateQuestionInput
  ): Promise<Question> {
    const response = await fetch(`${getApiUrl()}/admin/questions/${id}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update question");
    }

    const data = await response.json();
    return data.data.data || data;
  },

  // Delete question
  async deleteQuestion(id: number): Promise<void> {
    const response = await fetch(`${getApiUrl()}/admin/questions/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete question");
    }
  },

  // Create option for a question
  async createOption(
    questionId: number,
    input: CreateOptionInput
  ): Promise<QuestionOption> {
    const response = await fetch(
      `${getApiUrl()}/admin/questions/${questionId}/options`,
      {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(input),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create option");
    }

    const data = await response.json();
    return data.data.data || data;
  },

  // Update option
  async updateOption(
    optionId: number,
    input: UpdateOptionInput
  ): Promise<QuestionOption> {
    const response = await fetch(
      `${getApiUrl()}/admin/options/${optionId}`,
      {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify(input),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update option");
    }

    const data = await response.json();
    return data.data.data || data;
  },

  // Delete option
  async deleteOption(optionId: number): Promise<void> {
    const response = await fetch(
      `${getApiUrl()}/admin/options/${optionId}`,
      {
        method: "DELETE",
        headers: getAuthHeader(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete option");
    }
  },

  // Bulk create questions with options
  async bulkCreateQuestions(
    input: BulkCreateQuestionInput
  ): Promise<BulkCreateResponse> {
    const response = await fetch(`${getApiUrl()}/admin/questions/bulk`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to bulk create questions");
    }

    const data = await response.json();
    return data.data || data;
  },
};

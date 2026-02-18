import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";

const getApiUrl = () => getApiBaseUrl();

export interface QuestionOption {
  id?: number;
  question_id?: number;
  label: string;
  text: string;
  score_value: number;
  image?: string | null;
  image_url?: string;
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
  question_type?: "text" | "image";
  difficulty?: string;
  image?: string | null;
  image_url?: string;
  category: Category;
  options?: QuestionOption[];
}

export interface CreateQuestionInput {
  category_id: number;
  question: string;
  explanation?: string;
  question_type?: "text" | "image";
  image?: File | null;
}

export interface UpdateQuestionInput {
  category_id?: number;
  question?: string;
  explanation?: string;
  question_type?: "text" | "image";
  image?: File | null;
}

export interface CreateOptionInput {
  label: string;
  text: string;
  score_value: number;
  image?: File | null;
}

export interface UpdateOptionInput {
  label?: string;
  text?: string;
  score_value?: number;
  image?: File | null;
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

const getAuthHeaders = (isFormData: boolean = false) => {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

export const questionService = {
  // List all questions
  async getQuestions(): Promise<Question[]> {
    const response = await fetch(`${getApiUrl()}/admin/questions`, {
      method: "GET",
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch question ${id}`);
    }

    const data = await response.json();
    return data.data || data;
  },

  // Create question
  async createQuestion(input: CreateQuestionInput): Promise<Question> {
    const hasImage = input.image instanceof File;
    let body: any;
    let isFormData = false;

    if (hasImage) {
      isFormData = true;
      body = new FormData();
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          body.append(key, value);
        }
      });
    } else {
      body = JSON.stringify(input);
    }

    const response = await fetch(`${getApiUrl()}/admin/questions`, {
      method: "POST",
      headers: getAuthHeaders(isFormData),
      body: body,
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
    const hasImage = input.image instanceof File;
    let body: any;
    let isFormData = false;

    if (hasImage) {
      isFormData = true;
      body = new FormData();
      // Laravel PATCH with FormData can be tricky, often need _method=PATCH or use POST
      body.append("_method", "PATCH");
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          body.append(key, value);
        }
      });
    } else {
      body = JSON.stringify(input);
    }

    const response = await fetch(`${getApiUrl()}/admin/questions/${id}`, {
      method: "POST", // Use POST with _method=PATCH for FormData compatibility in many PHP frameworks
      headers: getAuthHeaders(isFormData),
      body: body,
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
      headers: getAuthHeaders(),
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
    const hasImage = input.image instanceof File;
    let body: any;
    let isFormData = false;

    if (hasImage) {
      isFormData = true;
      body = new FormData();
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          body.append(key, value);
        }
      });
    } else {
      body = JSON.stringify(input);
    }

    const response = await fetch(
      `${getApiUrl()}/admin/questions/${questionId}/options`,
      {
        method: "POST",
        headers: getAuthHeaders(isFormData),
        body: body,
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
    const hasImage = input.image instanceof File;
    let body: any;
    let isFormData = false;

    if (hasImage) {
      isFormData = true;
      body = new FormData();
      body.append("_method", "PATCH");
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          body.append(key, value);
        }
      });
    } else {
      body = JSON.stringify(input);
    }

    const response = await fetch(
      `${getApiUrl()}/admin/options/${optionId}`,
      {
        method: "POST", // Use POST with _method=PATCH for FormData
        headers: getAuthHeaders(isFormData),
        body: body,
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
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete option");
    }
  },

  // Bulk create questions with options (JSON)
  async bulkCreateQuestions(
    input: BulkCreateQuestionInput
  ): Promise<BulkCreateResponse> {
    const response = await fetch(`${getApiUrl()}/admin/questions/bulk`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to bulk create questions");
    }

    const data = await response.json();
    return data.data || data;
  },

  // New: Import questions from Excel
  async importQuestions(file: File): Promise<BulkCreateResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${getApiUrl()}/admin/questions/import`, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to import questions");
    }

    const data = await response.json();
    return data.data || data;
  },
};


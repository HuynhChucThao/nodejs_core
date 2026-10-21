import {
  Occupation,
  Question,
  TestHistoryItem,
  TestResult,
  User,
} from "../types";

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  "/api";


class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem("riasec_token");
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("riasec_token", token);
  } else {
    localStorage.removeItem("riasec_token");
  }
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const body: any = await response.json().catch(() => null);
  
  // // Lấy data trực tiếp từ response nếu có, hoặc dùng body trả về
  // const data = response.ok ? body : null;
  
  if (!response.ok) {
    const errorMsg =
      body?.message ||
      body?.error ||
      `Request failed with status ${response.status}`;
    throw new ApiError(
      Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg,
      response.status,
    );
  }

  // Bóc envelope chuẩn của core: { success, statusCode, message, data, timestamp }
  if(
    body && 
    typeof body === "object" && 
    body.success === true && 
    "statusCode" in body &&
    "data" in body
  ){
    return body.data as T;
  }

  return body as T; // tương thích ngược với reponse chưa bọc
}

// 1. Auth APIs
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    request<{ message: string; user: User; accessToken: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
    ),

  register: (data: {
    email: string;
    password: string;
    name?: string;
    dreamWork?: string;
  }) =>
    request<{ message: string; user: User; accessToken: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),

  getProfile: () => request<User>("/auth/me"),
  updateProfile: (data: Partial<User>) =>
    request<User>("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// 2. Occupations APIs
export const occupationApi = {
  getAll: (params?: {
    keyword?: string;
    riasecCode?: string;
    mainCode?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.keyword) query.append("keyword", params.keyword);
    if (params?.riasecCode) query.append("riasecCode", params.riasecCode);
    if (params?.mainCode) query.append("mainCode", params.mainCode);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    return request<{
      items: Occupation[];
      data?: Occupation[];
      total: number;
      page: number;
      limit: number;
    }>(`/occupations?${query.toString()}`);
  },

  getById: (id: number) => request<Occupation>(`/occupations/${id}`),
};

// 3. Assessment & Questions APIs
export const assessmentApi = {
  getQuestions: (perType?: number) => {
    const endpoint = perType
      ? `/questions/test-set?perType=${perType}`
      : "/questions/test-set";
    return request<Question[]>(endpoint);
  },

  submitTest: (data: { answers: { questionId: string; score: number }[] }) =>
    request<TestResult>("/assessment/submit", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getHistory: () => request<TestHistoryItem[]>("/assessment/history"),

  getHistoryDetail: (id: string) =>
    request<TestHistoryItem>(`/assessment/history/${id}`),
};

// 4. Saved Jobs APIs
export const savedJobsApi = {
  getSaved: () => request<{ occupation: Occupation }[]>("/saved-jobs"),

  toggleSave: (occupationId: number) =>
    request<{ isSaved: boolean }>(`/saved-jobs/${occupationId}`, {
      method: "POST",
    }),
};

// 5. AI Consultant APIs
export const aiApi = {
  chat: (
    message: string,
    context?: { userRiasec?: string; currentOccupation?: string },
  ) =>
    request<{ reply: string; sources?: string[] }>("/ai-consultant/chat", {
      method: "POST",
      body: JSON.stringify({ message, ...context }),
    }),
};

// 6. Feedback APIs
export const feedbackApi = {
  submit: (content: string, rating: number = 5) =>
    request<{ success: boolean; message: string }>("/feedback", {
      method: "POST",
      body: JSON.stringify({ content, rating }),
    }),
};

// 7. Admin APIs
export const adminApi = {
  getQuestions: () => request<Question[]>(`/questions`),
  getDashboardStats: () => request<any>("/admin/dashboard-stats"),

  createQuestion: (data: { content: string; type: string }) =>
    request("/questions", { method: "POST", body: JSON.stringify(data) }),
  updateQuestion: (id: string, data: { content: string; type: string }) =>
    request(`/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteQuestion: (id: string) =>
    request(`/questions/${id}`, { method: "DELETE" }),

  getOccupations: (params?: {
    keyword?: string;
    riasecCode?: string;
    mainCode?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.keyword) query.append("keyword", params.keyword);
    if (params?.riasecCode) query.append("riasecCode", params.riasecCode);
    if (params?.mainCode) query.append("mainCode", params.mainCode);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    return request<{
      items: Occupation[];
      data?: Occupation[];
      total: number;
      page: number;
      limit: number;
    }>(`/occupations?${query.toString()}`);
  },
  createOccupation: (data: {
    jobName: string;
    mainCode: string;
    riasecCode: string;
    description?: string;
  }) => request("/occupations", { method: "POST", body: JSON.stringify(data) }),
  updateOccupation: (id: number, data: { jobName: string; mainCode: string }) =>
    request(`/occupations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteOccupation: (id: number) =>
    request(`/occupations/${id}`, { method: "DELETE" }),

  getUsers: () =>
    request<{ id: string; name?: string; email: string; role: string }[]>(
      "/users",
    ),
  updateUserRole: (id: string, role: string) =>
    request(`/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  deleteUser: (id: string) =>
    request(`/admin/users/${id}`, { method: "DELETE" }),

  getFeedback: () =>
    request<
      { id: string; user: User; rating: number; content: string }[]
    >("/feedback"),
};

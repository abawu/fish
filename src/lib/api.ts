import axios from "axios";

// Auto-detect backend URL based on current hostname
const getBackendURL = () => {
  // If environment variable is set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Otherwise, try to auto-detect based on current hostname
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // If accessing via IP address or network hostname, use same IP for backend
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${protocol}//${hostname}:3000/api/v1`;
  }
  
  // Default to localhost
  return "http://localhost:3000/api/v1";
};

export const API_BASE_URL = getBackendURL();
// API origin (used for static asset URLs returned by the backend, e.g. /img/...)
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export type BookingStatus = "upcoming" | "completed" | "expired" | "active";

export interface ExperienceSummary {
  _id?: string;
  title?: string;
  location?: string;
  nextOccurrenceAt?: string;
  expirationWindowHours?: number;
}

export interface BookingRecord {
  _id?: string;
  id?: string;
  experience?: ExperienceSummary | string | null;
  tour?: { name?: string } | string | null;
  price?: number;
  quantity?: number;
  txRef?: string;
  paid?: boolean;
  status?: BookingStatus;
  experienceDate?: string;
  expiresAt?: string;
  expirationWindowHours?: number;
  createdAt?: string;
  completedAt?: string;
}

export interface BookingListResponse {
  status: string;
  results: number;
  data: BookingRecord[];
  totalEarnings?: number;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const requestMethod = error.config?.method?.toLowerCase() || '';
      
      // Public GET routes that don't require authentication
      // These should allow unauthenticated access
      const publicGetRoutes = [
        '/experiences/',  // GET /experiences/:id (public)
        '/tours/',        // Alternative route (if exists)
      ];
      
      // Check if this is a GET request to a public experience route
      const isPublicExperienceGet = requestMethod === 'get' && 
        publicGetRoutes.some(route => requestUrl.includes(route)) &&
        !requestUrl.includes('/bookings') &&
        !requestUrl.includes('/reviews') &&
        !requestUrl.includes('/pending') &&
        !requestUrl.includes('/top-5-cheap');
      
      // If it's a public GET request, don't redirect - just reject the error
      // This allows unauthenticated users to view experience details
      if (isPublicExperienceGet) {
        // Don't redirect, just reject the promise
        // The component will handle the error (might be a 404 or other error)
        return Promise.reject(error);
      }
      
      // For all other 401 errors (protected routes), redirect to login
      // Only clear auth data and redirect if user was previously authenticated
      const hadToken = localStorage.getItem("token");
      if (hadToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/users/login", { email, password });
    return response.data;
  },
  signup: async (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => {
    const response = await api.post("/users/signup", {
      name,
      email,
      password,
      passwordConfirm,
    });
    return response.data;
  },
  verifyEmail: async (token: string) => {
    const response = await api.get(`/users/verifyEmail/${token}`);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  // OAuth - Redirect to backend OAuth endpoints
  googleOAuth: () => {
    const callbackUrl = `${window.location.origin}/auth/callback`;
    const redirectUrl = `${API_BASE_URL.replace('/api/v1', '')}/api/v1/users/auth/google`;
    window.location.href = `${redirectUrl}?redirect=${encodeURIComponent(callbackUrl)}`;
  },
  facebookOAuth: () => {
    const callbackUrl = `${window.location.origin}/auth/callback`;
    const redirectUrl = `${API_BASE_URL.replace('/api/v1', '')}/api/v1/users/auth/facebook`;
    window.location.href = `${redirectUrl}?redirect=${encodeURIComponent(callbackUrl)}`;
  },
  // Handle OAuth callback - called after OAuth redirect
  handleOAuthCallback: async (token: string) => {
    // Store token and fetch user data
    localStorage.setItem("token", token);
    try {
      const response = await api.get("/users/me");
      const user = response.data.data.data || response.data.data || response.data;
      localStorage.setItem("user", JSON.stringify(user));
      return { token, user };
    } catch (error: any) {
      // If fetching user fails, still return token (user might be in token)
      return { token, user: null };
    }
  },
};

// Experiences API
export const experiencesAPI = {
  getAll: async (paramsObj?: Record<string, any>) => {
    const params = new URLSearchParams();
    if (paramsObj) {
      Object.entries(paramsObj).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "")
          params.append(k, String(v));
      });
    }
    const url = params.toString() ? `/experiences?${params.toString()}` : "/experiences";
    const response = await api.get(url);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/experiences/${id}`);
    return response.data;
  },
  create: async (experienceData: any) => {
    const response = await api.post("/experiences", experienceData);
    return response.data;
  },
  update: async (id: string, experienceData: any) => {
    const response = await api.patch(`/experiences/${id}`, experienceData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/experiences/${id}`);
    return response.data;
  },
  getTopCheap: async () => {
    const response = await api.get("/experiences/top-5-cheap");
    return response.data;
  },
  getExperienceStats: async () => {
    const response = await api.get("/experiences/experience-stats");
    return response.data;
  },
  getExperiencesWithin: async (
    distance: number,
    latlng: string,
    unit: string = "mi"
  ) => {
    const response = await api.get(
      `/experiences/experiences-within/${distance}/center/${latlng}/unit/${unit}`
    );
    return response.data;
  },
  getDistances: async (latlng: string, unit: string = "mi") => {
    const response = await api.get(`/experiences/distances/${latlng}/unit/${unit}`);
    return response.data;
  },
};

// Users API
// Host Application API
export const hostApplicationAPI = {
  createOrUpdate: async (personalInfo: any) => {
    const response = await api.post("/host-applications", { personalInfo });
    return response.data;
  },
  updateExperienceDetails: async (experienceDetails: any) => {
    const response = await api.patch("/host-applications/experience-details", { experienceDetails });
    return response.data;
  },
  updateMedia: async (media: any) => {
    const response = await api.patch("/host-applications/media", { media });
    return response.data;
  },
  uploadMedia: async (formData: FormData) => {
    const response = await api.post("/host-applications/upload-media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  submitApplication: async () => {
    const response = await api.post("/host-applications/submit");
    return response.data;
  },
  reapplyApplication: async () => {
    const response = await api.post("/host-applications/reapply");
    return response.data;
  },
  getMyApplication: async () => {
    const response = await api.get("/host-applications/my-application");
    return response.data;
  },
  // Admin only
  getPendingApplications: async () => {
    const response = await api.get("/host-applications/pending");
    return response.data;
  },
  approveApplication: async (id: string, guideId?: string) => {
    const response = await api.patch(`/host-applications/${id}/approve`, { guideId });
    return response.data;
  },
  rejectApplication: async (id: string, rejectionReason?: string) => {
    const response = await api.patch(`/host-applications/${id}/reject`, { rejectionReason });
    return response.data;
  },
};

// Guide Application API
export const guideApplicationAPI = {
  createOrUpdate: async (personalInfo: any) => {
    const response = await api.post("/guide-applications", { personalInfo });
    return response.data;
  },
  updateExperienceDetails: async (experienceDetails: any) => {
    const response = await api.patch("/guide-applications/experience-details", { experienceDetails });
    return response.data;
  },
  updateMedia: async (media: any) => {
    const response = await api.patch("/guide-applications/media", { media });
    return response.data;
  },
  uploadMedia: async (formData: FormData) => {
    const response = await api.post("/guide-applications/upload-media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  submitApplication: async () => {
    const response = await api.post("/guide-applications/submit");
    return response.data;
  },
  reapplyApplication: async () => {
    const response = await api.post("/guide-applications/reapply");
    return response.data;
  },
  getMyApplication: async () => {
    const response = await api.get("/guide-applications/my-application");
    return response.data;
  },
  // Admin only
  getPendingApplications: async () => {
    const response = await api.get("/guide-applications/pending");
    return response.data;
  },
  approveApplication: async (id: string) => {
    const response = await api.patch(`/guide-applications/${id}/approve`);
    return response.data;
  },
  rejectApplication: async (id: string, rejectionReason?: string) => {
    const response = await api.patch(`/guide-applications/${id}/reject`, { rejectionReason });
    return response.data;
  },
};

// Guides API
export const guidesAPI = {
  getAll: async (location?: string) => {
    const params = new URLSearchParams();
    if (location) {
      params.append("location", location);
    }
    const url = params.toString() ? `/users/guides?${params.toString()}` : "/users/guides";
    const response = await api.get(url);
    return response.data;
  },
  getAssignedHosts: async (guideId: string) => {
    const response = await api.get(`/users/guides/${guideId}/hosts`);
    return response.data;
  },
  assignToHost: async (hostId: string, guideId: string) => {
    const response = await api.patch(`/users/hosts/${hostId}/assign-guide`, { guideId });
    return response.data;
  },
  reassignToHost: async (hostId: string, guideId: string) => {
    const response = await api.patch(`/users/hosts/${hostId}/reassign-guide`, { guideId });
    return response.data;
  },
};

// ADD: Wallet & Withdrawals API
export const walletAPI = {
  getMy: async () => {
    const response = await api.get("/wallet");
    return response.data;
  },
};

export const withdrawalsAPI = {
  create: async (payload: { amountCents: number; clientRequestId?: string; destination?: any }) => {
    const response = await api.post("/withdrawals", payload);
    return response.data;
  },
  listMine: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get("/withdrawals", { params });
    return response.data;
  },
};

export const adminPayoutsAPI = {
  createExport: async () => {
    const response = await api.post("/admin/payouts/exports");
    return response.data;
  },
  markPaid: async (id: string) => {
    const response = await api.post(`/admin/payouts/withdrawals/${id}/mark-paid`);
    return response.data;
  },
  markFailed: async (id: string, reason?: string) => {
    const response = await api.post(`/admin/payouts/withdrawals/${id}/mark-failed`, { reason });
    return response.data;
  },
  listWithdrawals: async (status?: string) => {
    const response = await api.get("/admin/payouts/withdrawals", { params: status ? { status } : {} });
    return response.data;
  }
};

export const usersAPI = {
  getAll: async (filters?: { role?: string }) => {
    const params = new URLSearchParams();
    if (filters?.role) {
      params.append("role", filters.role);
    }
    const url = params.toString() ? `/users?${params.toString()}` : "/users";
    const response = await api.get(url);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  update: async (id: string, userData: any) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  updateMe: async (userData: { name?: string; email?: string }) => {
    const response = await api.patch("/users/updateMe", userData);
    return response.data;
  },
  deleteMe: async () => {
    const response = await api.delete("/users/deleteMe");
    return response.data;
  },
  updateMyPassword: async (
    passwordCurrent: string,
    password: string,
    passwordConfirm: string
  ) => {
    const response = await api.patch("/users/updateMyPassword", {
      passwordCurrent,
      password,
      passwordConfirm,
    });
    return response.data;
  },
  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    role?: string;
  }) => {
    const response = await api.post("/users", userData);
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post("/users/forgotPassword", { email });
    return response.data;
  },
  resetPassword: async (
    token: string,
    password: string,
    passwordConfirm: string
  ) => {
    const response = await api.patch(`/users/resetPassword/${token}`, {
      password,
      passwordConfirm,
    });
    return response.data;
  },
  applyForHost: async () => {
    const response = await api.post("/users/applyForHost");
    return response.data;
  },
  getPendingHostApplications: async () => {
    const response = await api.get("/users/pending-hosts");
    return response.data;
  },
  approveHost: async (id: string) => {
    const response = await api.patch(`/users/approve-host/${id}`);
    return response.data;
  },
  rejectHost: async (id: string) => {
    const response = await api.patch(`/users/reject-host/${id}`);
    return response.data;
  },
  getHostById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
};

// Reviews API
export const reviewsAPI = {
  getAll: async (paramsObj?: Record<string, any>) => {
    const params = new URLSearchParams();
    if (paramsObj) {
      Object.entries(paramsObj).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "")
          params.append(k, String(v));
      });
    }
    const url = params.toString()
      ? `/reviews?${params.toString()}`
      : "/reviews";
    const response = await api.get(url);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },
  create: async (reviewData: {
    review: string;
    rating: number;
    experience: string;
  }) => {
    const response = await api.post("/reviews", reviewData);
    return response.data;
  },
  update: async (
    id: string,
    reviewData: { review?: string; rating?: number }
  ) => {
    const response = await api.patch(`/reviews/${id}`, reviewData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
  getReviewsForExperience: async (
    experienceId: string,
    paramsObj?: Record<string, any>
  ) => {
    const params = new URLSearchParams();
    if (paramsObj) {
      Object.entries(paramsObj).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "")
          params.append(k, String(v));
      });
    }
    const url = params.toString()
      ? `/experiences/${experienceId}/reviews?${params.toString()}`
      : `/experiences/${experienceId}/reviews`;
    const response = await api.get(url);
    return response.data;
  },
  createReviewForExperience: async (
    experienceId: string,
    reviewData: { review: string; rating: number }
  ) => {
    const response = await api.post(`/experiences/${experienceId}/reviews`, reviewData);
    return response.data;
  },
};

// Tours API (deprecated, use experiencesAPI)
export const toursAPI = experiencesAPI;

// Bookings API
export const bookingsAPI = {
  getAll: async () => {
    // Placeholder - would need backend booking endpoints
    throw new Error("Booking functionality not yet implemented in backend");
  },
  getById: async (id: string) => {
    // Placeholder - would need backend booking endpoints
    throw new Error("Booking functionality not yet implemented in backend");
  },
  create: async (experienceId: string, qty?: number) => {
    const params: { qty?: number } = {};
    if (qty != null && qty > 0) {
      params.qty = qty;
    }
    const response = await api.get(`/bookings/checkout-session/${experienceId}`, { params });
    return response.data;
  },
  verify: async (txRef: string) => {
    const response = await api.get(`/bookings/verify/${txRef}`);
    return response.data;
  },
  getMyBookings: async (): Promise<BookingListResponse> => {
    const response = await api.get("/bookings/me");
    return response.data as BookingListResponse;
  },
  getHostBookings: async (): Promise<BookingListResponse> => {
    const response = await api.get("/bookings/host/bookings");
    return response.data as BookingListResponse;
  },
  getAvailability: async (experienceId: string) => {
    const response = await api.get(`/bookings/availability/${experienceId}`);
    return response.data;
  },
};

// AI Chat API
export const aiChatAPI = {
  sendMessage: async (payload: {
    message: string;
    userId?: string;
    context?: {
      isAuthenticated?: boolean;
      userRole?: string;
      previousMessages?: Array<{ role: string; content: string }>;
    };
  }) => {
    const message = payload.message.toLowerCase();
    let response: any = {
      data: {
        message: "",
        suggestions: [],
        recommendations: [],
      },
    };

    try {
      // Try to fetch real experiences based on the message
      let shouldFetchExperiences = false;
      let fetchParams: Record<string, any> = { limit: 3 };

      if (message.includes("coffee") || message.includes("ceremony")) {
        response.data.message = "I'd love to help you find coffee ceremony experiences! Ethiopian coffee ceremonies are a beautiful tradition. Here are some options:";
        fetchParams.search = "coffee";
        shouldFetchExperiences = true;
        response.data.suggestions = [
          "Show me all coffee experiences",
          "What's the price range?",
          "Tell me more about the ceremony"
        ];
      } else if (message.includes("cheap") || message.includes("budget") || message.includes("under")) {
        response.data.message = "Great! I can help you find affordable experiences. Here are some budget-friendly options:";
        fetchParams.sort = "price";
        fetchParams.limit = 5;
        shouldFetchExperiences = true;
        response.data.suggestions = [
          "Experiences under $30",
          "Experiences under $50",
          "Show me the cheapest options"
        ];
      } else if (message.includes("popular") || message.includes("trending") || message.includes("best") || message.includes("top")) {
        response.data.message = "Here are some of our most popular and highly-rated experiences that guests love!";
        fetchParams.sort = "-ratingsAverage,price";
        shouldFetchExperiences = true;
        response.data.suggestions = [
          "Show top rated experiences",
          "What's trending this week?",
          "Show me experiences with great reviews"
        ];
      } else if (message.includes("cooking") || message.includes("food") || message.includes("recipe")) {
        response.data.message = "Ethiopian cuisine is amazing! Here are some cooking and food experiences:";
        fetchParams.search = "cooking food recipe";
        shouldFetchExperiences = true;
        response.data.suggestions = [
          "Tell me about Ethiopian food",
          "Show me cooking experiences",
          "What dishes can I learn?"
        ];
      } else if (message.includes("culture") || message.includes("ethiopian") || message.includes("tradition")) {
        response.data.message = "Ethiopian culture is rich and diverse! Here are some cultural experiences:";
        fetchParams.sort = "-ratingsAverage";
        shouldFetchExperiences = true;
        response.data.suggestions = [
          "Tell me about Ethiopian food",
          "Show me cultural experiences",
          "What makes these experiences authentic?"
        ];
      } else if (message.includes("location") || message.includes("where") || message.includes("place") || message.includes("addis")) {
        response.data.message = "Our experiences are hosted in local homes across Ethiopia, primarily in Addis Ababa and surrounding areas. Here are some options:";
        fetchParams.search = "addis ababa";
        shouldFetchExperiences = true;
        response.data.suggestions = [
          "Show experiences in Addis Ababa",
          "What locations are available?",
          "How do I get there?"
        ];
      } else if (message.includes("show") || message.includes("find") || message.includes("search") || message.includes("experiences")) {
        response.data.message = "Let me help you discover amazing experiences! Here are some options:";
        fetchParams.sort = "-ratingsAverage,price";
        shouldFetchExperiences = true;
        response.data.suggestions = [
          "Show me all experiences",
          "What's popular?",
          "Find budget-friendly options"
        ];
      } else {
        response.data.message = "I'm here to help you discover amazing Ethiopian cultural experiences! I can help you find experiences by type, price, location, or answer questions about our platform. What would you like to explore?";
        response.data.suggestions = [
          "Show me all experiences",
          "What's popular?",
          "Find budget-friendly options",
          "Tell me about Ethiopian culture"
        ];
      }

      // Fetch real experiences if needed
      if (shouldFetchExperiences) {
        try {
          const experiencesResponse = await experiencesAPI.getAll(fetchParams);
          const experiences = experiencesResponse.data?.data || experiencesResponse.data || [];
          
          if (experiences.length > 0) {
            response.data.recommendations = experiences.slice(0, 3).map((exp: any) => ({
              id: exp._id || exp.id,
              title: exp.title,
              location: exp.location || "Ethiopia",
              price: exp.price || 0,
              image: exp.imageCover,
            }));
          }
        } catch (error) {
          console.error("Failed to fetch experiences for AI chat:", error);
          // Continue without recommendations
        }
      }

      return response;
    } catch (error: any) {
      console.error("AI Chat error:", error);
      return {
        data: {
          message: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or feel free to browse our experiences directly.",
          suggestions: [
            "Browse all experiences",
            "Contact support",
            "Try asking again"
          ],
          recommendations: [],
        },
      };
    }
  },
  
  getRecommendations: async (userId?: string, preferences?: any) => {
    try {
      const params: Record<string, any> = { limit: 6 };
      
      if (preferences?.budgetRange) {
        params["price[gte]"] = preferences.budgetRange.min;
        params["price[lte]"] = preferences.budgetRange.max;
      }
      
      if (preferences?.location) {
        params.search = preferences.location;
      }
      
      if (preferences?.interests?.length > 0) {
        params.search = preferences.interests.join(" ");
      }
      
      const response = await experiencesAPI.getAll(params);
      return {
        data: {
          recommendations: response.data?.data || response.data || [],
        },
      };
    } catch (error) {
      console.error("Failed to get AI recommendations:", error);
      return {
        data: {
          recommendations: [],
        },
      };
    }
  },
};

export default api;

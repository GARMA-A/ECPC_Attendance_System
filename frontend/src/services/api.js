const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.errorAr || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Auth endpoints
  async login(username, password) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }
  async createUser(user) {
    return this.request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(user),
    });
  }

  async logout() {
    return this.request("/api/auth/logout", {
      method: "POST",
    });
  }

  async getCurrentUser() {
    return this.request("/api/auth/me");
  }

  // Session endpoints
  async getSessions() {
    return this.request("/api/sessions");
  }

  async getSession(id) {
    return this.request(`/api/sessions/${id}`);
  }

  async deleteSession(id) {
    return this.request(`/api/sessions/${id}`, { method: "DELETE" });
  }

  async createSession(data) {
    return this.request("/api/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getSessionQR(sessionId) {
    return this.request(`/api/sessions/${sessionId}/qr`);
  }

  async getSessionAttendance(sessionId, format = "json") {
    if (format === "csv") {
      const url = `${this.baseURL}/api/sessions/${sessionId}/attendance?format=csv`;
      window.open(url, "_blank");
      return;
    }
    return this.request(`/api/sessions/${sessionId}/attendance`);
  }

  // Attendance endpoints
  async recordAttendance(token, latitude = null, longitude = null) {
    return this.request("/api/attendance", {
      method: "POST",
      body: JSON.stringify({ token, latitude, longitude }),
    });
  }

  // User endpoints
  async getUserStats(userId) {
    return this.request(`/api/users/${userId}/stats`);
  }

  // Admin endpoints
  async getUsers() {
    return this.request("/api/admin/users");
  }

  async getAllAttendance(page = 1, limit = 50) {
    return this.request(`/api/admin/attendance?page=${page}&limit=${limit}`);
  }

  async deleteAttendance(attendanceId) {
    return this.request(`/api/admin/attendance/${attendanceId}`, {
      method: "DELETE",
    });
  }

  async deleteUser(attendanceId) {
    return this.request(`/api/admin/user/${attendanceId}`, {
      method: "DELETE",
    });
  }

  async addAttendance(userId, sessionId) {
    return this.request("/api/admin/attendance", {
      method: "POST",
      body: JSON.stringify({ userId, sessionId }),
    });
  }
}

export default new ApiService();

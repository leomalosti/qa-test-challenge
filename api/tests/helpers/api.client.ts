export class ApiClient {
  constructor(private baseURL: string) {}

  async createTask(request: any, data: any) {
    return request.post(`${this.baseURL}/tasks`, { data });
  }

  async getTasks(request: any) {
    return request.get(`${this.baseURL}/tasks`);
  }

  async updateTask(request: any, id: string, data: any) {
    return request.patch(`${this.baseURL}/tasks/${id}`, { data });
  }

  async deleteTask(request: any, id: string) {
    return request.delete(`${this.baseURL}/tasks/${id}`);
  }

  async getTaskById(request: any, id: string) {
    return request.get(`${this.baseURL}/tasks/${id}`);
  }
}
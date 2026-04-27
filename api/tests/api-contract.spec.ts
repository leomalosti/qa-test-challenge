import { test, expect } from '@playwright/test';
import { ApiClient } from './helpers/api.client';
import { makeTask } from './factories/task.factory';
import { assertTask, assertTaskList } from './helpers/assertions';

test.describe('Task API Contract Tests', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
  const api = new ApiClient(API_BASE_URL);

  // =========================================================
  // ISOLAMENTO (limpa estado antes de cada teste)
  // =========================================================
  test.beforeEach(async ({ request }) => {
  const res = await api.getTasks(request);
  const tasks = await res.json();

  for (const task of tasks) {
    await api.deleteTask(request, task.id);
  }
});

  // =========================================================
  // POST /tasks
  // =========================================================
  test.describe('POST /tasks', () => {
    test('deve criar tarefa válida', async ({ request }) => {
      const response = await api.createTask(request, makeTask());

      expect(response.status()).toBe(201);

      const body = await response.json();

      const task = assertTask(body);
      expect(task.title).toBeDefined();
    });

    test('deve aceitar título com 500 caracteres', async ({ request }) => {
      const response = await api.createTask(request, {
        title: 'a'.repeat(500),
      });

      expect(response.status()).toBe(201);

      const body = await response.json();
      const task = assertTask(body);

      expect(task.title.length).toBe(500);
    });
  });

  // =========================================================
  // GET /tasks
  // =========================================================
  test('deve retornar lista válida', async ({ request }) => {
    const created = await api.createTask(request, {
      title: 'Test Task for GET',
    });

    const createdTask = await created.json();

    const response = await api.getTasks(request);

    expect(response.status()).toBe(200);

    const body = await response.json();
    const tasks = assertTaskList(body);

    expect(tasks.some((t) => t.id === createdTask.id)).toBe(true);

    expect(() => assertTaskList(tasks)).not.toThrow();
});

  // =========================================================
  // PATCH /tasks/:id
  // =========================================================
  test.describe('PATCH /tasks/:id', () => {
    test('deve atualizar tarefa', async ({ request }) => {
      const created = await api.createTask(request, makeTask());
      const task = await created.json();

      const response = await api.updateTask(request, task.id, {
        isCompleted: true,
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      const updated = assertTask(body);

      expect(updated.isCompleted).toBe(true);
    });
  });

  test('PATCH deve retornar 404 para id inexistente', async ({ request }) => {
    const invalidId = crypto.randomUUID(); // mais realista que string fixa

    const response = await api.updateTask(request, invalidId, {
      isCompleted: true,
    });

    expect(response.status()).toBe(404);

    const body = await response.json();

    expect(body).toEqual(
      expect.objectContaining({
        error: 'Task not found',
      })
    );
  });

  // =========================================================
  // DELETE /tasks/:id
  // =========================================================
  test.describe('DELETE /tasks/:id', () => {
    test('deve deletar tarefa', async ({ request }) => {
      const created = await api.createTask(request, makeTask());
      const task = await created.json();

      const response = await api.deleteTask(request, task.id);

      expect(response.status()).toBe(204);

      const check = await api.getTaskById(request, task.id);
      expect(check.status()).toBe(404);
    });
  });

  // =========================================================
  // POST /ai/generate
  // =========================================================
  test.describe('POST /ai/generate', () => {
    test('deve retornar 201 ao gerar tarefas com IA com payload válido', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/ai/generate`, {
        data: {
        objective: 'Create a study plan for learning Playwright testing',
        apiKey: process.env.OPENROUTER_API_KEY || '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',
    },
  });

    expect(response.status()).toBe(201);

    const body = await response.json();

    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          isCompleted: expect.any(Boolean),
          isAiGenerated: true,
          createdAt: expect.any(String),
        }),
      ])
    );
  });
});

  // =========================================================
  // ERROR CONTRACT
  // =========================================================
  test.describe('Error Handling', () => {
    test('deve retornar erro estruturado', async ({ request }) => {
      const response = await api.createTask(request, {});

      expect(response.status()).toBe(400);

      const body = await response.json();

      expect(body).toHaveProperty('error');
    });
  });
});
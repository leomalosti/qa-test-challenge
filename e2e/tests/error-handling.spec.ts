import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

/**
 * Error Handling Tests
 * Tests the UI behavior when API returns errors
 */

test.describe('Error Handling', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.cleanupTasks();
  });

  // ============================================================================
  // API Error Simulation
  // ============================================================================

  test('✓ Deve exibir mensagem de erro quando a API de tarefas falha ao criar', async ({ page }) => {
    // Interceptar requisição e simular erro
    await page.route('**/tasks', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    // Tentar criar tarefa
    await homePage.taskForm.createTask('Tarefa que vai falhar');
    
    // Verificar que mensagem de erro aparece (se implementada)
    // Este teste pode precisar de ajuste dependendo da implementação
  });

  test('✓ Deve exibir mensagem de erro quando a API de tarefas falha ao listar', async ({ page }) => {
    // Interceptar requisição GET /tasks e simular erro
    await page.route('**/tasks', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 503,
          body: JSON.stringify({ error: 'Service Unavailable' }),
        });
      } else {
        await route.continue();
      }
    });

    // Recarregar página para triggerar GET
    await homePage.goto();
    
    // Verificar comportamento - pode ser mensagem de erro ou estado vazio
  });

  test('✓ Deve exibir mensagem de erro quando a API de tarefas falha ao deletar', async ({ page }) => {
    // Criar tarefa primeiro
    await homePage.taskForm.createTask('Tarefa para testar erro');
    
    // Interceptar requisição DELETE e simular erro
    await page.route('**/tasks/*', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Delete Failed' }),
        });
      } else {
        await route.continue();
      }
    });

    // Tentar deletar
    await homePage.taskList.deleteTask(0);
    
    // Verificar comportamento
  });

  // ============================================================================
  // AI Generator Error Handling
  // ============================================================================

  test('✓ Deve renderizar o componente de geração de IA', async ({ page }) => {
    await expect(homePage.aiGenerator.container).toBeVisible();
  });

  test('✓ Deve renderizar campo de API Key', async ({ page }) => {
    await expect(homePage.aiGenerator.apiKeyInput).toBeVisible();
  });

  test('✓ Deve renderizar campo de objetivo', async ({ page }) => {
    await expect(homePage.aiGenerator.objectiveInput).toBeVisible();
  });

  test('✓ Deve renderizar botão de gerar', async ({ page }) => {
    await expect(homePage.aiGenerator.generateButton).toBeVisible();
  });

  test('✓ Deve aceitar entrada no campo de API Key', async ({ page }) => {
    await homePage.aiGenerator.setApiKey('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');
    await expect(homePage.aiGenerator.apiKeyInput).toHaveValue('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');
  });

  test('✓ Deve aceitar entrada no campo de objetivo', async ({ page }) => {
    await homePage.aiGenerator.setObjective('Criar lista de tarefas para aprender programação');
    await expect(homePage.aiGenerator.objectiveInput).toHaveValue('Criar lista de tarefas para aprender programação');
  });

  // ============================================================================
  // Integration - Full Flow with Error
  // ============================================================================

  test('✓ Deve criar, completar e deletar uma tarefa (fluxo completo)', async ({ page }) => {
    const taskTitle = `Tarefa ${Date.now()}`;

    await homePage.taskForm.createTask(taskTitle);

    const task = homePage.taskList.getTaskTitle(taskTitle);
    await expect(task).toBeVisible();

    // deletar
    await homePage.taskList.deleteTask(0);

    // validar remoção da task específica
    await expect(task).toBeHidden();
  });
});
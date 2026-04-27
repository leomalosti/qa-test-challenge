import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

/**
 * Empty Stage Tests
 * Tests the UI behavior when there are no tasks
 */

test.describe('Empty Stage', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.cleanupTasks();
  });

  // ============================================================================
  // Header Component
  // ============================================================================

  test('✓ Deve renderizar o cabeçalho com data-testid', async ({ page }) => {
    await expect(homePage.header.header).toBeVisible();
  });

  test('✓ Deve exibir contador de tarefas como zero', async ({ page }) => {
    await expect(homePage.header.taskCount).toBeVisible();
    const count = await homePage.header.getTaskCountNumber();
    expect(count).toBe(0);
  });

  // ============================================================================
  // Empty State - Form
  // ============================================================================

  test('✓ Deve renderizar o formulário mesmo sem tarefas', async ({ page }) => {
    await expect(homePage.taskForm.form).toBeVisible();
  });

  test('✓ Deve permitir criar tarefa quando não há tarefas', async ({ page }) => {
    await homePage.taskForm.createTask('Primeira tarefa');
    await expect(homePage.taskList.getTaskTitle('Primeira tarefa')).toBeVisible();
  });

  // ============================================================================
  // Empty State - List
  // ============================================================================

  test('✓ Deve renderizar lista de tarefas vazia', async ({ page }) => {
    await expect(homePage.taskList.taskList).toBeAttached();
  });

  test('✓ Deve mostrar estado vazio quando não há tarefas', async ({ page }) => {
    // Verificar que não há itens de tarefa
    const taskItems = await homePage.taskList.taskList.locator('[data-testid="task-item"]').count();
    expect(taskItems).toBe(0);
  });
});
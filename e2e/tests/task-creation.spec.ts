import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

/**
 * Task Creation Tests
 * Tests the task creation flow and form validation
 */

test.describe('Task Creation', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.cleanupTasks();
  });

  // ============================================================================
  // Task Form Component - Render
  // ============================================================================

  test('✓ Deve renderizar o formulário de tarefas', async ({ page }) => {
    await expect(homePage.taskForm.form).toBeVisible();
  });

  test('✓ Deve renderizar o campo de título', async ({ page }) => {
    await expect(homePage.taskForm.titleInput).toBeVisible();
  });

  test('✓ Deve renderizar o botão de submit', async ({ page }) => {
    await expect(homePage.taskForm.submitButton).toBeVisible();
  });

  // ============================================================================
  // Task Creation - Functional
  // ============================================================================

  test('✓ Deve criar uma nova tarefa ao submeter o formulário', async ({ page }) => {
    await homePage.taskForm.createTask('Nova tarefa de teste');
    await expect(homePage.taskList.getTaskTitle('Nova tarefa de teste')).toBeVisible();
  });

  test('✓ Deve limpar o campo após criar tarefa', async ({ page }) => {
    await homePage.taskForm.createTask('Tarefa para limpar');
    await expect(homePage.taskForm.titleInput).toHaveValue('');
  });

  test('✓ Deve atualizar o contador de tarefas no header após criação', async ({ page }) => {
    const initialCount = await homePage.header.getTaskCountNumber();
    await homePage.taskForm.createTask('Nova tarefa');
    await page.waitForTimeout(500);
    const newCount = await homePage.header.getTaskCountNumber();
    expect(newCount).toBe(initialCount + 1);
  });

  // ============================================================================
  // Task List - Render
  // ============================================================================

  test('✓ Deve renderizar a lista de tarefas', async ({ page }) => {
    await expect(homePage.taskList.taskList).toBeAttached();
  });

  test('✓ Deve listar tarefas existentes', async ({ page }) => {
    await homePage.taskForm.createTask('Tarefa para listar');
    await expect(homePage.taskList.taskList).toBeVisible();
    await expect(homePage.taskList.getTaskItem(0)).toBeVisible();
  });
});
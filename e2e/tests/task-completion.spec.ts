import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

/**
 * Task Completion Tests
 * Tests the task completion toggle and persistence
 */

test.describe('Task Completion', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.cleanupTasks();
  });

  // ============================================================================
  // Task Item - Render
  // ============================================================================

  test('✓ Deve renderizar item de tarefa', async ({ page }) => {
    await homePage.taskForm.createTask('Tarefa item teste');

    await expect(homePage.taskList.getTaskItem(0)).toBeVisible();
  });

  test('✓ Deve renderizar checkbox de conclusão', async ({ page }) => {
    await homePage.taskForm.createTask('Tarefa checkbox');

    await expect(homePage.taskList.getTaskCheckbox(0)).toBeVisible();
  });

  test('✓ Deve renderizar título da tarefa', async ({ page }) => {
    await homePage.taskForm.createTask('Tarefa título teste');

    await expect(
      homePage.taskList.getTaskTitle('Tarefa título teste')
    ).toBeVisible();
  });

  // ============================================================================
  // Task Completion - Functional
  // ============================================================================

  test('✓ Deve marcar tarefa como concluída ao clicar no checkbox', async ({ page }) => {
    await homePage.taskForm.createTask('Tarefa para completar');

    const checkbox = homePage.taskList.getTaskCheckbox(0);
    await expect(homePage.taskList.getTaskItem(0)).toBeVisible();

    await checkbox.click();

    await expect(checkbox).toBeChecked();
  });

  test('✓ Deve persistir status de conclusão após reload da página', async ({ page }) => {
    const taskTitle = 'Tarefa para persistir';

    await homePage.taskForm.createTask(taskTitle);

    const checkbox = homePage.taskList.getCheckboxByTitle
      ? homePage.taskList.getCheckboxByTitle(taskTitle)
      : homePage.taskList.getTaskCheckbox(0);

    await expect(homePage.taskList.getTaskItem(0)).toBeVisible();

    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Reload da página
    await homePage.goto();

    // garantir que UI carregou novamente
    await expect(homePage.taskList.getTaskItem(0)).toBeVisible();

    const checkboxAfterReload = homePage.taskList.getCheckboxByTitle
      ? homePage.taskList.getCheckboxByTitle(taskTitle)
      : homePage.taskList.getTaskCheckbox(0);

    await expect(checkboxAfterReload).toBeChecked();
  });

  test('✓ Deve permitir desconcluir tarefa', async ({ page }) => {
    await homePage.taskForm.createTask('Tarefa para desconcluir');

    const checkbox = homePage.taskList.getTaskCheckbox(0);

    await expect(homePage.taskList.getTaskItem(0)).toBeVisible();

    // marcar
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // desmarcar
    await checkbox.click();

    await expect(checkbox).not.toBeChecked();
  });
});
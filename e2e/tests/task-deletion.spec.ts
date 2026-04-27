import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Task Deletion', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.cleanupTasks();
  });

  test('✓ Deve renderizar botão de deletar', async () => {
    await homePage.taskForm.createTask('Tarefa para deletar');
    await expect(homePage.taskList.getTaskDeleteButton(0)).toBeVisible();
  });

  test('✓ Deve deletar tarefa ao clicar no botão de deletar', async () => {
    const taskTitle = `Tarefa ${Date.now()}`;

    await homePage.taskForm.createTask(taskTitle);

    await expect(homePage.taskList.getTaskTitle(taskTitle)).toBeVisible();

    const initialCount = await homePage.taskList.getTaskCount();

    await homePage.taskList.deleteTask(0);

    // ✔️ validação correta aqui (não depende de waitForEmpty)
    await expect(homePage.taskList.getTaskItems())
      .toHaveCount(initialCount - 1);
  });

  test('✓ Deve atualizar o contador de tarefas no header após exclusão', async ({ page }) => {
    const taskTitle = `Tarefa ${Date.now()}`;

    await homePage.taskForm.createTask(taskTitle);

    await expect(homePage.taskList.getTaskTitle(taskTitle)).toBeVisible();

    await homePage.taskList.deleteTask(0);

    await expect(homePage.taskList.getTaskItems()).toHaveCount(0);

    const newCount = await homePage.header.getTaskCountNumber();
    expect(newCount).toBe(0);
  });

  test('✓ Deve remover tarefa da lista após exclusão', async () => {
    await homePage.taskForm.createTask('Tarefa 1');
    await homePage.taskForm.createTask('Tarefa 2');

    const beforeCount = await homePage.taskList.getTaskCount();

    await homePage.taskList.deleteTask(0);

    await expect(homePage.taskList.getTaskItems())
      .toHaveCount(beforeCount - 1);

    await expect(homePage.taskList.getTaskTitle('Tarefa 2')).toBeVisible();
  });
});
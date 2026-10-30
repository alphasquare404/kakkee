import { describe, expect, it, vi } from 'vitest';
import { createBackupController } from './backupController';
import type { BackupRepository } from './backupRepository';

const settings = {
  __typename: 'SettingsType' as const,
  autoBackupIncludeCategories: true,
  autoBackupIncludeChapters: true,
  autoBackupIncludeClientData: false,
  autoBackupIncludeHistory: true,
  autoBackupIncludeManga: true,
  autoBackupIncludeServerSettings: false,
  autoBackupIncludeTracking: false,
  backupPath: '/backups',
  backupInterval: 24,
  backupTime: '02:00',
  backupTTL: 5,
};

function setup() {
  const getSettings = vi.fn(async () => settings);
  const create = vi.fn(async () => 'https://example.test/backup.zip');
  const repository = {
    getSettings,
    create,
  } as unknown as BackupRepository;
  return {
    controller: createBackupController(repository),
    getSettings,
    create,
  };
}

describe('createBackupController', () => {
  it('loads settings and stores the created backup URL', async () => {
    const { controller, create } = setup();
    await controller.load();
    await controller.create({ includeManga: true });

    expect(controller.getState().settings?.backupPath).toBe('/backups');
    expect(controller.getState().createdUrl).toBe(
      'https://example.test/backup.zip',
    );
    expect(create).toHaveBeenCalledWith({ includeManga: true });
  });

  it('reports create failures', async () => {
    const { controller, create } = setup();
    await controller.load();
    create.mockRejectedValueOnce(new Error('rejected'));

    await controller.create({ includeManga: true });

    expect(controller.getState().error).toBe(true);
  });
});

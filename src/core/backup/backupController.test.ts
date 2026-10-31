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
  const restore = vi.fn(async () => 'restore-1');
  const validate = vi.fn(async () => ({
    missingSources: [],
    missingTrackers: [],
  }));
  const repository = {
    getSettings,
    create,
    restore,
    validate,
  } as unknown as BackupRepository;
  return {
    controller: createBackupController(repository),
    getSettings,
    create,
    restore,
    validate,
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

  it('restores a backup file', async () => {
    const { controller, restore } = setup();
    const file = new File(['backup'], 'backup.zip');
    await controller.restore(file, { includeManga: true });

    expect(restore).toHaveBeenCalledWith(file, { includeManga: true });
    expect(controller.getState().restoredId).toBe('restore-1');
    expect(controller.getState().restoring).toBe(false);
  });

  it('validates a backup file', async () => {
    const { controller, validate } = setup();
    const file = new File(['backup'], 'backup.zip');
    await controller.validate(file);

    expect(validate).toHaveBeenCalledWith(file);
    expect(controller.getState().validation).toEqual({
      missingSources: [],
      missingTrackers: [],
    });
    expect(controller.getState().validating).toBe(false);
  });
});

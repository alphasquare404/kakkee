import { describe, expect, it, vi } from 'vitest';
import { createServerSettingsController } from './serverSettingsController';
import type {
  ServerSettings,
  ServerSettingsRepository,
} from './serverSettingsRepository';

const settings: ServerSettings = {
  __typename: 'SettingsType',
  authMode: 'NONE',
  databaseType: 'H2',
  updateMangas: true,
  autoDownloadNewChapters: false,
  autoDownloadNewChaptersLimit: 5,
  downloadAsCbz: true,
  downloadsPath: '/downloads',
  maxSourcesInParallel: 3,
  globalUpdateInterval: 24,
  excludeCompleted: false,
  excludeNotStarted: true,
  excludeUnreadChapters: false,
  excludeEntryWithUnreadChapters: false,
  debugLogsEnabled: false,
  backupPath: '/backups',
  backupInterval: 24,
  webUIChannel: 'STABLE',
  webUIFlavor: 'WEBUI',
  webUIInterface: 'BROWSER',
  opdsCbzMimetype: 'COMPATIBLE',
  opdsChapterSortOrder: 'ASC',
  opdsEnablePageReadProgress: true,
  opdsItemsPerPage: 20,
  opdsMarkAsReadOnDownload: false,
  opdsShowOnlyDownloadedChapters: false,
  opdsShowOnlyUnreadChapters: false,
  opdsSkipChapterMetadataFeed: false,
  opdsUseBinaryFileSizes: false,
  koreaderSyncChecksumMethod: 'BINARY',
  koreaderSyncPercentageTolerance: 0.1,
  koreaderSyncStrategyBackward: 'PROMPT',
  koreaderSyncStrategyForward: 'PROMPT',};

function setup() {
  const getSettings = vi.fn(async () => settings);
  const updateSettings = vi.fn(async (patch) => patch);
  const repository = {
    getSettings,
    updateSettings,
  } as unknown as ServerSettingsRepository;
  const controller = createServerSettingsController(repository);
  return { controller, getSettings, updateSettings };
}

describe('createServerSettingsController', () => {
  it('loads settings and exposes a ready state', async () => {
    const { controller } = setup();

    await controller.load();

    expect(controller.getState().status).toBe('ready');
    expect(controller.getState().settings?.downloadsPath).toBe('/downloads');
  });

  it('applies a saved patch and reports save errors', async () => {
    const { controller, updateSettings } = setup();
    await controller.load();

    await controller.update({ updateMangas: false });
    expect(controller.getState().settings?.updateMangas).toBe(false);

    updateSettings.mockRejectedValueOnce(new Error('rejected'));
    await controller.update({ updateMangas: true });
    expect(controller.getState().saveError).toBe(true);
  });

  it('exposes a load error', async () => {
    const { controller, getSettings } = setup();
    getSettings.mockRejectedValueOnce(new Error('offline'));

    await controller.load();

    expect(controller.getState().status).toBe('error');
  });
});

import { useEffect, useState } from 'react';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { BackButton } from '../../shared/BackButton';

registerMessages('id', {
  Device: 'Perangkat',
  'Browser and display capabilities': 'Kemampuan browser dan layar',
  'All settings': 'Semua pengaturan',
  'This device': 'Perangkat ini',
  Platform: 'Platform',
  Language: 'Bahasa',
  Screen: 'Layar',
  'Pixel ratio': 'Rasio piksel',
  'Installed app': 'Aplikasi terpasang',
  'Standalone window': 'Jendela mandiri',
  'Browser tab': 'Tab browser',
  Network: 'Jaringan',
  Online: 'Online',
  Offline: 'Offline',
  'Service worker': 'Service worker',
  Supported: 'Didukung',
  Unsupported: 'Tidak didukung',
  'Wake Lock': 'Wake Lock',
  'Web Share': 'Web Share',
  Memory: 'Memori',
  'User agent': 'User agent',
});

interface DeviceInfo {
  readonly userAgent: string;
  readonly platform: string;
  readonly language: string;
  readonly screen: string;
  readonly pixelRatio: string;
  readonly standalone: boolean;
  readonly online: boolean;
  readonly serviceWorker: boolean;
  readonly wakeLock: boolean;
  readonly share: boolean;
  readonly storage: string;
}

function readDeviceInfo(): DeviceInfo {
  const navigatorWithExtras = navigator as Navigator & {
    wakeLock?: unknown;
    standalone?: boolean;
    deviceMemory?: number;
  };

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform || 'Unknown',
    language: navigator.language,
    screen: `${window.screen.width} × ${window.screen.height}`,
    pixelRatio: `${window.devicePixelRatio}×`,
    standalone:
      (typeof window.matchMedia === 'function' &&
        window.matchMedia('(display-mode: standalone)').matches) ||
      navigatorWithExtras.standalone === true,
    online: navigator.onLine,
    serviceWorker: 'serviceWorker' in navigator,
    wakeLock: Boolean(navigatorWithExtras.wakeLock),
    share: typeof navigator.share === 'function',
    storage: navigatorWithExtras.deviceMemory
      ? `${navigatorWithExtras.deviceMemory} GB device memory`
      : 'Not exposed',
  };
}

export function DeviceSettingsPage() {
  const { t } = useI18n();
  const [device, setDevice] = useState(readDeviceInfo);

  useEffect(() => {
    const update = () => setDevice(readDeviceInfo());
    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader
        title={t('Device')}
        subtitle={t('Browser and display capabilities')}
        leading={<BackButton to="/settings" label={t('Back')} />}
      />

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="device-info">
          <div className="section-heading-row">
            <h2 id="device-info">{t('This device')}</h2>
          </div>
          <dl className="settings-rows">
            <div>
              <dt>{t('Platform')}</dt>
              <dd>{device.platform}</dd>
            </div>
            <div>
              <dt>{t('Language')}</dt>
              <dd>{device.language}</dd>
            </div>
            <div>
              <dt>{t('Screen')}</dt>
              <dd>{device.screen}</dd>
            </div>
            <div>
              <dt>{t('Pixel ratio')}</dt>
              <dd>{device.pixelRatio}</dd>
            </div>
            <div>
              <dt>{t('Installed app')}</dt>
              <dd>{device.standalone ? t('Standalone window') : t('Browser tab')}</dd>
            </div>
            <div>
              <dt>{t('Network')}</dt>
              <dd>{device.online ? t('Online') : t('Offline')}</dd>
            </div>
            <div>
              <dt>{t('Service worker')}</dt>
              <dd>{device.serviceWorker ? t('Supported') : t('Unsupported')}</dd>
            </div>
            <div>
              <dt>{t('Wake Lock')}</dt>
              <dd>{device.wakeLock ? t('Supported') : t('Unsupported')}</dd>
            </div>
            <div>
              <dt>{t('Web Share')}</dt>
              <dd>{device.share ? t('Supported') : t('Unsupported')}</dd>
            </div>
            <div>
              <dt>{t('Memory')}</dt>
              <dd>{device.storage}</dd>
            </div>
            <div>
              <dt>{t('User agent')}</dt>
              <dd className="settings-endpoint">{device.userAgent}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

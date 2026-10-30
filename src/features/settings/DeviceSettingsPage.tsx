import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../shared/PageHeader';

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
      <PageHeader title="Device" subtitle="Browser and display capabilities">
        <Link className="button button-secondary" to="/settings">
          All settings
        </Link>
      </PageHeader>

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="device-info">
          <div className="section-heading-row">
            <h2 id="device-info">This device</h2>
          </div>
          <dl className="settings-rows">
            <div>
              <dt>Platform</dt>
              <dd>{device.platform}</dd>
            </div>
            <div>
              <dt>Language</dt>
              <dd>{device.language}</dd>
            </div>
            <div>
              <dt>Screen</dt>
              <dd>{device.screen}</dd>
            </div>
            <div>
              <dt>Pixel ratio</dt>
              <dd>{device.pixelRatio}</dd>
            </div>
            <div>
              <dt>Installed app</dt>
              <dd>{device.standalone ? 'Standalone window' : 'Browser tab'}</dd>
            </div>
            <div>
              <dt>Network</dt>
              <dd>{device.online ? 'Online' : 'Offline'}</dd>
            </div>
            <div>
              <dt>Service worker</dt>
              <dd>{device.serviceWorker ? 'Supported' : 'Unsupported'}</dd>
            </div>
            <div>
              <dt>Wake Lock</dt>
              <dd>{device.wakeLock ? 'Supported' : 'Unsupported'}</dd>
            </div>
            <div>
              <dt>Web Share</dt>
              <dd>{device.share ? 'Supported' : 'Unsupported'}</dd>
            </div>
            <div>
              <dt>Memory</dt>
              <dd>{device.storage}</dd>
            </div>
            <div>
              <dt>User agent</dt>
              <dd className="settings-endpoint">{device.userAgent}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

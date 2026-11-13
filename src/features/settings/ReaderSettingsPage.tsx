import type { CSSProperties } from 'react';
import {
  READER_FILTER_CSS,
  resetReaderSettings,
  saveReaderModeProfile,
  updateReaderSettings,
  type ReaderDirection,
  type ReaderFilter,
  type ReaderKey,
  type ReaderScale,
  type ReaderSettings,
} from '../../core/preferences/readerSettings';
import { useReaderSettings } from '../../shared/useReaderSettings';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { BackButton } from '../../shared/BackButton';

registerMessages('id', {
  'Reader settings': 'Pengaturan reader',
  'Defaults for every chapter': 'Default untuk setiap chapter',
  'All settings': 'Semua pengaturan',
  Layout: 'Tata letak',
  'Reading mode': 'Mode membaca',
  'Continuous vertical': 'Vertikal berkelanjutan',
  Webtoon: 'Webtoon',
  'Single page': 'Satu halaman',
  'Double page': 'Dua halaman',
  'Continuous horizontal': 'Horizontal berkelanjutan',
  'Mode profile': 'Profil mode',
  'Reader width': 'Lebar reader',
  '1 rem = browser root font size, usually 16 px.':
    '1 rem = ukuran font root browser, biasanya 16 px.',
  'Fit screen fits the page inside the available reader area and viewport height. It is not browser fullscreen.':
    'Fit screen menyesuaikan halaman agar masuk area reader dan tinggi layar. Ini bukan fullscreen browser.',
  'In double-page mode, Fit width fills the reader width with two pages; Fit height fits each page to the available screen height.':
    'Pada mode dua halaman, Fit width memenuhi lebar reader dengan dua halaman; Fit height menyesuaikan tinggi tiap halaman dengan layar.',
  'Fit height can make a page wider than the screen; scroll horizontally to see the full page.':
    'Fit height dapat membuat halaman lebih lebar dari layar; geser horizontal untuk melihat seluruh halaman.',
  'Page gap': 'Jarak halaman',
  'First-page offset': 'Offset halaman pertama',
  Background: 'Latar belakang',
  'Image filter': 'Filter gambar',
  Original: 'Asli',
  Grayscale: 'Grayscale',
  Sepia: 'Sepia',
  Invert: 'Invert',
  'High contrast': 'Kontras tinggi',
  Brightness: 'Kecerahan',
  Contrast: 'Kontras',
  Saturation: 'Saturasi',
  'Page scale': 'Skala halaman',
  'Fit width': 'Sesuaikan lebar',
  'Fit height': 'Sesuaikan tinggi',
  'Fit screen': 'Sesuaikan layar',
  'Original size': 'Ukuran asli',
  'Stretch small pages': 'Regangkan halaman kecil',
  'Reading direction': 'Arah membaca',
  'Left to right': 'Kiri ke kanan',
  'Right to left': 'Kanan ke kiri',
  'Keep screen on': 'Layar tetap menyala',
  'Use Wake Lock while reading': 'Gunakan Wake Lock saat membaca',
  'Auto-hide controls': 'Sembunyikan kontrol otomatis',
  'Hide the header and seekbar while reading':
    'Sembunyikan header dan seekbar saat membaca',
  'Duplicate chapters': 'Chapter duplikat',
  'Skip duplicate chapter numbers in navigation':
    'Lewati nomor chapter duplikat saat navigasi',
  'Auto-advance': 'Lanjut otomatis',
  'Open the next chapter after the last page':
    'Buka chapter berikutnya setelah halaman terakhir',
  'Webtoon detection': 'Deteksi webtoon',
  'Use webtoon layout for very tall pages':
    'Gunakan tata letak webtoon untuk halaman sangat tinggi',
  'Auto-scroll speed': 'Kecepatan gulir otomatis',
  'Previous page key': 'Tombol halaman sebelumnya',
  'Next page key': 'Tombol halaman berikutnya',
  'Back key': 'Tombol kembali',
  'Left arrow': 'Panah kiri',
  'Right arrow': 'Panah kanan',
  'Page up': 'Page up',
  'Page down': 'Page down',
  Escape: 'Escape',
  Backspace: 'Backspace',
  'Downloaded chapters': 'Chapter terunduh',
  'Delete the downloaded chapter after finishing it':
    'Hapus chapter terunduh setelah selesai dibaca',
  'Match background to the current page':
    'Sesuaikan latar dengan halaman saat ini',
  Preview: 'Pratinjau',
  'Reset defaults': 'Reset default',
  'Page 1': 'Halaman 1',
  'Page 2': 'Halaman 2',
  'Page 3': 'Halaman 3',
  'These preferences affect the vertical Reader immediately and are stored on this device only.':
    'Preferensi ini langsung memengaruhi Reader vertikal dan hanya disimpan di perangkat ini.',
  Ink: 'Tinta',
  'Pure black': 'Hitam pekat',
  Charcoal: 'Arang',
});

const BACKGROUNDS: Array<{ value: string; label: string }> = [
  { value: '#05070c', label: 'Ink' },
  { value: '#000000', label: 'Pure black' },
  { value: '#10151f', label: 'Charcoal' },
];

export function ReaderSettingsPage() {
  const settings = useReaderSettings();
  const { t } = useI18n();

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader
        title={t('Reader settings')}
        subtitle={t('Defaults for every chapter')}
        leading={<BackButton to="/settings" label={t('Back')} />}
      />

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="reader-layout-heading">
          <div className="section-heading-row">
            <h2 id="reader-layout-heading">{t('Layout')}</h2>
          </div>
          <dl className="settings-rows">
            <div>
              <dt>
                <label htmlFor="reader-mode">{t('Reading mode')}</label>
              </dt>
              <dd>
                <select
                  id="reader-mode"
                  className="settings-select"
                  value={settings.mode}
                  onChange={(event) =>
                    updateReaderSettings({
                      mode: event.target.value as ReaderSettings['mode'],
                    })
                  }
                >
                  <option value="vertical">{t('Continuous vertical')}</option>
                  <option value="webtoon">{t('Webtoon')}</option>
                  <option value="single">{t('Single page')}</option>
                  <option value="double">{t('Double page')}</option>
                  <option value="horizontal">{t('Continuous horizontal')}</option>
                </select>
              </dd>
            </div>
            <div>
              <dt>{t('Mode profile')}</dt>
              <dd>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={saveReaderModeProfile}
                >
                  Save layout for this mode
                </button>
              </dd>
            </div>
            <div>
              <dt>
                <label htmlFor="reader-width">{t('Reader width')}</label>
              </dt>
              <dd>
                <div className="settings-range">
                  <input
                    id="reader-width"
                    type="range"
                    min={42}
                    max={100}
                    step={1}
                    value={settings.widthRem}
                    onChange={(event) =>
                      updateReaderSettings({
                        widthRem: Number(event.target.value),
                      })
                    }
                  />
                  <output>{settings.widthRem} rem</output>
                </div>
                <p className="settings-field-hint">
                  {t('1 rem = browser root font size, usually 16 px.')}
                </p>
              </dd>
            </div>
            <div>
              <dt>
                <label htmlFor="reader-gap">{t('Page gap')}</label>
              </dt>
              <dd>
                <div className="settings-range">
                  <input
                    id="reader-gap"
                    type="range"
                    min={0}
                    max={24}
                    step={1}
                    value={settings.gapPx}
                    onChange={(event) =>
                      updateReaderSettings({ gapPx: Number(event.target.value) })
                    }
                  />
                  <output>{settings.gapPx} px</output>
                </div>
              </dd>
            </div>
            <div>
              <dt>
                <label htmlFor="reader-offset">{t('First-page offset')}</label>
              </dt>
              <dd>
                <div className="settings-range">
                  <input
                    id="reader-offset"
                    type="range"
                    min={0}
                    max={200}
                    step={4}
                    value={settings.firstPageOffset}
                    onChange={(event) =>
                      updateReaderSettings({
                        firstPageOffset: Number(event.target.value),
                      })
                    }
                  />
                  <output>{settings.firstPageOffset} px</output>
                </div>
              </dd>
            </div>
            <div>
              <dt>{t('Background')}</dt>
              <dd>
                <div className="settings-options">
                  {BACKGROUNDS.map((background) => (
                    <button
                      className={
                        settings.background === background.value ? 'is-active' : undefined
                      }
                      key={background.value}
                      type="button"
                      aria-pressed={settings.background === background.value}
                      onClick={() =>
                        updateReaderSettings({ background: background.value })
                      }
                    >
                      <span
                        className="settings-color-dot"
                        style={{ backgroundColor: background.value }}
                        aria-hidden="true"
                      />
                      {t(background.label)}
                    </button>
                  ))}
                </div>
              </dd>
            </div>
            <div>
              <dt>
                <label htmlFor="reader-filter">{t('Image filter')}</label>
              </dt>
              <dd>
                <select
                  id="reader-filter"
                  className="settings-select"
                  value={settings.filter}
                  onChange={(event) =>
                    updateReaderSettings({
                      filter: event.target.value as ReaderFilter,
                    })
                  }
                >
                  <option value="original">{t('Original')}</option>
                  <option value="grayscale">{t('Grayscale')}</option>
                  <option value="sepia">{t('Sepia')}</option>
                  <option value="invert">{t('Invert')}</option>
                  <option value="contrast">{t('High contrast')}</option>
                </select>
              </dd>
            </div>
            <div>
              <dt>
                <label htmlFor="reader-brightness">{t('Brightness')}</label>
              </dt>
              <dd>
                <input
                  id="reader-brightness"
                  type="range"
                  min={50}
                  max={150}
                  step={5}
                  value={settings.brightnessPct}
                  onChange={(event) =>
                    updateReaderSettings({
                      brightnessPct: Number(event.target.value),
                    })
                  }
                />
                <span className="settings-save-state">
                  {settings.brightnessPct}%
                </span>
              </dd>
            </div>
            <div>
              <dt>
                <label htmlFor="reader-contrast">Contrast</label>
              </dt>
              <dd>
                <input
                  id="reader-contrast"
                  type="range"
                  min={50}
                  max={150}
                  step={5}
                  value={settings.contrastPct}
                  onChange={(event) =>
                    updateReaderSettings({
                      contrastPct: Number(event.target.value),
                    })
                  }
                />
                <span className="settings-save-state">
                  {settings.contrastPct}%
                </span>
              </dd>
            </div>
            <div>
              <dt>
                <label htmlFor="reader-saturation">Saturation</label>
              </dt>
              <dd>
                <input
                  id="reader-saturation"
                  type="range"
                  min={0}
                  max={200}
                  step={5}
                  value={settings.saturationPct}
                  onChange={(event) =>
                    updateReaderSettings({
                      saturationPct: Number(event.target.value),
                    })
                  }
                />
                <span className="settings-save-state">
                  {settings.saturationPct}%
                </span>
              </dd>
            </div>
            <div>
              <dt>
                <label htmlFor="reader-scale">{t('Page scale')}</label>
              </dt>
              <dd>
                <select
                  id="reader-scale"
                  className="settings-select"
                  value={settings.scale}
                  onChange={(event) =>
                    updateReaderSettings({
                      scale: event.target.value as ReaderScale,
                    })
                  }
                >
                  <option value="fit-width">{t('Fit width')}</option>
                  <option value="fit-height">{t('Fit height')}</option>
                  <option value="screen">{t('Fit screen')}</option>
                  <option value="original">{t('Original size')}</option>
                </select>
                <p className="settings-field-hint">
                  {t(
                    'In double-page mode, Fit width fills the reader width with two pages; Fit height fits each page to the available screen height.',
                  )}
                </p>
                <p className="settings-field-hint">
                  {t(
                    'Fit height can make a page wider than the screen; scroll horizontally to see the full page.',
                  )}
                </p>
                <p className="settings-field-hint">
                  {t(
                    'Fit screen fits the page inside the available reader area and viewport height. It is not browser fullscreen.',
                  )}
                </p>
              </dd>
            </div>
            <div>
              <dt>{t('Stretch small pages')}</dt>
              <dd>
                <label className="settings-inline-toggle">
                  <input
                    type="checkbox"
                    checked={settings.stretchSmallPages}
                    onChange={(event) =>
                      updateReaderSettings({
                        stretchSmallPages: event.target.checked,
                      })
                    }
                  />
                  Scale narrow pages to the reading width
                </label>
              </dd>
            </div>
            <div>
              <dt>
                <label htmlFor="reader-direction">{t('Reading direction')}</label>
              </dt>
              <dd>
                <select
                  id="reader-direction"
                  className="settings-select"
                  value={settings.direction}
                  onChange={(event) =>
                    updateReaderSettings({
                      direction: event.target.value as ReaderDirection,
                    })
                  }
                >
                  <option value="ltr">{t('Left to right')}</option>
                  <option value="rtl">{t('Right to left')}</option>
                </select>
              </dd>
            </div>
            <div>
              <dt>{t('Keep screen on')}</dt>
              <dd>
                <label className="settings-inline-toggle">
                  <input
                    type="checkbox"
                    checked={settings.keepScreenOn}
                    onChange={(event) =>
                      updateReaderSettings({
                        keepScreenOn: event.target.checked,
                      })
                    }
                  />
                  {t('Use Wake Lock while reading')}
                </label>
              </dd>
            </div>
            <div>
              <dt>{t('Auto-hide controls')}</dt>
              <dd>
                <label className="settings-inline-toggle">
                  <input
                    type="checkbox"
                    checked={settings.autoHideControls}
                    onChange={(event) =>
                      updateReaderSettings({
                        autoHideControls: event.target.checked,
                      })
                    }
                  />
                  {t('Hide the header and seekbar while reading')}
                </label>
              </dd>
            </div>
            <div>
              <dt>{t('Duplicate chapters')}</dt>
              <dd>
                <label className="settings-inline-toggle">
                  <input
                    type="checkbox"
                    checked={settings.skipDuplicates}
                    onChange={(event) =>
                      updateReaderSettings({
                        skipDuplicates: event.target.checked,
                      })
                    }
                  />
                  {t('Skip duplicate chapter numbers in navigation')}
                </label>
              </dd>
            </div>
            <div>
              <dt>{t('Auto-advance')}</dt>
              <dd>
                <label className="settings-inline-toggle">
                  <input
                    type="checkbox"
                    checked={settings.autoAdvance}
                    onChange={(event) =>
                      updateReaderSettings({
                        autoAdvance: event.target.checked,
                      })
                    }
                  />
                  {t('Open the next chapter after the last page')}
                </label>
              </dd>
            </div>
            <div>
              <dt>{t('Webtoon detection')}</dt>
              <dd>
                <label className="settings-inline-toggle">
                  <input
                    type="checkbox"
                    checked={settings.autoDetectWebtoon}
                    onChange={(event) =>
                      updateReaderSettings({
                        autoDetectWebtoon: event.target.checked,
                      })
                    }
                  />
                  {t('Use webtoon layout for very tall pages')}
                </label>
              </dd>
            </div>
            <div>
              <dt>
                <label htmlFor="reader-auto-scroll-speed">{t('Auto-scroll speed')}</label>
              </dt>
              <dd>
                <input
                  id="reader-auto-scroll-speed"
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={settings.autoScrollSpeed}
                  onChange={(event) =>
                    updateReaderSettings({
                      autoScrollSpeed: Number(event.target.value),
                    })
                  }
                />
                <span className="settings-save-state">
                  {settings.autoScrollSpeed}×
                </span>
              </dd>
            </div>
            <div>
              <dt>
                <label htmlFor="reader-prev-key">{t('Previous page key')}</label>
              </dt>
              <dd>
                <select
                  id="reader-prev-key"
                  className="settings-select"
                  value={settings.pagePrevKey}
                  onChange={(event) =>
                    updateReaderSettings({
                      pagePrevKey: event.target.value as ReaderKey,
                    })
                  }
                >
                  <option value="ArrowLeft">Left arrow</option>
                  <option value="PageUp">Page up</option>
                  <option value="Escape">Escape</option>
                  <option value="Backspace">Backspace</option>
                </select>
              </dd>
            </div>
            <div>
              <dt>
                <label htmlFor="reader-next-key">{t('Next page key')}</label>
              </dt>
              <dd>
                <select
                  id="reader-next-key"
                  className="settings-select"
                  value={settings.pageNextKey}
                  onChange={(event) =>
                    updateReaderSettings({
                      pageNextKey: event.target.value as ReaderKey,
                    })
                  }
                >
                  <option value="ArrowRight">Right arrow</option>
                  <option value="PageDown">Page down</option>
                  <option value="Escape">Escape</option>
                  <option value="Backspace">Backspace</option>
                </select>
              </dd>
            </div>
            <div>
              <dt>
                <label htmlFor="reader-back-key">{t('Back key')}</label>
              </dt>
              <dd>
                <select
                  id="reader-back-key"
                  className="settings-select"
                  value={settings.backKey}
                  onChange={(event) =>
                    updateReaderSettings({
                      backKey: event.target.value as ReaderKey,
                    })
                  }
                >
                  <option value="Escape">Escape</option>
                  <option value="Backspace">Backspace</option>
                  <option value="ArrowLeft">Left arrow</option>
                </select>
              </dd>
            </div>
            <div>
              <dt>{t('Downloaded chapters')}</dt>
              <dd>
                <label className="settings-inline-toggle">
                  <input
                    type="checkbox"
                    checked={settings.deleteAfterReading}
                    onChange={(event) =>
                      updateReaderSettings({
                        deleteAfterReading: event.target.checked,
                      })
                    }
                  />
                  {t('Delete the downloaded chapter after finishing it')}
                </label>
              </dd>
            </div>
            <div>
              <dt>{t('Background')}</dt>
              <dd>
                <label className="settings-inline-toggle">
                  <input
                    type="checkbox"
                    checked={settings.autoBackground}
                    onChange={(event) =>
                      updateReaderSettings({
                        autoBackground: event.target.checked,
                      })
                    }
                  />
                  {t('Match background to the current page')}
                </label>
              </dd>
            </div>
          </dl>
        </section>

        <section className="settings-section" aria-labelledby="reader-preview-heading">
          <div className="section-heading-row">
            <h2 id="reader-preview-heading">{t('Preview')}</h2>
            <button
              className="library-action"
              type="button"
              onClick={resetReaderSettings}
            >
              {t('Reset defaults')}
            </button>
          </div>
          <div
            className="reader-settings-preview"
            style={
              {
                '--preview-bg': settings.background,
                '--preview-width': `${settings.widthRem}%`,
                '--preview-gap': `${settings.gapPx}px`,
                '--preview-filter': READER_FILTER_CSS[settings.filter],
              } as CSSProperties
            }
          >
            <span>Page 1</span>
            <span>Page 2</span>
            <span>Page 3</span>
          </div>
            <p className="settings-hint">
              {t(
                'These preferences affect the vertical Reader immediately and are stored on this device only.',
              )}
            </p>
        </section>
      </div>
    </div>
  );
}

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the Phase 0 bootstrap shell without claiming a server connection', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('Suwayomi Frontend');
    expect(html).toContain('Phase 0 · Step 1');
    expect(html).toContain('Siap untuk langkah berikutnya');
    expect(html).toContain('belum tersambung ke server');
  });
});

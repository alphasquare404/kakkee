// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BackButton } from './BackButton';
import { PageHeader } from './PageHeader';

afterEach(cleanup);

describe('BackButton', () => {
  it('renders a chevron action with an accessible fallback link', () => {
    render(
      <MemoryRouter initialEntries={['/extensions']}>
        <BackButton to="/browse" label="Back to Browse" />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: 'Back to Browse' });
    expect(link.getAttribute('href')).toBe('/browse');
    expect(link.getAttribute('title')).toBe('Back to Browse');
    expect(link.className).toContain('back-button');
    expect(link.textContent).toBe('');
    expect(link.querySelector('svg path')?.getAttribute('d')).toBe('m15 18-6-6 6-6');
  });

  it('uses the default accessible name and supports click interception', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event) => event.preventDefault());

    render(
      <MemoryRouter initialEntries={['/extensions']}>
        <BackButton to="/browse" onClick={onClick} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: 'Back' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('navigates to the explicit fallback when no history interception runs', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/extensions']}>
        <Routes>
          <Route
            path="/extensions"
            element={<BackButton to="/browse" label="Back to Browse" />}
          />
          <Route path="/browse" element={<p>Browse destination</p>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: 'Back to Browse' }));
    expect(await screen.findByText('Browse destination')).toBeTruthy();
  });

  it('keeps the back action and title block as siblings with the subtitle in the title block', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/extensions']}>
        <PageHeader
          leading={<BackButton to="/browse" label="Back to Browse" />}
          title="Extensions"
          subtitle="Sources installed through your server"
        />
      </MemoryRouter>,
    );

    const header = container.querySelector('.page-header.has-leading');
    const leading = header?.querySelector(':scope > .page-header-leading');
    const heading = header?.querySelector(':scope > .page-heading');

    expect(header?.firstElementChild).toBe(leading);
    expect(leading?.querySelector('.back-button')).toBeTruthy();
    expect(heading?.querySelector('h1')?.textContent).toBe('Extensions');
    expect(heading?.querySelector('.page-subtitle')?.textContent).toBe(
      'Sources installed through your server',
    );
    expect(leading?.contains(heading ?? null)).toBe(false);
  });
});

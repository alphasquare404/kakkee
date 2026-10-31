import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { createMangaNoteController } from '../../core/manga/mangaNoteController';
import { createMangaNoteRepository } from '../../core/manga/mangaNoteRepository';

export function MangaNotesSection({
  context,
  mangaId,
}: {
  readonly context: ConnectedContext;
  readonly mangaId: number;
}) {
  const controller = useMemo(
    () =>
      createMangaNoteController(
        createMangaNoteRepository({
          getClient: () => context.graphQL,
        }),
      ),
    [context.graphQL],
  );
  const note = useSyncExternalStore(controller.subscribe, controller.getState);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    void controller.load(mangaId);
  }, [controller, mangaId]);

  useEffect(() => {
    setDraft(note.value);
  }, [note.value]);

  return (
    <section className="manga-notes" aria-labelledby="manga-notes-heading">
      <div className="section-heading-row">
        <h2 id="manga-notes-heading">Notes</h2>
        <span>Private to this server</span>
      </div>

      {note.error ? (
        <p className="settings-inline-error" role="alert">
          The note could not be saved.
        </p>
      ) : null}

      <label className="manga-notes-field">
        <span className="sr-only">Manga note</span>
        <textarea
          rows={3}
          value={draft}
          placeholder="Write a note for this manga…"
          disabled={note.status === 'loading' || note.saving}
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      <div className="manga-notes-actions">
        <button
          className="button"
          type="button"
          disabled={note.saving || draft.trim() === note.value}
          onClick={() => void controller.save(mangaId, draft.trim())}
        >
          {note.saving ? 'Saving…' : 'Save note'}
        </button>
        <button
          className="button button-secondary"
          type="button"
          disabled={note.saving || !note.value}
          onClick={() => void controller.remove(mangaId)}
        >
          Clear
        </button>
      </div>
    </section>
  );
}

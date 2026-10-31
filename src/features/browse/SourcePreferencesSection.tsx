import { useEffect, useMemo, useState } from 'react';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  createSourcePreferenceRepository,
  type SourcePreference,
} from '../../core/source/sourcePreferenceRepository';

export function SourcePreferencesSection({
  context,
  sourceId,
}: {
  readonly context: ConnectedContext;
  readonly sourceId: string;
}) {
  const repository = useMemo(
    () =>
      createSourcePreferenceRepository({
        getClient: () => context.graphQL,
      }),
    [context.graphQL],
  );
  const [preferences, setPreferences] = useState<readonly SourcePreference[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let active = true;

    void repository
      .get(sourceId)
      .then((items) => {
        if (active) {
          setPreferences(items);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (active) {
          setStatus('error');
        }
      });

    return () => {
      active = false;
    };
  }, [repository, sourceId]);

  const update = (
    position: number,
    change: Parameters<typeof repository.update>[2],
  ) => {
    setSaving(true);
    setSaveError(false);
    void repository
      .update(sourceId, position, change)
      .then(() => repository.get(sourceId))
      .then((items) => setPreferences(items))
      .catch(() => setSaveError(true))
      .finally(() => setSaving(false));
  };

  if (status === 'loading' || preferences.length === 0) {
    return null;
  }

  return (
    <section className="source-preferences" aria-labelledby="source-preferences-heading">
      <div className="section-heading-row">
        <h2 id="source-preferences-heading">Source preferences</h2>
        {saving ? <span>Saving…</span> : null}
      </div>
      <div className="source-preference-list">
        {preferences.map((preference, position) => {
          if (!preference.visible || !preference.enabled) {
            return null;
          }

          if (preference.__typename === 'EditTextPreference') {
            return (
              <label className="settings-number" key={`${preference.key}-${position}`}>
                <span>{preference.title}</span>
                <input
                  defaultValue={preference.textValue ?? ''}
                  onBlur={(event) =>
                    update(position, { editTextState: event.target.value })
                  }
                />
              </label>
            );
          }

          if (preference.__typename === 'ListPreference') {
            return (
              <label className="settings-select-field" key={`${preference.key}-${position}`}>
                <span>{preference.title}</span>
                <select
                  value={preference.listValue ?? ''}
                  onChange={(event) =>
                    update(position, { listState: event.target.value })
                  }
                >
                  {preference.entryValues.map((value, index) => (
                    <option key={value} value={value}>
                      {preference.entries[index] ?? value}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          if (
            preference.__typename === 'CheckBoxPreference' ||
            preference.__typename === 'SwitchPreference'
          ) {
            const checked =
              preference.__typename === 'CheckBoxPreference'
                ? preference.checkValue === true
                : preference.switchValue === true;

            return (
              <label className="settings-toggle" key={`${preference.key}-${position}`}>
                <span>{preference.title}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) =>
                    update(
                      position,
                      preference.__typename === 'CheckBoxPreference'
                        ? { checkBoxState: event.target.checked }
                        : { switchState: event.target.checked },
                    )
                  }
                />
              </label>
            );
          }

          return (
            <p className="settings-save-state" key={`${preference.key}-${position}`}>
              {preference.title}: {(preference.multiValue ?? []).join(', ') || 'None'}
            </p>
          );
        })}
      </div>
      {saveError ? (
        <p className="settings-inline-error" role="alert">
          Source preference could not be saved.
        </p>
      ) : null}
    </section>
  );
}

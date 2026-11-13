import { Link } from 'react-router-dom';
import { ActivityPage } from '../activity/ActivityPage';
import { useAppPath } from '../../app/useAppPath';
import { createSectionOrigin } from '../../app/navigationOrigin';
import type { FeedInput } from '../../core/catalog/catalogRepository';
import { formatRelativeTime } from '../../shared/feedTime';
import { useHistoryPreferences } from '../../shared/useHistoryPreferences';
import { useHiddenCategoryIds } from '../../shared/useHiddenCategories';
import { useHiddenHistory } from '../../shared/useHiddenHistory';
import { hideHistoryManga } from '../../core/preferences/hiddenHistory';
import { ActionMenu } from '../../shared/ActionMenu';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  History: 'Riwayat',
  'Continue where you left off': 'Lanjutkan dari tempat Anda berhenti',
  'No reading history yet': 'Belum ada riwayat bacaan',
  'Chapters you read will appear here when your server has reading progress.':
    'Chapter yang Anda baca akan muncul di sini saat server memiliki progres bacaan.',
  'Page {page} of {total}': 'Halaman {page} dari {total}',
  '{count} pages': '{count} halaman',
  '1 page': '1 halaman',
  Read: 'Sudah dibaca',
  'In progress': 'Sedang dibaca',
  Hide: 'Sembunyikan',
  'History actions': 'Aksi riwayat',
});

const HISTORY_FEED: FeedInput = {
  filter: { lastReadAt: { greaterThan: '0' } },
  order: [{ by: 'LAST_READ_AT', byType: 'DESC' }],
};

export function HistoryPage() {
  const preferences = useHistoryPreferences();
  const hiddenCategoryIds = useHiddenCategoryIds();
  const hiddenHistoryIds = useHiddenHistory();
  const { t } = useI18n();
  const { pathname, search } = useAppPath();
  const origin = createSectionOrigin('history', { pathname, search });

  return (
    <ActivityPage
      title={t('History')}
      subtitle={t('Continue where you left off')}
      input={HISTORY_FEED}
      emptyTitle={t('No reading history yet')}
      emptyCopy={t(
        'Chapters you read will appear here when your server has reading progress.',
      )}
      emptyAction={
        <Link className="button button-secondary" to="/browse">
          {t('Browse sources')}
        </Link>
      }
      detail={(chapter) => {
        const when = formatRelativeTime(chapter.lastReadAt);
        const page =
          chapter.lastPageRead > 0
            ? t('Page {page} of {total}', {
                page: chapter.lastPageRead + 1,
                total: chapter.pageCount,
              })
            : chapter.pageCount === 1
          ? t('1 page')
          : t('{count} pages', { count: chapter.pageCount });

        return [when, page].filter(Boolean).join(' · ');
      }}
      stateLabel={(chapter) =>
        chapter.isRead ? t('Read') : t('In progress')
      }
      groupByDay
      dedupeByManga
      origin={origin}
      itemFilter={(chapter) => {
        const hidden =
          hiddenCategoryIds.size > 0 &&
          chapter.manga.categories.nodes.some((category) =>
            hiddenCategoryIds.has(category.id),
          );

        return (
          !hidden &&
          !hiddenHistoryIds.has(chapter.manga.id) &&
          (!preferences.hideRead || !chapter.isRead)
        );
      }}
      rowTo={(chapter) => {
        const page =
          chapter.lastPageRead > 0 ? `?page=${chapter.lastPageRead + 1}` : '';

        return `/manga/${chapter.manga.id}/chapter/${chapter.id}${page}`;
      }}
      rowTrailing={(chapter) => (
        <ActionMenu
          label={<span aria-hidden="true">···</span>}
          ariaLabel={t('History actions')}
          summaryClassName="feed-row-menu"
        >
          <button
            type="button"
            onClick={() => hideHistoryManga(chapter.manga.id)}
          >
            {t('Hide')}
          </button>
        </ActionMenu>
      )}
    />
  );
}

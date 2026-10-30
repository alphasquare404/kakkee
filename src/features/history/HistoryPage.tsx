import { ActivityPage } from '../activity/ActivityPage';
import type { FeedInput } from '../../core/catalog/catalogRepository';
import { formatRelativeTime } from '../../shared/feedTime';

const HISTORY_FEED: FeedInput = {
  filter: { lastReadAt: { greaterThan: '0' } },
  order: [{ by: 'LAST_READ_AT', byType: 'DESC' }],
};

export function HistoryPage() {
  return (
    <ActivityPage
      title="History"
      subtitle="Continue where you left off"
      input={HISTORY_FEED}
      emptyTitle="No reading history yet"
      emptyCopy="Chapters you read will appear here when your server has reading progress."
      detail={(chapter) => {
        const when = formatRelativeTime(chapter.lastReadAt);
        const page =
          chapter.lastPageRead > 0
            ? `Page ${chapter.lastPageRead} of ${chapter.pageCount}`
            : `${chapter.pageCount} pages`;

        return [when, page].filter(Boolean).join(' · ');
      }}
      stateLabel={(chapter) => (chapter.isRead ? 'Read' : 'In progress')}
    />
  );
}

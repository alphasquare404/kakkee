import { ActivityPage } from '../activity/ActivityPage';
import type { FeedInput } from '../../core/catalog/catalogRepository';

const DOWNLOAD_FEED: FeedInput = {
  filter: { isDownloaded: { equalTo: true } },
  order: [{ by: 'UPLOAD_DATE', byType: 'DESC' }],
};

export function DownloadsPage() {
  return (
    <ActivityPage
      title="Downloads"
      subtitle="Chapters stored on your server"
      input={DOWNLOAD_FEED}
      emptyTitle="No downloaded chapters"
      emptyCopy="Chapters downloaded through Suwayomi Server will appear here."
      detail={(chapter) => `${chapter.pageCount} pages · Downloaded`}
      summary={(items) => {
        const pages = items.reduce((total, item) => total + item.pageCount, 0);
        return `${items.length} chapters · ${pages.toLocaleString('en-US')} pages`;
      }}
    />
  );
}

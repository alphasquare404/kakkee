#!/usr/bin/env node
/**
 * Local fixture server for documentation screenshots only.
 * It exposes the small GraphQL surface Kakkee needs for the demo pages.
 */
import { createServer } from 'node:http';

const PORT = Number(process.env.DEMO_PORT || 4567);
const BASE = `http://127.0.0.1:${PORT}`;

const TITLES = [
  'Lanterns of Aster',
  'Paper Moons',
  'Neon Koi',
  'Hollow Orchard',
  'A Song for Winter',
  'Midnight Postal',
  'Glass Harbour',
  'The Quiet Titan',
  'Salt & Starlight',
  'Foxfire Detective',
  'Orbit of Us',
  'The Last Cartographer',
];
const COLORS = ['#5b4b8a', '#315b7a', '#0f6b6b', '#6b4b2e', '#3d5a80', '#4a3b6b', '#2a6f77', '#6a4a3a', '#5a4c8a', '#8a4b3a', '#3b4a6b', '#3a5a4a'];
const SOURCES = [
  { id: 'demo-aster', name: 'Aster Library', displayName: 'Aster Library' },
  { id: 'demo-paper', name: 'Paperverse', displayName: 'Paperverse' },
  { id: 'demo-moon', name: 'Moonstone', displayName: 'Moonstone' },
];
const CATEGORIES = [
  { id: 1, name: 'Favorites', order: 0, mangas: { totalCount: 4 } },
  { id: 2, name: 'Reading', order: 1, mangas: { totalCount: 7 } },
  { id: 3, name: 'Completed', order: 2, mangas: { totalCount: 2 } },
];

function manga(id) {
  const index = (id - 1) % TITLES.length;
  return {
    __typename: 'MangaType',
    id,
    title: TITLES[index],
    author: 'Demo Author',
    artist: 'Demo Artist',
    description: 'A fictional series prepared for the Kakkee interface demo. Follow a small crew as they map quiet places, collect stories, and find their way home.',
    status: 'ONGOING',
    thumbnailUrl: `/api/v1/manga/${id}/thumbnail`,
    thumbnailUrlLastFetched: '2026-11-14T00:00:00Z',
    genre: ['Adventure', 'Slice of Life', 'Mystery'],
    inLibrary: id % 2 === 0,
    unreadCount: 24 + index,
    downloadCount: 8 + (index % 4),
    bookmarkCount: 0,
    trackRecords: { totalCount: 0 },
    source: {
      __typename: 'SourceType',
      id: SOURCES[index % SOURCES.length].id,
      name: SOURCES[index % SOURCES.length].name,
      displayName: SOURCES[index % SOURCES.length].displayName,
      contentWarning: 'SAFE',
    },
    categories: { nodes: [{ id: 1 }, { id: 2 }] },
    lastReadChapter: {
      __typename: 'ChapterType',
      id: 100 + id,
      name: 'Chapter 12: The Quiet Map',
      chapterNumber: 12,
      lastPageRead: 3,
      pageCount: 8,
    },
    firstUnreadChapter: {
      __typename: 'ChapterType',
      id: 100 + id,
      name: 'Chapter 12: The Quiet Map',
      chapterNumber: 12,
      lastPageRead: 3,
      pageCount: 8,
    },
    latestUploadedChapter: {
      __typename: 'ChapterType',
      id: 100 + id,
      name: 'Chapter 12: The Quiet Map',
      chapterNumber: 12,
      pageCount: 8,
      isRead: false,
      isDownloaded: index < 3,
      lastPageRead: 0,
      lastReadAt: new Date(Date.now() - (index + 1) * 7200000).toISOString(),
      uploadDate: new Date(Date.now() - (index + 1) * 7200000).toISOString(),
      scanlator: 'Demo Scans',
      sourceOrder: 12,
    },
  };
}

function chapter(id, mangaId = 1) {
  const number = ((id - 1) % 12) + 1;
  return {
    __typename: 'ChapterType',
    id,
    name: `Chapter ${number}: The Quiet Map`,
    chapterNumber: number,
    pageCount: 8,
    isRead: number < 4,
    isBookmarked: number === 2,
    isDownloaded: true,
    lastPageRead: number === 12 ? 4 : 0,
    lastReadAt: new Date(Date.now() - number * 1800000).toISOString(),
    uploadDate: new Date(Date.now() - number * 3600000).toISOString(),
    scanlator: 'Demo Scans',
    sourceOrder: number,
    manga: manga(mangaId),
  };
}

function category(id) {
  return CATEGORIES.find((item) => item.id === id) ?? CATEGORIES[0];
}

function coverSvg(title, color) {
  const lines = title.length > 16 ? [title.slice(0, title.lastIndexOf(' ', 16) + 1 || 16), title.slice(title.lastIndexOf(' ', 16) + 1 || 16)] : [title];
  const text = lines.map((line, index) => `<text x="300" y="${470 + index * 74}" text-anchor="middle" font-size="58" font-weight="800" fill="#fff" font-family="Arial, sans-serif">${escapeXml(line.trim())}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#111827"/></linearGradient></defs>
  <rect width="600" height="900" fill="url(#g)"/>
  <circle cx="470" cy="170" r="180" fill="#ffffff" opacity=".12"/>
  <path d="M0 690 L600 520 L600 900 L0 900Z" fill="#000" opacity=".22"/>
  <text x="300" y="130" text-anchor="middle" font-size="22" letter-spacing="7" fill="#fff" opacity=".7" font-family="Arial, sans-serif">KAKKEE DEMO</text>
  ${text}
  <text x="300" y="640" text-anchor="middle" font-size="24" fill="#fff" opacity=".72" font-family="Arial, sans-serif">A fictional series</text>
</svg>`;
}

function pageSvg(chapterId, page, mangaTitle) {
  const panels = [
    [80, 120, 500, 420],
    [620, 120, 500, 260],
    [620, 420, 500, 420],
    [80, 580, 500, 260],
    [80, 880, 1040, 420],
    [80, 1340, 500, 330],
    [620, 1340, 500, 330],
  ];
  const rects = panels
    .map(([x, y, w, h], index) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${index % 2 ? '#e8edf4' : '#dbe4ee'}" stroke="#52637a" stroke-width="5"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1800" viewBox="0 0 1200 1800">
  <rect width="1200" height="1800" fill="#f7f9fc"/>
  ${rects}
  <text x="600" y="80" text-anchor="middle" font-size="22" fill="#52637a" font-family="Arial, sans-serif">${escapeXml(mangaTitle)} · Demo page ${page}</text>
  <text x="330" y="280" text-anchor="middle" font-size="52" font-weight="700" fill="#253247" font-family="Arial, sans-serif">A quiet beginning.</text>
  <text x="880" y="560" text-anchor="middle" font-size="30" fill="#3b4b63" font-family="Arial, sans-serif">We follow the map.</text>
  <text x="330" y="1040" text-anchor="middle" font-size="34" fill="#3b4b63" font-family="Arial, sans-serif">Every place has a story.</text>
  <text x="600" y="1700" text-anchor="middle" font-size="20" fill="#7a879a" font-family="Arial, sans-serif">Kakkee documentation fixture · chapter ${chapterId}</text>
</svg>`;
}

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char]);
}

function json(res, data, status = 200) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type, authorization',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify({ data }));
}

function svg(res, body) {
  res.writeHead(200, {
    'content-type': 'image/svg+xml; charset=utf-8',
    'access-control-allow-origin': '*',
    'cache-control': 'public, max-age=60',
  });
  res.end(body);
}

function operationName(body) {
  if (body.operationName) return body.operationName;
  const match = String(body.query || '').match(/\b(?:query|mutation)\s+([A-Za-z0-9_]+)/);
  return match?.[1] ?? '';
}

function nodes(list) {
  return { nodes: list, totalCount: list.length, pageInfo: { endCursor: null, hasNextPage: false } };
}

function fixture(name, variables) {
  const all = Array.from({ length: 12 }, (_, index) => manga(index + 1));
  switch (name) {
    case 'AboutServer':
      return { aboutServer: { name: 'Kakkee Demo Server', version: 'v2.4.2366', buildType: 'Demo', buildTime: '2026-11-14', platformInfo: { arch: 'x86_64', headless: true, os: { name: 'Linux', version: 'demo', build: 'demo' }, jvm: { javaVersion: '21', vmName: 'Demo', vmVersion: '21', vmVendor: 'Demo' } } } };
    case 'AuthProbe':
      return { settings: { authMode: 'NONE' } };
    case 'NavigationBadges':
      return { downloadStatus: { queue: [{ position: 1 }, { position: 2 }] }, extensions: { totalCount: 1 } };
    case 'LibraryCategories':
      return { categories: { nodes: CATEGORIES } };
    case 'MangaCategoryPicker': {
      const mangaId = Number(variables?.mangaId) || 1;
      return {
        manga: {
          id: mangaId,
          categories: { nodes: CATEGORIES.slice(0, 1) },
        },
        categories: { nodes: CATEGORIES },
      };
    }
    case 'CategoryCatalog':
      return { categories: { nodes: CATEGORIES.map((item) => ({ ...item, default: false, isDefaultCategory: false, includeInUpdate: 'INCLUDE', includeInDownload: 'INCLUDE' })) } };
    case 'LibraryMangas':
      return { mangas: { nodes: all, totalCount: all.length, pageInfo: { endCursor: null, hasNextPage: false } } };
    case 'LibraryCategoryMembership':
      return { mangas: { nodes: all.map((item) => ({ categories: item.categories })), pageInfo: { endCursor: null, hasNextPage: false } } };
    case 'RecentlyRead': {
      const recent = all.slice(0, 6).map((item, index) => ({ ...chapter(100 + item.id, item.id), lastReadAt: new Date(Date.now() - (index + 1) * 3600000).toISOString(), isRead: false }));
      return { chapters: { nodes: recent, pageInfo: { endCursor: null, hasNextPage: false } } };
    }
    case 'ReadingFeed':
      return { mangas: { nodes: all, totalCount: all.length, pageInfo: { endCursor: null, hasNextPage: false } } };
    case 'MangaDetail':
      return { manga: manga(Number(variables?.mangaId) || 1), chapters: { nodes: Array.from({ length: 12 }, (_, index) => chapter(101 + index, Number(variables?.mangaId) || 1)), totalCount: 12, pageInfo: { endCursor: null, hasNextPage: false } } };
    case 'ChapterFeed':
      return { chapters: { nodes: [1, 2, 3, 4].map((id) => chapter(100 + id, id)), totalCount: 4, pageInfo: { endCursor: null, hasNextPage: false } } };
    case 'DownloadQueue':
      return { downloadStatus: { state: 'STARTED', queue: [
        { position: 1, progress: 0.42, state: 'DOWNLOADING', tries: 1, chapter: { id: 101, name: 'Chapter 1: The Quiet Map', pageCount: 8 }, manga: manga(1) },
        { position: 2, progress: 0, state: 'QUEUED', tries: 0, chapter: { id: 102, name: 'Chapter 2: Paper Lanterns', pageCount: 8 }, manga: manga(2) },
      ] } };
    case 'ReaderChapter':
      return { chapter: chapter(Number(variables?.chapterId) || 101, 1) };
    case 'ReaderNeighbors':
      return { previous: { nodes: [] }, next: { nodes: [chapter(102, 1)] } };
    case 'ReaderChapterList':
      return { chapters: { nodes: Array.from({ length: 12 }, (_, index) => chapter(101 + index, 1)) } };
    case 'FetchChapterPages': {
      const chapterId = Number(variables?.input?.chapterId) || 101;
      return { fetchChapterPages: { chapter: { id: chapterId, pageCount: 8 }, pages: Array.from({ length: 8 }, (_, index) => `/api/v1/manga/1/chapter/${chapterId}/page/${index + 1}`) } };
    }
    case 'UpdateChapterProgress':
      return { updateChapter: { chapter: { id: 101, isRead: false, isBookmarked: false, lastPageRead: 3 } } };
    case 'SourceCatalog':
      return { sources: { nodes: SOURCES.map((source) => ({ ...source, lang: 'en', isNsfw: false, contentWarning: 'SAFE', supportsLatest: true, iconUrl: `/api/v1/source/${source.id}/icon` })), totalCount: SOURCES.length } };
    case 'SourceInfo':
      return {
        source: {
          id: String(variables?.id || 'demo-aster'),
          displayName: 'Aster Library',
          name: 'Aster Library',
          lang: 'en',
          contentWarning: 'SAFE',
          filters: [],
        },
      };
    case 'SourcePreferences':
      return { source: { id: variables?.sourceId, displayName: 'Aster Library', preferences: [] } };
    case 'GlobalSearch': {
      const query = String(variables?.search || '').toLowerCase();
      const matches = all.filter((item) => item.title.toLowerCase().includes(query));
      return { mangas: { nodes: matches, totalCount: matches.length } };
    }
    case 'FetchSourceManga': {
      const query = String(variables?.input?.query || '').toLowerCase();
      const matches = all.filter((item) => item.title.toLowerCase().includes(query));
      const page = Math.max(1, Number(variables?.input?.page) || 1);
      const pageSize = 8;
      const start = (page - 1) * pageSize;
      const mangas = matches.slice(start, start + pageSize);
      const sourceId = String(variables?.input?.source || variables?.input?.sourceId || 'demo-aster');
      return {
        fetchSourceManga: {
          hasNextPage: start + pageSize < matches.length,
          mangas: mangas.map((item) => ({
            id: item.id,
            title: item.title,
            thumbnailUrl: item.thumbnailUrl,
            inLibrary: item.id % 2 === 0,
            sourceId,
          })),
        },
      };
    }
    default:
      return {};
  }
}

createServer((req, res) => {
  const url = new URL(req.url || '/', BASE);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type, authorization', 'access-control-allow-methods': 'GET, POST, OPTIONS' });
    res.end();
    return;
  }
  if (url.pathname === '/api/graphql' && req.method === 'POST') {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try {
        const body = JSON.parse(raw || '{}');
        json(res, fixture(operationName(body), body.variables));
      } catch {
        json(res, {}, 400);
      }
    });
    return;
  }
  const cover = url.pathname.match(/^\/api\/v1\/manga\/(\d+)\/thumbnail$/);
  if (cover) {
    const item = manga(Number(cover[1]));
    svg(res, coverSvg(item.title, COLORS[(Number(cover[1]) - 1) % COLORS.length]));
    return;
  }
  const page = url.pathname.match(/^\/api\/v1\/manga\/(\d+)\/chapter\/(\d+)\/page\/(\d+)$/);
  if (page) {
    svg(res, pageSvg(Number(page[2]), Number(page[3]), manga(Number(page[1])).title));
    return;
  }
  const sourceIcon = url.pathname.match(/^\/api\/v1\/source\/(.+)\/icon$/);
  if (sourceIcon) {
    svg(res, `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="14" fill="#f3332a"/><text x="32" y="42" text-anchor="middle" font-size="30" fill="#fff" font-family="Arial">D</text></svg>`);
    return;
  }
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('Not found');
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Demo Suwayomi GraphQL server listening on ${BASE}`);
});

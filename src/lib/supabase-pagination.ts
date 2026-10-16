interface PageResult<T> {
  data: T[] | null;
  error: { message?: string } | null;
}

const PAGE_TIMEOUT_MS = 20_000;

export async function withDataTimeout<T>(request: PromiseLike<T>, message = 'The data request timed out. Please refresh and try again.') {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(request),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(message)), PAGE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function fetchPageWithTimeout<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
  from: number,
  to: number,
) {
  return withDataTimeout(fetchPage(from, to));
}

export async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
  pageSize = 1000,
) {
  const rows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await fetchPageWithTimeout(fetchPage, from, from + pageSize - 1);
    if (error) throw error;
    const page = data || [];
    rows.push(...page);
    if (page.length < pageSize) break;
  }

  return rows;
}

export async function fetchAllPagesInParallel<T>(
  totalRows: number,
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
  pageSize = 1000,
  concurrency = 4,
) {
  if (totalRows <= 0) return [];

  const starts = Array.from({ length: Math.ceil(totalRows / pageSize) }, (_, index) => index * pageSize);
  const rows: T[] = [];

  for (let index = 0; index < starts.length; index += concurrency) {
    const batch = starts.slice(index, index + concurrency);
    const pages = await Promise.all(batch.map(async (from) => {
      const { data, error } = await fetchPageWithTimeout(fetchPage, from, from + pageSize - 1);
      if (error) throw error;
      return data || [];
    }));
    pages.forEach(page => rows.push(...page));
  }

  return rows;
}

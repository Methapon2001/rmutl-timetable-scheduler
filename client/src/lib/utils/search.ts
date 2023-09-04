import { invalidate } from '$app/navigation';
import debounce from './debounce';

export const searchHandler = (invalidateData: string) =>
  debounce(async (text: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set('search', text);
    history.replaceState({}, '', url);
    await invalidate(invalidateData);
  }, 300);

export const paginationRequestParams = (url: URL) => {
  const params = new URLSearchParams();

  const page = url.searchParams.get('page');
  const search = url.searchParams.get('search');

  if (search && search.length > 0) {
    params.set('search', search);
  } else {
    params.delete('search');
  }

  params.set('limit', String(20));
  params.set('offset', String((+(page ?? 1) - 1) * 20));

  return params;
};

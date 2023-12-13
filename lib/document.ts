export const createDocument = async (html: string): Promise<Document> => {
  const isNode =
    typeof window === 'undefined' && typeof document === 'undefined';
  if (isNode) {
    const { JSDOM } = await import('jsdom');
    return new JSDOM(html).window.document;
  } else {
    return Promise.resolve(new DOMParser().parseFromString(html, 'text/html'));
  }
};

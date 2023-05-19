export const CONTENT_BASE = new URL('../../../../documentation/', import.meta.url).pathname;

export const CONTENT_BASE_PATHS = {
	BLOG: `${CONTENT_BASE}blog`,
	TUTORIAL: `${CONTENT_BASE}tutorial`,
	DOCS: `${CONTENT_BASE}docs`,
	FAQ: `${CONTENT_BASE}faq`,
	EXAMPLES: `${CONTENT_BASE}examples`
};

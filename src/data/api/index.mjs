import tools from './pages/tools.mjs';
import images from './pages/images.mjs';
import chartImages from './pages/chart-images.mjs';
import { ERRORS, HTTP_ONLY } from './errors.mjs';
export const REFERENCE_PAGES = [tools, images, chartImages];
export const REGISTRY = new Map();
for (const page of REFERENCE_PAGES) for (const section of page.sections) for (const endpoint of section.endpoints) REGISTRY.set(endpoint.id, { endpoint, page, section });
export function errorEntry(item) {
 if (typeof item === 'string') return { code: HTTP_ONLY[item] ? null : item, ...(ERRORS[item] || HTTP_ONLY[item]) };
 if (Array.isArray(item)) return { status: item[0], code: item[1], desc: item[2] || ERRORS[item[1]]?.desc };
 return item;
}

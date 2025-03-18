/**
 * @import { TemplateOperations } from "../types.js"
 */
import { template_to_string } from './to-string.js';

/**
 * @param {TemplateOperations} items
 */
export function transform_template(items) {
	// here we will check if we need to use `$.template` or create a series of `document.createElement` calls
	return template_to_string(items);
}

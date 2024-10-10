/** @type {string[]} */
export const assignment_stack = [];

/**
 * @param {string} location
 */
export function track_assignment(location) {
	assignment_stack.push(location);
}

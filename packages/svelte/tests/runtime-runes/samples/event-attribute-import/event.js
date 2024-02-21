/** @type {any[]} */
export const log = [];

export const log_a = () => {
	log.push('a');
};

export const log_b = () => {
	log.push('b');
};

export const handler = {
	value: log_a
};

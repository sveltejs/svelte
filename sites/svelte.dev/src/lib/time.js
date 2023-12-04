const formatter = new Intl.RelativeTimeFormat(undefined, {
	numeric: 'auto'
});

const DIVISIONS = {
	seconds: 60,
	minutes: 60,
	hours: 24,
	days: 7,
	weeks: 4.34524,
	months: 12,
	years: Number.POSITIVE_INFINITY
};

/**
 * @param {Date} date
 */
export const ago = (date) => {
	let duration = (date.getTime() - new Date().getTime()) / 1000;

	for (const [name, amount] of Object.entries(DIVISIONS)) {
		if (Math.abs(duration) < amount) {
			const format = /** @type {keyof(DIVISIONS)} */ (name);
			return formatter.format(Math.round(duration), format);
		}
		duration /= amount;
	}
};

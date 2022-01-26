import * as eases from 'svelte/easing';

function calculateShape (easeFn) {
    let result = 'M0 1000';
    for (let i = 1; i <= 1000; i++) {
        result = `${result} L${(i / 1000) * 1000} ${1000 - easeFn(i / 1000) * 1000} `;
    }
    return result;
}

function getEasesGroupBy (endings) {
	const result = {};

	for (const ease in eases) {
		const ending = endings.find((ending) => ease.endsWith(ending));
		if (!ending) continue;
	
		const key = ending;
		const name = ease.substring(0, ease.length - ending.length);
		const fn = eases[ease];
		const shape = calculateShape(fn);
	
		result[name] = result[name] || {};
		result[name][key] = { fn, shape };
	}

	return result;
}

export const easesGroupBy = ['In', 'InOut', 'Out'];

export const processedEases = getEasesGroupBy(easesGroupBy);

export const types = [
    ['Ease In', easesGroupBy[0]],
    ['Ease Out', easesGroupBy[1]],
    ['Ease In Out', easesGroupBy[2]],
];

export { processedEases as eases };

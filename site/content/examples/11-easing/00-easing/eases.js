import * as eases from 'svelte/easing'

const processed_eases = {}
let ease
for (ease in eases) {
	if (ease === 'linear') {
		processed_eases.linear = eases.linear
	} else if (ease === 'cubicBezier') {
		continue
	} else {
		const name = ease.replace(/In$|InOut$|Out$/, '')
		;(processed_eases[name] || (processed_eases[name] = {}))[ease.match(/In$|InOut$|Out$/)[0]] = {
			fn: eases[ease],
			shape: generate(eases[ease]),
		}
	}
}
export function generate(easing, from = 0, to = 1000) {
	let shape = `M${from} ${to}`
	for (let i = from + 1; i <= to; i++) shape += ` L${i} ${to - to * easing(i / to)}`
	return shape
}

const sorted_eases = new Map([
	['sine', processed_eases.sine],
	['quad', processed_eases.quad],
	['cubic', processed_eases.cubic],
	['quart', processed_eases.quart],
	['quint', processed_eases.quint],
	['expo', processed_eases.expo],
	['circ', processed_eases.circ],
	['back', processed_eases.back],
	['elastic', processed_eases.elastic],
	['bounce', processed_eases.bounce],
])

export const types = [
	['Ease In', 'In'],
	['Ease Out', 'Out'],
	['Ease In Out', 'InOut'],
]

export { sorted_eases as eases }

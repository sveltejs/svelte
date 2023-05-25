export { identity as linear } from '../internal/Component-cd97939e.mjs';

/*
Adapted from https://github.com/mattdesl
Distributed under MIT License https://github.com/mattdesl/eases/blob/master/LICENSE.md
*/

/**
 * @param {number} t
 * @returns {number}
 */
function backInOut(t) {
	const s = 1.70158 * 1.525;
	if ((t *= 2) < 1) return 0.5 * (t * t * ((s + 1) * t - s));
	return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
}

/**
 * @param {number} t
 * @returns {number}
 */
function backIn(t) {
	const s = 1.70158;
	return t * t * ((s + 1) * t - s);
}

/**
 * @param {number} t
 * @returns {number}
 */
function backOut(t) {
	const s = 1.70158;
	return --t * t * ((s + 1) * t + s) + 1;
}

/**
 * @param {number} t
 * @returns {number}
 */
function bounceOut(t) {
	const a = 4.0 / 11.0;
	const b = 8.0 / 11.0;
	const c = 9.0 / 10.0;
	const ca = 4356.0 / 361.0;
	const cb = 35442.0 / 1805.0;
	const cc = 16061.0 / 1805.0;
	const t2 = t * t;
	return t < a
		? 7.5625 * t2
		: t < b
		? 9.075 * t2 - 9.9 * t + 3.4
		: t < c
		? ca * t2 - cb * t + cc
		: 10.8 * t * t - 20.52 * t + 10.72;
}

/**
 * @param {number} t
 * @returns {number}
 */
function bounceInOut(t) {
	return t < 0.5 ? 0.5 * (1.0 - bounceOut(1.0 - t * 2.0)) : 0.5 * bounceOut(t * 2.0 - 1.0) + 0.5;
}

/**
 * @param {number} t
 * @returns {number}
 */
function bounceIn(t) {
	return 1.0 - bounceOut(1.0 - t);
}

/**
 * @param {number} t
 * @returns {number}
 */
function circInOut(t) {
	if ((t *= 2) < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
	return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
}

/**
 * @param {number} t
 * @returns {number}
 */
function circIn(t) {
	return 1.0 - Math.sqrt(1.0 - t * t);
}

/**
 * @param {number} t
 * @returns {number}
 */
function circOut(t) {
	return Math.sqrt(1 - --t * t);
}

/**
 * @param {number} t
 * @returns {number}
 */
function cubicInOut(t) {
	return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
}

/**
 * @param {number} t
 * @returns {number}
 */
function cubicIn(t) {
	return t * t * t;
}

/**
 * @param {number} t
 * @returns {number}
 */
function cubicOut(t) {
	const f = t - 1.0;
	return f * f * f + 1.0;
}

/**
 * @param {number} t
 * @returns {number}
 */
function elasticInOut(t) {
	return t < 0.5
		? 0.5 * Math.sin(((+13.0 * Math.PI) / 2) * 2.0 * t) * Math.pow(2.0, 10.0 * (2.0 * t - 1.0))
		: 0.5 *
				Math.sin(((-13.0 * Math.PI) / 2) * (2.0 * t - 1.0 + 1.0)) *
				Math.pow(2.0, -10.0 * (2.0 * t - 1.0)) +
				1.0;
}

/**
 * @param {number} t
 * @returns {number}
 */
function elasticIn(t) {
	return Math.sin((13.0 * t * Math.PI) / 2) * Math.pow(2.0, 10.0 * (t - 1.0));
}

/**
 * @param {number} t
 * @returns {number}
 */
function elasticOut(t) {
	return Math.sin((-13.0 * (t + 1.0) * Math.PI) / 2) * Math.pow(2.0, -10.0 * t) + 1.0;
}

/**
 * @param {number} t
 * @returns {number}
 */
function expoInOut(t) {
	return t === 0.0 || t === 1.0
		? t
		: t < 0.5
		? +0.5 * Math.pow(2.0, 20.0 * t - 10.0)
		: -0.5 * Math.pow(2.0, 10.0 - t * 20.0) + 1.0;
}

/**
 * @param {number} t
 * @returns {number}
 */
function expoIn(t) {
	return t === 0.0 ? t : Math.pow(2.0, 10.0 * (t - 1.0));
}

/**
 * @param {number} t
 * @returns {number}
 */
function expoOut(t) {
	return t === 1.0 ? t : 1.0 - Math.pow(2.0, -10.0 * t);
}

/**
 * @param {number} t
 * @returns {number}
 */
function quadInOut(t) {
	t /= 0.5;
	if (t < 1) return 0.5 * t * t;
	t--;
	return -0.5 * (t * (t - 2) - 1);
}

/**
 * @param {number} t
 * @returns {number}
 */
function quadIn(t) {
	return t * t;
}

/**
 * @param {number} t
 * @returns {number}
 */
function quadOut(t) {
	return -t * (t - 2.0);
}

/**
 * @param {number} t
 * @returns {number}
 */
function quartInOut(t) {
	return t < 0.5 ? +8.0 * Math.pow(t, 4.0) : -8.0 * Math.pow(t - 1.0, 4.0) + 1.0;
}

/**
 * @param {number} t
 * @returns {number}
 */
function quartIn(t) {
	return Math.pow(t, 4.0);
}

/**
 * @param {number} t
 * @returns {number}
 */
function quartOut(t) {
	return Math.pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;
}

/**
 * @param {number} t
 * @returns {number}
 */
function quintInOut(t) {
	if ((t *= 2) < 1) return 0.5 * t * t * t * t * t;
	return 0.5 * ((t -= 2) * t * t * t * t + 2);
}

/**
 * @param {number} t
 * @returns {number}
 */
function quintIn(t) {
	return t * t * t * t * t;
}

/**
 * @param {number} t
 * @returns {number}
 */
function quintOut(t) {
	return --t * t * t * t * t + 1;
}

/**
 * @param {number} t
 * @returns {number}
 */
function sineInOut(t) {
	return -0.5 * (Math.cos(Math.PI * t) - 1);
}

/**
 * @param {number} t
 * @returns {number}
 */
function sineIn(t) {
	const v = Math.cos(t * Math.PI * 0.5);
	if (Math.abs(v) < 1e-14) return 1;
	else return 1 - v;
}

/**
 * @param {number} t
 * @returns {number}
 */
function sineOut(t) {
	return Math.sin((t * Math.PI) / 2);
}

export { backIn, backInOut, backOut, bounceIn, bounceInOut, bounceOut, circIn, circInOut, circOut, cubicIn, cubicInOut, cubicOut, elasticIn, elasticInOut, elasticOut, expoIn, expoInOut, expoOut, quadIn, quadInOut, quadOut, quartIn, quartInOut, quartOut, quintIn, quintInOut, quintOut, sineIn, sineInOut, sineOut };

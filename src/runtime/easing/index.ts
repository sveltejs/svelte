import { dev$assert } from 'svelte/internal';

export const linear = (t: number) => t;
export const quadIn = (t: number) => t ** 2;
export const quadOut = (t: number) => 1.0 - (1.0 - t) ** 2;
export const quadInOut = (t: number) => 0.5 * (t >= 0.5 ? 2.0 - 2 * (1.0 - t) ** 2 : (2 * t) ** 2);
export const cubicIn = (t: number) => t ** 3;
export const cubicOut = (t: number) => 1.0 - (1.0 - t) ** 3;
export const cubicInOut = (t: number) => 0.5 * (t >= 0.5 ? 2.0 - (2 * (1.0 - t)) ** 3 : (2 * t) ** 3);
export const quartIn = (t: number) => t ** 4;
export const quartOut = (t: number) => 1.0 - (1.0 - t) ** 4;
export const quartInOut = (t: number) => 0.5 * (t >= 0.5 ? 2.0 - (2 * (1.0 - t)) ** 4 : (2 * t) ** 4);
export const easeIn = quartIn;
export const easeOut = quartOut;
export const easeInOut = quartInOut;
export const quintIn = (t: number) => t ** 5;
export const quintOut = (t: number) => 1.0 - (1.0 - t) ** 5;
export const quintInOut = (t: number) => 0.5 * (t >= 0.5 ? 2.0 - (2 * (1.0 - t)) ** 5 : (2 * t) ** 5);
export const backIn = (t: number) => t * t * (2.6 * t - 1.6);
export const backOut = (t: number) => 1.0 - (t = 1.0 - t) * t * (2.6 * t - 1.6);
export const backInOut = (t: number) =>
	0.5 * (t >= 0.5 ? 2 - (t = 2 * (1.0 - t)) * t * (2.6 * t - 1.6) : (t = 2 * t) * t * (2.6 * t - 1.6));
export const expoIn = (t: number) => (t ? Math.pow(2.0, 10.0 * (t - 1.0)) : t);
export const expoOut = (t: number) => (t ? 1.0 - Math.pow(2.0, -10.0 * t) : t);
export const expoInOut = (t: number) =>
	!t || t === 1.0 ? t : t < 0.5 ? 0.5 * Math.pow(2.0, 20.0 * t - 10.0) : -0.5 * Math.pow(2.0, 10.0 - t * 20.0) + 1.0;
export const elasticIn = (t: number) => Math.sin((13.0 * t * Math.PI) / 2.0) * Math.pow(2.0, 10.0 * (t - 1.0));
export const elasticOut = (t: number) => Math.sin((-13.0 * (t + 1.0) * Math.PI) / 2.0) * Math.pow(2.0, -10.0 * t) + 1.0;
export const elasticInOut = (t: number) =>
	t < 0.5
		? 0.5 * Math.sin(((+13.0 * Math.PI) / 2) * 2.0 * t) * Math.pow(2.0, 10.0 * (2.0 * t - 1.0))
		: 0.5 * Math.sin(((-13.0 * Math.PI) / 2) * (2.0 * t - 1.0 + 1.0)) * Math.pow(2.0, -10.0 * (2.0 * t - 1.0)) + 1.0;
export const bounceOut = (t: number) =>
	4 / 11 > t
		? 7.5625 * t * t
		: 8 / 11 > t
		? 3.4 + 9.075 * t * t - 9.9 * t
		: 9 / 10 > t
		? 16061.0 / 1805.0 + (4356.0 * t * t) / 361.0 - (35442.0 * t) / 1805.0
		: 10.72 + 10.8 * t * t - 20.52 * t;
export const bounceIn = (t: number) => 1.0 - bounceOut(1.0 - t);
export const bounceInOut = (t: number) =>
	t < 0.5 ? 0.5 * (1.0 - bounceOut(1.0 - t * 2.0)) : 0.5 * bounceOut(t * 2.0 - 1.0) + 0.5;
export const sineIn = (t: number) => (1e-14 > Math.abs((t = Math.cos(t * Math.PI * 0.5))) ? 1.0 : 1.0 - t);
export const sineOut = (t: number) => Math.sin((t * Math.PI) / 2);
export const sineInOut = (t: number) => -0.5 * (Math.cos(Math.PI * t) - 1.0);
export const circIn = (t: number) => 1.0 - Math.sin(Math.acos(t));
export const circOut = (t: number) => Math.sin(Math.acos(1.0 - t));
export const circInOut = (t: number) =>
	0.5 * (t >= 0.5 ? 2.0 - Math.sin(Math.acos(1.0 - 2.0 * (1.0 - t))) : Math.sin(Math.acos(1.0 - 2.0 * t)));
export const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
	dev$assert(
		x1 >= 0 && x1 <= 1 && x2 >= 0 && x2 <= 1,
		`CubicBezier x1 & x2 values must be { 0 < x < 1 }, got { x1 : ${x1}, x2: ${x2} }`
	);
	const ax = 1.0 - (x2 = 3.0 * (x2 - x1) - (x1 = 3.0 * x1)) - x1,
		ay = 1.0 - (y2 = 3.0 * (y2 - y1) - (y1 = 3.0 * y1)) - y1;
	let r = 0.0,
		s = 0.0,
		d = 0.0,
		x = 0.0;
	return (t: number) => {
		r = t;
		for (let i = 0; 32 > i; i++)
			if (1e-5 > Math.abs((x = r * r * (r * ax + x1 + x2) - t))) return r * (r * (r * ay + y2) + y1);
			else if (1e-5 > Math.abs((d = r * (r * ax * 3.0 + x2 * 2.0) + x1))) break;
			else r = r - x / d;
		if ((s = 0.0) > (r = t)) return 0;
		else if ((d = 1.0) > r) return 1;
		while (d > s)
			if (1e-5 > Math.abs((x = r * (r * (r * ax + x2) + x1)) - t)) break;
			else t > x ? (s = r) : (d = r), (r = 0.5 * (d - s) + s);
		return r * (r * (r * ay + y2) + y1);
	};
};

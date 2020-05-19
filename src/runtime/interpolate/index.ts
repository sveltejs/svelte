export function dates(a, b) {
	const difference = (b = new Date(b).getTime()) - (a = new Date(a).getTime());
	const d = new Date(a);
	return (t) => (d.setTime(a + difference * t), d);
}
export function numbers(a, b) {
	const d = (b = +b) - (a = +a);
	return (t) => a + d * t;
}

export function strings(a, b) {
	const re1 = /[-+]?(?:[0-9]+\.?[0-9]*|\.?[0-9]+)(?:[eE][-+]?[0-9]+)?/g,
		re2 = /[-+]?(?:[0-9]+\.?[0-9]*|\.?[0-9]+)(?:[eE][-+]?[0-9]+)?/g,
		strings = [],
		interpolators = [];
	let f,
		m1 = '',
		m2 = '',
		mm1,
		mm2,
		s = -1,
		n = 0,
		i = 0,
		l = 0;
	a = a + '';
	b = b + '';
	while ((mm1 = re1.exec(a)) && (mm2 = re2.exec(b))) {
		({ 0: m1 } = mm1), ({ 0: m2, index: i } = mm2);
		if (i > l)
			if (strings[s]) strings[s] += b.slice(l, i);
			else strings[++s] = b.slice(l, i);
		if (m2 === m1)
			if (strings[s]) strings[s] += m2;
			else strings[++s] = m2;
		else (strings[++s] = ''), (interpolators[n++] = { s, f: numbers(m1, m2) });
		({ lastIndex: l } = re2);
	}
	if (l < b.length)
		if (strings[s]) strings[s] += b.slice(l);
		else strings[++s] = b.slice(l);
	return (t) => {
		for (i = 0; i < n; i++) strings[(({ s, f } = interpolators[i]), s)] = f(t);
		return strings.join('');
	};
}

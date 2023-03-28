// adapted from https://github.com/digplan/time-ago
// https://github.com/digplan/time-ago/blob/master/license.txt
const o = {
	second: 1000,
	minute: 60 * 1000,
	hour: 60 * 1000 * 60,
	day: 24 * 60 * 1000 * 60,
	week: 7 * 24 * 60 * 1000 * 60,
	month: 30 * 24 * 60 * 1000 * 60,
	year: 365 * 24 * 60 * 1000 * 60
};

export const ago = (nd, s) => {
	var r = Math.round,
		dir = ' ago',
		pl = function (v, n) {
			return s === undefined ? n + ' ' + v + (n > 1 ? 's' : '') + dir : n + v.substring(0, 1);
		},
		ts = Date.now() - new Date(nd).getTime(),
		ii;
	if (ts < 0) {
		ts *= -1;
		dir = ' from now';
	}
	for (var i in o) {
		if (r(ts) < o[i]) return pl(ii || 'm', r(ts / (o[ii] || 1)));
		ii = i;
	}
	return pl(i, r(ts / o[i]));
};

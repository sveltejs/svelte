export function omit(obj, ...keysToOmit) {
	return Object.keys(obj).reduce((acc, key) => {
		if (keysToOmit.indexOf(key) === -1) acc[key] = obj[key];
		return acc;
	}, {});
}

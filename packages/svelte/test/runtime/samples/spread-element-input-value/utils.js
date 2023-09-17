export function omit(obj, ...keys_to_omit) {
	return Object.keys(obj).reduce((acc, key) => {
		if (keys_to_omit.indexOf(key) === -1) acc[key] = obj[key];
		return acc;
	}, {});
}

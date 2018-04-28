export function spread(args) {
	const attributes = Object.assign({}, ...args);
	let str = '';

	Object.keys(attributes).forEach(name => {
		const value = attributes[name];
		if (value === undefined) return;
		if (value === true) str += " " + name;
		str += " " + name + "=" + JSON.stringify(value);
	});

	return str;
}
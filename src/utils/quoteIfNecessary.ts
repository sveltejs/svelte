import isValidIdentifier from './isValidIdentifier';
import reservedNames from './reservedNames';

export function quoteNameIfNecessary(name) {
	if (!isValidIdentifier(name)) return `"${name}"`;
	return name;
}

export function quotePropIfNecessary(name) {
	if (!isValidIdentifier(name)) return `["${name}"]`;
	return `.${name}`;
}
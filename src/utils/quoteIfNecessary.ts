import isValidIdentifier from './isValidIdentifier';
import reservedNames from './reservedNames';

export default function quoteIfNecessary(name) {
	if (!isValidIdentifier(name)) return `"${name}"`;
	return name;
}
import isValidIdentifier from './isValidIdentifier';
import reservedNames from './reservedNames';

export default function quoteIfNecessary(name, legacy) {
	if (!isValidIdentifier(name) || (legacy && reservedNames.has(name))) return `"${name}"`;
	return name;
}
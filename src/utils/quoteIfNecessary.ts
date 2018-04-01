import isValidIdentifier from './isValidIdentifier';
import reservedNames from './reservedNames';

export default function quoteIfNecessary(name: string, legacy?: boolean) {
	if (!isValidIdentifier(name) || (legacy && reservedNames.has(name))) return `"${name}"`;
	return name;
}
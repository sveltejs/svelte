const voidElementNames = /^(?:area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;

export default function isVoidElementName(name: string) {
	return voidElementNames.test(name) || name.toLowerCase() === '!doctype';
}

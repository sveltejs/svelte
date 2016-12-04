export default function _yield ( parser ) {
	const start = parser.index;

	parser.current().children.push({
		start,
		end: parser.index,
		type: 'YieldTag'
	});

	return null;
}

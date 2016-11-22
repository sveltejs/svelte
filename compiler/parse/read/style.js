export default function readStyle ( parser, start, attributes ) {
	const contentStart = parser.index;
	const styles = parser.readUntil( /<\/style>/ );
	const contentEnd = parser.index;

	parser.eat( '</style>', true );
	const end = parser.index;

	return {
		start,
		end,
		attributes,
		content: {
			start: contentStart,
			end: contentEnd,
			styles
		}
	};
}

export default function visitYieldTag ( generator ) {
	generator.append( `\${options && options.yield ? options.yield() : ''}` );
}
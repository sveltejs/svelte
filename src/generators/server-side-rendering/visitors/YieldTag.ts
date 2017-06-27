import { SsrGenerator } from '../index';

export default function visitYieldTag(generator: SsrGenerator) {
	generator.append(`\${options && options.yield ? options.yield() : ''}`);
}

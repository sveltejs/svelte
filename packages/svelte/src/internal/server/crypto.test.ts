import { assert, test } from 'vitest';
import { sha256 } from './crypto.js';

const inputs = [
	['hello world', 'uU0nuZNNPgilLlLX2n2r+sSE7+N6U4DukIj3rOLvzek='],
	['', '47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='],
	['abcd', 'iNQmb9TmM40TuEX88olXnSCciXgjuSF9o+Fhk28DFYk='],
	['the quick brown fox jumps over the lazy dog', 'Bcbgjx2f2voDFH/Lj4LxJMdtL3Dj2Ynciq2159dFC+w='],
	['工欲善其事，必先利其器', 'oPOthkQ1c5BbPpvrr5WlUBJPyD5e6JeVdWcqBs9zvjA=']
];

test.each(inputs)('sha256("%s")', async (input, expected) => {
	const actual = await sha256(input);
	assert.equal(actual, expected);
});

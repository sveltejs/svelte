import * as assert from 'assert';
import get_name_from_filename from './get_name_from_filename';

describe('get_name_from_filename', () => {
	it('uses the basename', () => {
		assert.equal(get_name_from_filename('path/to/Widget.svelte'), 'Widget');
	});

	it('uses the directory name, if basename is index', () => {
		assert.equal(get_name_from_filename('path/to/Widget/index.svelte'), 'Widget');
	});

	it('handles Windows filenames', () => {
		assert.equal(get_name_from_filename('path\\to\\Widget.svelte'), 'Widget');
	});

	it('handles special characters in filenames', () => {
		assert.equal(get_name_from_filename('@.svelte'), '_');
		assert.equal(get_name_from_filename('&.svelte'), '_');
		assert.equal(get_name_from_filename('~.svelte'), '_');
	});
});

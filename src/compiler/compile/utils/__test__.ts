import * as assert from 'assert';
import get_name_from_filename from './get_name_from_filename';
import {
	is_contenteditable,
	is_input_or_textarea,
	is_attr_contenteditable,
	has_contenteditable_attr,
	is_name_contenteditable,
	get_contenteditable_attr,
	CONTENTEDITABLE_ATTR,
	CONTENTEDITABLE_BINDINGS,
} from './contenteditable';
import Element from '../nodes/Element';
import Attribute from '../nodes/Attribute';

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
});

describe('contenteditable', () => {
	describe('is_contenteditable', () => {
		it('returns false if node is input', () => {
			const node = { name: 'input' } as Element;
			assert.equal(is_contenteditable(node), false);
		});
		it('returns false if node is textarea', () => {
			const node = { name: 'textarea' } as Element;
			assert.equal(is_contenteditable(node), false);
		});
		it('returns false if node is not input or textarea AND it is not contenteditable', () => {
			const attr = { name: 'href' } as Attribute;
			const node = { name: 'a', attributes: [attr] } as Element;
			assert.equal(is_contenteditable(node), false);
		});
		it('returns true if node is not input or textarea AND it is contenteditable', () => {
			const attr = { name: CONTENTEDITABLE_ATTR } as Attribute;
			const node = { name: 'a', attributes: [attr] } as Element;
			assert.equal(is_contenteditable(node), true);
		});
	});

	describe('is_input_or_textarea', () => {
		it('returns true if node is input', () => {
			const node = { name: 'input' } as Element;
			assert.equal(is_input_or_textarea(node), true);
		});
		it('returns true if node is textarea', () => {
			const node = { name: 'textarea' } as Element;
			assert.equal(is_input_or_textarea(node), true);
		});
		it('returns false if node is not input or textarea', () => {
			const node = { name: 'div' } as Element;
			assert.equal(is_input_or_textarea(node), false);
		});
	});

	describe('is_attr_contenteditable', () => {
		it('returns true if attribute is contenteditable', () => {
			const attr = { name: CONTENTEDITABLE_ATTR } as Attribute;
			assert.equal(is_attr_contenteditable(attr), true);
		});
		it('returns false if attribute is not contenteditable', () => {
			const attr = { name: 'href' } as Attribute;
			const actual = is_attr_contenteditable(attr);
			assert.equal(actual, false);
		});
	});

	describe('has_contenteditable_attr', () => {
		it('returns true if attribute is contenteditable', () => {
			const attr = { name: CONTENTEDITABLE_ATTR } as Attribute;
			const node = { attributes: [attr] } as Element;
			assert.equal(has_contenteditable_attr(node), true);
		});
		it('returns false if attribute is not contenteditable', () => {
			const attr = { name: 'href' } as Attribute;
			const node = { attributes: [attr] } as Element;
			assert.equal(has_contenteditable_attr(node), false);
		});
	});

	describe('is_name_contenteditable', () => {
		it('returns true if name is a contenteditable type', () => {
			assert.equal(is_name_contenteditable(CONTENTEDITABLE_BINDINGS[0]), true);
		});
		it('returns false if name is not contenteditable type', () => {
			assert.equal(is_name_contenteditable('value'), false);
		});
	});

	describe('get_contenteditable_attr', () => {
		it('returns the contenteditable Attribute if it exists', () => {
			const attr = { name: CONTENTEDITABLE_ATTR } as Attribute;
			const node = { name: 'div', attributes: [attr] } as Element;
			assert.equal(get_contenteditable_attr(node), attr);
		});
		it('returns undefined if contenteditable attribute cannot be found', () => {
			const node = { name: 'div', attributes: [] } as Element;
			assert.equal(get_contenteditable_attr(node), undefined);
		});
	});

});

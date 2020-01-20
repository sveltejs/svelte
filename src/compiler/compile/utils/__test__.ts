import * as assert from 'assert';
import get_name_from_filename from './get_name_from_filename';
import {
	isContenteditable,
	isInputOrTextarea,
	isAttrContentEditable,
	hasContentEditableAttr,
	isBindingContenteditable,
	getContenteditableAttr,
	CONTENTEDITABLE_ATTR,
	CONTENTEDITABLE_BINDINGS,
} from './contenteditable';
import Element from '../nodes/Element';
import Attribute from '../nodes/Attribute';
import Binding from '../nodes/Binding';

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
	describe('isContenteditable', () => {
		it('returns false if node is input', () => {
			const node = { name: 'input' } as Element;
			assert.equal(isContenteditable(node), false);
		});
		it('returns false if node is textarea', () => {
			const node = { name: 'textarea' } as Element;
			assert.equal(isContenteditable(node), false);
		});
		it('returns false if node is not input or textarea AND it is not contenteditable', () => {
			const attr = { name: 'href' } as Attribute;
			const node = { name: 'a', attributes: [attr] } as Element;
			assert.equal(isContenteditable(node), false);
		});
		it('returns true if node is not input or textarea AND it is contenteditable', () => {
			const attr = { name: CONTENTEDITABLE_ATTR } as Attribute;
			const node = { name: 'a', attributes: [attr] } as Element;
			assert.equal(isContenteditable(node), true);
		});
	});

	describe('isInputOrTextarea', () => {
		it('returns true if node is input', () => {
			const node = { name: 'input' } as Element;
			assert.equal(isInputOrTextarea(node), true);
		});
		it('returns true if node is textarea', () => {
			const node = { name: 'textarea' } as Element;
			assert.equal(isInputOrTextarea(node), true);
		});
		it('returns false if node is not input or textarea', () => {
			const node = { name: 'div' } as Element;
			assert.equal(isInputOrTextarea(node), false);
		});
	});

	describe('isAttrContentEditable', () => {
		it('returns true if attribute is contenteditable', () => {
			const attr = { name: CONTENTEDITABLE_ATTR } as Attribute;
			assert.equal(isAttrContentEditable(attr), true);
		});
		it('returns false if attribute is not contenteditable', () => {
			const attr = { name: 'href' } as Attribute;
			const actual = isAttrContentEditable(attr);
			assert.equal(actual, false);
		});
	});

	describe('hasContentEditableAttr', () => {
		it('returns true if attribute is contenteditable', () => {
			const attr = { name: CONTENTEDITABLE_ATTR } as Attribute;
			const node = { attributes: [attr] } as Element;
			assert.equal(hasContentEditableAttr(node), true);
		});
		it('returns false if attribute is not contenteditable', () => {
			const attr = { name: 'href' } as Attribute;
			const node = { attributes: [attr] } as Element;
			assert.equal(hasContentEditableAttr(node), false);
		});
	});

	describe('isBindingContenteditable', () => {
		it('returns true if binding is a contenteditable type', () => {
			const binding = { name: CONTENTEDITABLE_BINDINGS[0] } as Binding;
			assert.equal(isBindingContenteditable(binding), true);
		});
		it('returns false if attribute is not contenteditable type', () => {
			const binding = { name: 'value' } as Binding;
			assert.equal(isBindingContenteditable(binding), false);
		});
	});
	
	describe('getContenteditableAttr', () => {
		it('returns the contenteditable Attribute if it exists', () => {
			const attr = { name: CONTENTEDITABLE_ATTR } as Attribute;
			const node = { name: 'div', attributes: [attr] } as Element;
			assert.equal(getContenteditableAttr(node), attr);
		});
		it('returns undefined if contenteditable attribute cannot be found', () => {
			const node = { name: 'div', attributes: [] } as Element;
			assert.equal(getContenteditableAttr(node), undefined);
		});
	});

});

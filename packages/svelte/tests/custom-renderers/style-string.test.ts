import { afterEach, assert, beforeEach, describe, it } from 'vitest';
import {
	style_set_property,
	style_remove_property
} from '../../src/internal/client/dom/operations.js';
import { set_renderer } from '../../src/internal/client/custom-renderer/state.js';

function make_element(style = '') {
	return { attributes: { style } as Record<string, string> };
}

const fake_renderer = {
	getAttribute(element: any, name: string) {
		return element.attributes[name] ?? null;
	},
	setAttribute(element: any, name: string, value: string) {
		element.attributes[name] = String(value);
	}
} as any;

function style_of(element: any) {
	return element.attributes.style;
}

describe('custom renderer style string manipulation', () => {
	beforeEach(() => {
		set_renderer(fake_renderer);
	});

	afterEach(() => {
		set_renderer(null);
	});

	it('sets a property on an empty style', () => {
		const el = make_element();
		style_set_property(el as any, 'color', 'red');
		assert.equal(style_of(el), 'color: red');
	});

	it('updates an existing property, preserving unrelated ones', () => {
		const el = make_element('color: red; background: blue');
		style_set_property(el as any, 'color', 'green');
		assert.equal(style_of(el), 'color: green; background: blue');
	});

	it('appends a new property, preserving unrelated ones', () => {
		const el = make_element('color: red');
		style_set_property(el as any, 'background', 'blue');
		assert.equal(style_of(el), 'color: red; background: blue');
	});

	it('supports the important priority', () => {
		const el = make_element('color: red');
		style_set_property(el as any, 'color', 'green', 'important');
		assert.equal(style_of(el), 'color: green !important');
	});

	it('removes a property, preserving unrelated ones', () => {
		const el = make_element('color: red; background: blue');
		style_remove_property(el as any, 'color');
		assert.equal(style_of(el), 'background: blue');
	});

	it('removing a non-existent property is a no-op', () => {
		const el = make_element('color: red');
		style_remove_property(el as any, 'background');
		assert.equal(style_of(el), 'color: red');
	});

	it('removing the only property yields an empty style', () => {
		const el = make_element('color: red');
		style_remove_property(el as any, 'color');
		assert.equal(style_of(el), '');
	});

	describe('preserves quoted semicolons', () => {
		it('when updating an unrelated property', () => {
			const el = make_element('content: "a;b"; color: red');
			style_set_property(el as any, 'color', 'green');
			assert.equal(style_of(el), 'content: "a;b"; color: green');
		});

		it('when removing an unrelated property', () => {
			const el = make_element('content: "a;b"; color: red');
			style_remove_property(el as any, 'color');
			assert.equal(style_of(el), 'content: "a;b"');
		});

		it('with single-quoted values', () => {
			const el = make_element("content: 'x;y;z'; color: red");
			style_set_property(el as any, 'color', 'green');
			assert.equal(style_of(el), "content: 'x;y;z'; color: green");
		});
	});

	describe('preserves data URLs', () => {
		it('with semicolons inside url(...)', () => {
			const el = make_element('background: url(data:image/png;base64,AAAA); color: red');
			style_set_property(el as any, 'color', 'green');
			assert.equal(style_of(el), 'background: url(data:image/png;base64,AAAA); color: green');
		});

		it('when removing the data URL property', () => {
			const el = make_element('background: url(data:image/png;base64,AAAA); color: red');
			style_remove_property(el as any, 'background');
			assert.equal(style_of(el), 'color: red');
		});
	});

	describe('preserves escaped quotes', () => {
		it('escaped quote inside a quoted value does not close the string', () => {
			const el = make_element('content: "a\\";b"; color: red');
			style_set_property(el as any, 'color', 'green');
			assert.equal(style_of(el), 'content: "a\\";b"; color: green');
		});

		it('escaped backslash before a quote', () => {
			const el = make_element('content: "a\\\\"; color: red');
			style_remove_property(el as any, 'color');
			assert.equal(style_of(el), 'content: "a\\\\"');
		});
	});

	it('ignores semicolons inside comments', () => {
		const el = make_element('color: red /* a;b */; background: blue');
		style_set_property(el as any, 'background', 'green');
		assert.equal(style_of(el), 'color: red /* a;b */; background: green');
	});

	it('preserves escaped semicolons outside strings', () => {
		const el = make_element('--text: a\\;b; color: red');
		style_remove_property(el as any, 'color');
		assert.equal(style_of(el), '--text: a\\;b');
	});
});

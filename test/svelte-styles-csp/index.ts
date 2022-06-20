import * as assert from 'assert';
import {StyleSheetTestObj, get_svelte_style_sheet_index} from '../../src/runtime/internal/style_manager';

describe('svelte-styles-csp', () => {
  describe('test get_svelte_style_sheet_index',  () => {
	it('return correct value of styleSheetIndex for svelte-stylesheet for stylesheet collection', () => {
		const styleSheetIndex: number = 2;
		const myStyleSheetTestObjList = new Array<StyleSheetTestObj>();
		myStyleSheetTestObjList[0] = new StyleSheetTestObj('my-stylesheet');
		myStyleSheetTestObjList[1] = new StyleSheetTestObj('my-stylesheet2');
		myStyleSheetTestObjList[styleSheetIndex] = new StyleSheetTestObj('svelte-stylesheet');
		myStyleSheetTestObjList[3] = new StyleSheetTestObj('my-stylesheet3');
		const result = get_svelte_style_sheet_index(myStyleSheetTestObjList);

		assert.equal(result, styleSheetIndex);
	});
	it('returns undefined if no svelte-stylesheet is found', () => {
		const myStyleSheetTestObjList = new Array<StyleSheetTestObj>();
		myStyleSheetTestObjList[0] = new StyleSheetTestObj('my-stylesheet');
		myStyleSheetTestObjList[1] = new StyleSheetTestObj('my-stylesheet2');
		myStyleSheetTestObjList[2] = new StyleSheetTestObj('my-stylesheet3');
		const result = get_svelte_style_sheet_index(myStyleSheetTestObjList);

		assert.equal(result, undefined);
	});
	it('returns undefined if svelte-stylesheet has css rules', () => {
		const myStyleSheetTestObjList = new Array<StyleSheetTestObj>();
		myStyleSheetTestObjList[0] = new StyleSheetTestObj('svelte-stylesheet', 'text/css', ['body { width:100%; }']);
		const result = get_svelte_style_sheet_index(myStyleSheetTestObjList);

		assert.equal(result, undefined);
	});
	it('returns undefined if svelte-stylesheet is not of type text/css', () => {
		const myStyleSheetTestObjList = new Array<StyleSheetTestObj>();
		myStyleSheetTestObjList[0] = new StyleSheetTestObj('svelte-stylesheet', 'text/html');
		const result = get_svelte_style_sheet_index(myStyleSheetTestObjList);

		assert.equal(result, undefined);
	});
});
});

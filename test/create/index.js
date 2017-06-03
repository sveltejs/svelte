import assert from "assert";
import { svelte, deindent } from "../helpers.js";

describe("create", () => {
	it("should return a component constructor", () => {
		const source = deindent`
			<div>{{prop}}</div>
		`;

		const component = svelte.create(source);
		assert(component instanceof Function);
	});

	it("should throw error when source is invalid ", done => {
		const source = deindent`
			<div>{{prop}</div>
		`;

		const component = svelte.create(source, {
			onerror: () => {
				done();
			}
		});

		assert.equal(component, undefined);
	});

	it("should return undefined when source is invalid ", () => {
		const source = deindent`
			<div>{{prop}</div>
		`;

		const component = svelte.create(source, {
			onerror: () => {}
		});

		assert.equal(component, undefined);
	});
});

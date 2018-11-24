import assert from "assert";
import { svelte, deindent } from "../helpers.js";

describe("create", () => {
	it("should return a component constructor", () => {
		const component = svelte.create(`<div>{prop}</div>`);
		assert(component instanceof Function);
	});

	it("should throw error when source is invalid ", done => {
		assert.throws(() => {
			svelte.create(`<div>{prop</div>`);
		}, /TODO/);
	});
});

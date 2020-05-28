import { update_expected } from "../update";

export function sanitize_ast(compiled) {
	return compiled.ast;
}

export function sanitize_error(e) {
	return {
		code: e.code,
		message: e.message,
		start: e.start,
		pos: e.pos
	};
}

// this file will replace all the expected.js files with their _actual
// equivalents. Only use it when you're sure that you haven't
// broken anything!

update_expected((compile, check) => {
	try {
		check("output.json", sanitize_ast(compile({ generate: false })));
	} catch (e) {
		if (e.name !== "ParseError") throw e;
		check("error.json", sanitize_error(e));
	}
}, __dirname);

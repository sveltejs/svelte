import { update_expected } from "../update";

// this file will replace all the expected.js files with their _actual
// equivalents. Only use it when you're sure that you haven't
// broken anything!

update_expected((compile, check) => {
	try {
		check("output.json", compile({ generate: false }).ast);
	} catch (e) {
		if (e.name !== "ParseError") throw e;
		check("error.json", {
			code: e.code,
			message: e.message,
			start: e.start,
			pos: e.pos,
		});
	}
}, __dirname);

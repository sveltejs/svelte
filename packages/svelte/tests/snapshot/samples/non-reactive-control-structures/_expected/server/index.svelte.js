import * as $ from "svelte/internal/server";

export default function Non_reactive_control_structures($$payload) {
	const a = true;
	let b = true;

	if (a) {
		$$payload.out += "<!--[-->";
		$$payload.out += `hello`;
	} else {
		$$payload.out += "<!--[!-->";
	}

	$$payload.out += `<!--]--> `;

	if (b) {
		$$payload.out += "<!--[-->";
		$$payload.out += `world`;
	} else {
		$$payload.out += "<!--[!-->";
	}

	$$payload.out += `<!--]--> `;

	if (a) {
		$$payload.out += "<!--[-->";
		$$payload.out += `hi`;
	} else {
		$$payload.out += "<!--[!-->";
		$$payload.out += `earth`;
	}

	$$payload.out += `<!--]-->`;
}

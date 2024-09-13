import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import __IMPORTED_ASSET_0__ from "./foo.svg";
import { counter } from "./some.js";

const __DECLARED_ASSET_0__ = "__VITE_ASSET__2AM7_y_a__ 1440w, __VITE_ASSET__2AM7_y_b__ 960w";
const __DECLARED_ASSET_1__ = "__VITE_ASSET__2AM7_y_c__ 1440w, __VITE_ASSET__2AM7_y_d__ 960w";
const __DECLARED_ASSET_2__ = "__VITE_ASSET__2AM7_y_e__ 1440w, __VITE_ASSET__2AM7_y_f__ 960w";
const __DECLARED_ASSET_3__ = "__VITE_ASSET__2AM7_y_g__";
var root = $.template(`<div></div> <img src="${$.escape(__IMPORTED_ASSET_0__)}" alt="default imports are not live bindings so can be inlined"> <picture><source srcset="${__DECLARED_ASSET_0__}" type="image/avif"> <source srcset="${__DECLARED_ASSET_1__}" type="image/webp"> <source srcset="${__DECLARED_ASSET_2__}" type="image/png"> <img src="${__DECLARED_ASSET_3__}" alt="production test" width="1440" height="1440"></picture>`, 1);

export default function Inline_module_vars($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	div.textContent = `${counter ?? ""} named exports are live bindings so cannot be inlined`;

	var img = $.sibling(div, 2);
	var picture = $.sibling(img, 2);
	var source = $.child(picture);
	var source_1 = $.sibling(source, 2);
	var source_2 = $.sibling(source_1, 2);
	var img_1 = $.sibling(source_2, 2);

	$.reset(picture);
	$.append($$anchor, fragment);
}

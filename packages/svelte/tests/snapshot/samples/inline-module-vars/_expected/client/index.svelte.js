import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

const __DECLARED_ASSET_0__ = "__VITE_ASSET__2AM7_y_a__ 1440w, __VITE_ASSET__2AM7_y_b__ 960w";
const __DECLARED_ASSET_1__ = "__VITE_ASSET__2AM7_y_c__ 1440w, __VITE_ASSET__2AM7_y_d__ 960w";
const __DECLARED_ASSET_2__ = "__VITE_ASSET__2AM7_y_e__ 1440w, __VITE_ASSET__2AM7_y_f__ 960w";
const __DECLARED_ASSET_3__ = "__VITE_ASSET__2AM7_y_g__";
var root = $.template(`<picture><source type="image/avif"> <source type="image/webp"> <source type="image/png"> <img alt="production test" width="1440" height="1440"></picture>`);

export default function Inline_module_vars($$anchor) {
	var picture = root();
	var source = $.child(picture);

	$.set_attribute(source, "srcset", __DECLARED_ASSET_0__);

	var source_1 = $.sibling(source, 2);

	$.set_attribute(source_1, "srcset", __DECLARED_ASSET_1__);

	var source_2 = $.sibling(source_1, 2);

	$.set_attribute(source_2, "srcset", __DECLARED_ASSET_2__);

	var img = $.sibling(source_2, 2);

	$.set_attribute(img, "src", __DECLARED_ASSET_3__);
	$.reset(picture);
	$.append($$anchor, picture);
}
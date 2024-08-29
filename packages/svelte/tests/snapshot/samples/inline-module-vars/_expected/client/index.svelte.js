import "svelte/internal/disclose-version";

const __ENHANCED_IMG_1__ = "__VITE_ASSET__2AM7_y_a__";
const __ENHANCED_IMG_2__ = "__VITE_ASSET__2AM7_y_b__";
const __ENHANCED_IMG_3__ = "__VITE_ASSET__2AM7_y_c__";
const __ENHANCED_IMG_4__ = "__VITE_ASSET__2AM7_y_d__";
const __ENHANCED_IMG_5__ = "__VITE_ASSET__2AM7_y_e__";
const __ENHANCED_IMG_6__ = "__VITE_ASSET__2AM7_y_f__";

import * as $ from "svelte/internal/client";

var root = $.template(`<picture><source type="image/avif"> <source type="image/webp"> <source type="image/png"> <img alt="production test" width="1440" height="1440"></picture>`);

export default function Inline_module_vars($$anchor) {
	var picture = root();
	var source = $.child(picture);

	$.set_attribute(source, "srcset", __ENHANCED_IMG_1__ + " 1440w, " + __ENHANCED_IMG_2__ + " 960w");

	var source_1 = $.sibling(source, 2);

	$.set_attribute(source_1, "srcset", __ENHANCED_IMG_3__ + " 1440w, " + __ENHANCED_IMG_4__ + " 960w");

	var source_2 = $.sibling(source_1, 2);

	$.set_attribute(source_2, "srcset", __ENHANCED_IMG_5__ + " 1440w, " + __ENHANCED_IMG_6__ + " 960w");

	var img = $.sibling(source_2, 2);

	$.set_attribute(img, "src", __ENHANCED_IMG_5__);
	$.reset(picture);
	$.append($$anchor, picture);
}
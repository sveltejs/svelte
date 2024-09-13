import * as $ from "svelte/internal/server";
import __IMPORTED_ASSET_0__ from "./foo.svg";
import { counter } from "./some.js";

const __DECLARED_ASSET_0__ = "__VITE_ASSET__2AM7_y_a__ 1440w, __VITE_ASSET__2AM7_y_b__ 960w";
const __DECLARED_ASSET_1__ = "__VITE_ASSET__2AM7_y_c__ 1440w, __VITE_ASSET__2AM7_y_d__ 960w";
const __DECLARED_ASSET_2__ = "__VITE_ASSET__2AM7_y_e__ 1440w, __VITE_ASSET__2AM7_y_f__ 960w";
const __DECLARED_ASSET_3__ = "__VITE_ASSET__2AM7_y_g__";

export default function Inline_module_vars($$payload) {
	$$payload.out += `<div>${$.escape(counter)} named exports are live bindings so cannot be inlined</div> <img${$.attr("src", __IMPORTED_ASSET_0__)} alt="default imports are not live bindings so can be inlined"> <picture><source${$.attr("srcset", __DECLARED_ASSET_0__)} type="image/avif"> <source${$.attr("srcset", __DECLARED_ASSET_1__)} type="image/webp"> <source${$.attr("srcset", __DECLARED_ASSET_2__)} type="image/png"> <img${$.attr("src", __DECLARED_ASSET_3__)} alt="production test" width="1440" height="1440"></picture>`;
}

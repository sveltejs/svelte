import { test } from '../../test';

export default test({
	// JSDOM lacks support for some of these attributes, so we'll skip it for now.
	//
	// See:
	//  - `async`: https://github.com/jsdom/jsdom/issues/1564
	//  - `nomodule`: https://github.com/jsdom/jsdom/issues/2475
	//  - `autofocus`: https://github.com/jsdom/jsdom/issues/3041
	//  - `inert`: https://github.com/jsdom/jsdom/issues/3605
	//  - etc...: https://github.com/jestjs/jest/issues/139#issuecomment-592673550
	skip_mode: ['client'],

	html: `
	<script nomodule async defer></script>
	<form novalidate></form>
	<input readonly required checked webkitdirectory>
	<select multiple disabled></select>
	<button formnovalidate></button>
	<img ismap>
	<video autoplay controls loop muted playsinline disablepictureinpicture disableremoteplayback></video>
	<audio disableremoteplayback></audio>
	<track default>
	<iframe allowfullscreen></iframe>
	<details open></details>
	<ol reversed></ol>
	<div autofocus></div>
	<span inert></span>

	<script nomodule async defer></script>
	<form novalidate></form>
	<input readonly required checked webkitdirectory>
	<select multiple disabled></select>
	<button formnovalidate></button>
	<img ismap>
	<video autoplay controls loop muted playsinline disablepictureinpicture disableremoteplayback></video>
	<audio disableremoteplayback></audio>
	<track default>
	<iframe allowfullscreen></iframe>
	<details open></details>
	<ol reversed></ol>
	<div autofocus></div>
	<span inert></span>

	<script></script>
	<form></form>
	<input>
	<select></select>
	<button></button>
	<img>
	<video></video>
	<audio></audio>
	<track>
	<iframe></iframe>
	<details></details>
	<ol></ol>
	<div></div>
	<span></span>
`
});

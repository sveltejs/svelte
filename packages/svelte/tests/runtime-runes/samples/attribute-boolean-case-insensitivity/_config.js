import { test } from '../../test';

export default test({
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

// @ts-expect-error
import SvelteComponent from '__MAIN_DOT_SVELTE__';
// @ts-expect-error
import config from '__CONFIG__';
// @ts-expect-error
import { render } from 'svelte/server';

export default function () {
	return render(SvelteComponent, { props: config.props || {} }).html;
}

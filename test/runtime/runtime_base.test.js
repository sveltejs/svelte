// @vitest-environment jsdom

import { create_loader } from '../helpers';
import { assert, it } from 'vitest';

const load = create_loader({ generate: 'dom', dev: true }, __dirname);
const { default: App } = await load('App.svelte');

it('fails if options.target is missing in dev mode', async () => {
	assert.throws(() => {
		new App();
	}, /'target' is a required option/);
});

it('fails if options.hydrate is true but the component is non-hydratable', async () => {
	assert.throws(() => {
		new App({
			target: { childNodes: [] },
			hydrate: true
		});
	}, /options\.hydrate only works if the component was compiled with the `hydratable: true` option/);
});

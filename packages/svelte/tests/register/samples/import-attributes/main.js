import Server from './App.svelte';
import Client from './App.svelte' with { generate: 'client' };
import ClientAgain from './App.svelte' with { generate: 'client' };
import ServerSourceA from './App.svelte' with { as: 'source', generate: 'server' };
import ServerSourceB from './App.svelte' with { generate: 'server', as: 'source' };
import client_source from './App.svelte' with { as: 'source' };
import module_source from './module.svelte.js' with { as: 'source' };

/** @param {Record<string, string>} attributes */
async function get_error(attributes) {
	try {
		await import('./App.svelte', { with: attributes });
	} catch (error) {
		return /** @type {Error} */ (error).message.replace(/\S*App\.svelte/, 'App.svelte');
	}
}

console.log(
	JSON.stringify({
		distinct_modules: Server !== Client,
		same_attributes_same_module: Client === ClientAgain,
		attribute_order_ignored: ServerSourceA === ServerSourceB,
		client_source: client_source.includes("from 'svelte/internal/client'"),
		server_source: ServerSourceA.includes("from 'svelte/internal/server'"),
		module_source: module_source.includes("from 'svelte/internal/client'"),
		errors: [
			await get_error({ as: 'nope' }),
			await get_error({ generate: 'nope' }),
			await get_error({ dev: 'true' })
		]
	})
);

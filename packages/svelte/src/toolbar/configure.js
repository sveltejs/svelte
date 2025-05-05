/**
 * toolbar config
 * @type {import('./public.d.ts').ResolvedConfig}
 */
const config = {
	tools: []
};

/**
 * @param  {Partial<import('./public.d.ts').Config>} options
 */
export function configure(options) {
	for (const [key, value] of Object.entries(options)) {
		if (key === 'tools') {
			continue
		} else {
			// @ts-expect-error index access
			config[key] = value;
		}
	}
	if(options.tools) {
		for (let tool of options.tools) {
			/** @type {import('./public.d.ts').Tool} */
			const resolved_tool = typeof tool === 'function' ? tool() : tool;
			const existing = config.tools.find((t) => t.name === resolved_tool.name);
			if (existing) {
				for (const [k, v] of Object.entries(tool)) {
					// @ts-expect-error index access
					existing[k] = v;
				}
			} else {
				config.tools.push(resolved_tool);
			}
		}
	}
}

/**
 *
 * @return {import('./public.d.ts').Config}
 */
export function getConfig() {
	// TODO clone to avoid direct manipulation
	return config;
}

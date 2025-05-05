/**
 * toolbar config
 * @type {import('./public.d.ts').Config}
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
			for (let tool of /** @type {import('./public.d.ts').Config.tools[0][]}*/ value) {
				if(typeof tool === 'function') {
					tool = tool(); // TODO lazy init?
				}
				/** @type {import('./public.d.ts').Tool}*/
				const existing = config.tools.find((t) => t.name === tool.name);
				if (existing) {
					for (const [k, v] of Object.entries(tool)) {
						existing[k] = v;
					}
				} else {
					config.tools.push(tool);
				}
			}
		} else {
			config[key] = value;
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

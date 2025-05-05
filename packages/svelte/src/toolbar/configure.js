/**
 * toolbar config
 * @type {import('./public.d.ts').Config}
 */
const config = {};

/**
 * @param  {Partial<import('./public.d.ts').Config>} options
 */
export function configure(options){
	// TODO deep merge?
	for(const [key,value] of options){
		config[key]=value;
	}
}

/**
 *
 * @return {import('./public.d.ts').Config}
 */
export function getConfig(){
	// TODO clone to avoid direct manipulation
	return config;
}

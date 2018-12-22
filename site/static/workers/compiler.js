self.window = self; // egregious hack to get magic-string to work in a worker

let fulfil_ready;
const ready = new Promise(f => {
	fulfil_ready = f;
});

self.addEventListener('message', async event => {
	switch (event.data.type) {
		case 'init':
			importScripts(`https://unpkg.com/svelte@${event.data.version}/compiler.js`);
			fulfil_ready();
			break;

		case 'compile':
			await ready;
			postMessage(compile(event.data));
			break;

	}
});

const commonCompilerOptions = {
	dev: false,
	css: false
};

function compile({ source, options, entry }) {
	try {
		const { js, stats } = svelte.compile(
			source,
			Object.assign({}, commonCompilerOptions, options)
		);

		return { code: js.code, props: entry ? stats.props : null };
	} catch (err) {
		let result = `/* Error compiling component\n\n${err.message}`;
		if (err.frame) result += `\n${err.frame}`;
		result += `\n\n*/`;
		return { code: result, props: null };
	}
}

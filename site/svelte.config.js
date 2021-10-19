import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		adapter: adapter(),
		target: '#svelte',
		prerender: {
			enabled: false
		},
		vite: () => ({
			optimizeDeps: {
				include: [
					'codemirror',
					'codemirror/mode/javascript/javascript.js',
					'codemirror/mode/handlebars/handlebars.js',
					'codemirror/mode/htmlmixed/htmlmixed.js',
					'codemirror/mode/xml/xml.js',
					'codemirror/mode/css/css.js',
					'codemirror/mode/markdown/markdown.js',
					'codemirror/addon/edit/closebrackets.js',
					'codemirror/addon/edit/closetag.js',
					'codemirror/addon/edit/continuelist.js',
					'codemirror/addon/comment/comment.js',
					'codemirror/addon/fold/foldcode.js',
					'codemirror/addon/fold/foldgutter.js',
					'codemirror/addon/fold/brace-fold.js',
					'codemirror/addon/fold/xml-fold.js',
					'codemirror/addon/fold/indent-fold.js',
					'codemirror/addon/fold/markdown-fold.js',
					'codemirror/addon/fold/comment-fold.js'
				]
			}
		})
	}
};

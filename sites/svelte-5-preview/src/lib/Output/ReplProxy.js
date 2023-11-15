let uid = 1;

const noop = () => {};

export default class ReplProxy {
	/** @type {HTMLIFrameElement} */
	iframe;

	/** @type {import("./proxy").Handlers} */
	handlers = {
		on_fetch_progress: noop,
		on_console: noop,
		on_error: noop,
		on_console_group: noop,
		on_console_group_collapsed: noop,
		on_console_group_end: noop,
		on_unhandled_rejection: noop
	};

	/** @type {Map<number, { resolve: (value: any) => void, reject: (value: any) => void }>} */
	pending_cmds = new Map();

	/** @param {MessageEvent<any>} e */
	handle_event = (e) => this.handle_repl_message(e);

	/**
	 * @param {HTMLIFrameElement} iframe
	 * @param {import("./proxy").Handlers} handlers
	 */
	constructor(iframe, handlers) {
		this.iframe = iframe;
		this.handlers = handlers;

		window.addEventListener('message', this.handle_event, false);
	}

	destroy() {
		window.removeEventListener('message', this.handle_event);
	}

	/**
	 * @param {string} action
	 * @param {any} args
	 */
	iframe_command(action, args) {
		return new Promise((resolve, reject) => {
			const cmd_id = uid++;

			this.pending_cmds.set(cmd_id, { resolve, reject });

			this.iframe.contentWindow?.postMessage({ action, cmd_id, args }, '*');
		});
	}

	/**
	 * @param {{ action: string; cmd_id: number; message: string; stack: any; args: any; }} cmd_data
	 */
	handle_command_message(cmd_data) {
		let action = cmd_data.action;
		let id = cmd_data.cmd_id;
		let handler = this.pending_cmds.get(id);

		if (handler) {
			this.pending_cmds.delete(id);
			if (action === 'cmd_error') {
				let { message, stack } = cmd_data;
				let e = new Error(message);
				e.stack = stack;
				handler.reject(e);
			}

			if (action === 'cmd_ok') {
				handler.resolve(cmd_data.args);
			}
		} else {
			console.error('command not found', id, cmd_data, [...this.pending_cmds.keys()]);
		}
	}

	/**
	 * @param {MessageEvent<any>} event
	 */
	handle_repl_message(event) {
		if (event.source !== this.iframe.contentWindow) return;

		const { action, args } = event.data;

		switch (action) {
			case 'cmd_error':
			case 'cmd_ok':
				return this.handle_command_message(event.data);
			case 'fetch_progress':
				return this.handlers.on_fetch_progress(args.remaining);
			case 'error':
				return this.handlers.on_error(event.data);
			case 'unhandledrejection':
				return this.handlers.on_unhandled_rejection(event.data);
			case 'console':
				return this.handlers.on_console(event.data);
			case 'console_group':
				return this.handlers.on_console_group(event.data);
			case 'console_group_collapsed':
				return this.handlers.on_console_group_collapsed(event.data);
			case 'console_group_end':
				return this.handlers.on_console_group_end(event.data);
		}
	}

	/** @param {string} script */
	eval(script) {
		return this.iframe_command('eval', { script });
	}

	handle_links() {
		return this.iframe_command('catch_clicks', {});
	}
}

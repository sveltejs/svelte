import { type Environment, builtinEnvironments } from 'vitest/environments';

const xhtml_page = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.0//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic10.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body></body></html>`;

export default <Environment>{
	name: 'jsdom-xhtml',
	transformMode: 'web',
	setup(global, { jsdom = {} }) {
		return builtinEnvironments.jsdom.setup(global, {
			jsdom: {
				...jsdom,
				html: xhtml_page,
				contentType: 'application/xhtml+xml'
			}
		});
	}
};

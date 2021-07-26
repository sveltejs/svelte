export default {
	html: `
		a,b,undefined,c
		<br />
		a: undefined<br />
		b: number<br />
		c: undefined<br />
		d: undefined<br />
		e: number<br />
		f: undefined<br />
		g: undefined<br />
		<br />
		{"d":"d","e":"e","g":"f"}
	`,
	ssrHtml: `
		a,b,undefined,c
		<br />
		a: undefined<br />
		b: number<br />
		c: undefined<br />
		d: undefined<br />
		e: number<br />
		f: undefined<br />
		g: undefined<br />
		<br />
		{}
	`
};

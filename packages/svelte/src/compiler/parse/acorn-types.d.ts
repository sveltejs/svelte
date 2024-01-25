declare module 'acorn' {
	export function isIdentifierStart(code: number, astral: boolean): boolean;
	export function isIdentifierChar(code: number, astral: boolean): boolean;
}

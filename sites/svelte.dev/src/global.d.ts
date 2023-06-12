/// <reference types="@sveltejs/kit" />

declare global {
	namespace App {
		interface PageData {
			nav_title: string;
		}
	}
}

export {};

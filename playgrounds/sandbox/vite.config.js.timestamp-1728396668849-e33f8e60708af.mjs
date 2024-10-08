// vite.config.js
import { defineConfig } from 'file:///Users/trueadm/projects/svelte/node_modules/.pnpm/vite@5.4.6_@types+node@20.12.7_lightningcss@1.23.0_sass@1.70.0_terser@5.27.0/node_modules/vite/dist/node/index.js';
import inspect from 'file:///Users/trueadm/projects/svelte/node_modules/.pnpm/vite-plugin-inspect@0.8.4_rollup@4.21.0_vite@5.4.6_@types+node@20.12.7_lightningcss@1.23.0_sass@1.70.0_terser@5.27.0_/node_modules/vite-plugin-inspect/dist/index.mjs';
import { svelte } from 'file:///Users/trueadm/projects/svelte/node_modules/.pnpm/@sveltejs+vite-plugin-svelte@4.0.0-next.6_svelte@packages+svelte_vite@5.4.6_@types+node@20.12_b535d3omrre5h65el7zdniaefi/node_modules/@sveltejs/vite-plugin-svelte/src/index.js';
var vite_config_default = defineConfig({
	build: {
		minify: false
	},
	plugins: [
		inspect(),
		svelte({
			compilerOptions: {
				hmr: true
			}
		})
	],
	optimizeDeps: {
		// svelte is a local workspace package, optimizing it would require dev server restarts with --force for every change
		exclude: ['svelte']
	}
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvdHJ1ZWFkbS9wcm9qZWN0cy9zdmVsdGUvcGxheWdyb3VuZHMvc2FuZGJveFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3RydWVhZG0vcHJvamVjdHMvc3ZlbHRlL3BsYXlncm91bmRzL3NhbmRib3gvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3RydWVhZG0vcHJvamVjdHMvc3ZlbHRlL3BsYXlncm91bmRzL3NhbmRib3gvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCBpbnNwZWN0IGZyb20gJ3ZpdGUtcGx1Z2luLWluc3BlY3QnO1xuaW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSAnQHN2ZWx0ZWpzL3ZpdGUtcGx1Z2luLXN2ZWx0ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG5cdGJ1aWxkOiB7XG5cdFx0bWluaWZ5OiBmYWxzZVxuXHR9LFxuXG5cdHBsdWdpbnM6IFtcblx0XHRpbnNwZWN0KCksXG5cdFx0c3ZlbHRlKHtcblx0XHRcdGNvbXBpbGVyT3B0aW9uczoge1xuXHRcdFx0XHRobXI6IHRydWVcblx0XHRcdH1cblx0XHR9KVxuXHRdLFxuXG5cdG9wdGltaXplRGVwczoge1xuXHRcdC8vIHN2ZWx0ZSBpcyBhIGxvY2FsIHdvcmtzcGFjZSBwYWNrYWdlLCBvcHRpbWl6aW5nIGl0IHdvdWxkIHJlcXVpcmUgZGV2IHNlcnZlciByZXN0YXJ0cyB3aXRoIC0tZm9yY2UgZm9yIGV2ZXJ5IGNoYW5nZVxuXHRcdGV4Y2x1ZGU6IFsnc3ZlbHRlJ11cblx0fVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdVLFNBQVMsb0JBQW9CO0FBQ3JXLE9BQU8sYUFBYTtBQUNwQixTQUFTLGNBQWM7QUFFdkIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDM0IsT0FBTztBQUFBLElBQ04sUUFBUTtBQUFBLEVBQ1Q7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxNQUNOLGlCQUFpQjtBQUFBLFFBQ2hCLEtBQUs7QUFBQSxNQUNOO0FBQUEsSUFDRCxDQUFDO0FBQUEsRUFDRjtBQUFBLEVBRUEsY0FBYztBQUFBO0FBQUEsSUFFYixTQUFTLENBQUMsUUFBUTtBQUFBLEVBQ25CO0FBQ0QsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K

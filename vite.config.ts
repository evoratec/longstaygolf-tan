import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tsconfigPaths from 'vite-tsconfig-paths'

const config = defineConfig(({ mode }) => ({
	server: {
		port: 3000,
		host: true,
		preset: 'node-server',
	},
	plugins: [
		devtools(),
		...(mode === "production"
			? [
					cloudflare({
						configPath: "./wrangler.jsonc",
						viteEnvironment: { name: "ssr" },
					}),
				]
			: []),
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		tsconfigPaths(),
	],
}));

export default config;

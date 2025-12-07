import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { defineConfig } from 'vite';
import metadata from './public/client-metadata.json';

const SERVER_HOST = '127.0.0.1';
const SERVER_PORT = 3000;

export default defineConfig({
	plugins: [
		svelte(),
		{
			name: 'oauth',
			config(_conf, { command }) {
				if (command === 'build') {
					process.env.VITE_OAUTH_CLIENT_ID = metadata.client_id;
					process.env.VITE_OAUTH_REDIRECT_URI = metadata.redirect_uris[0];
				} else {
					const redirectUri = (() => {
						const url = new URL(metadata.redirect_uris[0]);
						return `http://${SERVER_HOST}:${SERVER_PORT}${url.pathname}`;
					})();

					const clientId =
						`http://localhost` +
						`?redirect_uri=${encodeURIComponent(redirectUri)}` +
						`&scope=${encodeURIComponent(metadata.scope)}`;

					process.env.VITE_DEV_SERVER_PORT = '' + SERVER_PORT;
					process.env.VITE_OAUTH_CLIENT_ID = clientId;
					process.env.VITE_OAUTH_REDIRECT_URI = redirectUri;
				}

				process.env.VITE_CLIENT_URI = metadata.client_uri;
				process.env.VITE_OAUTH_SCOPE = metadata.scope;
			}
		}
	],
	resolve: {
		alias: {
			$lib: path.resolve(__dirname, './src/lib')
		}
	},
	server: {
		host: SERVER_HOST,
		port: SERVER_PORT
	}
});

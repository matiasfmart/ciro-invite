import { defineConfig, type HtmlTagDescriptor } from 'vite';
import react from '@vitejs/plugin-react';
import { invitation } from './src/config/invitation';
import { readFileSync } from 'node:fs';

export default defineConfig({
	base: './',
	plugins: [react(), {
		name: 'invitation-metadata',
		generateBundle() {
			for (const family of ['fredoka', 'dm-sans']) {
				this.emitFile({ type: 'asset', fileName: `licenses/${family}.txt`, source: readFileSync(new URL(`./node_modules/@fontsource-variable/${family}/LICENSE`, import.meta.url), 'utf8') });
			}
		},
		transformIndexHtml(): HtmlTagDescriptor[] {
			const title = `El cumple de ${invitation.child.name}`;
			const description = `Celebramos los ${invitation.child.age} años de ${invitation.child.name}. ${invitation.theme.description}`;
			return [
				{ tag: 'title', children: title.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;') },
				{ tag: 'meta', attrs: { name: 'description', content: description } },
				{ tag: 'meta', attrs: { name: 'theme-color', content: invitation.theme.colors.primary } },
				{ tag: 'meta', attrs: { property: 'og:title', content: title } },
				{ tag: 'meta', attrs: { property: 'og:description', content: description } },
				{ tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
			];
		},
	}],
});
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';

const noAttr = () => {
    return {
        name: "no-attribute",
        transformIndexHtml(html) {
            return html.replace(`type="module" crossorigin`, "");
        }
    }
}
export default defineConfig({
    plugins: [viteSingleFile(), noAttr()],
    build: {
        minify: true,
        outDir: resolve(__dirname, 'dist/ui'),
    },
});
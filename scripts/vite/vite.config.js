import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// import fs from 'fs';
// import ts from 'rollup-plugin-typescript2';
// import cmj from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
// import { resolvePkgPath } from '../rollup/utils';

const pkgPath = path.resolve(__dirname, '../../packages');
const distPath = path.resolve(__dirname, '../../dist/node_modules');

function resolvePkgPath(pkgName, isDist) {
	if (isDist) {
		return `${distPath}/${pkgName}`;
	} else {
		return `${pkgPath}/${pkgName}`;
	}
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		replace({ __DEV__: true, preventAssignment: true })
		// cmj(),
		// ts({})
	],
	resolve: {
		alias: [
			{
				find: 'react',
				replacement: resolvePkgPath('react')
			},
			{
				find: 'react-dom',
				replacement: resolvePkgPath('react-dom')
			},
			{
				find: 'hostConfig',
				replacement: path.resolve(
					resolvePkgPath('react-dom'),
					'./src/hostConfig.ts'
				)
			}
		]
	}
});

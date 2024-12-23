import path from 'path';
import fs from 'fs';
import ts from 'rollup-plugin-typescript2';
import cmj from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

const pkgPath = path.resolve(__dirname, '../../packages');
const distPath = path.resolve(__dirname, '../../dist/node_modules');

export function resolvePkgPath(pkgName, isDist) {
	if (isDist) {
		return `${distPath}/${pkgName}`;
	} else {
		return `${pkgPath}/${pkgName}`;
	}
}

// 读取 pkg.json
export function getPackageJSON(pkgName) {
	const path = `${resolvePkgPath(pkgName)}/package.json`;

	// json 格式
	const str = fs.readFileSync(path, { encoding: 'utf-8' });

	// 返回 pkg.json 中的 kv
	return JSON.parse(str);
}

// commonjs ts 转移插件
export function getBaseRollupPlugins({
	typescript = {},
	alias = { preventAssignment: true }
} = {}) {
	return [replace(alias), cmj(), ts(typescript)];
}

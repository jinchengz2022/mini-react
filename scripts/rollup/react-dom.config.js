import { getBaseRollupPlugins, getPackageJSON, resolvePkgPath } from './utils';
import generateJson from 'rollup-plugin-generate-package-json';
import alias from '@rollup/plugin-alias';

const { name, module, peerDependencies } = getPackageJSON('react-dom');
// react-dom 包的路径
const pkgPath = resolvePkgPath(name);
// react-dom 产物路径
const pkgDistPath = resolvePkgPath(name, true);
console.log({ module, pkgPath });
export default [
	// react
	{
		input: `${pkgPath}/${module}`,
		output: [
			{
				file: `${pkgDistPath}/index.js`,
				name: 'ReactDOM',
				format: 'umd'
			},
			{
				file: `${pkgDistPath}/client.js`,
				name: 'client',
				format: 'umd'
			}
		],
		external: [...Object.keys(peerDependencies)],
		plugins: [
			// 模块编译插件
			...getBaseRollupPlugins(),
			alias({
				entries: {
					hostConfig: `${pkgPath}/src/hostConfig.ts`
				}
			}),
			// 自动生成 pkg.json 插件
			generateJson({
				inputFolder: pkgPath,
				outputFolder: pkgDistPath,
				// react pkg.json 中包含 shared 我们不需要，这自定义下
				baseContents: ({ name, version, description, pnpm }) => ({
					name,
					version,
					description,
					// peerDependencies: {
					// 	react: version
					// },
					main: 'index.js'
					// pnpm
				})
			})
		]
	}
];

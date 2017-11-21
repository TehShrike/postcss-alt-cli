#!/usr/bin/env node

require(`loud-rejection`)()
const compile = require(`./compile`)
const mri = require(`mri`)
const postcssLoadConfig = require(`postcss-load-config`)
const postcss = require(`postcss`)

const {
	_: [ sourceGlob, output ],
	watch,
	config,
} = mri(process.argv.slice(2))

main({ watch, sourceGlob, output, config })

async function main({ watch, sourceGlob, output, config }) {
	const { plugins } = await postcssLoadConfig({}, config)

	const cssProcessor = postcss(plugins)

	const watchGlob = (watch && typeof watch === `string`) ? watch : sourceGlob

	await compile({ cssProcessor, watch, sourceGlob, watchGlob, output })
}

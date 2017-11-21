const pify = require(`pify`)
const path = require(`path`)
const { readFile, writeFile } = pify(require(`fs`))
const { sync: makeDirSync } = require(`make-dir`)

const globby = require(`globby`)

module.exports = async({ cssProcessor, watch, sourceGlob, watchGlob, output }) => {
	makeDirSync(path.dirname(output))

	await build(cssProcessor, sourceGlob, output)

	if (watch) {
		onFileChange(watchGlob, () => build(cssProcessor, sourceGlob, output))
	}
}

async function build(cssProcessor, globPath, outputPath) {
	const paths = (await globby([ globPath ])).sort(sortByDepth)
	const outputFile = path.basename(outputPath)

	const cssResults = await Promise.all(paths.map(async path => {
		const contents = await readFile(path, { encoding: `utf8` })

		return cssProcessor.process(contents, {
			from: path,
			to: outputFile,
		})
	}))

	const rootOfAll = cssResults.map(result => result.root).reduce((memo, nextRoot) => memo.append(nextRoot))

	const result = rootOfAll.toResult({
		to: outputFile,
		map: {
			inline: false,
		},
	})

	await Promise.all([
		writeFile(outputPath, result),
		writeFile(`${ outputPath }.map`, result.map),
	])

	console.log(`Rebuilt.`, new Date())
}

function startIfItsNotRunningAlready(asyncFunction) {
	let queued = false
	let running = false

	async function singleRun() {
		running = true
		await asyncFunction()
		running = false
	}

	return async function run() {
		if (running) {
			queued = true
		} else {
			queued = false
			await singleRun()
			if (queued) {
				run()
			}
		}
	}
}

function sortByDepth(fileA, fileB) {
	const chunksA = fileA.split(`/`)
	const chunksB = fileB.split(`/`)
	return chunksA.length - chunksB.length
}

async function onFileChange(globPath, fn) {
	const gaze = pify(require(`gaze`))
	const watcher = await gaze(globPath)

	const buildButOnlyOneAtATime = startIfItsNotRunningAlready(fn)

	watcher.on(`all`, buildButOnlyOneAtATime)

	watcher.on(`added`, path => console.log(`add:`, path))
	watcher.on(`changed`, path => console.log(`change:`, path))
}

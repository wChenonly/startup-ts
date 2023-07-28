import process from 'node:process'
import { join } from 'node:path'
import { copyFileSync, rm } from 'node:fs'
import { type BuildOptions, type PluginBuild, build, context } from 'esbuild'

import c from 'picocolors'

import { name, version } from './package.json'

const log = (format: string): void => console.log(c.green(c.bold(`\n ${name} ${format} 格式 ${version} 版本打包成功 🎉🎉🎉\n`)))

function move(): void {
  copyFileSync(join('dist', 'src', 'index.d.ts'), join('dist', 'index.d.ts'))
  rm(join('dist', 'src'), { recursive: true }, () => {})
}

async function bundle(format: 'esm' | 'cjs') {
  const ext = format === 'esm' ? '.mjs' : '.js'

  const options: BuildOptions = {
    format,
    bundle: true,
    charset: 'utf8',
    entryPoints: ['src/index.ts'],
    minify: true,
    outdir: 'dist',
    outExtension: { '.js': `${ext}` },
    external: [],
    logLevel: 'info'
  }

  if (process.argv.includes('-w')) {
    const Plugin = {
      name: 'logPlugin',
      setup(build: PluginBuild) {
        build.onEnd(() => {
          log(format)
        })
      }
    }

    const ctx = await context({
      ...options,
      plugins: [Plugin]
    })

    await ctx.watch()
  }
  else {
    await build(options)
    log(format)
  }
}

;(async function () {
  await bundle('esm')
  await bundle('cjs')
  move()
})()

import fs from 'node:fs'
import { basename, dirname, join, resolve, sep } from 'node:path'
import process from 'node:process'
import CheapWatch from 'cheap-watch'
import type { Entry } from 'fast-glob'
import fg from 'fast-glob'
import type { LoggerInterface } from 'zeed'
import { Logger, ensureFolder, objectOmit, objectPick, writeText } from 'zeed'
import { parseMarkdown } from './parse-markdown'

const log: LoggerInterface = Logger('obsidian-copy')

export async function obsidianCopy(source: string, target: string) {
  log.info(`obsidian copy from ${source} to ${target}`)

  let rootObsidianVaultPath = ''
  const destinationFolderPath = resolve(target)

  async function copy(fromPath: string, toPath: string) {
    log(`copy ... ${fromPath} -> ${toPath}`)
    await ensureFolder(dirname(toPath))
    fs.copyFileSync(fromPath, toPath)
  }

  async function getPost(path: string, _assets: Entry[]) {
    let src = fs.readFileSync(path, 'utf-8')

    const info = parseMarkdown(src, path)
    const { slug, lang } = info

    src = src.replace(/\!\[\[(.*?)\]\]/gim, (m, assetUrl) => {
      log(m, assetUrl)
      const assetTitle = basename(assetUrl) || 'Image'
      return `![${assetTitle}](${assetUrl})`
    })

    src = src.replace(/\!\[(.*?)\]\((.*?)\)/gim, (m, assetTitle, assetUrl) => {
      log(m, assetUrl)
      const name = basename(assetUrl)

      const locations = [
        resolve(dirname(path), assetUrl),
        resolve(rootObsidianVaultPath, assetUrl),
        resolve(rootObsidianVaultPath, 'Assets', name),
      ]

      for (const fullPath of locations) {
        log('check location', fullPath)
        if (fs.existsSync(fullPath)) {
          void copy(fullPath, resolve(destinationFolderPath, `${slug}-${lang}-assets`, name))
          break
        }
      }

      return `![${assetTitle}](./${join(`${slug}-${lang}-assets`, name)})`
    })

    const name = `${slug}-${lang}.md`
    const destPath = resolve(destinationFolderPath, name)
    log(`write to ${destPath}`)
    await writeText(destPath, src)

    info.name = name

    return info
  }

  async function getPosts() {
    await ensureFolder(destinationFolderPath)

    const posts = []
    const assets: any = [] // await allAssets(rootObsidianVaultPath)
    // const pattern = '(de|en)/*.md'
    const pattern = '**/*.md'
    for (const obj of (await fg.glob([pattern], {
      cwd: source,
      dot: false,
      absolute: true,
      objectMode: true,
      onlyFiles: true,
      // stats: true,
    }))) {
      log('found', obj)
      // let fullPath = resolve(source, name)
      const data = await getPost(obj.path, assets)
      posts.push(data)
    }

    await writeText(
      resolve(destinationFolderPath, 'meta.json'),
      // JSON.stringify(posts, null, 2),
      JSON.stringify(posts.map(info => objectOmit(info, 'content')), null, 2),
    )

    await writeText(
      resolve(destinationFolderPath, 'meta-routes.json'),
      JSON.stringify(posts.map(info => objectPick(info, 'title', 'slug', 'lang')), null, 2),
    )
  }

  async function obsidianCopyToPosts() {
    const parts = resolve(source).split(sep)
    while (parts.length) {
      const p = join('/', ...parts, '.obsidian')
      if (fs.existsSync(p)) {
        rootObsidianVaultPath = join('/', ...parts)
        break
      }
      parts.pop()
    }

    log('rootObsidianVaultPath', rootObsidianVaultPath)
    log.assert(rootObsidianVaultPath, 'Missing Obsidian root')

    const posts = await getPosts()
    log('posts', posts)
  }

  await obsidianCopyToPosts()

  async function watchPosts() {
    const watcher = new CheapWatch({
      dir: source,
      filter: ({ path }: any) => path.endsWith('.md'),
      debounce: 50,
    })
    await watcher.init()
    watcher.on('+', obsidianCopyToPosts)
    watcher.on('-', obsidianCopyToPosts)
  }

  if (process.env.NODE_ENV === 'production')
    return

  await watchPosts()
}
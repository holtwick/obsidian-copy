# obsidian-copy

WORK IN PROGRESS!

**Copy [Obsidian](https://obsidian.md) documents, including referenced assets.**

> [!NOTE]
> [Obsidian](https://obsidian.md) is a great tool for creating and managing text. And Markdown is the format of choice for documentation and blog posts. This tool helps to do the text work in Obsidian and copy the results to wherever they are needed. This specialized tool helps to collect all the asset files and do some cleanup.

## CLI - Command Line Tool

The easiest way to use it, is via CLI in the terminal:

```sh
obsidian-copy my-obsidian-vault/project my-blog/posts
```

## Javascript Library

```js
import { obsidianCopy } from 'obsidian-copy'

await obsidianCopy(fromPath, toPath, options)
```


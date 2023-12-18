# obsidian-copy

**Copy [Obsidian](https://obsidian.md) documents including referenced assets.**

> [!NOTE]
> [Obsidian](https://obsidian.md) is a great tool to produce and manage texts. 
> And Markdown is the go to format for documentation and blog posts. 
> This tool helps doing the text work in Obsidian and copy the results to wherever they are needed. This specialized tool helps to gather all asset files and to some cleanup.

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


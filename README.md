# MCP Iconfont Server

A minimal [MCP](https://modelcontextprotocol.io) server that searches
[iconfont.cn](https://www.iconfont.cn) by a single keyword and returns the
matching icons together with their SVG markup. Designed to be easy for an AI
model to call: one keyword in, a small paginated list of SVGs out.

## Version History

### v1.0.1 (Latest)
- ✅ **Pagination**: Fixed page size of 10 icons per page; use the `page` parameter to fetch more
- ✅ **Richer Result**: Response now includes `page`, `pageSize`, `total`, `totalPages`, `count`
- ✅ **Docs**: Installation and editor-integration guide

### v1.0.0
- ✅ Initial release
- ✅ Single `search_icons` tool
- ✅ SVG markup returned per icon

## Features

- ✅ Single-keyword icon search against iconfont.cn
- ✅ Returns ready-to-use SVG markup for each icon
- ✅ Fixed page size (10 per page) for fast model selection
- ✅ Pagination metadata (`total`, `totalPages`, `page`)
- ✅ Zero runtime dependencies (uses Node.js built-in `fetch`)
- ✅ Stdio JSON-RPC transport, works with any MCP client

## Requirements

- Node.js >= 18 (uses the built-in `fetch` API)

## Installation

### Global Installation (Recommended)
```bash
npm install -g @liangshanli/mcp-server-iconfont
```

### Local Installation
```bash
npm install @liangshanli/mcp-server-iconfont
```

### From Source
```bash
git clone https://github.com/liliangshan/mcp-server-iconfont.git
cd mcp-server-iconfont
npm install
```

## Usage

### 1. Direct Run (Global Installation)
```bash
mcp-server-iconfont
```

### 2. Using npx (Recommended)
```bash
npx @liangshanli/mcp-server-iconfont
```

### 3. Direct Start (Source Installation)
```bash
npm start
```

## Editor Integration

### Cursor Editor Configuration

Create a `.cursor/mcp.json` file in your project root:

```json
{
  "mcpServers": {
    "iconfont": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-iconfont"]
    }
  }
}
```

### VS Code Configuration

Create a `.vscode/mcp.json` file (or add to your MCP client config):

```json
{
  "mcpServers": {
    "iconfont": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-iconfont"]
    }
  }
}
```

### Claude Code / Generic MCP Client

```json
{
  "mcpServers": {
    "iconfont": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-iconfont"]
    }
  }
}
```

## Tools

### `search_icons`

Search icons from iconfont.cn by a single keyword. Returns 10 icons per page
with their SVG markup; use the `page` parameter to fetch more.

| Param     | Type   | Required | Default | Description                                             |
| --------- | ------ | -------- | ------- | ------------------------------------------------------- |
| `keyword` | string | yes      | —       | Single keyword to search iconfont.cn against.           |
| `page`    | number | no       | 1       | Page number, starting from 1. Always 10 icons per page. |

Returns JSON text:

```json
{
  "page": 1,
  "pageSize": 10,
  "total": 17131,
  "totalPages": 1714,
  "count": 10,
  "icons": [
    { "id": 123, "name": "home-2", "svg": "<svg ...>...</svg>" }
  ]
}
```

| Field        | Description                                      |
| ------------ | ------------------------------------------------ |
| `page`       | Current page number.                             |
| `pageSize`   | Icons per page (fixed at 10).                    |
| `total`      | Total number of matching icons on iconfont.cn.   |
| `totalPages` | Total number of pages (`ceil(total / 10)`).      |
| `count`      | Number of icons actually returned on this page.  |
| `icons`      | Array of `{ id, name, svg }` objects.            |

## How It Works

1. The client calls the `search_icons` tool with a `keyword` (and optional `page`).
2. The server POSTs the query to the iconfont.cn search API.
3. Each returned icon's `show_svg` (fallback `icon`) field is extracted as SVG.
4. The server replies with a paginated list of `{ id, name, svg }` objects.

## Environment Variables

| Variable              | Default | Description           |
| --------------------- | ------- | --------------------- |
| `ICON_SEARCH_TIMEOUT` | `30000` | Request timeout (ms). |

## Project Structure

```
mcp-server-iconfont/
├── bin/
│   └── cli.js          # CLI entry point
├── src/
│   └── server.js       # MCP server (stdio JSON-RPC)
├── package.json
└── README.md
```

## License

MIT © liliangshan

# @liangshanli/mcp-server-iconfont

A minimal [MCP](https://modelcontextprotocol.io) server that searches
[iconfont.cn](https://www.iconfont.cn) by a single keyword and returns the
matching icons' SVG markup.

## Requirements

- Node.js >= 18 (uses built-in `fetch`)

## Usage

Run over stdio:

```bash
node bin/cli.js
```

### MCP client config

```json
{
  "mcpServers": {
    "iconfont": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-iconfont/bin/cli.js"]
    }
  }
}
```

## Tool

### `search_icons`

| Param     | Type   | Required | Default | Description                                            |
| --------- | ------ | -------- | ------- | ------------------------------------------------------ |
| `keyword` | string | yes      | —       | Single keyword to search iconfont.cn against.          |
| `page`    | number | no       | 1       | Page number, starting from 1. Always 10 icons per page.|

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

## Environment

| Variable              | Default | Description                  |
| --------------------- | ------- | ---------------------------- |
| `ICON_SEARCH_TIMEOUT` | `30000` | Request timeout (ms).        |

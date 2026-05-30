// Minimal MCP server for iconfont.cn
// Exposes a single tool: search_icons(keyword) -> list of { name, svg }
// Uses built-in fetch (Node.js 18+) and stdio JSON-RPC transport.

const ICONFONT_API = 'https://www.iconfont.cn/api/icon/search.json';
const TIMEOUT = parseInt(process.env.ICON_SEARCH_TIMEOUT, 10) || 30000;
const PAGE_SIZE = 10;

const SERVER_INFO = { name: 'iconfont-mcp-server', version: '1.0.0' };

// Fetch icons from iconfont.cn for a single keyword and return their SVGs.
async function searchIcons({ keyword, page }) {
  const q = String(keyword || '').trim();
  if (!q) {
    throw new Error('keyword is required');
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);

  const body = new URLSearchParams({
    q,
    sortType: 'updated_at',
    page: pageNum,
    pageSize: PAGE_SIZE,
    fromCollection: -1,
    t: Date.now(),
    ctoken: 'null'
  });

  const response = await fetch(ICONFONT_API, {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: body.toString(),
    signal: AbortSignal.timeout(TIMEOUT)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  if (data.code !== 200) {
    throw new Error(`API returned error: ${data.message || 'Unknown error'}`);
  }

  const icons = (data.data?.icons || []).map((icon) => ({
    id: icon.id,
    name: icon.name || String(icon.id),
    svg: icon.show_svg || icon.icon || ''
  }));

  const total = data.data?.count ?? icons.length;
  return {
    page: pageNum,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    count: icons.length,
    icons
  };
}

const TOOL = {
  name: 'search_icons',
  description: 'Search icons from iconfont.cn by a single keyword. Returns 10 icons per page with their SVG markup; use the page parameter to fetch more.',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        description: 'Search keyword (use a single, most relevant word).'
      },
      page: {
        type: 'number',
        description: 'Page number, starting from 1. Returns 10 icons per page.',
        default: 1
      }
    },
    required: ['keyword']
  }
};

async function handleRequest(request) {
  const { id, method, params } = request;

  // Notifications: no response.
  if (method === 'notifications/initialized' || method === 'notifications/exit') {
    if (method === 'notifications/exit') process.exit(0);
    return null;
  }

  try {
    let result;

    if (method === 'initialize') {
      result = {
        protocolVersion: params?.protocolVersion || '2024-11-05',
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO
      };
    } else if (method === 'tools/list') {
      result = { tools: [TOOL] };
    } else if (method === 'tools/call') {
      const { name, arguments: args } = params || {};
      if (name !== TOOL.name) {
        throw new Error(`Unknown tool: ${name}`);
      }
      const data = await searchIcons(args || {});
      result = {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    } else if (method === 'ping') {
      result = {};
    } else {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${method}` }
      };
    }

    return { jsonrpc: '2.0', id, result };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32603, message: error.message }
    };
  }
}

function start() {
  let buffer = '';
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', async (chunk) => {
    buffer += chunk;
    let index;
    while ((index = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, index).trim();
      buffer = buffer.slice(index + 1);
      if (!line) continue;

      let request;
      try {
        request = JSON.parse(line);
      } catch {
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: 'Parse error' }
        }) + '\n');
        continue;
      }

      const response = await handleRequest(request);
      if (response) {
        process.stdout.write(JSON.stringify(response) + '\n');
      }
    }
  });

  process.on('SIGTERM', () => process.exit(0));
  process.on('SIGINT', () => process.exit(0));
}

start();

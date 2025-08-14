# kagi-ken-mcp

A lightweight Node MCP server around the [`kagi-ken` package](https://github.com/czottmann/kagi-ken), providing access to Kagi.com services using Kagi session tokens:

- **Search**: Searches Kagi
- **Summarizer**: Uses Kagi's Summarizer to create summaries from URLs or text content

Unlike the official Kagi API which requires API access, this MCP server uses your existing Kagi session to access both search and summarization features.

_"Kagi-ken"_ is a portmanteau of _"Kagi"_ (the service) and _"token"_.

<a href="https://glama.ai/mcp/servers/@czottmann/kagi-ken-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@czottmann/kagi-ken-mcp/badge" alt="kagi-kan-mcp MCP server" />
</a>

## Why?

The [Kagi API](https://help.kagi.com/kagi/api/overview.html) requires a separate API key, which are invite-only at the moment. If you already have a Kagi subscription but no API access, yet want to programmatically access Kagi's services from LLMs or agents like Claude, this MCP server provides an alternative.


## Features

- **Search**: Fetch web results using Kagi Search with concurrent query processing
- **Summarization**: Summarize content from URLs with customizable output types and languages

The server supports two methods for using your Kagi session token (see [Installation](#installation)), in this order:

1. `KAGI_SESSION_TOKEN` environment variable
2. `~/.kagi_session_token` file containing the token string

It includes comprehensive error handling:

- Connection timeouts (10 seconds per search)
- Invalid input validation
- Environment variable validation  
- Graceful error formatting


## Installation

Node.js 22+ is required.

### 1. Get Kagi Session Token

1. Visit [Kagi Settings](https://kagi.com/settings/user_details) in your browser
2. Copy the **Session Link**
3. Extract the `token` value from the link
4. Use that value as your session token: save to `~/.kagi_session_token` (recommended), alternatively pass as `KAGI_SESSION_TOKEN` env variable

The server will automatically try the environment variable first, then fall back to the token file.

> [!WARNING]
> **Security Note**: Keep your session token private. It provides access to your Kagi account.

### 2.a. Add MCP server to Claude Desktop

Add kagi-ken-mcp to your `claude_desktop_config.json` which you can open from the Claude Desktop app via Settings → Developer → Local MCP Servers → Edit Config.

Afterwards, [disable Claude Desktop's built-in websearch](assets/claude-desktop-disable-websearch.png) so it'll use this here MCP server.

#### Method 1: Using token file (recommended)
```json
{
  "mcpServers": {
    "kagi-ken-mcp": {
      "command": "npx",
      "args": ["-y", "github:czottmann/kagi-ken-mcp"]
    }
  }
}
```

#### Method 2: Using environment variable
```json
{
  "mcpServers": {
    "kagi-ken-mcp": {
      "command": "npx",
      "args": ["-y", "github:czottmann/kagi-ken-mcp"],
      "env": {
        "KAGI_SESSION_TOKEN": "YOUR_SESSION_TOKEN_HERE"
      }
    }
  }
}
```

### 2.b. Add MCP server to Claude Code

#### Method 1: Using token file (recommended)

```bash
claude mcp add kagi-ken-mcp --scope user -- npx -y github:czottmann/kagi-ken-mcp
```

#### Method 2: Using environment variable

```bash
claude mcp add kagi-ken-mcp \
  --scope user \
  --env KAGI_SESSION_TOKEN="YOUR_SESSION_TOKEN_HERE" -- \
  npx -y github:czottmann/kagi-ken-mcp
```

To disable Claude Code's built-in web search (optional), set the permission in the relevant `.claude/settings*.json` file:

```json
{
  "permissions": {
    "deny": [
      "WebSearch"
    ],
    "allow": [
      "mcp__kagi-ken-mcp__kagi_search_fetch",
      "mcp__kagi-ken-mcp__kagi_summarizer"
    ]
  }
}
```


## Usage: Pose query that requires use of a tool

e.g. _"Who was time's 2024 person of the year?"_ for search, or "summarize this video: https://www.youtube.com/watch?v=sczwaYyaevY" for summarizer.


## Tools

### `kagi_search_fetch`
Fetch web results based on one or more queries using the Kagi Search API. Results are numbered continuously for easy reference.

**Parameters:**
- `queries` (array of strings): One or more search queries

### `kagi_summarizer` 
Summarize content from URLs using the Kagi Summarizer API. Supports various document types including webpages, videos, and audio.

**Parameters:**
- `url` (string): URL to summarize
- `summary_type` (enum): `"summary"` for paragraph prose or `"takeaway"` for bullet points (default: `"summary"`)  
- `target_language` (string, optional): Language code (e.g., `"EN"` for English, default: `"EN"`)


## Development

### Project Structure
```
kagi-ken-mcp/
├── src/
│   ├── index.js              # Main server entry point
│   ├── tools/
│   │   ├── search.js         # Search tool implementation
│   │   └── summarizer.js     # Summarizer tool implementation
│   └── utils/
│       └── formatting.js     # Utility functions
├── package.json
└── README.md
```

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd kagi-ken-mcp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Running in Development Mode
```bash
npm run dev
```

### Debugging

Use the MCP Inspector to debug:
```bash
npx @modelcontextprotocol/inspector node ./src/index.js
```

Then access the inspector at `http://localhost:5173`. If using environment variables, add your `KAGI_SESSION_TOKEN` in the environment variables section of the inspector.

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with the MCP Inspector
5. Submit a pull request


## Author

Carlo Zottmann, <carlo@zottmann.dev>, https://c.zottmann.dev, https://github.com/czottmann.

This project is neither affiliated with nor endorsed by Kagi. I'm just a very happy customer.

> [!TIP]
> I make Shortcuts-related macOS & iOS productivity apps like [Actions For Obsidian](https://actions.work/actions-for-obsidian), [Browser Actions](https://actions.work/browser-actions) (which adds Shortcuts support for several major browsers), and [BarCuts](https://actions.work/barcuts) (a surprisingly useful contextual Shortcuts launcher). Check them out!


## Related Projects

- [czottmann/kagi-ken](https://github.com/czottmann/kagi-ken) - Unofficial session token-based Kagi client, Node
- [czottmann/kagi-ken-cli](https://github.com/czottmann/kagi-ken-cli) - Unofficial Node session token-based CLI tool, Node
- [Official Kagi MCP Server](https://github.com/kagisearch/kagimcp) - Python
- [Model Context Protocol](https://modelcontextprotocol.io/)
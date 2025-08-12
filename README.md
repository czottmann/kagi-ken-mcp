# Kagi Ken MCP Server

A Node.js MCP server that provides access to Kagi.com services using Kagi session tokens:

- **Search**: Searches Kagi.com and returns structured JSON data matching Kagi's official search API schema
- **Summarizer**: Uses Kagi's Summarizer to create summaries from URLs or text content

Unlike the official Kagi API which requires API access, this MCP server uses your existing Kagi session to access both search and summarization features.

_"Kagi-ken"_ is a portmanteau of _"Kagi"_ (the service) and _"token"_.

## Why?

The [Kagi API](https://help.kagi.com/kagi/api/overview.html) requires a separate API key, which are invite-only at the moment. If you already have a Kagi subscription and want to programmatically access Kagi's services from LLMs or agents like Claude, this MCP server provides an alternative by:

- Using your existing Kagi session token (no additional API costs)
- Parsing Kagi's HTML search results into structured JSON (matching official API format)
- Accessing Kagi's Summarizer for URL and text summarization

## Features

- **Search**: Fetch web results using Kagi Search with concurrent query processing
- **Summarization**: Summarize content from URLs with customizable output types and languages
- **Compatible**: Mirrors the functionality of the official Kagi MCP server
- **Lightweight**: Built with the Node.js MCP SDK

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

## Setup Instructions

### Prerequisites
- Node.js 18 or higher
- Kagi session token (see [Authentication](#authentication))

### Configuration with Claude

The server supports two methods for providing your session token:

1. **Token file** (recommended): Save token to `~/.kagi_session_token`
2. **Environment variable**: Set `KAGI_SESSION_TOKEN`

#### Claude Desktop

**Method 1: Using token file (recommended)**
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

**Method 2: Using environment variable**
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

#### Claude Code

**Method 1: Using token file (recommended)**
```bash
claude mcp add kagi-ken-mcp --scope user -- npx github:czottmann/kagi-ken-mcp
```

**Method 2: Using environment variable**
```bash
claude mcp add kagi-ken-mcp \
  --scope user \
  --env KAGI_SESSION_TOKEN="YOUR_SESSION_TOKEN_HERE" -- \
  npx -y github:czottmann/kagi-ken-mcp
```

To disable Claude Code's built-in web search (optional):
```json
{
  "permissions": {
    "deny": [
      "WebSearch"
    ]
  }
}
```


## Authentication

Get your Kagi session token:

1. Visit [Kagi Settings](https://kagi.com/settings/user_details) in your browser
2. Copy the **Session Link**
3. Extract the `token` value from the link
4. Use that value as your session token: save to `~/.kagi_session_token`, alternatively pass as `KAGI_SESSION_TOKEN` env variable

The server will automatically try the environment variable first, then fall back to the token file.

> [!WARNING]
> **Security Note**: Keep your session token private. It provides access to your Kagi account.


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

## Environment Variables

- `KAGI_SESSION_TOKEN` (optional): Your Kagi session token (fallback: `~/.kagi_session_token` file)

## Token Resolution Priority

The server resolves tokens in this order:
1. `KAGI_SESSION_TOKEN` environment variable
2. `~/.kagi_session_token` file

This matches the behavior of [kagi-ken-cli](https://github.com/czottmann/kagi-ken-cli) for consistent authentication.

## Differences from Official Kagi MCP

This implementation uses:
- **Session token** authentication instead of API key
- **kagi-ken package** instead of direct API calls
- **Node.js/JavaScript** instead of Python

The tool interfaces and output formats are designed to be compatible with the official Kagi MCP server.

## Error Handling

The server includes comprehensive error handling:
- Connection timeouts (10 seconds per search)
- Invalid input validation
- Environment variable validation  
- Graceful error formatting

## Contributing

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

## License

MIT License - see LICENSE file for details.

## Related Projects

- [Official Kagi MCP Server](https://github.com/kagisearch/kagimcp) (Python)
- [kagi-ken](https://github.com/czottmann/kagi-ken) (Node.js Kagi API client)
- [Model Context Protocol](https://modelcontextprotocol.io/)

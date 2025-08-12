# Kagi Ken MCP Server

A Node.js MCP server that provides Kagi search and summarization capabilities using the [kagi-ken](https://github.com/czottmann/kagi-ken) package.

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
- Kagi session token (see [Getting Your Session Token](#getting-your-session-token))

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

### Configuration with Claude

The server supports two methods for providing your session token:

1. **Token file** (recommended): Save token to `~/.kagi_session_token`
2. **Environment variable**: Set `KAGI_SESSION_TOKEN`

#### Claude Desktop

**Method 1: Using token file (recommended)**
```json
{
  "mcpServers": {
    "kagi-ken": {
      "command": "node",
      "args": ["/absolute/path/to/kagi-ken-mcp/src/index.js"]
    }
  }
}
```

**Method 2: Using environment variable**
```json
{
  "mcpServers": {
    "kagi-ken": {
      "command": "node",
      "args": ["/absolute/path/to/kagi-ken-mcp/src/index.js"],
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
claude mcp add kagi-ken -- node /absolute/path/to/kagi-ken-mcp/src/index.js
```

**Method 2: Using environment variable**
```bash
claude mcp add kagi-ken -e KAGI_SESSION_TOKEN="YOUR_SESSION_TOKEN_HERE" -- node /absolute/path/to/kagi-ken-mcp/src/index.js
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

### Getting Your Session Token

1. Go to [Kagi Settings > API](https://kagi.com/settings?p=api)
2. Copy the "Session Link" 
3. Extract the `token` parameter value from the URL

**Save the token:**

**Option 1: Token file (recommended)**
```bash
echo "YOUR_TOKEN_HERE" > ~/.kagi_session_token
```

**Option 2: Environment variable** 
```bash
export KAGI_SESSION_TOKEN="YOUR_TOKEN_HERE"
```

The server will automatically try the environment variable first, then fall back to the token file.

### Testing

**Test token resolution:**
```bash
node test-token-resolution.js
```

**Test the server with a query like:**
- "Who was Time's 2024 person of the year?" (search)
- "Summarize this article: https://example.com/article" (summarizer)

### Debugging

Use the MCP Inspector to debug:
```bash
npx @modelcontextprotocol/inspector node /absolute/path/to/kagi-ken-mcp/src/index.js
```

Then access the inspector at `http://localhost:5173`. If using environment variables, add your `KAGI_SESSION_TOKEN` in the environment variables section of the inspector.

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

### Running in Development Mode
```bash
npm run dev
```

## Environment Variables

- `KAGI_SESSION_TOKEN` (optional): Your Kagi session token (fallback: `~/.kagi_session_token` file)
- `KAGI_SUMMARIZER_ENGINE` (optional): Compatibility variable (may not affect kagi-ken behavior)

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

## License

MIT License - see LICENSE file for details.

## Related Projects

- [Official Kagi MCP Server](https://github.com/kagisearch/kagimcp) (Python)
- [kagi-ken](https://github.com/czottmann/kagi-ken) (Node.js Kagi API client)
- [Model Context Protocol](https://modelcontextprotocol.io/)
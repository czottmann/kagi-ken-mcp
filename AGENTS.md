# AGENTS.md

This file provides guidance to LLM agents when working with code in this repository.

## Common Commands

### Development
```bash
npm install          # Install dependencies
npm start           # Run the MCP server
npm run dev         # Run with Node.js inspector for debugging
```

### Testing & Debugging
```bash
npx @modelcontextprotocol/inspector node src/index.js    # Launch MCP Inspector at localhost:5173
```

## Architecture Overview

This is a **Model Context Protocol (MCP) server** that provides Kagi search and summarization tools to Claude Desktop/Code. The server acts as a bridge between Claude and the `kagi-ken` package for accessing Kagi's APIs.

### Core Architecture Pattern

**MCP Server Structure**: The main server (`src/index.js`) uses the `@modelcontextprotocol/sdk` to create an MCP server that registers tools and handles communication via stdio transport.

**Tool-Based Architecture**: Each capability is implemented as a separate MCP tool:
- `kagi_search_fetch` - Multi-query concurrent search
- `kagi_summarizer` - URL/content summarization

**Token Resolution System**: Authentication follows the same pattern as `kagi-ken-cli` with priority-based token resolution:
1. `KAGI_SESSION_TOKEN` environment variable  
2. `~/.kagi_session_token` file

### Key Components

**`src/index.js`** - Main server class that:
- Creates McpServer instance
- Registers tools with Zod schemas for input validation
- Sets up stdio transport and error handling

**`src/tools/`** - Tool implementations:
- Each tool exports both the handler function and config object
- Handlers return MCP-compliant response format with `content` array
- Input validation uses direct Zod schema objects (not `z.object()`)

**`src/utils/auth.js`** - Token resolution that mirrors `kagi-ken-cli`:
- `resolveToken()` - Priority-based token resolution
- `readTokenFromFile()` - File-based token reading
- Comprehensive error messages for missing tokens

**`src/utils/formatting.js`** - Result formatting:
- `formatSearchResults()` - Matches official Kagi MCP output format
- `getEnvironmentConfig()` - Unified config with token resolution

### Critical Implementation Details

**MCP Schema Format**: Input schemas must be plain objects with Zod validators as values, NOT `z.object()` wrappers:
```js
// Correct
export const schema = {
  queries: z.array(z.string()).min(1)
};

// Incorrect 
export const schema = z.object({
  queries: z.array(z.string()).min(1)
});
```

**Concurrent Search Processing**: Search tool uses `Promise.allSettled()` with individual timeouts to handle multiple queries concurrently, maintaining result order and partial success handling.

**Result Formatting Compatibility**: Output format precisely matches the official Python Kagi MCP server to ensure tool interface compatibility across implementations.

## Dependencies

- `@modelcontextprotocol/sdk` - MCP server implementation
- `kagi-ken` - Kagi API client (GitHub dependency, not npm)
- `zod` - Input validation schemas

## Configuration

Requires Kagi session token via environment variable or file. Server automatically detects token source and provides clear error messages for setup issues.

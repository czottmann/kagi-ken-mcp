#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tools
import { kagiSearchFetch, searchToolConfig } from "./tools/search.js";
import { kagiSummarizer, summarizerToolConfig } from "./tools/summarizer.js";

/**
 * Kagi MCP Server using kagi-ken package
 * Provides search and summarization capabilities compatible with official Kagi MCP
 */
class KagiKenMcpServer {
  constructor() {
    this.server = new McpServer({
      name: "kagi-ken-mcp",
      version: "1.0.0",
    });
    this.setupTools();
  }

  /**
   * Register tools with the MCP server
   */
  setupTools() {
    // Register search tool
    this.server.registerTool(
      searchToolConfig.name,
      {
        title: "Kagi Search",
        description: searchToolConfig.description,
        inputSchema: searchToolConfig.inputSchema,
      },
      async (args) => await kagiSearchFetch(args),
    );

    // Register summarizer tool
    this.server.registerTool(
      summarizerToolConfig.name,
      {
        title: "Kagi Summarizer",
        description: summarizerToolConfig.description,
        inputSchema: summarizerToolConfig.inputSchema,
      },
      async (args) => await kagiSummarizer(args),
    );
  }

  /**
   * Start the MCP server
   */
  async start() {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error("Kagi Ken MCP Server started successfully");
    } catch (error) {
      console.error("Failed to start Kagi Ken MCP Server:", error);
      process.exit(1);
    }
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
if (import.meta.url === new URL(process.argv[1], "file://").href) {
  const server = new KagiKenMcpServer();
  await server.start();
}

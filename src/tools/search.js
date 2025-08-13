import { search } from "kagi-ken";
import {
  formatError,
  formatSearchResults,
  getEnvironmentConfig,
} from "../utils/formatting.js";
import { z } from "zod";

/**
 * Schema for search tool input validation
 */
export const searchInputSchema = {
  queries: z.array(z.string()).min(1).describe(
    "One or more concise, keyword-focused search queries. Include essential context within each query for standalone use.",
  ),
};

/**
 * Kagi search tool implementation using kagi-ken package
 * Mirrors the functionality of the official Kagi MCP kagi_search_fetch tool
 *
 * @param {Object} args - Tool arguments
 * @param {Array<string>} args.queries - Array of search queries
 * @returns {Promise<Object>} MCP tool response
 */
export async function kagiSearchFetch({ queries }) {
  try {
    if (!queries || queries.length === 0) {
      throw new Error("Search called with no queries.");
    }

    const { token } = getEnvironmentConfig();

    // Execute searches concurrently (similar to ThreadPoolExecutor in original)
    const searchPromises = queries.map((query) => {
      if (typeof query !== "string" || query.trim() === "") {
        throw new Error("All queries must be non-empty strings");
      }
      return search(query.trim(), token);
    });

    // Wait for all searches to complete with 10 second timeout per search
    const results = await Promise.allSettled(
      searchPromises.map((promise) =>
        Promise.race([
          promise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Search timeout")), 10000)
          ),
        ])
      ),
    );

    // Process results and handle any failures
    const responses = [];
    const errors = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "fulfilled") {
        responses.push(result.value);
      } else {
        errors.push(
          `Query "${queries[i]}": ${result.reason?.message || result.reason}`,
        );
        // Add empty response to maintain index alignment
        responses.push({ results: [] });
      }
    }

    // Format results using the same formatting as official MCP
    const formattedResults = formatSearchResults(queries, responses);

    // Include any errors in the response
    let finalResponse = formattedResults;
    if (errors.length > 0) {
      finalResponse += "\n\nErrors encountered:\n" + errors.join("\n");
    }

    return {
      content: [
        {
          type: "text",
          text: finalResponse,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: formatError(error),
        },
      ],
    };
  }
}

/**
 * Tool registration configuration for MCP server
 */
export const searchToolConfig = {
  name: "kagi_search_fetch",
  description: `
    Fetch web results based on one or more queries using the Kagi.com web search engine. Use for
    general search and when the user explicitly tells you to 'fetch' results/information. Results are
    from all queries given. They are numbered continuously, so that a user may be able to refer to a
    result by a specific number.
    `.replace(/\s+/gs, " ").trim(),
  inputSchema: searchInputSchema,
};

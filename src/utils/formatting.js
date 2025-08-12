/**
 * Formatting utilities for search results to match official Kagi MCP output
 */

import { resolveToken } from "./auth.js";

/**
 * Format search results from kagi-ken to match official MCP format
 * @param {Array<string>} queries - The search queries
 * @param {Array<Object>} responses - The search responses from kagi-ken
 * @returns {string} Formatted search results string
 */
export function formatSearchResults(queries, responses) {
  const resultTemplate = (resultNumber, title, url, published, snippet) =>
    `${resultNumber}: ${title}
${url}
Published Date: ${published}
${snippet}`;

  const queryResponseTemplate = (query, formattedSearchResults) =>
    `-----
Results for search query "${query}":
-----
${formattedSearchResults}`;

  const perQueryResponseStrs = [];
  let startIndex = 1;

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    const response = responses[i];

    // Filter for search results (assuming kagi-ken returns similar structure)
    const results = response?.results || response?.data || [];

    const formattedResultsList = results.map((result, index) => {
      const resultNumber = startIndex + index;
      return resultTemplate(
        resultNumber,
        result.title || "No Title",
        result.url || "",
        result.published || result.publishedDate || "Not Available",
        result.snippet || result.description || "No snippet available",
      );
    });

    startIndex += results.length;

    const formattedResultsStr = formattedResultsList.join("\n\n");
    const queryResponseStr = queryResponseTemplate(query, formattedResultsStr);
    perQueryResponseStrs.push(queryResponseStr);
  }

  return perQueryResponseStrs.join("\n\n");
}

/**
 * Handle errors consistently across tools
 * @param {Error|string} error - The error to format
 * @returns {string} Formatted error message
 */
export function formatError(error) {
  if (error instanceof Error) {
    return `Error: ${error.message || error.toString()}`;
  }
  return `Error: ${error || "Unknown error occurred"}`;
}

/**
 * Get configuration with token resolution and environment variables
 * Uses the same token resolution as kagi-ken-cli:
 * 1. Environment variable KAGI_SESSION_TOKEN
 * 2. Token file ~/.kagi_session_token
 *
 * @returns {Object} Environment configuration
 */
export function getEnvironmentConfig() {
  const token = resolveToken();

  // Note: kagi-ken might not support engine selection like the official API
  // We'll keep this for compatibility but may not use it
  const engine = process.env.KAGI_SUMMARIZER_ENGINE || "default";

  return { token, engine };
}

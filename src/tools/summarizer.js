import { summarize, SUPPORTED_LANGUAGES } from "kagi-ken";
import { formatError, getEnvironmentConfig } from "../utils/formatting.js";
import { z } from "zod";

/**
 * Schema for summarizer tool input validation
 */
export const summarizerInputSchema = {
  url: z.string().url().describe("A URL to a document to summarize."),
  summary_type: z.enum(["summary", "takeaway"]).default("summary").describe(
    "Type of summary to produce. Options are 'summary' for paragraph prose and 'takeaway' for a bulleted list of key points.",
  ),
  target_language: z.string().optional().describe(
    "Desired output language using language codes (e.g., 'EN' for English). If not specified, the document's original language influences the output.",
  ),
};

/**
 * Kagi summarizer tool implementation using kagi-ken package
 * Mirrors the functionality of the official Kagi MCP kagi_summarizer tool
 *
 * @param {Object} args - Tool arguments
 * @param {string} args.url - URL to summarize
 * @param {string} args.summary_type - Type of summary (summary|takeaway)
 * @param {string} args.target_language - Target language code
 * @returns {Promise<Object>} MCP tool response
 */
export async function kagiSummarizer(
  { url, summary_type = "summary", target_language },
) {
  try {
    if (!url) {
      throw new Error("Summarizer called with no URL.");
    }

    const { token, engine } = getEnvironmentConfig();

    // Validate summary type
    if (!["summary", "takeaway"].includes(summary_type)) {
      throw new Error(
        `Invalid summary_type: ${summary_type}. Must be 'summary' or 'takeaway'.`,
      );
    }

    // Set default language if not provided
    const language = target_language || "EN";

    // Validate language if provided
    if (
      target_language && SUPPORTED_LANGUAGES &&
      !SUPPORTED_LANGUAGES.includes(language)
    ) {
      console.warn(
        `Warning: Language '${language}' may not be supported. Supported languages: ${
          SUPPORTED_LANGUAGES.join(", ")
        }`,
      );
    }

    // Note about engine compatibility
    if (engine && engine !== "default") {
      console.warn(
        `Note: Engine selection (${engine}) from KAGI_SUMMARIZER_ENGINE may not be supported by kagi-ken. Using default behavior.`,
      );
    }

    // Prepare options for kagi-ken
    const options = {
      type: summary_type,
      language: language,
      isUrl: true,
    };

    // Call kagi-ken summarize function
    const result = await summarize(url, token, options);

    // Extract the summary text from the result
    // The structure may vary, so we'll try different possible response formats
    let summaryText;
    if (typeof result === "string") {
      summaryText = result;
    } else if (result && result.summary) {
      summaryText = result.summary;
    } else if (result && result.data && result.data.output) {
      summaryText = result.data.output;
    } else if (result && result.output) {
      summaryText = result.output;
    } else {
      // Fallback: stringify the result if it's not in expected format
      summaryText = JSON.stringify(result, null, 2);
    }

    return {
      content: [
        {
          type: "text",
          text: summaryText,
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
export const summarizerToolConfig = {
  name: "kagi_summarizer",
  description: `
    Summarize content from a URL using the Kagi.com Summarizer API. The Summarizer can summarize any
    document type (text webpage, video, audio, etc.)
    `.replace(/\s+/gs, " ").trim(),
  inputSchema: summarizerInputSchema,
};

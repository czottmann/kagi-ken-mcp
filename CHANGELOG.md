# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-10-17

### Added

- Optional `limit` parameter to `kagi_search_fetch` tool to control maximum number of search results per query
- Default limit of 10 results when no limit is specified
- Input validation for limit parameter (1-50 results)
- Updated tool description to mention limit functionality

### Changed

- Enhanced `kagiSearchFetch()` to apply limit per individual query
- Updated Zod schema to include optional limit field with validation

### Technical Details

- Limit parameter is passed through to core `kagi-ken` package's `search()` function
- Each query in the array gets its own limit applied (not global across all queries)
- Related searches are always included regardless of limit (handled by core package)
- Backward compatible - existing usage without limit continues to work

## [1.0.0] - 2025-08-13

Initial release!

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-03

### Added
- Initial release of n8n-nodes-beease-timer
- Support for Workspace operations (Create, Delete, Get Many, Update)
- Support for Project operations (Create, Delete, Get Many, Update)
- Support for Member Session operations (Create, Delete, Get Many, Stop, Update Comment)
- Automatic API URL configuration (production by default, localhost in development)
- Beease Timer API credentials with API key authentication

### Changed
- Base URL is now automatically configured and hidden from users
- Development mode can be activated by setting `NODE_ENV=development`

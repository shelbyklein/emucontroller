# Overview

EmuController is a single-page web application for creating and editing iOS emulator skin configurations. Built entirely with vanilla HTML, CSS, and JavaScript, it provides a visual GUI for manipulating JSON configurations used by emulators like Delta and Gamma. The application operates as a single-session tool without requiring any backend infrastructure, making it portable and easy to deploy.

The core functionality centers around converting complex nested JSON structures into visual representations where users can see and interact with emulator control layouts. It supports multiple console types (GameBoy, Nintendo DS, PlayStation, etc.) with their respective button configurations and screen layouts.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Single-Page Application Pattern**: The entire application runs in the browser with no build process required. Three main files (`index.html`, `styles.css`, `script.js`) contain all functionality, making deployment as simple as serving static files.

**Component-Based JavaScript Class**: The `EmuController` class manages all application state and functionality through a centralized controller pattern. This approach was chosen to avoid framework complexity while maintaining organized code structure.

**Visual Rendering System**: Uses HTML/CSS-based rendering instead of canvas for better performance and easier styling. The `VisualRenderer` class creates positioned DOM elements that represent emulator controls, allowing for real-time visual feedback and interactive editing.

## Data Management

**JSON Configuration Format**: Works with nested JSON structures representing emulator skins with specific schema:
- Base configuration (name, identifier, console type)
- Device representations (iPhone with portrait/landscape orientations)
- Control items (buttons, D-pads, analog sticks)
- Screen definitions and layout properties

**Asset-Driven Configuration**: Console capabilities, button types, and device specifications are defined in JSON files in the `assets/` directory, serving as the single source of truth for what controls and configurations are available.

**State Management**: Application state is maintained in memory during the session with no persistence layer. Users import existing configurations or start from templates, make modifications, then export the final JSON.

## User Interface Design

**Welcome Screen Pattern**: Initial landing provides three clear paths: create new, use template, or import existing configuration. This reduces cognitive load and guides users to their intended workflow.

**Split-Panel Editor**: Main editing interface uses a dual-pane layout with JSON editor on one side and visual preview on the other, allowing real-time feedback between code and visual representation.

**Dark Theme Consistency**: CSS custom properties define a complete dark color palette optimized for extended editing sessions, with careful attention to contrast ratios and visual hierarchy.

# External Dependencies

**Static Asset Files**: The application relies on JSON configuration files stored in the `assets/` directory:
- `gameTypeIdentifiers.json` - Defines supported console types and their identifiers
- `available_buttons.json` - Maps console types to their available control inputs  
- `console-aspect-ratios.json` - Screen aspect ratios for different console types
- `iphone-sizes.json` - Device specifications for accurate skin sizing
- `default_config.json` - Base template for new skin configurations

**Template System**: Pre-configured skin templates stored in `assets/templates/` provide starting points for common console types, reducing setup time for users.

**No External APIs**: The application operates entirely offline with no external service dependencies, API calls, or network requirements beyond initial file serving.

**Browser APIs Only**: Utilizes standard web APIs for file operations (File API for import/export), DOM manipulation, and local storage capabilities without requiring any polyfills or external libraries.
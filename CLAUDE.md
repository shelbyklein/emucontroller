# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EmuController is a single-session web application for creating and editing iOS emulator skin configurations. Built with vanilla HTML, CSS, and JavaScript, it provides a GUI for manipulating JSON data structures that define emulator controller layouts and button mappings for various retro gaming consoles.

## Key Data Structures

The application works with emulator skin JSON configurations with this structure:
- **Base config**: Contains name, identifier, gameTypeIdentifier, and debug flag
- **Representations**: Nested structure for device types (iPhone) and orientations (portrait/landscape)
- **Items**: Button/control definitions with positioning and styling
- **Assets**: Image resources and their metadata
- **Screens**: Game display area definitions
- **Extended edges** and **menu insets**: Layout spacing configuration

## Console Support

Supported console types with their respective button sets:
- **GameBoy Color (gbc)**: Basic controls (A/B, D-pad, Select/Start)
- **GameBoy Advance (gba)**: Adds shoulder buttons (L/R)
- **Nintendo DS (nds)**: Dual screens, touch controls, thumbstick
- **NES/SNES/N64**: Progressive complexity from 2-button to 6-button + analog
- **Genesis (sg)**: 6-button layout with mode button
- **PlayStation 1 (ps1)**: Full controller with analog sticks and shoulder buttons

Each console has predefined aspect ratios and available button sets defined in the assets directory.

## Asset Organization

- **assets/consoles/**: Console identification images
- **assets/icons/**: UI control icons (alignment, scaling, etc.)
- **assets/**: Configuration files for buttons, console data, device specs
- **claude_docs/**: Development tracking and documentation

## Development Guidelines

- Use the provided asset files as the single source of truth for console capabilities
- Maintain the nested JSON structure when building editor interfaces
- Consider both portrait and landscape orientations for all console types
- iPhone device specifications are provided for accurate skin sizing
- All button types and console identifiers are predefined - do not create new ones

## File Structure

This is a single-page application with no build process. All development should focus on creating HTML, CSS, and JavaScript files that work together to provide JSON editing capabilities for emulator skin configurations.
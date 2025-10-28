# Build Process

<cite>
**Referenced Files in This Document**   
- [package.json](file://package.json)
- [vite.config.ts](file://configs/vite.config.ts)
- [tsup.config.ts](file://configs/tsup.config.ts)
- [tsconfig.json](file://tsconfig.json)
- [tsconfig.main.json](file://tsconfig.main.json)
- [tsconfig.server.json](file://tsconfig.server.json)
- [build-icons.js](file://scripts/build-icons.js)
- [index.ts](file://src/main/index.ts)
- [index.html](file://src/renderer/index.html)
</cite>

## Table of Contents
1. [Build System Overview](#build-system-overview)
2. [Renderer Process Build with Vite](#renderer-process-build-with-vite)
3. [Main, Preload, and Server Builds with tsup](#main-preload-and-server-builds-with-tsup)
4. [Development vs Production Build Configuration](#development-vs-production-build-configuration)
5. [Build Scripts and Execution Flow](#build-scripts-and-execution-flow)
6. [Output Structure and Component Integration](#output-structure-and-component-integration)
7. [Common Build Errors and Troubleshooting](#common-build-errors-and-troubleshooting)
8. [Build Optimization Techniques](#build-optimization-techniques)

## Build System Overview

The LifeOS application employs a multi-tool build system that leverages specialized tools for different components of the Electron application. The build process is orchestrated through npm scripts in package.json, with Vite handling the renderer process (frontend) and tsup managing the main process, preload script, and server modules. This separation allows for optimized builds tailored to each component's requirements, with Vite providing fast development server capabilities and tsup offering efficient TypeScript compilation for Node.js environments.

The build system follows a modular approach where each component is built independently before being integrated into the final Electron application. This architecture enables parallel development and testing of frontend and backend components while ensuring that production builds are properly packaged and optimized. The build process also includes icon generation and verification, ensuring that all necessary assets are available before packaging.

**Section sources**
- [package.json](file://package.json#L1-L108)
- [configs/vite.config.ts](file://configs/vite.config.ts#L1-L23)
- [configs/tsup.config.ts](file://configs/tsup.config.ts#L1-L30)

## Renderer Process Build with Vite

The renderer process, which constitutes the user interface of the LifeOS application, is built using Vite. Vite is configured through vite.config.ts to serve as both a development server and production build tool. The configuration sets the root directory to src/renderer, establishes aliases for @renderer and @common paths, and specifies the output directory as dist/renderer. During development, Vite serves the application at port 5173 with hot module replacement, enabling rapid iteration.

For production builds, Vite compiles the React-based frontend code into optimized static assets, including minified JavaScript and CSS files. The build process transforms the source code in src/renderer/components and src/renderer/pages into a production-ready bundle with proper code splitting and asset optimization. The resulting index.html in the dist/renderer directory references these optimized assets with hashed filenames to ensure proper caching behavior.

The Vite build process handles various frontend assets including TypeScript, JSX, CSS, and SVG files, processing them according to the configured plugins (primarily @vitejs/plugin-react). This ensures that modern JavaScript features are properly transpiled while maintaining development productivity through fast build times and efficient hot module replacement.

**Section sources**
- [configs/vite.config.ts](file://configs/vite.config.ts#L1-L23)
- [src/renderer/index.html](file://src/renderer/index.html#L1-L13)
- [package.json](file://package.json#L10-L13)

## Main, Preload, and Server Builds with tsup

The main process, preload script, and server modules are compiled using tsup, a lightweight TypeScript build tool optimized for Node.js applications. tsup is configured through tsup.config.ts to handle multiple entry points, with the main process entry point at src/main/index.ts and various IPC handler modules. The configuration specifies common settings for all builds, including source map generation, no file cleaning between builds, and CommonJS module format targeting Node.js 18.

The main process build compiles the Electron main thread code, which manages application lifecycle, window creation, and system-level operations. This includes the IPC handlers that facilitate communication between the renderer and main processes. The preload script build creates a secure bridge between the isolated renderer context and the privileged main process, exposing only specific APIs through context isolation.

The server module build, targeting both ESM and CJS formats, compiles the MCP (Mind Control Protocol) server that provides REST API endpoints for various application features. This multi-format output ensures compatibility with different module systems while maintaining type safety through TypeScript compilation. All tsup builds exclude Electron and better-sqlite3 from bundling, treating them as external dependencies to be resolved at runtime.

**Section sources**
- [configs/tsup.config.ts](file://configs/tsup.config.ts#L1-L30)
- [package.json](file://package.json#L14-L19)
- [src/main/index.ts](file://src/main/index.ts#L1-L109)

## Development vs Production Build Configuration

The LifeOS build system implements distinct configurations for development and production environments, controlled through the NODE_ENV environment variable. Development builds prioritize fast iteration and debugging capabilities, while production builds focus on optimization and security.

In development mode, the application uses a two-process approach where the renderer runs on a Vite development server (localhost:5173) while the main process loads this external URL. This enables hot module replacement and fast refresh capabilities. The main process also automatically opens developer tools for debugging. In contrast, production builds serve the renderer from local HTML files in the dist directory, eliminating the dependency on a development server.

TypeScript configurations differ between environments, with tsconfig.main.json and tsconfig.server.json extending the base tsconfig.json but specifying different output directories and including appropriate source files. Development builds preserve source maps and do not minify code, while production builds could be configured for minification (currently disabled in tsup.config.ts for easier debugging).

The build process also handles environment-specific assets, with the main process using different icon paths during development (project root) versus production (packaged resources). This ensures that developers can easily modify assets without repackaging the entire application.

**Section sources**
- [package.json](file://package.json#L10-L13)
- [tsconfig.json](file://tsconfig.json#L1-L18)
- [tsconfig.main.json](file://tsconfig.main.json#L1-L28)
- [src/main/index.ts](file://src/main/index.ts#L1-L109)

## Build Scripts and Execution Flow

The build process is orchestrated through npm scripts defined in package.json, providing a clear execution flow for both development and production builds. The primary build script "build" executes a sequential chain of operations: first generating icons, then building the renderer, main process, preload script, and server modules in sequence.

The build:icons script verifies the presence of required icon assets (LOGO.svg, build/icon.png, and build/icon.ico) and ensures they are properly formatted for different platforms. This script is critical for the subsequent electron-builder packaging step, as missing or incorrectly formatted icons will prevent successful installer creation.

Individual build scripts allow for targeted compilation of specific components:
- build:renderer uses Vite to compile the frontend
- build:main uses tsup to compile the Electron main process
- build:preload uses tsup to compile the preload script
- build:server uses tsup to compile the MCP server

The development workflow uses the "dev" script, which runs concurrently the Vite development server, TypeScript watcher for the main process, and the Electron application itself. This enables real-time updates to both frontend and backend code during development. The "pack" and "dist" scripts integrate the build process with electron-builder to create distributable packages for various platforms.

**Section sources**
- [package.json](file://package.json#L1-L108)
- [scripts/build-icons.js](file://scripts/build-icons.js#L1-L51)

## Output Structure and Component Integration

The build process generates a structured output in the dist directory, with separate subdirectories for each component: renderer, main, preload, and server. The renderer output contains optimized HTML, JavaScript, CSS, and asset files that constitute the user interface. The main and preload outputs contain compiled JavaScript files that run in the Electron main process context.

During application startup, the main process (dist/main/index.js) initializes the Electron application, creates the browser window, and loads either the development server URL (in development) or the built index.html file (in production). The preload script (dist/preload/index.js) is injected into the renderer context, establishing a secure communication channel through context isolation.

The server component (dist/server/mcp-server.js) can run independently as a REST API service, providing endpoints for various application features. This modular output structure allows for flexible deployment options, including running the MCP server separately from the desktop application.

The final integration occurs through electron-builder, which packages the dist directory contents along with other specified files (notification.html, LOGO.svg, package.json) into platform-specific installers. The ASAR archive format is used to package application source files, improving load times and providing a degree of code protection.

**Section sources**
- [package.json](file://package.json#L20-L30)
- [dist/renderer/index.html](file://dist/renderer/index.html#L1-L14)
- [src/main/index.ts](file://src/main/index.ts#L1-L109)

## Common Build Errors and Troubleshooting

Several common build errors can occur during the LifeOS build process, primarily related to missing dependencies, incorrect configurations, or missing assets. The most frequent issue is missing icon files, particularly build/icon.ico, which is required for Windows installer creation. The build-icons.js script explicitly checks for the presence of LOGO.svg, build/icon.png, and build/icon.ico, failing the build if any are missing.

TypeScript compilation errors may occur if there are type mismatches between the renderer and main processes, particularly in the IPC communication interfaces defined in src/common/types.ts. Since the main process and renderer have separate TypeScript configurations, changes to shared types must be compatible with both compilation contexts.

Vite build failures can occur due to incorrect path aliases or missing dependencies in the renderer process. The vite.config.ts file defines aliases for @renderer and @common paths, and incorrect usage of these aliases can lead to module resolution errors during the build process.

tsup compilation issues may arise from incorrect entry point configurations in tsup.config.ts or problems with the external dependencies specification. Since Electron and better-sqlite3 are marked as external, the build environment must ensure these packages are properly installed and accessible at runtime.

Network-related issues can affect the development workflow, particularly if the Vite development server fails to start on port 5173 due to port conflicts or firewall restrictions. The wait-on dependency in the dev script helps mitigate timing issues between the Vite server startup and Electron application launch.

**Section sources**
- [scripts/build-icons.js](file://scripts/build-icons.js#L1-L51)
- [configs/tsup.config.ts](file://configs/tsup.config.ts#L1-L30)
- [configs/vite.config.ts](file://configs/vite.config.ts#L1-L23)

## Build Optimization Techniques

The LifeOS build system incorporates several optimization techniques to improve compilation speed and reduce bundle sizes. The use of Vite for the renderer process provides fast development builds through esbuild's pre-bundling and native ES module serving, eliminating the need for full bundling during development.

For production optimization, several strategies could be implemented:
- Enable minification in tsup.config.ts by setting minify: true for smaller main process bundles
- Implement code splitting in the renderer process to reduce initial load time
- Optimize asset loading by properly configuring Vite's asset handling and compression
- Use tree-shaking to eliminate unused code from dependencies

The current configuration disables file cleaning between builds (clean: false in tsup.config.ts), which can speed up incremental builds but may lead to stale files in the output directory. For production releases, enabling clean would ensure a fresh build.

The build process could be further optimized by parallelizing independent build steps. Currently, the main, preload, and server builds are executed sequentially, but since they have no dependencies on each other, they could be run in parallel to reduce total build time.

Dependency optimization is another area for improvement. The application could implement dynamic imports for less frequently used features to reduce the initial bundle size, and analyze the dependency tree to identify and remove unused packages that increase the overall application size.

**Section sources**
- [configs/tsup.config.ts](file://configs/tsup.config.ts#L1-L30)
- [configs/vite.config.ts](file://configs/vite.config.ts#L1-L23)
- [package.json](file://package.json#L1-L108)
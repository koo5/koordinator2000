# CLAUDE.md - Koordinator2000 Services Guidelines

## Commands
- **Start service**: `npm start`
- **Development mode**: `npm run dev`
- **Run a single test**: No test commands found - implement Jest or Mocha

## Code Style
- **JS Standard**: Follow CommonJS module pattern
- **Imports**: Place at top of file, group by external/internal
- **Error Handling**: Use try/catch blocks as in matcher.js
- **Naming**: 
  - Use camelCase for variables and functions
  - Use descriptive names (e.g., `flip_stuff`, `my_fetch`)
- **Async/Await**: Prefer async/await over callbacks
- **Logging**: Use console.log with descriptive messages
- **Database**: Use GraphQL with Apollo Client for queries
- **Formatting**: 
  - Use consistent indentation (2 spaces)
  - Keep line length reasonable
- **Documentation**: Add comments for functions and complex logic
- **Environment**: Use dotenv for environment variables

## Architecture
- The service uses Apollo Client to interact with a GraphQL API
- Process runs continuously with a self-scheduling loop
- Node.js backend with moment.js for date handling
# Next.js Feature Development

Complete end-to-end Next.js feature development workflow with Product Manager → Developer → Code Reviewer → Automation Engineer → Documentation Engineer.

## Task

I'll launch the `nextjs-workflow-orchestrator` agent to coordinate a complete feature development workflow for: $ARGUMENTS

## Process

I'll use the Task tool to launch the orchestrator agent with the feature request, which will:

1. **Requirements Analysis** - Launch Product Manager agent to create task breakdown
2. **Implementation** - Launch Next.js Developer agent to build the feature
3. **Code Review** - Launch Code Review Engineer to ensure quality and security
4. **Test Automation** - Launch Automation Engineer to add comprehensive tests
5. **Documentation** - Launch Documentation Engineer to create all docs
6. **Final Report** - Summarize completion and artifacts created

The orchestrator agent will handle all coordination automatically.

## Usage Examples

```bash
# User dashboard with Server Components
/nextjs-feature "Create user dashboard with Server Components, data fetching, and real-time updates"

# Blog system with ISR
/nextjs-feature "Implement blog system using App Router, Server Components, ISR, and Markdown support"

# Authentication flow
/nextjs-feature "Build authentication flow with NextAuth, protected routes, and session management"

# E-commerce product catalog
/nextjs-feature "Create product catalog with filtering, search, pagination using Server Components and Suspense"
```

## Notes

- Each agent runs sequentially using outputs from previous agents
- All agents communicate via files in `.claude/tasks/<feature>/`
- Product manager creates the roadmap, others execute it
- Final deliverable is production-ready, tested, documented Next.js code
- All work is tracked in git with proper commit messages
- Focuses on App Router, Server Components, and Next.js 15+ patterns
- Tests include unit, component, integration, and E2E with Playwright

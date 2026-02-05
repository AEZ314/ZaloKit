# ZaloKit

⚠️⚠️⚠️  
Hey all! The template is pre-production, but hang tight while I'm preparing to ship the first usable version in a few weeks. If you're tempted, feel free to share your thoughts!  
–Zalo

## WTF?

ZaloKit is a production-grade web application template built on SvelteKit, designed to eliminate the infrastructure overhead that delays real product development.

Instead of spending weeks configuring authentication, storage, deployment, observability, and analytics, ZaloKit provides a structured, extensible foundation with production-ready defaults and a turnkey deployment path.

## Core Stack

ZaloKit integrates proven, modular tooling:

### Authentication & Access

- Better Auth (sessions, OAuth, organizations/teams, API keys)

### Database

- Postgres
- Drizzle ORM (type-safe schema + migrations)

### Storage

- S3-compatible object storage (SeaweedFS)

### Observability (Optional but Pre-Wired)

- Structured logging
- Metrics
- Tracing
- Product analytics hooks

### Frontend

- TailwindCSS
- Component-driven UI architecture
- PWA support for cross-platform installability

All integrations are optional but pre-wired so they can be enabled without refactoring.

### Turnkey Docker Compose Deployment

ZaloKit includes a production-ready Docker Compose setup.

## Project Lore

### Background

You know how to code and have a cool side project idea, but there is too much friction in starting from scratch. Only setting up a decent auth setup, deployment configs, environment settings may take days (don't even get me started on adding observability to your project) Thus far, I've been hesitant to start projects and instead solved my problems with spreadsheets, but you can over-engineer spreadsheets only so much. Somethings are just impossible in the spreadsheet world.

One recently emerging solution is vibe-coding. I don't like it. Not because I'm a cool kid: it's just too unpredictable and prone to breaking; otherwise, I think AI is really helpful for learning concepts and reading complicated docs. Using AI in more nuanced ways yield better results.

Another overlooked solution is low-coding tools (ie, Retool, Lowcoder, Appsmith). I personally tested/demo-ed 20 or so such tools. They presented varying combinations of: greedy pricing, slothy performance, too much ram consumption, and making me furious–**that's at least 4 deadly sins**. So, I didn't like low-coding tools either. Not because I have too much pride to put aside my coding skills, but because it sucks to pay $50k/month for a side project with 10k users (at a generous $5/user pricing).

Recognizing the weight of the repetitive tasks associated with the problem in question, I decided to build a simple, comprehensive, and extensible template for building web apps (but it also supports cross-platform mobile apps via PWA). I'm trying to build a first class template that addresses most hobby and commercial project requirements without sacrificing neither quality nor simplicity. My vision for this project is to combine simplicity of spreadsheets with customizability of custom-coded apps while providing a bunch of optional–but often very helpful–features such as observability, product analytics, and more. You want to start a side project? Great. This template will cut your development time from 10 weeks to 10 hours, multiply your developer experience, and help you not shoot yourself in the foot–all without AI bs or lowcode toys.

## Links

### [Docs](docs.md)

### [To Do](todo.md)

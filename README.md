# Situation

A minimal personal dashboard that pulls your active tasks from Trello and latest commits from GitHub into one view. PWA-installable, dark theme, no auth, no database.

## Features

- **Project cards** with Trello board integration (in-progress, backlog) and GitHub last commit
- **Daily habit tracker** with a contribution graph (like GitHub's)
- **Focus mode** picks a random in-progress task when you can't decide what to work on
- **PWA** installable as a desktop/mobile app with offline support
- **Config-driven** add or remove projects by editing one file

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in your Trello API key and token
npm run dev
```

## Configuration

Edit `src/config/projects.ts` to define your projects. Each project can have:

- **Trello integration** board ID + which lists to display
- **GitHub integration** repo for last commit info
- **Daily habit type** standalone streak tracker with no external integrations

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `TRELLO_API_KEY` | Yes | Trello API key |
| `TRELLO_TOKEN` | Yes | Trello auth token |
| `GITHUB_TOKEN` | No | GitHub PAT (avoids rate limits) |

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui

## License

MIT

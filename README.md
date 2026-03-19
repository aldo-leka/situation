# Situation

A PWA dashboard for tracking multiple projects with Trello and GitHub integrations.

## Features

- 📊 **Project Cards**: Track multiple projects with Trello boards and GitHub repos
- 🎯 **Focus Mode**: Randomly pick an in-progress task to work on
- 💻 **LeetCode Tracker**: Daily coding habit tracker with contribution-graph style
- 🌙 **Dark Theme**: Beautiful dark theme with zinc color palette
- 📱 **PWA Support**: Installable as a desktop/mobile app with offline support
- ⚡ **Fast**: Built with Next.js 15, TypeScript, and Tailwind CSS

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **PWA**: Service Worker with offline caching
- **APIs**: Trello API + GitHub API

## Projects Configuration

Projects are configured in `src/config/projects.ts`. Each project can have:

- **Trello board**: Track cards from specific lists (In Progress, Backlog, etc.)
- **GitHub repo**: Show last commit info
- **Daily habit**: Special tracker type with contribution-graph grid

## Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/aldo-leka/situation.git
   cd situation
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` with your API credentials:
   ```bash
   TRELLO_API_KEY=your_trello_api_key
   TRELLO_TOKEN=your_trello_token
   GITHUB_TOKEN=your_github_token_optional
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## API Routes

- `GET /api/status` - Aggregates all project data (Trello + GitHub)
  - Caches responses for 5 minutes
  - Returns project status with last activity timestamps

## Adding Projects

Edit `src/config/projects.ts`:

```typescript
{
  name: "ProjectName",
  emoji: "🚀",
  description: "Project description",
  trello: {
    boardId: "trello_board_id",
    listsToShow: ["In Progress", "Backlog"],
  },
  github: {
    repo: "owner/repo",
  },
}
```

## Environment Variables

- `TRELLO_API_KEY`: Get from [Trello Developer API Keys](https://trello.com/app-key)
- `TRELLO_TOKEN`: Generate from the same page
- `GITHUB_TOKEN`: (Optional) [GitHub Personal Access Token](https://github.com/settings/tokens) for higher rate limits

## PWA

The app is installable as a PWA:

- Desktop: Click install button in browser address bar
- Mobile: Add to Home Screen

Offline support: Shows last cached data when offline.

## License

MIT

---

Built by [Aldo](https://aldo.al)

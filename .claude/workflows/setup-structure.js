export const meta = {
  name: 'setup-structure',
  description: 'Initialize the monorepo project structure and basic scaffolding for the FAQ Crowdsourcing Platform',
  phases: [
    { title: 'Monorepo Setup', detail: 'Create Turborepo directories' },
    { title: 'Database Init', detail: 'Initialize Prisma schema' },
    { title: 'Auth Boilerplate', detail: 'Add NextAuth scaffolding' },
    { title: 'Frontend Bootstrap', detail: 'Create Next.js app with Tailwind & Radix UI' },
    { title: 'Backend Bootstrap', detail: 'Create Fastify API package' }
  ]
};

// Note: This workflow only creates the file structure. Actual commands should be run
// via separate Bash/PowerShell tasks or agents.

log('Workflow placeholder created. Run subsequent tasks to populate each phase.');
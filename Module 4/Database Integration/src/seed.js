const prisma = require('./prisma');
const seed = require('./data/postSeed');

async function seedDatabase() {
  // Clear existing records in reverse dependency order
  await prisma.postTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create default author matching postSeed authorId
  const user = await prisma.user.create({
    data: {
      id: 1,
      name: 'Default Author',
      email: 'author@community.dev',
    },
  });

  // Seed default posts
  for (const item of seed) {
    await prisma.post.create({
      data: {
        id: item.id,
        title: item.title,
        body: item.body,
        authorId: user.id,
      },
    });
  }

  // Reset auto-increment sequence on PostgreSQL
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Post"', 'id'), coalesce(max(id), 0) + 1, false) FROM "Post";`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"User"', 'id'), coalesce(max(id), 0) + 1, false) FROM "User";`
  );

  console.log('Database successfully seeded.');
}

if (require.main === module) {
  seedDatabase()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}

module.exports = { seedDatabase };

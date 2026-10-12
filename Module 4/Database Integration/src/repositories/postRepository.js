const prisma = require('../prisma');

/**
 * PostgreSQL/Prisma-backed Post Repository
 *
 * Implements the asynchronous repository contract:
 * - findAll(): Promise<Post[]>
 * - findById(id): Promise<Post | null>
 * - create(fields): Promise<Post>
 * - update(id, patch): Promise<Post | null>
 * - remove(id): Promise<boolean>
 *
 * Translates between Prisma method names/errors and the repository boundary,
 * ensuring services remain decoupled from Prisma delegates and SQL details.
 */

async function findAll() {
  const posts = await prisma.post.findMany({
    orderBy: { id: 'asc' },
  });
  return posts;
}

async function findById(id) {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;

  const post = await prisma.post.findUnique({
    where: { id: numericId },
  });
  return post;
}

async function create(fields) {
  try {
    const post = await prisma.post.create({
      data: {
        title: fields.title,
        body: fields.body || '',
        authorId: Number(fields.authorId),
      },
    });
    return post;
  } catch (error) {
    // Foreign key constraint violation (e.g. authorId does not exist in User table)
    if (error.code === 'P2003') {
      const err = new Error('Invalid authorId: referenced author does not exist');
      err.statusCode = 400;
      throw err;
    }
    // Unique constraint violation
    if (error.code === 'P2002') {
      const err = new Error('A post with these unique attributes already exists');
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
}

async function update(id, patch) {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;

  try {
    const data = {};
    if (patch.title !== undefined) data.title = patch.title;
    if (patch.body !== undefined) data.body = patch.body;

    const post = await prisma.post.update({
      where: { id: numericId },
      data,
    });
    return post;
  } catch (error) {
    // P2025: Record to update not found
    if (error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}

async function remove(id) {
  const numericId = Number(id);
  if (isNaN(numericId)) return false;

  try {
    await prisma.post.delete({
      where: { id: numericId },
    });
    return true;
  } catch (error) {
    // P2025: Record to delete not found
    if (error.code === 'P2025') {
      return false;
    }
    throw error;
  }
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};

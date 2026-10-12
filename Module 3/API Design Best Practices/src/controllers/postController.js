const service = require('../services/postService');
const http = require('../utils/http');

function listPosts(req, res, next) {
  try {
    const { posts, meta } = service.listPosts(req.query);
    return http.sendSuccess(res, posts, 200, meta);
  } catch (err) {
    return next(err);
  }
}

function getPost(req, res, next) {
  try {
    const post = service.getPost(req.params.id);
    if (!post) {
      return http.sendError(res, 404, 'Post not found');
    }
    return http.sendSuccess(res, post, 200);
  } catch (err) {
    return next(err);
  }
}

function createPost(req, res, next) {
  try {
    const { title, author } = req.body || {};
    if (!title || !author) {
      return http.sendError(res, 400, 'Title and author are required');
    }
    const post = service.createPost(req.body);
    return http.sendSuccess(res, post, 201);
  } catch (err) {
    return next(err);
  }
}

function likePost(req, res, next) {
  try {
    const post = service.likePost(req.params.id);
    if (!post) {
      return http.sendError(res, 404, 'Post not found');
    }
    return http.sendSuccess(res, post, 200);
  } catch (err) {
    return next(err);
  }
}

function explode(req, res, next) {
  try {
    service.explode();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};

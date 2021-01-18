const express = require("express");
const cors = require("cors");
const { v4, validate } = require("uuid");

const app = express();
const repositories = [];

//#region  Middlewares

function logger(request, response, next) {
  const { method, url } = request;

  const log = `[${method.toUpperCase()}] - ${url}`;

  console.time(log);

  next();

  console.timeEnd(log);
}

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if (!validate(id)) {
    return response.status(400).json({ error: 'Invalid Repository ID.' });
  }

  const repoIdx = repositories.findIndex(repo => repo.id === id);

  if (repoIdx < 0) {
    return response.status(404).json({ error: 'Repository not found!' });
  }

  request.repoIdx = repoIdx;

  return next();
}

//#endregion

//#region  Uses

app.use(logger);
app.use(express.json());
app.use(cors());

//#endregion

//#region  Routes

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = { id: v4(), title, url, techs, likes: 0 };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", validateRepositoryId, (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const repoIdx = request.repoIdx;
  const likes = repositories[repoIdx]['likes'];

  const repo = { id, title, url, techs, likes };

  repositories[repoIdx] = repo;

  return response.json(repo);
});

app.delete("/repositories/:id", validateRepositoryId, (request, response) => {
  const repoIdx = request.repoIdx;

  repositories.splice(repoIdx, 1);

  return response.status(204).send();

});

app.post("/repositories/:id/like", validateRepositoryId, (request, response) => {
  const { id } = request.params;
  const repoIdx = request.repoIdx;
  const repo = repositories[repoIdx];

  repo.likes += 1;

  repositories[repoIdx] = repo;

  return response.json(repo);
});

//#endregion

module.exports = app;

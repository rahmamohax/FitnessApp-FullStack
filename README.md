# FitnessApp — Full-Stack Project

A full-stack continuation of our Elevate fitness graduation project, bringing an Angular web frontend to the backend we developed as a team.

## Authorship and credits

| Area | Credit |
| --- | --- |
| Original backend | Developed collaboratively by **Elevate Fitness Project — Team 4 (GP2)**, including me |
| Angular frontend | Solo development by **[Rahma Mohammed (@rahmamohax)](https://github.com/rahmamohax)** |
| Frontend/backend integration | Ongoing individual work by Rahma Mohammed |

The original backend lives in **[Elevate-Fitness-Project-Teams/Fitness-App-Team4-GP2](https://github.com/Elevate-Fitness-Project-Teams/Fitness-App-Team4-GP2)**. Credit for that implementation belongs to the team and its contributors. See the [original contribution history](https://github.com/Elevate-Fitness-Project-Teams/Fitness-App-Team4-GP2/graphs/contributors).

The backend is included as a Git submodule, preserving its original repository, commits, and authorship. This repository tracks the frontend and the backend revision used for integration.

## Current status

- Team backend: existing ASP.NET Core services.
- Frontend: Angular 21 starter with Tailwind CSS, server-side rendering, and prerendering.
- Fitness UI and API integration: planned/in progress; the generated starter is not yet a complete fitness application.

## Repository structure

```text
Angular.FitnessApp/
  FitnessApp/          Angular frontend
Elevate.FitnessApp/    Team backend (Git submodule)
```

## Get started

Clone both the frontend and linked backend:

```sh
git clone --recurse-submodules https://github.com/rahmamohax/FitnessApp-FullStack.git
cd FitnessApp-FullStack
```

For an existing clone:

```sh
git submodule update --init --recursive
```

### Run the frontend

Use Node.js compatible with Angular 21 (the initial setup was verified with Node.js 22.14.0).

```sh
cd Angular.FitnessApp/FitnessApp
npm ci
npm start
```

Open http://localhost:4200.

If npm 10.9.2 fails with `Cannot read properties of null (reading 'edgesOut')`, run `npx --yes npm@11 ci`. The initial dependencies were successfully installed using npm 11.

```sh
npm run build
npm test -- --watch=false
```

### Backend

Open `Elevate.FitnessApp/Elevate.FitnessApp.sln` to work with the services. Backend configuration and infrastructure are managed in the linked team repository. Configure the services and their dependencies before integrating the frontend; cloning this repository alone does not start or configure them.

Changes inside the backend submodule belong to its own Git repository. Publish a backend commit to an appropriate backend repository before updating this repository's submodule pointer. Commit frontend changes from this repository.

## Attribution

This project continues a collaborative backend project with an individually developed frontend. Linking the backend here does not change its authorship or licensing.

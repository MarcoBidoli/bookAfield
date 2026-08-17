# bookAField
This project was developed as the exam project for the 2025-2026
_Web Application Programming_ course at the University of Trieste.

The name is a not-so-subtle tribute to the University's canteen booking app 🙃.

It is a field and tournament management application that allows users to:
- browse and search sports fields, tournaments, teams, and users;
- view field availability and book available time slots;
- create, edit, and manage amateur tournaments;
- automatically generate single round-robin match schedules;
- enter match results and view updated standings;

## Technologies

- **Backend:** [Node.js](https://nodejs.org/), [Express](https://expressjs.com/)
- **Frontend:** [Vue.js](https://vuejs.org/), [Vite](https://vite.dev/), [Pinia](https://pinia.vuejs.org/)
- **Database:** [MongoDB](https://www.mongodb.com/)
- **Containerization:** [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)

## Architecture

The application is composed of three main parts.

### Backend

The backend is a **Node.js application using the Express framework**. It provides the REST API used by the frontend and handles communication with the database and application logic.

### Frontend

The frontend is built with **Vue.js** and uses **Vite** as its development and build tool.

Application state is managed using **Pinia**, which provides a centralized store and makes shared state between Vue components easier to manage.

### Database

The application uses **MongoDB** for persistent data storage.

The components are containerized with Docker and orchestrated using Docker Compose.

---

## How to Run

Before running **any Docker command**, copy the example environment file:

```bash
cp /app/.env.example /app/.env
```

You can change the `JWT_SECRET` or configure the other values in `/app/.env` according to your environment. The default values are sufficient for a small demo setup.

### Development Environment

Start the development containers with:

```bash
docker compose -f docker-compose.dev.yml up --build -d
```

Then, from the `/frontend` directory, start the Vite development server:

```bash
cd /frontend
npm run dev
```

The services will be available at:

* **Express API:** http://localhost:3000
* **Vue + Vite frontend:** http://localhost:5173
* **MongoDB:** `localhost:27017`

### Production Environment

Build and start the production environment with:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

The production setup runs the application using the production configuration.

The application is available at http://localhost:3000.

MongoDB is also started as part of the production Docker Compose setup, but it is not exposed outside the Docker network.

> **Note:** The MongoDB database uses the same database name in both development and production. If you want to start with a fresh database, stop the containers and remove their volumes:
>
> ```bash
> docker compose -f docker-compose.prod.yml down -v
> ```
>
> Replace `docker-compose.prod.yml` with `docker-compose.dev.yml` if you are using the development environment.

---

## Demo Data / Seeding

To populate the production database with demo data, run the seed script inside the application container:

```bash
docker compose -f docker-compose.prod.yml exec app node seed.js
```

Run this command after the production containers have been started.
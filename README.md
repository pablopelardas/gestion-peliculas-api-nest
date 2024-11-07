# Movie Management API Documentation

- [Introduction](#movie-management-api)
- [Run in Development](#run-in-development)
- [Production Build](#production-build)
- [Stack](#stack)
- [Env Variables](#env-variables)
- [Testing Instructions](#testing-instructions)
- [API Documentation](#api-documentation)

## Movie Management API

API to manage movies using the [Star Wars API](https://swapi.dev/) as a base.


## Production Build

1. Create the `.env.prod` file with the environment variables defined in the `.env.template` file.
2. Replace DB_HOST with container name:`postgres-gpa`
2. Create the new Docker image

    ```bash
    docker-compose -f docker-compose.prod.yaml --env-file .env.production.local up --build
    ```

3. To run the image

    ```bash
    docker-compose -f docker-compose.prod.yaml --env-file .env.production.local up -d
    ```
4. Execute the seed to initialize users and roles
    ```http
    http://localhost:3000/api/seed
    ```
5. Access the API at
    ```http
    http://localhost:3000/api
    ```
6. Login with the following credentials
    ```
    email: admin@example.com
    password: Admin123
    ```
   or
    ```
    email: user@example.com
    password: User123
    ```


## Run in Development

1. Clone the repository
2. Run

    ```bash
    yarn install
    ```

3. Ensure Nest CLI is installed

    ```bash
    npm install -g @nestjs/cli
    ```

4. Start the databases (dev and test) with docker compose

    ```bash
    docker-compose up -d
    ```

5. Set up environment variables by cloning the `.env.template` file

    ```bash
    cp .env.template .env # Environment variables for development
    cp .env.template .env.test # Environment variables for testing
    ```

6. Fill in the environment variables defined in the `.env` file. See [Env Variables](#env-variables) for more information.
7. Run the application

    ```bash
    npm run start:dev
    ```

8. Run the seed to initialize users and roles

    ```http
    http://localhost:3000/api/seed
    ```
9. Access the API at
    ```http
    http://localhost:3000/api
    ```
10. Login with the following credentials
    ```
    email: admin@example.com
    password: Admin123
    ```
    or
    ```
    email: user@example.com
    password: User123
    ```
## Stack

- PostgreSQL
- NestJS
- TypeScript
- Docker

## Env Variables

| Variable       | Default                                                | Description                  |
| -------------- | ------------------------------------------------------ | ---------------------------- |
| DB\_PASSWORD   | mySecret\@password123                                  | Database password            |
| DB\_NAME       | gpa\_db                                                | Database name                |
| DB\_HOST       | localhost                                              | Database host                |
| DB\_USER       | postgres                                               | Database user                |
| DB\_PORT       | 5432                                                   | Database port                |
| HOST\_API      | [http://localhost:3000/api](http://localhost:3000/api) | API URL                      |
| HOST\_PORT     | 3000                                                   | API port                     |
| JWT\_SECRET    | Est3esMiS3cr3t0                                        | JWT secret                   |
| DEFAULT\_LIMIT | 10                                                     | Default items per page limit |

## Testing Instructions

1. Run unit tests

    ```bash
    yarn test
    ```

2. Run end-to-end (e2e) tests

    ```bash
    yarn test:e2e
    ```

3. Run test coverage

    ```bash
    yarn test:cov
    ```

## API Documentation

API documentation is available via Swagger. Once the application is running, you can access the API docs at:

```http
http://localhost:3000/api
```


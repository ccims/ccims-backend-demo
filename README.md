# ccims-backend-demo
the demo backend

# IMPORTAND

This is a demo/mockup
It was created as fast as possible witout a lot of care in good programming practice.

The final system will be completly rewritten

# Usage
## With Docker

```bash
docker-compose -f stack.yml up
```

`postgres.json` for docker:

```json
{
    "$schema": "./postgres.schema.json",
    "username": "demo-user",
    "password": "demo-password",
    "database": "CCIMS",
    "server": "db"
}
```


## Without docker
All commands below should be executed in the root directory of this repository
1. Download and install [PostgreSQL](https://www.postgresql.org/)
1. Create poetgres data base: `createdb [YOUR_DB_NAME]` (Potenially add `-U [POSTGRS_USER]` option if using a different Postgres user)
1. Run the database initialization script `psql -d [YOUR_DB_NAME] -f .\databaseScripts.sql` (If needed add user; see above)
1. Create file `postgres.json` in Directory `./src/config` with the content below these instructions. For more Infos on the config options see the liked json-Schema
1. Install typescript `npm install -g typescript`
1. Install all dependencies `npm i`
1. Run typescript compiler `tsc`
1. Run application `node ./out/index.js`
### `postgres.json`
```json
{
    "$schema": "./postgres.schema.json",
    "username": "[POSTGRS_USER]",
    "password": "[POSTRES_PASSWIORD]",
    "database": "[YOUR_DB_NAME]"
}
```

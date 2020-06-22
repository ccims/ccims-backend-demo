# ccims-backend-demo
the demo backend

# IMPORTAND

This is a demo/mockup
It was created as fast as possible witout a lot of care in good programming practice.

The final system will be completly rewritten

# Usage
## With Docker
TODO
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

# Adding github api key
1. Goto https://github.com/settings/apps
1. Create a new Github app
1. Check `Identifying and authorizing users -> Request user authorization (OAuth) during installation`
1. Set `Identifying and authorizing users -> User authorization callback URL` to `http://localhost:8080/tokenResponse/github` (Or the address where the ccims backend is reachable)
1. Set `Repository permissions -> Issues` to `Read & Write`
1. Enter the client id and client secret in the file `defaultUser.sql` (and the redirectUri in case it differs from the one given above)
1. Execute the `defaultUser.sql` script
1. Start the backend
1. Navigate to http://localhost:8080/tokenRequest/github (Or the url where the backend is reachable)
1. Enter `admin` and press `Start authorization`
1. Authorize the github app
1. Once authorized you should be redirected back to the backend and see the message `Token will be added`

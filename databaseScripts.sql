DROP TABLE projects;
DROP TABLE components;
DROP TABLE issue_management_systems;
DROP TABLE users;
DROP TYPE ims_type;
DROP TYPE ims_credential;

--\connect ccims

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    components INTEGER[],
    owner INTEGER NOT NULL
);

CREATE TYPE ims_type AS ENUM ('GitHub');

CREATE TABLE components (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    owner INTEGER NOT NULL,
    project INTEGER,
    ims INTEGER,
    ims_data JSON
);

CREATE TABLE issue_management_systems (
    id SERIAL PRIMARY KEY,
    type IMS_TYPE,
    data TEXT
);

INSERT INTO issue_management_systems (type, data) VALUES ('GitHub','{"endpoint":"https://api.github.com/graphql", "clientId":"0000", "clientSecret":"0000","redirectUri":"hallo"}');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    components INTEGER[] NOT NULL,
    ims_login JSON[] NOT NULL
);
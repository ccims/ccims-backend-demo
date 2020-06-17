DROP DATABASE ccims;

CREATE DATABASE ccims;

\connect ccims

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

CREATE TYPE ims_credential AS (
    ims integer,
    secret TEXT
);

CREATE TABLE issue_management_systems (
    id SERIAL PRIMARY KEY,
    type IMS_TYPE,
    data TEXT
);

INSERT INTO issue_managemant_systems (type, data) VALUES ('GitHub','{endpoint:"https://api.github.com/graphql", clientId:"000000"}');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    components INTEGER[] NOT NULL,
    ims_login IMS_CREDENTIAL[] NOT NULL
);

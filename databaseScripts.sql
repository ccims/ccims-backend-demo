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
    ims_type IMS_TYPE,
    imsdata JSON
);

CREATE TYPE ims_login AS (
    type IMS_TYPE,
    secret TEXT
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    components INTEGER[] NOT NULL,
    ims_login IMS_LOGIN NOT NULL
);
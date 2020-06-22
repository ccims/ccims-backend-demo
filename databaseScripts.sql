DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS components;
DROP TABLE IF EXISTS issue_management_systems;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS interfaces;
DROP TYPE IF EXISTS ims_type;

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
    projects INTEGER[],
    ims INTEGER,
    ims_data JSON,
    interfaces INTEGER[],
    consumed_interfaces INTEGER[]
);

CREATE TABLE interfaces (
    id SERIAL PRIMARY KEY,
    host_component INTEGER,
    using_components INTEGER[],
    name TEXT
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

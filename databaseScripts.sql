DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS components;
DROP TABLE IF EXISTS issue_management_systems;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS interfaces;
DROP TYPE IF EXISTS ims_type;

--\connect ccims

CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    components BIGINT[],
    owner BIGINT NOT NULL
);

CREATE TYPE ims_type AS ENUM ('GitHub');

CREATE TABLE components (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    owner BIGINT NOT NULL,
    projects BIGINT[],
    ims BIGINT,
    ims_data JSON,
    interfaces BIGINT[],
    consumed_interfaces BIGINT[]
);

CREATE TABLE interfaces (
    id BIGSERIAL PRIMARY KEY,
    host_component BIGINT,
    using_components BIGINT[],
    name TEXT
);

CREATE TABLE issue_management_systems (
    id BIGSERIAL PRIMARY KEY,
    type IMS_TYPE,
    data TEXT
);

INSERT INTO issue_management_systems (type, data) VALUES ('GitHub','{"endpoint":"https://api.github.com/graphql", "clientId":"0000", "clientSecret":"0000","redirectUri":"hallo"}');

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    components BIGINT[] NOT NULL,
    ims_login JSON[] NOT NULL
);

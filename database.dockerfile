FROM postgres

ENV POSTGRES_USER demo-user
ENV POSTGRES_PASSWORD demo-password
ENV POSTGRES_DB CCIMS

RUN mkdir -p /docker-entrypoint-initdb.d

ADD init-db.sh /docker-entrypoint-initdb.d/init-db.sh
ADD databaseScripts.sql /schema/init-db.sql

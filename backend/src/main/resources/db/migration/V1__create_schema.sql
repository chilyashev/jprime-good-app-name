CREATE TABLE conferences (
    id          BIGSERIAL PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    conference_year  INTEGER      NOT NULL
);

CREATE TABLE halls (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    conference_id   BIGINT       NOT NULL REFERENCES conferences (id)
);

CREATE TABLE sessions (
    id               BIGINT PRIMARY KEY,
    hall_name        VARCHAR(255),
    hall_id          BIGINT REFERENCES halls (id),
    title            VARCHAR(255),
    lector_name      VARCHAR(255),
    co_lector_name   VARCHAR(255),
    talk_description TEXT,
    start_time       TIMESTAMP(6),
    end_time         TIMESTAMP(6)
);

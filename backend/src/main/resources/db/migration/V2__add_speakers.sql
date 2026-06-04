CREATE TABLE speakers
(
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    conference_id BIGINT       NOT NULL REFERENCES conferences (id),
    UNIQUE (name, conference_id)
);

CREATE TABLE session_speakers
(
    session_id BIGINT NOT NULL REFERENCES sessions (id),
    speaker_id BIGINT NOT NULL REFERENCES speakers (id),
    PRIMARY KEY (session_id, speaker_id)
);

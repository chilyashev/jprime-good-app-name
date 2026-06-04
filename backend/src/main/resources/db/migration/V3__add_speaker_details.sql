ALTER TABLE speakers
    ADD COLUMN jprime_speaker_id BIGINT,
    ADD COLUMN image_url         VARCHAR(512),
    ADD COLUMN bio               TEXT;

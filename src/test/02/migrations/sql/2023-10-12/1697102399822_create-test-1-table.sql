DROP TABLE IF EXISTS test_1;

CREATE TABLE test_1(
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    position                        TEXT DEFAULT (ROUND((EXTRACT(EPOCH FROM NOW()) * (1000)::NUMERIC)) || '.000'),
    title                           TEXT UNIQUE NOT NULL,

    is_deleted                      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at                      TIMESTAMP WITH TIME ZONE,

    created_at                      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                      TIMESTAMP WITH TIME ZONE

);

CREATE INDEX idx__test_1__title ON test_1(title);

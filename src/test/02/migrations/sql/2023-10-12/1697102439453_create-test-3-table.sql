DROP TABLE IF EXISTS test_3;

CREATE TABLE test_3(
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    test_2_id                       UUID NOT NULL,

    position                        TEXT DEFAULT (ROUND((EXTRACT(EPOCH FROM NOW()) * (1000)::NUMERIC)) || '.000'),
    title                           TEXT NOT NULL,

    deleted_at                      TIMESTAMP WITH TIME ZONE,
    is_deleted                      BOOLEAN NOT NULL DEFAULT FALSE,

    created_at                      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                      TIMESTAMP WITH TIME ZONE,

    CONSTRAINT test_3_test_2_test_2_id_fk
        FOREIGN KEY(test_2_id)
            REFERENCES test_2(id) ON DELETE CASCADE

);

CREATE INDEX idx__test_3__title ON test_3(title);
CREATE INDEX idx__test_3__test_2_id ON test_3(test_2_id);

DROP TABLE IF EXISTS test_2;

CREATE TABLE test_2(
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    test_1_id                       UUID NOT NULL,

    position                        TEXT DEFAULT (ROUND((EXTRACT(EPOCH FROM NOW()) * (1000)::NUMERIC)) || '.000'),
    title                           TEXT NOT NULL,

    deleted_at                      TIMESTAMP WITH TIME ZONE,
    is_deleted                      BOOLEAN NOT NULL DEFAULT FALSE,

    created_at                      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                      TIMESTAMP WITH TIME ZONE,

    CONSTRAINT test_2_test_1_test_1_id_fk
        FOREIGN KEY(test_1_id)
            REFERENCES test_1(id) ON DELETE CASCADE

);

CREATE INDEX idx__test_2__title ON test_2(title);
CREATE INDEX idx__test_2__test_1_id ON test_2(test_1_id);

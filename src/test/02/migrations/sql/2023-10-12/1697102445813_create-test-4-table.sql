DROP TABLE IF EXISTS test_4;

CREATE TABLE test_4(
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    test_3_id                       UUID NOT NULL,

    path                            LTREE NOT NULL,
    title                           TEXT NOT NULL,

    deleted_at                      TIMESTAMP WITH TIME ZONE,
    is_deleted                      BOOLEAN NOT NULL DEFAULT FALSE,

    created_at                      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                      TIMESTAMP WITH TIME ZONE,

    CONSTRAINT test_4__test_3__test_3_id_fk
        FOREIGN KEY(test_3_id)
            REFERENCES test_3(id) ON DELETE CASCADE

);

CREATE INDEX idx_gist__test_4__path ON test_4 USING gist(path);
CREATE INDEX idx__test_4__test_3_id ON test_4(test_3_id);

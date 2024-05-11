CREATE OR REPLACE FUNCTION test_function_1() RETURNS TABLE (
    user_id BIGINT,
    first_name TEXT,
    last_name TEXT,
    row_num INT
) AS $$
    SELECT id, first_name, last_name, ROW_NUMBER() OVER (ORDER BY id) AS row_num
    FROM users
    WHERE NOT is_deleted;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION test_function_2() RETURNS TABLE (
    user_id BIGINT,
    first_name TEXT,
    last_name TEXT,
    row_num INT
) AS $$
    SELECT id, first_name, last_name, ROW_NUMBER() OVER (ORDER BY id) AS row_num
    FROM users
    WHERE NOT is_deleted;
$$ LANGUAGE SQL;

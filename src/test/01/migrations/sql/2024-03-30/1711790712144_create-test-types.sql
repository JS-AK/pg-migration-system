CREATE TYPE test_1_type AS (f1 int, f2 text);

CREATE FUNCTION fn_1() RETURNS SETOF test_1_type AS $$
    SELECT id_user_role, first_name FROM users
$$ LANGUAGE SQL;

CREATE TYPE test_2_type AS (f1 int, f2 text);

CREATE FUNCTION fn_2() RETURNS SETOF test_2_type AS $$
    SELECT id_user_role, first_name FROM users
$$ LANGUAGE SQL;

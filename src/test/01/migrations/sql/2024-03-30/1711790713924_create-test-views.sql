CREATE VIEW test_view_1 AS
    SELECT *
    FROM users
    WHERE is_deleted = false;

CREATE VIEW test_view_2 AS
    SELECT *
    FROM users
    WHERE is_deleted = false
    WITH LOCAL CHECK OPTION;

CREATE VIEW test_view_3 AS
    SELECT *
    FROM users
    WHERE is_deleted = false
    WITH CASCADED CHECK OPTION;

CREATE RECURSIVE VIEW public.nums_1_100 (n) AS
    VALUES (1)
UNION ALL
    SELECT n+1 FROM nums_1_100 WHERE n < 100;

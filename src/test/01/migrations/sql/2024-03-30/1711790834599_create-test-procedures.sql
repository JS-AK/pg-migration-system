CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(100),
    salary DECIMAL(10, 2)
);

CREATE OR REPLACE PROCEDURE add_employee(
    emp_name VARCHAR(100),
    emp_department VARCHAR(100),
    emp_salary DECIMAL(10, 2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO employees (name, department, salary) VALUES (emp_name, emp_department, emp_salary);
END;
$$;

CREATE OR REPLACE PROCEDURE get_employees_by_department(
    dep_name VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT * FROM employees WHERE department = dep_name;
END;
$$;

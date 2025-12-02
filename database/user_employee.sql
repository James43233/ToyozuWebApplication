--
-- PostgreSQL database dump
--

\restrict Kikzlc21do1JApAcbmIuzZLSoabIJ4P0Kow0Koohdd6OvbwhGIBw8IdFInJUP7Y

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: user_employee; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_employee (
    user_id integer NOT NULL,
    user_name character varying(255) NOT NULL,
    username character varying(150) NOT NULL,
    password character varying(128) NOT NULL,
    email character varying(255),
    mobile_phone character varying(20),
    role_id integer NOT NULL,
    profile_picture character varying(255),
    is_superuser boolean DEFAULT false,
    last_login timestamp without time zone,
    contact_type character varying(10) DEFAULT 'email'::character varying
);


ALTER TABLE public.user_employee OWNER TO postgres;

--
-- Name: user_employee_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_employee_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_employee_user_id_seq OWNER TO postgres;

--
-- Name: user_employee_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_employee_user_id_seq OWNED BY public.user_employee.user_id;


--
-- Name: user_employee user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_employee ALTER COLUMN user_id SET DEFAULT nextval('public.user_employee_user_id_seq'::regclass);


--
-- Name: user_employee user_employee_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_employee
    ADD CONSTRAINT user_employee_pkey PRIMARY KEY (user_id);


--
-- Name: user_employee user_employee_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_employee
    ADD CONSTRAINT user_employee_username_key UNIQUE (username);


--
-- Name: user_employee user_employee_role_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_employee
    ADD CONSTRAINT user_employee_role_id_fk FOREIGN KEY (role_id) REFERENCES public.role_type(role_id) DEFERRABLE INITIALLY DEFERRED;


--
-- PostgreSQL database dump complete
--

\unrestrict Kikzlc21do1JApAcbmIuzZLSoabIJ4P0Kow0Koohdd6OvbwhGIBw8IdFInJUP7Y


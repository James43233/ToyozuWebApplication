--
-- PostgreSQL database dump
--

\restrict Po0QaPfsaFrllUXUZ478fdqgfS7GeixBbX1ZRBhvMa184ZcvuZaZosJE6WIkl4H

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
-- Name: role_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_type (
    role_id integer NOT NULL,
    title character varying(100) NOT NULL
);


ALTER TABLE public.role_type OWNER TO postgres;

--
-- Name: role_type_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_type_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_type_role_id_seq OWNER TO postgres;

--
-- Name: role_type_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_type_role_id_seq OWNED BY public.role_type.role_id;


--
-- Name: role_type role_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_type ALTER COLUMN role_id SET DEFAULT nextval('public.role_type_role_id_seq'::regclass);


--
-- Data for Name: role_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_type (role_id, title) FROM stdin;
1	Admin
2	Staff
3	Manager
\.


--
-- Name: role_type_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_type_role_id_seq', 1, false);


--
-- Name: role_type role_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_type
    ADD CONSTRAINT role_type_pkey PRIMARY KEY (role_id);


--
-- PostgreSQL database dump complete
--

\unrestrict Po0QaPfsaFrllUXUZ478fdqgfS7GeixBbX1ZRBhvMa184ZcvuZaZosJE6WIkl4H


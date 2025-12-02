--
-- PostgreSQL database dump
--

\restrict ekFBrCTgOHBkDaoymwpMKdx2OUf0FY5EZkRKpeNl3vtiZ2X3gZnN44FVw9r14lD

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

--
-- Data for Name: user_employee; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_employee (user_id, user_name, username, password, email, mobile_phone, role_id, profile_picture, is_superuser, last_login, contact_type) FROM stdin;
1	James Paul U. Carballo	james43233	bcrypt_sha256$$2b$12$jNNtV.vmYZ1Nui75kdGbjeD1gy7zE1epb7uoxPvEy2Sj6p1ErVCZi	jamespcarba@gmail.com	09956105351	1		f	\N	email
7	John Williams	JohnW	bcrypt_sha256$$2b$12$vt4HZi/yQehUyEJebPvnse9MFDjbgzm4/qRA59iNgH8NthkarcFqG	\N	\N	3		f	\N	email
8	Lance Andres	lansvl	bcrypt_sha256$$2b$12$PlxeT6nAeZZvOOGRk1i7NOmBLJUZkOeQtgvXpW.sYMxnbY2qJ2bz2	\N	\N	1		f	\N	email
9	kissy	kcsoria	bcrypt_sha256$$2b$12$ksvS074i8G2rZbqxGdHuRuXseQPsVc/I5uV5/aeZP91oMZSZwa60G	\N	\N	1		f	\N	email
11	Paul	peenpapi	bcrypt_sha256$$2b$12$ga1es5G1AkzwrXk1A0cBN.ZffuYQqQ8Hl9Zd192bP.tx9EJpfLy3i	picsforsale0521@gmail.com	09956105351	1	\N	f	\N	email
12	Carballo	papicholo	bcrypt_sha256$$2b$12$Sr87SSBtaRi13moNRFRbXuZHWxarRTKEF2jseXOs93m29Ls.C73mW		09561053511	2	\N	f	\N	email
13	JC	jcataal	bcrypt_sha256$$2b$12$LuepaO1cQpMfhAzcrvz.l.4GGuNruHtq93YOs8WG9fvhpNVgsXH/i	jcreycataal1217@gmail.com	09202423783	2	\N	f	\N	email
14	Angela Acebedo	acacebedo	bcrypt_sha256$$2b$12$1XFIMAfYLs2XpU/fXPyq2.UC4AHsDOBGfrNlxwpY.cH1Aiv39fvku	acacebedo@mcm.edu.ph	09437260913	3	\N	f	\N	email
15	sample lang	samplelang	bcrypt_sha256$$2b$12$32S16KfGZeT1XEhIV2nZbeuD4/jVrXhlVN6ihtjoBTvAli0MLnICq	samplelang@gmail.com	092310401231	3	\N	f	\N	email
\.


--
-- Name: user_employee_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_employee_user_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict ekFBrCTgOHBkDaoymwpMKdx2OUf0FY5EZkRKpeNl3vtiZ2X3gZnN44FVw9r14lD


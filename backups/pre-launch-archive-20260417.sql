--
-- PostgreSQL database dump
--

\restrict 93zh9SZYaBx41ucAdKM5ZE19HOcVEVHAQF65K5YuGXShd8eX3bMjpEHy5vQCEIT

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: users_invoicecondition_enum; Type: TYPE; Schema: public; Owner: lensia
--

CREATE TYPE public.users_invoicecondition_enum AS ENUM (
    'consumidor_final',
    'responsable_inscripto',
    'monotributista',
    'exento'
);


ALTER TYPE public.users_invoicecondition_enum OWNER TO lensia;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: lensia
--

CREATE TYPE public.users_role_enum AS ENUM (
    'cliente',
    'optica',
    'medico',
    'admin'
);


ALTER TYPE public.users_role_enum OWNER TO lensia;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: dispute_messages; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.dispute_messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "senderRole" character varying NOT NULL,
    message text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "disputeId" uuid,
    "senderId" uuid
);


ALTER TABLE public.dispute_messages OWNER TO lensia;

--
-- Name: dispute_photos; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.dispute_photos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "imageUrl" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "disputeId" uuid
);


ALTER TABLE public.dispute_photos OWNER TO lensia;

--
-- Name: disputes; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.disputes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reason character varying NOT NULL,
    comment character varying,
    status character varying DEFAULT 'open'::character varying NOT NULL,
    "adminDecision" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "orderId" uuid,
    "openedById" uuid
);


ALTER TABLE public.disputes OWNER TO lensia;

--
-- Name: frames; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.frames (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    brand character varying NOT NULL,
    model character varying NOT NULL,
    material character varying,
    color character varying,
    "priceMin" numeric,
    "priceMax" numeric,
    "styleTags" text,
    "arReady" boolean DEFAULT false NOT NULL,
    "arAssetUrl" character varying,
    "imageUrl" character varying,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "opticaId" uuid
);


ALTER TABLE public.frames OWNER TO lensia;

--
-- Name: medico_locations; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.medico_locations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    address character varying NOT NULL,
    lat numeric,
    lng numeric,
    schedule jsonb,
    "medicoId" uuid
);


ALTER TABLE public.medico_locations OWNER TO lensia;

--
-- Name: medico_ratings; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.medico_ratings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    score integer NOT NULL,
    comment character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "medicoId" uuid,
    "clientId" uuid
);


ALTER TABLE public.medico_ratings OWNER TO lensia;

--
-- Name: medicos; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.medicos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "fullName" character varying NOT NULL,
    specialty character varying NOT NULL,
    "licenseNumber" character varying,
    "obrasSociales" text,
    rating numeric,
    "ratingCount" integer DEFAULT 0 NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" uuid
);


ALTER TABLE public.medicos OWNER TO lensia;

--
-- Name: optica_ratings; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.optica_ratings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    score integer NOT NULL,
    comment character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "opticaId" uuid,
    "clientId" uuid,
    "orderId" uuid
);


ALTER TABLE public.optica_ratings OWNER TO lensia;

--
-- Name: opticas; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.opticas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "businessName" character varying NOT NULL,
    cuit character varying,
    address character varying,
    lat numeric,
    lng numeric,
    phone character varying,
    "isVerified" boolean DEFAULT false NOT NULL,
    "referralCode" character varying,
    "referredBy" character varying,
    "discountUntil" timestamp without time zone,
    "discountRate" numeric,
    "responseRate" numeric DEFAULT '0'::numeric NOT NULL,
    "totalResponseCount" integer DEFAULT 0 NOT NULL,
    "totalRequestCount" integer DEFAULT 0 NOT NULL,
    "subscriptionTier" character varying DEFAULT 'free'::character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" uuid,
    rating numeric,
    "ratingCount" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.opticas OWNER TO lensia;

--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.order_status_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    status character varying NOT NULL,
    note character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "orderId" uuid
);


ALTER TABLE public.order_status_history OWNER TO lensia;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    status character varying DEFAULT 'payment_pending'::character varying NOT NULL,
    amount numeric,
    "commissionAmount" numeric,
    "mpPaymentId" character varying,
    "deliveredAt" timestamp without time zone,
    "verificationDeadline" timestamp without time zone,
    "completedAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "quoteId" uuid,
    "clientId" uuid,
    "opticaId" uuid,
    "selectedFrameId" uuid,
    "paymentDeadline" timestamp without time zone,
    "paymentMode" character varying DEFAULT 'full'::character varying NOT NULL,
    "depositAmount" numeric,
    "deliveryMethod" character varying DEFAULT 'pickup'::character varying NOT NULL,
    "deliveryAddress" text
);


ALTER TABLE public.orders OWNER TO lensia;

--
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.platform_settings (
    key character varying NOT NULL,
    value text NOT NULL,
    description character varying,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.platform_settings OWNER TO lensia;

--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.prescriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "imageUrl" character varying NOT NULL,
    notes character varying,
    "isProcessed" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "clientId" uuid,
    "aiTranscription" text
);


ALTER TABLE public.prescriptions OWNER TO lensia;

--
-- Name: quote_frames; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.quote_frames (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "quoteId" uuid,
    "frameId" uuid
);


ALTER TABLE public.quote_frames OWNER TO lensia;

--
-- Name: quote_requests; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.quote_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "lensType" character varying,
    "priceRangeMin" character varying,
    "priceRangeMax" character varying,
    "stylePreferences" text,
    "clientLat" numeric NOT NULL,
    "clientLng" numeric NOT NULL,
    status character varying DEFAULT 'open'::character varying NOT NULL,
    "quotesReceived" integer DEFAULT 0 NOT NULL,
    "expiresAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "clientId" uuid,
    "prescriptionId" uuid,
    "serviceType" character varying DEFAULT 'lentes_receta'::character varying NOT NULL,
    observations text,
    gender character varying
);


ALTER TABLE public.quote_requests OWNER TO lensia;

--
-- Name: quotes; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.quotes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "totalPrice" numeric NOT NULL,
    "lensDescription" character varying,
    "estimatedDays" character varying,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "requestId" uuid,
    "opticaId" uuid,
    "expiresAt" timestamp without time zone,
    "tierBasicPrice" numeric,
    "tierBasicDesc" character varying,
    "tierRecommendedPrice" numeric,
    "tierRecommendedDesc" character varying,
    "tierPremiumPrice" numeric,
    "tierPremiumDesc" character varying,
    "selectedTier" character varying
);


ALTER TABLE public.quotes OWNER TO lensia;

--
-- Name: request_opticas; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.request_opticas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "requestId" uuid,
    "opticaId" uuid
);


ALTER TABLE public.request_opticas OWNER TO lensia;

--
-- Name: users; Type: TABLE; Schema: public; Owner: lensia
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    role public.users_role_enum DEFAULT 'cliente'::public.users_role_enum NOT NULL,
    "fullName" character varying NOT NULL,
    phone character varying,
    "isApproved" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "resetToken" character varying,
    "resetTokenExpiry" timestamp without time zone,
    "isEmailVerified" boolean DEFAULT false NOT NULL,
    "emailVerifyToken" character varying,
    cuit character varying,
    "razonSocial" character varying,
    "invoiceCondition" public.users_invoicecondition_enum
);


ALTER TABLE public.users OWNER TO lensia;

--
-- Data for Name: dispute_messages; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.dispute_messages (id, "senderRole", message, "createdAt", "disputeId", "senderId") FROM stdin;
2d244707-4d69-4b07-9ba3-4620efc90323	admin	hola como podemos ayudarte?	2026-04-13 14:27:47.483521	e5555e2c-4cd9-495a-90b3-8d8859466386	1c5eb771-888b-4833-9b97-90665e48bdeb
d5ffcfc2-ffeb-4657-b95e-2574b97a8146	admin	hola	2026-04-13 14:29:18.010615	e5555e2c-4cd9-495a-90b3-8d8859466386	1c5eb771-888b-4833-9b97-90665e48bdeb
d1ce94ed-76c0-4138-917d-9561f8da3677	admin	hola	2026-04-13 14:43:05.414398	e5555e2c-4cd9-495a-90b3-8d8859466386	1c5eb771-888b-4833-9b97-90665e48bdeb
85c3c855-b840-478a-a777-09f414e19d45	admin	hola	2026-04-13 14:43:08.452927	e5555e2c-4cd9-495a-90b3-8d8859466386	1c5eb771-888b-4833-9b97-90665e48bdeb
ad63f911-a008-4907-acc2-313184b71252	optica	voy A RESOLVER EL PROBLEMA	2026-04-13 15:32:11.875481	e5555e2c-4cd9-495a-90b3-8d8859466386	764a0320-c05b-476c-a691-baeb4fa3423a
02e9ba66-9c0e-4bd3-abe1-af4ba833ddc3	cliente	ESPERARE A QUE SE RESUELVA	2026-04-13 15:32:34.059225	e5555e2c-4cd9-495a-90b3-8d8859466386	eb65c951-041e-48b0-bf6e-bc5602239537
39aeb889-52c5-4e72-b92c-9d6b05923dd2	optica	[Sistema] La óptica marcó la corrección como completada. Esperando confirmación del cliente.	2026-04-13 19:21:05.112088	e5555e2c-4cd9-495a-90b3-8d8859466386	764a0320-c05b-476c-a691-baeb4fa3423a
33f6ac8b-f73c-4c2d-acbd-a2f665ae730b	cliente	[Sistema] El cliente confirmó la corrección. Disputa cerrada y pago liberado a la óptica.	2026-04-13 19:21:33.246862	e5555e2c-4cd9-495a-90b3-8d8859466386	eb65c951-041e-48b0-bf6e-bc5602239537
97c80ea8-8026-4b7d-8232-790d1f64391f	optica	que es lo que sucede?	2026-04-13 20:23:57.081799	93913f5b-807c-43da-ac26-b981a5969c2a	a22c74e8-c1c8-492c-8dea-24e0e21cacf3
52228fb0-f522-4f77-9bf6-7527874831ca	admin	hola, me pueden decir que paso?	2026-04-13 23:10:32.478103	2e193d01-3e17-4aa3-acc9-3983c7af7d41	1c5eb771-888b-4833-9b97-90665e48bdeb
bb6b359e-e1d1-4d0d-9cc6-c6536b965bcb	optica	si esta perfectop	2026-04-13 23:10:58.803334	2e193d01-3e17-4aa3-acc9-3983c7af7d41	764a0320-c05b-476c-a691-baeb4fa3423a
94b178b3-e04b-4a86-a28b-25f76d687fdd	optica	LA CLIENTA ES UNA IMBECIL, INDECISA QUE NO SABE NI LO QUE QUIERE. ENCIMA ESTA EMBARAZADA ASIQUE DICEN QUE SE PONEN INFUMABLE Y APARENTEMENTE NO ES MENTIRA.. POBRE EL MARIDO	2026-04-14 21:59:43.898296	1d9b9a28-525c-409f-b3e3-aae924eb2c60	764a0320-c05b-476c-a691-baeb4fa3423a
\.


--
-- Data for Name: dispute_photos; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.dispute_photos (id, "imageUrl", "createdAt", "disputeId") FROM stdin;
74bc837f-3d0e-498f-baa2-b2df3952be32	/uploads/disputes/1776090403428-382195.png	2026-04-13 14:26:43.632043	e5555e2c-4cd9-495a-90b3-8d8859466386
58d161e3-d926-4a32-a06d-9b25444f6f61	/uploads/disputes/1776111784056-231711.png	2026-04-13 20:23:04.20953	93913f5b-807c-43da-ac26-b981a5969c2a
d6e1ec44-4e77-442d-86da-3ab4354ccc1b	/uploads/disputes/1776121806016-673653.png	2026-04-13 23:10:06.258273	2e193d01-3e17-4aa3-acc9-3983c7af7d41
a8027d68-76f9-4180-90bc-6318f845ee03	/uploads/disputes/1776203936723-189137.jpeg	2026-04-14 21:58:56.82126	1d9b9a28-525c-409f-b3e3-aae924eb2c60
\.


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.disputes (id, reason, comment, status, "adminDecision", "createdAt", "updatedAt", "orderId", "openedById") FROM stdin;
e5555e2c-4cd9-495a-90b3-8d8859466386	wrong_prescription	\N	resolved	Admin resolved: correction	2026-04-13 14:26:43.610432	2026-04-13 19:21:33.158151	343ba299-2966-47e7-a333-6d3572e13483	eb65c951-041e-48b0-bf6e-bc5602239537
93913f5b-807c-43da-ac26-b981a5969c2a	other	malisimo trabajo	refunded	Admin resolved: refund	2026-04-13 20:23:04.197439	2026-04-13 20:24:24.681036	5150c763-6e63-4204-976c-2842e90caa74	eb65c951-041e-48b0-bf6e-bc5602239537
2e193d01-3e17-4aa3-acc9-3983c7af7d41	wrong_prescription	esto es un desastre	resolved	Admin resolved: release	2026-04-13 23:10:06.249754	2026-04-13 23:14:09.528977	582a0e85-404b-41e2-a409-d77429c50337	eb65c951-041e-48b0-bf6e-bc5602239537
1d9b9a28-525c-409f-b3e3-aae924eb2c60	other	el optico me puso cara de culo y me cae mal. muy mal	resolved	Admin resolved: release	2026-04-14 21:58:56.814273	2026-04-14 22:01:37.667625	9a2233c8-f4e1-45d3-83a4-0413ddc57656	eb65c951-041e-48b0-bf6e-bc5602239537
\.


--
-- Data for Name: frames; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.frames (id, brand, model, material, color, "priceMin", "priceMax", "styleTags", "arReady", "arAssetUrl", "imageUrl", "isActive", "createdAt", "opticaId") FROM stdin;
d96c426e-3507-41d3-9d8a-ed0908774753	zc	zx	Metal	zxc	123333	123333	\N	f	\N	/uploads/catalog/1775305782501-43531.png	f	2026-04-04 12:29:42.525364	b738e8bf-3534-4956-9ec7-5301a47b0afa
1136c1d4-3f58-41e1-8f40-1e1e5344fae7	as	asd	Metal	asd	123	123	\N	f	\N	/uploads/catalog/1775305826010-6342.webp	f	2026-04-04 12:30:26.022803	b738e8bf-3534-4956-9ec7-5301a47b0afa
bbbd9bfe-fc5a-4484-b39c-06fb32f7e22b	Optic100	9066	Acetato	Verde	40000	40000	\N	f	\N	/uploads/catalog/1776199219714-954893.jpg	t	2026-04-14 20:40:19.734008	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
28b89156-c147-472e-a2b9-33aae7f43fbb	Optic100	57015	Acetato	Gris transparente	40000	40000	\N	f	\N	/uploads/catalog/1776199386614-686618.jpg	t	2026-04-14 20:43:06.64285	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
4c76e40b-cc3b-4bff-aa42-484600bd44e9	123	sda	Metal	nwggg	1	1	\N	f	\N	/uploads/catalog/1775592592715-939007.webp	t	2026-04-07 20:09:52.727155	b738e8bf-3534-4956-9ec7-5301a47b0afa
0869ab69-4847-424f-9d54-e95275c85c82	asdsa	asda	Metal	ass	123333	123333	\N	f	\N	/uploads/catalog/1775478428808-782781.webp	f	2026-04-06 12:27:08.827857	5ced47ba-406d-42fe-9cea-c63c70189a5d
92af84ba-52cc-4429-8e40-b182fa134ad1	Optic100	9036	Acetato	Caramelo	40000	40000	\N	f	\N	/uploads/catalog/1776199483762-380773.jpg	t	2026-04-14 20:44:43.783789	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
16f3837f-b823-4213-8dec-192d6bd4b1d1	sdf	e4ed	Metal	3433	12	12	\N	f	\N	/uploads/catalog/1775735520331-145272.webp	f	2026-04-09 11:52:00.934616	5ced47ba-406d-42fe-9cea-c63c70189a5d
98404044-896b-407b-ada7-b91e00ba98a1	Rusty	Xold mblk	Acetato	Negro mate	115000	115000	\N	f	\N	/uploads/catalog/1776197580906-382997.jpg	t	2026-04-14 20:13:00.979255	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
10fa0015-17c8-4122-ad2a-4a1f7c408ac1	Vulk	Be again	Acetato	Gris mate con negro	120000	120000	\N	f	\N	/uploads/catalog/1776197694652-53519.jpg	t	2026-04-14 20:14:54.675253	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
9f14877c-309f-4310-91e5-fa6aa4adc0c7	Rusty	Hopels c2	Acetato	Marrón con gris traslúcido 	135000	135000	\N	f	\N	/uploads/catalog/1776197460614-548116.jpg	t	2026-04-14 20:10:33.088266	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
40dfad7c-1f07-445c-800e-48dbc1b353bc	rayra	ras	Metal	123	122328	122328	\N	t	\N	/uploads/catalog/1775735644046-223923.png	f	2026-04-06 11:41:26.565142	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
70579035-c6e4-478c-8823-9dba3532d354	freda	freda	Metal	blue	122000	122000	\N	f	\N	/uploads/catalog/1775678311234-157413.png	f	2026-04-08 19:58:31.271596	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
039b5db4-baf0-41e0-b596-69fb07b5da41	456	5555	Metal	123	120	120	\N	t	\N	/uploads/catalog/1775736011183-564821.webp	t	2026-04-09 12:00:11.203917	b738e8bf-3534-4956-9ec7-5301a47b0afa
53457603-7162-4a7e-a786-3f7716e42a98	roybon	free	Metal	aera	12000	12000	\N	f	\N	/uploads/catalog/1776108314834-640967.png	t	2026-04-13 19:25:14.865383	b738e8bf-3534-4956-9ec7-5301a47b0afa
953559ac-7063-4093-a2c4-f91f20b7a502	dasda	asdada	Metal	asda	23333	23333	\N	f	\N	/uploads/catalog/1776108328720-221577.webp	t	2026-04-13 19:25:28.738255	b738e8bf-3534-4956-9ec7-5301a47b0afa
4033f4cd-91bd-40f0-9f86-6ab7cf59b13b	sea	seef	Acetato	232	23111	23111	\N	f	\N	/uploads/catalog/1776108382508-43792.jpeg	f	2026-04-13 19:26:22.530248	b738e8bf-3534-4956-9ec7-5301a47b0afa
d8779af8-5e7e-4e42-ab63-5e3923b0efb7	aseda	213	Metal	sad	22333	22333	\N	f	\N	/uploads/catalog/1776108347007-849920.png	f	2026-04-13 19:25:47.036061	b738e8bf-3534-4956-9ec7-5301a47b0afa
b1392ea3-f7be-41e6-8ad1-c62a4b96a0a2	ewsa	232	Metal	sda	22333	22333	\N	f	\N	/uploads/catalog/1776108361292-764372.png	f	2026-04-13 19:26:01.313567	b738e8bf-3534-4956-9ec7-5301a47b0afa
4b508ab7-ee5c-48ea-b08a-6accf4558ba5	tifany	4618	Metal	c04	195000	195000	\N	f	\N	/uploads/catalog/1776350162562-150914.jpeg	t	2026-04-16 14:36:02.58035	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
e71559cd-6e19-4500-bca2-ed93ba844bd0	rooiybon	aseqq	Metal	neg	-1	-1	\N	f	\N	/uploads/catalog/1775592517492-278600.webp	f	2026-04-07 20:08:37.505538	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
afae492b-43b5-4100-8f4b-9c2b5c5d0485	Mama	134	Metal	Negro	120000	120000	\N	f	\N	/uploads/catalog/1776177393961-435274.jpg	f	2026-04-14 14:36:33.993076	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
cadc909b-f252-4c95-9157-45c137c3e54a	gyor	crow	Acetato		155000	155000	\N	f	\N	/uploads/catalog/1776108817431-23065.png	f	2026-04-13 19:33:37.471084	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
90f41835-4ef7-40b2-85ba-d48216ee2ad1	gasw	esasa	Metal	2	23333	23333	\N	f	\N	/uploads/catalog/1775687032315-173651.webp	f	2026-04-08 22:23:52.371754	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
df48c7c2-d5c3-4d8f-bbf2-ab0c6c6c1db9	vulk	rs aftermath	Acetato	negro mate	159720	159720	\N	f	\N	/uploads/catalog/1776350250126-949670.jpeg	t	2026-04-16 14:37:30.151566	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
29229f42-e869-4e39-8609-7bd0d3558b2b	Rusty	Jsjsj	Metal	Njbv	120000	120000	\N	f	\N	/uploads/catalog/1776198035478-878547.jpg	f	2026-04-14 20:20:35.501665	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
93e0ba97-6072-4acf-9d84-628b5d87b19e	Optic100	9053	Acetato	Negro mate	40000	40000	\N	f	\N	/uploads/catalog/1776198113729-54399.jpg	t	2026-04-14 20:21:53.752025	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
bc723c4e-105e-440c-8e4e-f889177f0abb	Eco	9221	Acetato	Animal print	40000	40000	\N	f	\N	/uploads/catalog/1776198383205-89730.jpg	t	2026-04-14 20:26:23.263318	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
761ac728-ff23-4007-b72b-fd3628a5b88d	Fosco	Fofk39	Metal	Dorado	40000	40000	\N	f	\N	/uploads/catalog/1776198627463-86090.jpg	t	2026-04-14 20:30:27.483929	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
686dfaea-b8de-4647-8b81-3e0e8f201ce9	Eco	2117	Acetato	Negro brillo	40000	40000	\N	f	\N	/uploads/catalog/1776198690048-321637.jpg	t	2026-04-14 20:31:30.14528	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
86503dcb-84b9-40fe-b315-2096b2fd0911	Gdk	Gdk13	Acetato	Rosa mate	155000	155000	\N	f	\N	/uploads/catalog/1776198807376-123452.jpg	t	2026-04-14 20:33:27.399485	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
16af3025-2916-4260-8694-9845320bfea4	Batman	Detective	Acetato	Azul niño	155000	155000	\N	f	\N	/uploads/catalog/1776198918494-430878.jpg	t	2026-04-14 20:35:18.515704	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
2be50cea-8c03-4fdb-b044-f0d811801ce2	Optic100	9040	Acetato	Rojo traslúcido 	40000	40000	\N	f	\N	/uploads/catalog/1776199128068-578399.jpg	t	2026-04-14 20:38:48.134259	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
6d598b6f-9578-4d9c-9800-0bd058b50651	optitech	Bb	Acetato	negro y rojo	180000	180000	\N	f	\N	/uploads/catalog/1776108740713-868748.jpg	t	2026-04-13 19:32:20.733258	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
492bfc10-1ea6-4fb4-9594-a87e89127ed8	ray ban	rb7251l	Acetato	caramel	239000	239000	\N	f	\N	/uploads/catalog/1776349360502-879295.jpeg	t	2026-04-16 14:22:40.521846	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
bff8640e-ddb9-4cf1-9be1-cfb2e8bdd31d	viv	nu2518	Acetato	traslucido	176176	176176	\N	f	\N	/uploads/catalog/1776349554013-226966.jpeg	t	2026-04-16 14:25:54.031099	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
3a5af46a-a52c-43a5-b09a-238d0952eba9	rusty	bruice	Acetato	traslucido	147500	147500	\N	f	\N	/uploads/catalog/1776349601948-412421.jpeg	t	2026-04-16 14:26:41.965793	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
4b0b0981-51fb-4393-a1fc-486d0dfe6912	fleur	fl305	Acetato	c2	197000	197000	\N	f	\N	/uploads/catalog/1776349683961-287348.jpeg	t	2026-04-16 14:28:03.990927	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
3c9b1f98-86dd-45f7-abea-001ea72395d5	hardem	minsk	Acetato	col2	176176	176176	\N	f	\N	/uploads/catalog/1776349788493-931860.jpeg	t	2026-04-16 14:29:48.506236	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
0860fde7-943d-4778-a155-6df0e0a5d2b4	valdez	10092	Metal	negro/dorado	185856	185856	\N	f	\N	/uploads/catalog/1776349846948-692097.jpeg	t	2026-04-16 14:30:46.970103	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
4b848c04-3c0a-41cf-b5d5-f77024ab032a	vulk	katleen	Acetato	caramel	140400	140400	\N	f	\N	/uploads/catalog/1776349891666-469503.jpeg	t	2026-04-16 14:31:31.682183	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
710e5681-a10e-4be5-b830-2914fcf63ddd	valdez	10064	Metal	c2	188760	188760	\N	f	\N	/uploads/catalog/1776349924084-252137.jpeg	t	2026-04-16 14:32:04.110316	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
15b88efb-28bf-455d-85c2-f91feed3e8ae	vulk	harry	Acetato	traslucido gris	130000	130000	\N	f	\N	/uploads/catalog/1776349962375-793654.jpeg	t	2026-04-16 14:32:42.393305	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
4547ec6f-dea1-40ca-825c-7b70819277a6	vulk	dieven	Acetato	mdemi	129970	129970	\N	f	\N	/uploads/catalog/1776350308422-57637.jpeg	t	2026-04-16 14:38:28.443196	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
af1ec7ee-5c5d-4130-aa58-66ae721a3400	max polar	magic421	Metal	c2	165000	165000	\N	f	\N	/uploads/catalog/1776350359953-830879.jpeg	t	2026-04-16 14:39:19.966036	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
99b5d0f8-c37d-433c-9840-07e39cb2bc87	blitz	rubber	Acetato	gris con roza 	120000	120000	\N	f	\N	/uploads/catalog/1776350431727-90541.jpeg	t	2026-04-16 14:40:31.74674	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
8584653f-144a-42ba-b80b-6fa7f31ebe71	wanama	1123	Acetato	c1	192970	192970	\N	f	\N	/uploads/catalog/1776350520668-81908.jpeg	t	2026-04-16 14:42:00.683925	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
\.


--
-- Data for Name: medico_locations; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.medico_locations (id, address, lat, lng, schedule, "medicoId") FROM stdin;
\.


--
-- Data for Name: medico_ratings; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.medico_ratings (id, score, comment, "createdAt", "medicoId", "clientId") FROM stdin;
9812cd5d-1b90-4cbe-b139-1f09e7f96910	5	excelente profesional	2026-04-16 12:17:47.72658	1a0ca7a7-f8ed-40e7-9a48-fa63e53877d1	f70b1c45-4811-4e93-9bb6-390f5e75f8d4
\.


--
-- Data for Name: medicos; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.medicos (id, "fullName", specialty, "licenseNumber", "obrasSociales", rating, "ratingCount", "isVerified", "createdAt", "userId") FROM stdin;
1a0ca7a7-f8ed-40e7-9a48-fa63e53877d1	carlos guzman	oftalmologo	MN123	\N	5	1	t	2026-04-16 12:16:26.830732	f70b1c45-4811-4e93-9bb6-390f5e75f8d4
\.


--
-- Data for Name: optica_ratings; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.optica_ratings (id, score, comment, "createdAt", "opticaId", "clientId", "orderId") FROM stdin;
24c24539-b475-46a9-9935-1a491391e6c6	5	excelente	2026-04-13 14:21:26.366574	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	eb65c951-041e-48b0-bf6e-bc5602239537	9c47d8cc-f26f-43f4-8ffa-a06af6b30417
7644a843-f078-4c1c-b855-af959854a5d1	5	\N	2026-04-13 14:55:15.358165	b738e8bf-3534-4956-9ec7-5301a47b0afa	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	501f1c57-c175-4216-bd54-4ee8a5b5c0ef
3d189bb1-9c12-42fc-9b06-3db740dbdad3	5	\N	2026-04-13 20:17:00.160899	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	5b22bab5-0cd1-4503-9c01-79f1b6071e56
8a5b161f-0462-411b-a150-34cc3cb9bd2c	5	\N	2026-04-13 20:19:39.368276	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	eb65c951-041e-48b0-bf6e-bc5602239537	6094ca25-7842-412a-8f8a-2de01e4607aa
904bbb4b-4768-4198-940d-208cf0942904	5	\N	2026-04-13 20:20:01.302545	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	eb65c951-041e-48b0-bf6e-bc5602239537	c337f52e-8f68-4476-a84f-8312dfdd8dd1
84bfeabb-4fde-4d76-b883-e5db97e4e43a	5	lujo	2026-04-14 14:32:37.36274	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	eb65c951-041e-48b0-bf6e-bc5602239537	536be370-f6d4-4133-8a96-f76b3251355a
44319637-9006-4fdb-8fb7-3223db904fb1	5	\N	2026-04-15 23:01:48.139656	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	eb65c951-041e-48b0-bf6e-bc5602239537	f09d2f95-ebd5-4812-9962-6c84c0d43d0e
8a7b0172-c9e9-412b-933a-e8754ec77843	5	\N	2026-04-16 12:11:51.816873	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	eb65c951-041e-48b0-bf6e-bc5602239537	66955b6c-6a0e-47c3-8371-9d83898d4d40
\.


--
-- Data for Name: opticas; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.opticas (id, "businessName", cuit, address, lat, lng, phone, "isVerified", "referralCode", "referredBy", "discountUntil", "discountRate", "responseRate", "totalResponseCount", "totalRequestCount", "subscriptionTier", "createdAt", "userId", rating, "ratingCount") FROM stdin;
5ced47ba-406d-42fe-9cea-c63c70189a5d	Óptica Visión Norte	\N	\N	\N	\N	\N	f	89AF9CA6	\N	\N	\N	0	0	33	free	2026-04-06 11:47:28.848562	6eeb4336-6ecf-468f-9e61-8cabcb5cd990	\N	0
8eab78e1-09b0-4f81-9f4a-9dc7a090551e	Óptica Edreira	\N	17 nro 929	-26.332916	-60.4367148	2302205845	f	0D72C720	\N	\N	\N	0	0	33	free	2026-04-04 12:35:46.635164	764a0320-c05b-476c-a691-baeb4fa3423a	5	7
b738e8bf-3534-4956-9ec7-5301a47b0afa	optica edreira beat	\N	17 nro 929	-26.332916	-60.4367148	2302693990	f	84CC8461	\N	\N	\N	0	0	33	free	2026-04-04 12:29:27.776008	a22c74e8-c1c8-492c-8dea-24e0e21cacf3	5	1
\.


--
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.order_status_history (id, status, note, "createdAt", "orderId") FROM stdin;
fa216469-657b-4831-8605-a9d1f37964a1	payment_pending	Order created	2026-04-06 20:29:06.137024	5150c763-6e63-4204-976c-2842e90caa74
cdbb8893-bd38-4dd1-b74d-bbc183e66af1	payment_pending	Order created	2026-04-06 21:35:02.398639	c337f52e-8f68-4476-a84f-8312dfdd8dd1
51ab8760-92f8-4e2d-86e7-c6b5aef3c23b	payment_pending	Order created	2026-04-06 21:49:17.720106	5b22bab5-0cd1-4503-9c01-79f1b6071e56
91df2c71-68d8-46f9-ae8d-bb21d25ef527	payment_pending	Order created	2026-04-06 22:09:06.383563	ebb14b34-6e2d-4508-99cb-9fd4744ba3cf
df070300-6e9c-4495-92bf-4b3d78c94153	payment_pending	Order created	2026-04-06 23:13:25.595378	501f1c57-c175-4216-bd54-4ee8a5b5c0ef
0c1b7822-705e-43e2-a95a-ab74d7b21657	payment_pending	Order created	2026-04-07 01:46:52.197307	6094ca25-7842-412a-8f8a-2de01e4607aa
cd41cdf0-7003-4782-8400-764623fea103	payment_pending	Order created	2026-04-08 15:34:15.371491	9e5464f5-3795-4f10-9d8a-a5305108ee87
882c5b7b-8e93-4f3b-b88c-c6d332d362aa	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-08 15:56:00.109766	9e5464f5-3795-4f10-9d8a-a5305108ee87
84a8ac51-62a5-4985-bd17-fdef9e53ada4	payment_pending	Order created	2026-04-08 19:58:50.326392	86b34597-1df2-4aff-9874-912625150ad8
878ae247-09e7-4d91-bd45-8e8cc20f359c	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-08 20:20:00.503713	86b34597-1df2-4aff-9874-912625150ad8
1d277ca0-b683-44af-8104-e7e5241ca035	payment_pending	Order created	2026-04-08 21:13:17.220671	5d26bf47-dc5e-4d6c-b4f4-eabb866565a7
c4e2e108-6599-4a1d-ab91-79623d83a885	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-08 21:34:00.084175	5d26bf47-dc5e-4d6c-b4f4-eabb866565a7
c41c8cfa-8050-4364-89b9-262863967611	payment_pending	Order created	2026-04-08 22:19:07.359031	e56b57f1-56c7-49aa-9dc6-0ed7e9ec03e6
d4aace6e-be2e-413f-95b7-aa1a0798875a	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-08 22:40:00.218422	e56b57f1-56c7-49aa-9dc6-0ed7e9ec03e6
3cbd3932-3b83-4d01-93c6-fbaf87f8c2f7	payment_pending	Order created	2026-04-09 11:34:09.321131	40b986fc-4393-46f3-a2df-a0f51398498b
57c2ca7b-8968-4cc5-951f-9983a161ac4f	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-09 11:56:00.094186	40b986fc-4393-46f3-a2df-a0f51398498b
60590cdc-ecd9-4870-a6f1-46c961048a5c	payment_pending	Order created	2026-04-09 14:45:10.947441	a779d70b-5bbe-4ff1-b575-9fb0a974eca0
cd256777-4893-4c25-8121-4a1bff40288f	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-09 15:06:00.091036	a779d70b-5bbe-4ff1-b575-9fb0a974eca0
be729cb9-b8e9-4997-9378-a67d14a5d9c6	payment_pending	Order created	2026-04-09 22:28:31.73553	127e0101-30f1-4f85-999e-46afc819aed4
2a2ee7cf-264f-4adc-8280-9e2c885adea0	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-09 22:50:00.181899	127e0101-30f1-4f85-999e-46afc819aed4
a33a27b2-f70c-4c46-a811-61e9efa0a3e4	payment_pending	Order created	2026-04-10 00:08:17.156242	4643a659-6cc0-40e7-8a41-0838cdc7b61d
f1464ee5-5332-4397-b11a-3f1c364c2c1b	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-10 00:30:00.149375	4643a659-6cc0-40e7-8a41-0838cdc7b61d
fd56e58a-4b39-4ce3-a388-386634d925d3	payment_pending	Order created	2026-04-10 01:12:22.808513	bcfe7e4b-c4f5-4ab6-9402-a01e55e498e5
9ba161a0-a4d3-427e-b093-d877ee65fe0a	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-10 01:34:00.117627	bcfe7e4b-c4f5-4ab6-9402-a01e55e498e5
8d47cc09-fca8-451c-8085-8d7378df9783	payment_pending	Order created	2026-04-10 01:56:45.461133	cc6ff94d-293a-42c7-a777-4724da8af9ea
c8ba84dc-4f66-4574-a6f2-26f43df5ddc6	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-10 02:18:00.140162	cc6ff94d-293a-42c7-a777-4724da8af9ea
e43ce5e4-af75-49ea-a4ea-c12e6d1ed471	payment_pending	Order created	2026-04-10 11:43:15.122326	4994747b-53ad-4c6e-bc8f-e878d48ad37c
1ca0ce3f-5dd9-498f-ba17-98bb803431a5	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-10 12:04:00.272269	4994747b-53ad-4c6e-bc8f-e878d48ad37c
298eacbf-c32d-4525-bcc9-33dd1e390520	payment_pending	Order created	2026-04-10 12:14:23.689818	123781f9-4800-4c76-b26e-eceeb2f4160f
15e9d7b2-fa46-42e4-b137-a836b4e5d138	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-10 12:36:00.080491	123781f9-4800-4c76-b26e-eceeb2f4160f
72a154c8-a4d2-4770-b031-cf698872c48f	payment_pending	Order created	2026-04-10 12:54:47.154227	c45721b0-8db9-4449-911f-33a06c8721f4
2ac1f683-a7cb-4135-a519-e9bfabb86f0a	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-10 13:16:00.107457	c45721b0-8db9-4449-911f-33a06c8721f4
d4f65abb-14db-421b-b103-8f0c8606a35e	payment_pending	Order created	2026-04-10 21:38:26.837533	56949d8e-8939-4678-899e-519e01343bdd
c1587b1e-0e07-4d96-9ca5-a1762b24ed69	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-10 22:00:00.26526	56949d8e-8939-4678-899e-519e01343bdd
751216c4-376b-46fa-8375-0cd420313c20	payment_pending	Order created	2026-04-11 23:29:53.50674	ae89ae3a-5c8f-461b-847c-9a5c0f676f18
8bca5357-836a-4c69-b92f-3b1d31397221	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-11 23:50:00.099329	ae89ae3a-5c8f-461b-847c-9a5c0f676f18
5e2d24f9-e111-4aeb-b981-ec992c5a6a70	payment_pending	Order created	2026-04-13 12:14:16.181296	e707adf5-3811-4995-92cd-273f15f29e97
6d26eeaf-8be9-4e83-81e9-4f9fd8d31f90	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-13 12:36:00.109577	e707adf5-3811-4995-92cd-273f15f29e97
9fe49656-d924-4ede-bfde-e2575a795acf	payment_pending	Order created	2026-04-13 13:25:12.074189	9c47d8cc-f26f-43f4-8ffa-a06af6b30417
12dfecf2-4124-4855-925d-30ba9fbf0810	payment_pending	Order created	2026-04-13 13:40:22.185095	343ba299-2966-47e7-a333-6d3572e13483
23d914b2-e996-463b-984b-b1ade07c0dea	delivered	Marked as delivered by óptica	2026-04-13 14:12:51.331558	9c47d8cc-f26f-43f4-8ffa-a06af6b30417
8c1695c8-c633-47d9-bf5b-ddc7b16ae3d3	completed	Receipt confirmed by client	2026-04-13 14:20:54.165054	9c47d8cc-f26f-43f4-8ffa-a06af6b30417
b045aec0-bcbb-492b-90ec-b0013b858a38	delivered	Marked as delivered by óptica	2026-04-13 14:23:45.053889	343ba299-2966-47e7-a333-6d3572e13483
6851ce14-9d42-47ef-9ce5-210518e128fa	dispute	Dispute opened: wrong_prescription	2026-04-13 14:26:43.588592	343ba299-2966-47e7-a333-6d3572e13483
ed00b6d2-3aa4-4fa9-b131-8748687b3aba	delivered	Marked as delivered by óptica	2026-04-13 14:54:34.490195	501f1c57-c175-4216-bd54-4ee8a5b5c0ef
7dc14340-3764-47c9-b380-e506aab0d815	completed	Receipt confirmed by client	2026-04-13 14:54:59.393776	501f1c57-c175-4216-bd54-4ee8a5b5c0ef
28535311-267b-4f07-9e75-67450f0720ef	completed	Cliente confirmó la corrección	2026-04-13 19:21:33.232146	343ba299-2966-47e7-a333-6d3572e13483
09169c79-8965-4d89-868d-595537847f39	delivered	Marked as delivered by óptica	2026-04-13 20:00:54.131267	5b22bab5-0cd1-4503-9c01-79f1b6071e56
7e775548-5630-41ac-9dc1-2016ef56c4bf	delivered	Marked as delivered by óptica	2026-04-13 20:04:56.565071	6094ca25-7842-412a-8f8a-2de01e4607aa
bc095912-84bf-4fa3-8a1b-524946ea9935	delivered	Marked as delivered by óptica	2026-04-13 20:05:10.659897	c337f52e-8f68-4476-a84f-8312dfdd8dd1
76893a40-8dc7-4114-8ee5-42faba93a82f	completed	Receipt confirmed by client	2026-04-13 20:16:45.425661	5b22bab5-0cd1-4503-9c01-79f1b6071e56
ec5dc67b-061a-4187-beb7-9355cdbc5b1b	completed	Receipt confirmed by client	2026-04-13 20:19:25.888798	6094ca25-7842-412a-8f8a-2de01e4607aa
51dd1199-536e-443e-86d5-e89402dad968	completed	Receipt confirmed by client	2026-04-13 20:19:47.837989	c337f52e-8f68-4476-a84f-8312dfdd8dd1
80ca12cc-2b5e-452a-b678-ee037c5f0683	delivered	Marked as delivered by óptica	2026-04-13 20:20:34.396184	5150c763-6e63-4204-976c-2842e90caa74
def41017-f362-47e1-bd1b-499ff29bd8de	dispute	Dispute opened: other	2026-04-13 20:23:04.185349	5150c763-6e63-4204-976c-2842e90caa74
597c7c02-8a91-4b1c-ae2e-278d7bc0cca3	refunded	Resolved by admin: refunded	2026-04-13 20:24:25.233273	5150c763-6e63-4204-976c-2842e90caa74
52e12568-cf5b-452c-a41e-adcde63e9dbc	payment_pending	Order created	2026-04-13 23:06:49.071137	582a0e85-404b-41e2-a409-d77429c50337
d87d76ed-607e-4d46-9826-43ee451a6e33	delivered	Marked as delivered by óptica	2026-04-13 23:08:38.757845	582a0e85-404b-41e2-a409-d77429c50337
c4800baf-77aa-4478-833e-4eaa37c95222	dispute	Dispute opened: wrong_prescription	2026-04-13 23:10:06.232826	582a0e85-404b-41e2-a409-d77429c50337
71e46d82-abe5-4929-8439-9e6cbf2e91a8	completed	Resolved by admin: released	2026-04-13 23:14:09.575596	582a0e85-404b-41e2-a409-d77429c50337
9f89f796-9c7c-439e-9d65-052254ddbbc2	payment_pending	Order created	2026-04-14 12:54:04.876966	5a088d5f-b414-41f3-b40b-e019f27f7ce8
df3f4479-00a1-4c2a-a098-a0c5451ce17e	cancelled	Auto-cancelled: payment deadline expired (20 min)	2026-04-14 13:16:00.080562	5a088d5f-b414-41f3-b40b-e019f27f7ce8
4ff95d1b-b2b8-459c-95d5-525edb808a5e	payment_pending	Order created	2026-04-14 14:30:25.506638	536be370-f6d4-4133-8a96-f76b3251355a
8a66e942-3a61-49e0-ad08-516169a4d39a	delivered	Marked as delivered by óptica	2026-04-14 14:31:56.661875	536be370-f6d4-4133-8a96-f76b3251355a
9f61e6fe-57b9-4dc6-9403-d76950e84504	completed	Receipt confirmed by client	2026-04-14 14:32:29.842276	536be370-f6d4-4133-8a96-f76b3251355a
fdfe837c-6d51-4969-99ea-9dd1c198ec5c	payment_pending	Order created	2026-04-14 21:53:16.858671	9a2233c8-f4e1-45d3-83a4-0413ddc57656
b7b05216-7acc-4f46-8a5c-8347674a2529	delivered	Marked as delivered by óptica	2026-04-14 21:56:25.986157	9a2233c8-f4e1-45d3-83a4-0413ddc57656
c16e09fd-9630-4f1a-9b9b-630cb21fd3e0	dispute	Dispute opened: other	2026-04-14 21:58:56.807961	9a2233c8-f4e1-45d3-83a4-0413ddc57656
da504cd6-aad4-404b-ad38-5ffa08653aff	completed	Resolved by admin: released	2026-04-14 22:01:37.71395	9a2233c8-f4e1-45d3-83a4-0413ddc57656
783a4584-9e2c-40b2-b9b7-8f21b0c92f97	payment_pending	Order created	2026-04-15 22:59:54.452071	f09d2f95-ebd5-4812-9962-6c84c0d43d0e
bd59784b-df2b-44cc-9a19-8aa1c31c6448	delivered	Marked as delivered by óptica	2026-04-15 23:01:19.61262	f09d2f95-ebd5-4812-9962-6c84c0d43d0e
5c552a01-dffa-49c7-8d99-6c0ffd382c10	completed	Receipt confirmed by client	2026-04-15 23:01:42.085995	f09d2f95-ebd5-4812-9962-6c84c0d43d0e
db936018-9f51-45e4-87a9-9de1c8708d67	payment_pending	Order created	2026-04-15 23:06:57.13465	73403f9f-d5b0-4cd7-ba81-663998d06e7a
399f0ab3-bcb8-4fd0-9309-9a352fa51073	delivered	Marked as delivered by óptica	2026-04-15 23:08:36.913261	73403f9f-d5b0-4cd7-ba81-663998d06e7a
4eaa3b27-c60a-4cd2-a636-5726157a1593	completed	Receipt confirmed by client	2026-04-15 23:08:54.872916	73403f9f-d5b0-4cd7-ba81-663998d06e7a
b48612c0-82f4-417d-97a6-2413166033d7	payment_pending	Order created	2026-04-16 12:07:40.90031	66955b6c-6a0e-47c3-8371-9d83898d4d40
61176970-64a8-4e40-b793-017beedbe9fe	delivered	Marked as delivered by óptica	2026-04-16 12:11:31.80909	66955b6c-6a0e-47c3-8371-9d83898d4d40
20190f53-0bd9-4acb-88a5-58cecd2bf952	completed	Receipt confirmed by client	2026-04-16 12:11:48.228686	66955b6c-6a0e-47c3-8371-9d83898d4d40
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.orders (id, status, amount, "commissionAmount", "mpPaymentId", "deliveredAt", "verificationDeadline", "completedAt", "createdAt", "updatedAt", "quoteId", "clientId", "opticaId", "selectedFrameId", "paymentDeadline", "paymentMode", "depositAmount", "deliveryMethod", "deliveryAddress") FROM stdin;
9a2233c8-f4e1-45d3-83a4-0413ddc57656	completed	100000	12000	154789020510	2026-04-14 21:56:25.935	2026-04-16 21:56:25.935	\N	2026-04-14 21:53:16.84647	2026-04-14 22:01:37.671246	9a1e426e-0610-453d-9f96-9c975d2f3e51	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	bc723c4e-105e-440c-8e4e-f889177f0abb	2026-04-14 22:13:16.843	deposit	12000	pickup	\N
343ba299-2966-47e7-a333-6d3572e13483	completed	43333	5199.96	153809521635	2026-04-13 14:23:44.995	2026-04-15 14:23:44.995	\N	2026-04-13 13:40:21.942165	2026-04-13 19:21:33.165515	f0c17848-98d3-44e0-b32a-e892df0b5be0	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	90f41835-4ef7-40b2-85ba-d48216ee2ad1	2026-04-13 14:00:21.765	full	\N	pickup	\N
ebb14b34-6e2d-4508-99cb-9fd4744ba3cf	payment_pending	33	3.96	3117825855-53bc33a5-3b75-4228-8df0-0df9cf9245ed	\N	\N	\N	2026-04-06 22:09:06.367438	2026-04-06 22:09:06.70107	a279b9a6-c2df-4534-9750-22b7c0419de3	140f6673-13ea-4c1b-aedd-481a6e900039	5ced47ba-406d-42fe-9cea-c63c70189a5d	\N	\N	full	\N	pickup	\N
536be370-f6d4-4133-8a96-f76b3251355a	completed	53333	6399.96	153974376031	2026-04-14 14:31:56.621	2026-04-16 14:31:56.621	2026-04-14 14:32:29.767	2026-04-14 14:30:25.489455	2026-04-14 14:32:29.769144	fc567eac-aee8-4604-bb49-57dc6c5261c1	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	90f41835-4ef7-40b2-85ba-d48216ee2ad1	2026-04-14 14:50:25.487	full	\N	pickup	\N
9e5464f5-3795-4f10-9d8a-a5305108ee87	cancelled	32	3.84	3117825855-a12c2151-62d1-4912-8968-4a7dd873791c	\N	\N	\N	2026-04-08 15:34:15.32688	2026-04-08 15:56:00.101553	bacce2b1-d98d-439a-8dce-9c4808d648d4	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	2026-04-08 15:54:15.311	full	\N	pickup	\N
86b34597-1df2-4aff-9874-912625150ad8	cancelled	1	0.12	3117825855-0e4513e8-dc85-4031-b041-bdf5c447ae78	\N	\N	\N	2026-04-08 19:58:50.312234	2026-04-08 20:20:00.424926	2c4a4bbc-1ff4-4ac0-a44a-a9e994823f54	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	2026-04-08 20:18:50.311	full	\N	pickup	\N
cc6ff94d-293a-42c7-a777-4724da8af9ea	cancelled	23345	2801.4	3117825855-692417c3-e2d3-48ce-a6b5-117398da4bad	\N	\N	\N	2026-04-10 01:56:45.442904	2026-04-10 02:18:00.128462	0b0101fa-9a2b-407f-a0e9-7ab2a3230eaf	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	90f41835-4ef7-40b2-85ba-d48216ee2ad1	2026-04-10 02:16:45.439	full	\N	pickup	\N
5d26bf47-dc5e-4d6c-b4f4-eabb866565a7	cancelled	12	1.44	3117825855-b025ca22-6aad-4f63-a940-622e1cb9c45e	\N	\N	\N	2026-04-08 21:13:17.194563	2026-04-08 21:34:00.069259	4114eb4b-5db5-40b4-b02b-061f4f234184	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	e71559cd-6e19-4500-bca2-ed93ba844bd0	2026-04-08 21:33:17.187	full	\N	pickup	\N
e56b57f1-56c7-49aa-9dc6-0ed7e9ec03e6	cancelled	32	3.84	3117825855-a5f27e6d-1271-4635-bebb-7baeb70384e1	\N	\N	\N	2026-04-08 22:19:07.341248	2026-04-08 22:40:00.197499	191abcc1-25d8-4b41-8dfa-5337d2879582	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	e71559cd-6e19-4500-bca2-ed93ba844bd0	2026-04-08 22:39:07.337	full	\N	pickup	\N
40b986fc-4393-46f3-a2df-a0f51398498b	cancelled	4	0.48	3117825855-cb50a4d4-73aa-461d-881b-daa9a34d5759	\N	\N	\N	2026-04-09 11:34:09.309871	2026-04-09 11:56:00.08325	7c2f794d-6192-4886-9cf2-3d203005d092	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	70579035-c6e4-478c-8823-9dba3532d354	2026-04-09 11:54:09.308	full	\N	pickup	\N
4994747b-53ad-4c6e-bc8f-e878d48ad37c	cancelled	23357	2802.84	3117825855-08b7691a-3371-402f-b1af-f0c0c12c71be	\N	\N	\N	2026-04-10 11:43:15.114088	2026-04-10 12:04:00.207243	ad39552a-9b14-4311-b15f-446301b927b9	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	90f41835-4ef7-40b2-85ba-d48216ee2ad1	2026-04-10 12:03:15.113	full	\N	pickup	\N
a779d70b-5bbe-4ff1-b575-9fb0a974eca0	cancelled	122	14.64	3117825855-54b7e9fb-c1d5-4622-9cee-889bc805a246	\N	\N	\N	2026-04-09 14:45:10.886077	2026-04-09 15:06:00.076361	bf50ca31-b310-4199-a789-fbce675e3f74	eb65c951-041e-48b0-bf6e-bc5602239537	b738e8bf-3534-4956-9ec7-5301a47b0afa	039b5db4-baf0-41e0-b596-69fb07b5da41	2026-04-09 15:05:10.855	deposit	14.64	pickup	\N
127e0101-30f1-4f85-999e-46afc819aed4	cancelled	23353	2802.36	3117825855-5b8a4653-3de8-4d7e-8b3e-733025a36b54	\N	\N	\N	2026-04-09 22:28:31.724802	2026-04-09 22:50:00.169264	b98eb687-ac70-4163-97b3-07cc703f2046	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	90f41835-4ef7-40b2-85ba-d48216ee2ad1	2026-04-09 22:48:31.72	full	\N	pickup	\N
582a0e85-404b-41e2-a409-d77429c50337	completed	145000	17400	153895807519	2026-04-13 23:08:38.703	2026-04-15 23:08:38.703	\N	2026-04-13 23:06:49.060274	2026-04-13 23:14:09.535648	cbfd1432-41b0-492f-b198-3d8c6f58d2d6	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	6d598b6f-9578-4d9c-9800-0bd058b50651	2026-04-13 23:26:49.058	deposit	17400	pickup	\N
4643a659-6cc0-40e7-8a41-0838cdc7b61d	cancelled	23335	2800.2	3117825855-f537a419-005c-43b0-8cc5-d72463f72a7a	\N	\N	\N	2026-04-10 00:08:17.14448	2026-04-10 00:30:00.131282	3d02be46-8e85-42fe-93e1-f17d0a150dcf	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	90f41835-4ef7-40b2-85ba-d48216ee2ad1	2026-04-10 00:28:17.142	deposit	2800.2	pickup	\N
123781f9-4800-4c76-b26e-eceeb2f4160f	cancelled	2	0.24	3117825855-6dcd9e1a-9248-412d-ba7c-39621e02af4a	\N	\N	\N	2026-04-10 12:14:23.667196	2026-04-10 12:36:00.070268	fe18523a-cfd4-4227-8e0e-1d511a09f116	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	2026-04-10 12:34:23.664	full	\N	pickup	\N
bcfe7e4b-c4f5-4ab6-9402-a01e55e498e5	cancelled	23335	2800.2	3117825855-6d34c13b-f60b-44d4-aede-70266c58cd68	\N	\N	\N	2026-04-10 01:12:22.794343	2026-04-10 01:34:00.105256	69fd4f53-2924-4e83-ae0e-274612767ec1	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	90f41835-4ef7-40b2-85ba-d48216ee2ad1	2026-04-10 01:32:22.792	deposit	2800.2	pickup	\N
c45721b0-8db9-4449-911f-33a06c8721f4	cancelled	23349	2801.88	3117825855-c1011006-2d6a-4369-aab1-a2b91176b371	\N	\N	\N	2026-04-10 12:54:47.144586	2026-04-10 13:16:00.090016	52967c0b-db5d-405f-b0ce-c58d253109e3	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	90f41835-4ef7-40b2-85ba-d48216ee2ad1	2026-04-10 13:14:47.143	full	\N	pickup	\N
56949d8e-8939-4678-899e-519e01343bdd	cancelled	23363	2803.56	3117825855-ba722b7a-3d54-4356-80b8-8eb7b0c3957c	\N	\N	\N	2026-04-10 21:38:26.806133	2026-04-10 22:00:00.244177	690bac1b-1dba-4e44-ac14-3991460d9654	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	90f41835-4ef7-40b2-85ba-d48216ee2ad1	2026-04-10 21:58:26.805	full	\N	pickup	\N
ae89ae3a-5c8f-461b-847c-9a5c0f676f18	cancelled	19999	2399.88	3117825855-5b1cc988-2e0c-4af9-a373-b18044abbd3a	\N	\N	\N	2026-04-11 23:29:53.498564	2026-04-11 23:50:00.087552	5e21868e-2b1e-4e8b-b9de-c8228bf6123a	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	e71559cd-6e19-4500-bca2-ed93ba844bd0	2026-04-11 23:49:53.497	deposit	2399.88	pickup	\N
5a088d5f-b414-41f3-b40b-e019f27f7ce8	cancelled	121333	14559.96	3117965466-5f81351c-54bc-434a-98a7-abeb81bf77a5	\N	\N	\N	2026-04-14 12:54:04.850322	2026-04-14 13:16:00.070871	a30a210d-7bca-4cf3-a7aa-6c58cdaa7dc1	4b754b35-7cc4-4661-9b9f-bc24cf753cfb	b738e8bf-3534-4956-9ec7-5301a47b0afa	953559ac-7063-4093-a2c4-f91f20b7a502	2026-04-14 13:14:04.844	full	\N	pickup	\N
e707adf5-3811-4995-92cd-273f15f29e97	cancelled	53333	6399.96	3117825855-8934da23-4293-440b-ba5a-c0def99e7f63	\N	\N	\N	2026-04-13 12:14:16.160231	2026-04-13 12:36:00.10204	21844ae2-a45b-4bed-b0c3-cc849057791c	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	90f41835-4ef7-40b2-85ba-d48216ee2ad1	2026-04-13 12:34:16.154	deposit	6399.96	pickup	\N
9c47d8cc-f26f-43f4-8ffa-a06af6b30417	completed	253333	30399.96	153808485449	2026-04-13 14:12:51.23	2026-04-15 14:12:51.23	2026-04-13 14:20:53.452	2026-04-13 13:25:12.052261	2026-04-13 14:20:53.469844	19dd39fc-4c6c-4042-844f-bdabd34cf787	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	90f41835-4ef7-40b2-85ba-d48216ee2ad1	2026-04-13 13:45:12.046	full	\N	pickup	\N
5b22bab5-0cd1-4503-9c01-79f1b6071e56	completed	2	0.24	153820797079	2026-04-13 20:00:53.554	2026-04-15 20:00:53.554	2026-04-13 20:16:45.272	2026-04-06 21:49:17.710755	2026-04-13 20:16:45.308286	da3df02f-9429-4481-9995-e828d21cf9dc	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	\N	full	\N	pickup	\N
6094ca25-7842-412a-8f8a-2de01e4607aa	completed	122	14.64	153866154263	2026-04-13 20:04:55.671	2026-04-15 20:04:55.671	2026-04-13 20:19:25.834	2026-04-07 01:46:52.183857	2026-04-13 20:19:25.836958	6b037dd9-12b2-4fde-a684-6fecdf1df238	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	\N	full	\N	pickup	\N
c337f52e-8f68-4476-a84f-8312dfdd8dd1	completed	12	1.44	153865948675	2026-04-13 20:05:10.493	2026-04-15 20:05:10.493	2026-04-13 20:19:47.803	2026-04-06 21:35:02.388851	2026-04-13 20:19:47.805505	64df2550-929d-4d15-b41d-e6f838df2708	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	\N	full	\N	pickup	\N
501f1c57-c175-4216-bd54-4ee8a5b5c0ef	completed	17	2.04	154569734426	2026-04-13 14:54:34.348	2026-04-15 14:54:34.348	2026-04-13 14:54:59.329	2026-04-06 23:13:25.583534	2026-04-13 14:54:59.335749	73535626-5274-4561-ae7c-796532395b71	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	b738e8bf-3534-4956-9ec7-5301a47b0afa	\N	\N	full	\N	pickup	\N
f09d2f95-ebd5-4812-9962-6c84c0d43d0e	completed	100000	12000	154207661715	2026-04-15 23:01:19.569	2026-04-17 23:01:19.569	2026-04-15 23:01:42.042	2026-04-15 22:59:54.441469	2026-04-15 23:01:42.046734	e1219e82-592c-4b52-b0f0-3dc1a905fb07	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	bbbd9bfe-fc5a-4484-b39c-06fb32f7e22b	2026-04-15 23:19:54.44	deposit	12000	pickup	\N
5150c763-6e63-4204-976c-2842e90caa74	refunded	125000	15000	154615193406	2026-04-13 20:20:34.346	2026-04-15 20:20:34.346	\N	2026-04-06 20:29:06.12558	2026-04-13 20:24:25.182298	1f581e7c-463b-4985-8163-da492d7a05a1	eb65c951-041e-48b0-bf6e-bc5602239537	b738e8bf-3534-4956-9ec7-5301a47b0afa	\N	\N	full	\N	pickup	\N
73403f9f-d5b0-4cd7-ba81-663998d06e7a	completed	90000	10800	154960417522	2026-04-15 23:08:36.849	2026-04-17 23:08:36.849	2026-04-15 23:08:54.816	2026-04-15 23:06:57.110704	2026-04-15 23:08:54.818868	9652fa13-ce13-4a26-84aa-abeca35d46b1	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	92af84ba-52cc-4429-8e40-b182fa134ad1	2026-04-15 23:26:57.108	full	\N	delivery	necesito que llegue a calle 17 nro 929, general pico, la pampa.
66955b6c-6a0e-47c3-8371-9d83898d4d40	completed	185000	22200	155022569608	2026-04-16 12:11:31.756	2026-04-18 12:11:31.756	2026-04-16 12:11:48.161	2026-04-16 12:07:40.878116	2026-04-16 12:11:48.166271	47219e3a-dc8b-46ad-be1e-486cb13693d8	eb65c951-041e-48b0-bf6e-bc5602239537	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	16af3025-2916-4260-8694-9845320bfea4	2026-04-16 12:27:40.874	full	\N	pickup	\N
\.


--
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.platform_settings (key, value, description, "updatedAt") FROM stdin;
outer_radius_km	10	\N	2026-03-20 09:47:19.723565
extended_radius_km	25	\N	2026-03-20 09:47:19.732135
smart_select_min	3	\N	2026-03-20 09:47:19.74038
smart_select_max	5	\N	2026-03-20 09:47:19.748704
quote_expiry_hours	48	\N	2026-03-20 09:47:19.757224
verification_window_hours	48	\N	2026-03-20 09:47:19.764081
referral_discount_pct	5	\N	2026-03-20 09:47:19.7779
referral_discount_days	30	\N	2026-03-20 09:47:19.787193
quote_cap	3	\N	2026-03-20 09:47:19.792925
dispute_window_days	7	\N	2026-03-20 09:47:19.798073
commission_rate_pct	12	\N	2026-04-01 22:53:52.332179
inner_radius_km	10	\N	2026-04-02 15:25:01.068313
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.prescriptions (id, "imageUrl", notes, "isProcessed", "createdAt", "clientId", "aiTranscription") FROM stdin;
d97943d6-848d-4fa3-9b46-f353c1da1bce	/uploads/prescriptions/1774537493815-490100.jpeg	Lente: Monofocal | Precio: $40.000 – $80.000 | Estilo: Sin preferencia	f	2026-03-26 15:04:53.880992	eb65c951-041e-48b0-bf6e-bc5602239537	\N
02ce34df-3840-4c25-bd51-19be89e25778	/uploads/prescriptions/1774538246428-414784.jpeg	Lente: Monofocal | Precio: $40.000 – $80.000 | Estilo: Sin preferencia	f	2026-03-26 15:17:26.447236	eb65c951-041e-48b0-bf6e-bc5602239537	\N
89e40c4e-e01b-480f-b6ce-2c491553f01e	/uploads/prescriptions/1775083922380-362102.jpeg	Lente: Monofocal | Precio: $20.000 – $40.000 | Estilo: Sin preferencia	f	2026-04-01 22:52:02.439903	eb65c951-041e-48b0-bf6e-bc5602239537	\N
34e9eb78-07ed-432b-8238-8915ae21b646	/uploads/prescriptions/1775131838115-466217.jpg	Lente: Monofocal | Precio: $40.000 – $80.000 | Estilo: Acetato	f	2026-04-02 12:10:38.159042	eb65c951-041e-48b0-bf6e-bc5602239537	\N
e463f2ac-a4df-4695-9cf2-71db38f90f13	/uploads/prescriptions/1775132831572-497825.jpg	Lente: Monofocal | Precio: $150.000+ | Estilo: Sin preferencia	f	2026-04-02 12:27:11.583245	eb65c951-041e-48b0-bf6e-bc5602239537	\N
0a95e29e-3aab-44f2-8804-de80f67124dd	/uploads/prescriptions/1775133317128-732571.jpg	Lente: Monofocal | Precio: $40.000 – $80.000 | Estilo: Acetato	f	2026-04-02 12:35:22.402377	eb65c951-041e-48b0-bf6e-bc5602239537	\N
68b7ccf4-e236-4c4c-a6d1-38d095103c8c	/uploads/prescriptions/1775142422957-146453.jpeg	Lente: Monofocal | Precio: $40.000 – $80.000 | Estilo: Sin preferencia	f	2026-04-02 15:07:03.022642	eb65c951-041e-48b0-bf6e-bc5602239537	\N
5b617281-953e-4357-b8c5-1328dec4b792	/uploads/prescriptions/1775142585398-808043.jpeg	Lente: Monofocal | Precio: $40.000 – $80.000 | Estilo: Metal	f	2026-04-02 15:09:45.412617	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	\N
8bb306f6-a5a9-4b95-a12c-5757dfe69d0d	/uploads/prescriptions/1775142756275-736626.jpeg	Lente: Monofocal | Precio: $40.000 – $80.000 | Estilo: Sin preferencia	f	2026-04-02 15:12:36.281679	140f6673-13ea-4c1b-aedd-481a6e900039	\N
c9c5bf9e-4427-4cae-9454-979ba1484b68	/uploads/prescriptions/1775305651906-781592.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-04 12:27:31.947107	140f6673-13ea-4c1b-aedd-481a6e900039	\N
88988282-2c7b-4032-be79-971109d08252	/uploads/prescriptions/1775475944863-428057.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-06 11:45:44.871398	eb65c951-041e-48b0-bf6e-bc5602239537	\N
86b067d4-54b7-4fd7-bbe9-b6e4a2cae344	/uploads/prescriptions/1775480379051-464671.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-06 12:59:39.077295	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	\N
aa188cb3-f6b7-45ee-a20f-2cb30a2d23e3	/uploads/prescriptions/1775480456125-633332.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-06 13:00:56.132941	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	\N
54daa946-4ff6-4c79-b14b-6030760ca8ae	/uploads/prescriptions/1775480549075-851052.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-06 13:02:29.137499	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	\N
320a84f5-0847-48ec-951f-1b361a1684f4	/uploads/prescriptions/1775511193110-506733.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-06 21:33:13.123353	eb65c951-041e-48b0-bf6e-bc5602239537	\N
fae5f80c-3bd2-4840-8271-38f3f8c6d00b	/uploads/prescriptions/1775511759097-206221.jpeg	Lente: Monofocal | Precio: $40.000 – $80.000 | Estilo: Sin preferencia	f	2026-04-06 21:42:39.126042	140f6673-13ea-4c1b-aedd-481a6e900039	\N
85660cee-dd0d-459b-af50-76c79b425d7f	/uploads/prescriptions/1775517127420-54224.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-06 23:12:07.435177	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	\N
8f66b46d-5f92-4fbf-8388-5f5bafeb57af	/uploads/prescriptions/1775526202121-591113.png	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-07 01:43:22.179818	eb65c951-041e-48b0-bf6e-bc5602239537	\N
996801a4-a5bc-41b5-a08e-2156fcf7cbac	/uploads/prescriptions/1775592387402-682991.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-07 20:06:27.441016	eb65c951-041e-48b0-bf6e-bc5602239537	\N
75301aa4-bc61-4625-8966-69183ec71e54	/uploads/prescriptions/1775662508802-821564.jpeg	Lente: Monofocal | Precio: $150.000+ | Estilo: Sin preferencia	f	2026-04-08 15:35:08.820256	eb65c951-041e-48b0-bf6e-bc5602239537	\N
e4dc5925-e958-495d-b317-c7685af17f62	/uploads/prescriptions/1775682655416-760631.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-08 21:10:55.453381	eb65c951-041e-48b0-bf6e-bc5602239537	\N
8a3936f3-f2a0-416a-ba66-30380307f717	/uploads/prescriptions/1775686191752-972675.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-08 22:09:51.783686	eb65c951-041e-48b0-bf6e-bc5602239537	\N
b8bd1f24-99d8-4fcb-b4dc-74244fb12998	/uploads/prescriptions/1775691355162-892783.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-08 23:35:55.179238	eb65c951-041e-48b0-bf6e-bc5602239537	\N
d912b7f6-e772-4949-a186-9e9ee51e1f48	/uploads/prescriptions/1775734868745-897274.jpeg	Lente: Necesita asesoramiento | Precio: $400.000+ | Estilo: Sin preferencia	f	2026-04-09 11:41:08.758971	eb65c951-041e-48b0-bf6e-bc5602239537	\N
6c985e06-108d-4521-afd3-2811a1e1c6ad	/uploads/prescriptions/1775773234339-583828.jpeg	Lente: Con filtro azul | Precio: $50.000 – $100.000 | Estilo: Sin preferencia	f	2026-04-09 22:20:34.375786	eb65c951-041e-48b0-bf6e-bc5602239537	\N
5d9d6cee-e7d8-44f1-9fca-21f00d21ce3f	/uploads/prescriptions/1775773296284-839331.jpeg	Lente: Bifocal | Precio: $100.000 – $200.000 | Estilo: Sin preferencia	f	2026-04-09 22:21:36.292076	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	\N
189a990c-b0cb-4d2c-bc4b-1ba1811d0654	/uploads/prescriptions/1775773894737-94631.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin aro	f	2026-04-09 22:31:34.743941	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	\N
578b9b9b-ad73-4041-aa15-c7a456f0982a	/uploads/prescriptions/1775779590584-457211.jpg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-10 00:06:30.635032	eb65c951-041e-48b0-bf6e-bc5602239537	\N
40d4e9d6-4e74-4446-a9a5-81cfbe7f1933	/uploads/prescriptions/1775783449090-694486.jpg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-10 01:10:49.111537	eb65c951-041e-48b0-bf6e-bc5602239537	\N
6f35472f-76d1-4336-8eb1-fd981c91520f	/uploads/prescriptions/1775784680045-710416.jpg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-10 01:31:20.05518	eb65c951-041e-48b0-bf6e-bc5602239537	\N
d9aa941f-e9d5-4981-bf69-4bee03acdecc	/uploads/prescriptions/1775821282050-304572.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-10 11:41:22.064035	eb65c951-041e-48b0-bf6e-bc5602239537	OJO DERECHO (OD):\n• Esfera (ESF): -1.25\n• Cilindro (CIL): -0.50\n• Eje: 10°\n• Adición (ADD): No especificado\n\nOJO IZQUIERDO (OI):\n• Esfera (ESF): -1.00\n• Cilindro (CIL): -0.50\n• Eje: 180°\n• Adición (ADD): No especificado\n\nDISTANCIA PUPILAR (DP): No especificado\n\nOBSERVACIONES: Receta para anteojos. Documento del Colegio Médico La Pampa.
8e5ab94d-ec9c-4f9f-a474-59395f90569e	/uploads/prescriptions/1775823219444-816667.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-10 12:13:39.499065	eb65c951-041e-48b0-bf6e-bc5602239537	OJO DERECHO (OD):\n• Esfera (ESF): -1.25\n• Cilindro (CIL): -0.50\n• Eje: 10°\n• Adición (ADD): No especificado\n\nOJO IZQUIERDO (OI):\n• Esfera (ESF): -1.00\n• Cilindro (CIL): -0.50\n• Eje: 180°\n• Adición (ADD): No especificado\n\nDISTANCIA PUPILAR (DP): No especificado\n\nOBSERVACIONES: Receta médica para anteojos. Paciente: Ziegentuss Josefina. Fecha: 30/11/2023.
f070a201-b371-444d-b932-9fb42a7ae859	/uploads/prescriptions/1775825633086-953103.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-10 12:53:53.096903	eb65c951-041e-48b0-bf6e-bc5602239537	OJO DERECHO (OD):\n• Esfera (ESF): -1.25\n• Cilindro (CIL): -0.50\n• Eje: 10°\n• Adición (ADD): No especificado\n\nOJO IZQUIERDO (OI):\n• Esfera (ESF): -1.00\n• Cilindro (CIL): -0.50\n• Eje: 180°\n• Adición (ADD): No especificado\n\nDISTANCIA PUPILAR (DP): No especificado\n\nOBSERVACIONES: No especificado
8128b480-00c1-4bd4-8a2c-698f8cd7237b	/uploads/prescriptions/1775857043511-344981.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-10 21:37:23.529599	eb65c951-041e-48b0-bf6e-bc5602239537	OJO DERECHO (OD):\n• Esfera (ESF): -1.25\n• Cilindro (CIL): -0.50\n• Eje: 10°\n• Adición (ADD): No especificado\n\nOJO IZQUIERDO (OI):\n• Esfera (ESF): -1.00\n• Cilindro (CIL): -0.50\n• Eje: 180°\n• Adición (ADD): No especificado\n\nDISTANCIA PUPILAR (DP): No especificado\n\nOBSERVACIONES: Receta médica para anteojos. Paciente: Ziegenfuls Josefina. Fecha: 30/11/2023.
29a70b0b-952b-4ae6-9156-e88ab32f892b	/uploads/prescriptions/1775949829425-574103.jpeg	Lente: Monofocal | Precio: $100.000 – $200.000 | Estilo: Sin preferencia	f	2026-04-11 23:23:49.439271	eb65c951-041e-48b0-bf6e-bc5602239537	OJO DERECHO (OD):\n• Esfera (ESF): -1.25\n• Cilindro (CIL): -0.50\n• Eje: 10°\n• Adición (ADD): No especificado\n\nOJO IZQUIERDO (OI):\n• Esfera (ESF): -1.00\n• Cilindro (CIL): -0.50\n• Eje: 180°\n• Adición (ADD): No especificado\n\nDISTANCIA PUPILAR (DP): No especificado\n\nOBSERVACIONES: Anteojo 0409
39cc185a-edd3-4015-98e0-2c46cf10a1ff	/uploads/prescriptions/1775950483957-773325.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-11 23:34:43.973253	eb65c951-041e-48b0-bf6e-bc5602239537	OJO DERECHO (OD):\n• Esfera (ESF): No especificado\n• Cilindro (CIL): No especificado\n• Eje: No especificado\n• Adición (ADD): No especificado\n\nOJO IZQUIERDO (OI):\n• Esfera (ESF): No especificado\n• Cilindro (CIL): No especificado\n• Eje: No especificado\n• Adición (ADD): No especificado\n\nDISTANCIA PUPILAR (DP): No especificado\n\nOBSERVACIONES: No se detectó una receta óptica en la imagen. Esta es una receta médica general de la Dra. Mafud Silvina con indicaciones manuscritas en letra cursiva que no corresponden a graduación óptica.
486ecb12-2ae4-4d45-b4b5-231178debf14	/uploads/prescriptions/1776086651564-697077.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-13 13:24:11.64902	eb65c951-041e-48b0-bf6e-bc5602239537	OJO DERECHO (OD):\n• Esfera (ESF): -1.25\n• Cilindro (CIL): -0.50\n• Eje: 10°\n• Adición (ADD): No especificado\n\nOJO IZQUIERDO (OI):\n• Esfera (ESF): -1.00\n• Cilindro (CIL): -0.50\n• Eje: 180°\n• Adición (ADD): No especificado\n\nDISTANCIA PUPILAR (DP): No especificado\n\nOBSERVACIONES: Receta médica para anteojos con corrección para miopía y astigmatismo en ambos ojos.
72c0d015-a646-4629-a316-bea40f6fbaf9	/uploads/prescriptions/1776087561673-468886.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-13 13:39:21.726113	eb65c951-041e-48b0-bf6e-bc5602239537	OJO DERECHO (OD):\n• Esfera (ESF): -1.25\n• Cilindro (CIL): -0.50\n• Eje: 10°\n• Adición (ADD): No especificado\n\nOJO IZQUIERDO (OI):\n• Esfera (ESF): -1.00\n• Cilindro (CIL): -0.50\n• Eje: 180°\n• Adición (ADD): No especificado\n\nDISTANCIA PUPILAR (DP): No especificado\n\nOBSERVACIONES: Prescripción para anteojos, firmada por Dr. María Laura Cambi
0e5856ac-3449-4e39-8fb9-6be89b03011b	/uploads/prescriptions/1776121481192-792604.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-13 23:04:41.222092	eb65c951-041e-48b0-bf6e-bc5602239537	OJO DERECHO (OD):\n• Esfera (ESF): -1.25\n• Cilindro (CIL): -0.50\n• Eje: 10°\n• Adición (ADD): No especificado\n\nOJO IZQUIERDO (OI):\n• Esfera (ESF): -1.00\n• Cilindro (CIL): -0.50\n• Eje: 180°\n• Adición (ADD): No especificado\n\nDISTANCIA PUPILAR (DP): No especificado\n\nOBSERVACIONES: Receta médica de Colegio Médico La Pampa para prácticas complementarias de diagnóstico y tratamiento. Paciente: Ziegenfuss Josefina.
4e49b498-b012-49ea-b339-fea55fe06dd5	/uploads/prescriptions/1776170602667-720487.jpg	Lente: Con filtro azul | Precio: $100.000 – $200.000 | Estilo: Metal	f	2026-04-14 12:43:22.781981	4b754b35-7cc4-4661-9b9f-bc24cf753cfb	\N
f127fa25-7de4-4ee2-b1b7-15ba370170c0	/uploads/prescriptions/1776176938059-591330.jpeg	Lente: Con filtro azul | Precio: $100.000 – $200.000 | Estilo: Acetato	f	2026-04-14 14:28:58.075067	eb65c951-041e-48b0-bf6e-bc5602239537	OJO DERECHO (OD):\n• Esfera (ESF): -1.25\n• Cilindro (CIL): -0.50\n• Eje: 10°\n• Adición (ADD): No especificado\n\nOJO IZQUIERDO (OI):\n• Esfera (ESF): -1.00\n• Cilindro (CIL): -0.50\n• Eje: 180°\n• Adición (ADD): No especificado\n\nDISTANCIA PUPILAR (DP): No especificado\n\nOBSERVACIONES: Receta médica del Colegio Médico La Pampa para anteojos
3e147608-afe7-41e9-bd23-d94e0c8226cc	/uploads/prescriptions/1776203049045-761436.jpeg	Lente: Monofocal | Precio: Sin preferencia | Estilo: Metal	f	2026-04-14 21:44:09.060111	eb65c951-041e-48b0-bf6e-bc5602239537	OJO DERECHO (OD):\n• Esfera (ESF): +1.00\n• Cilindro (CIL): -5.50\n• Eje: 15°\n• Adición (ADD): No especificado\n\nOJO IZQUIERDO (OI):\n• Esfera (ESF): -0.50\n• Cilindro (CIL): -2.50\n• Eje: 170°\n• Adición (ADD): No especificado\n\nDISTANCIA PUPILAR (DP): No especificado\n\nOBSERVACIONES: Astigmatismo (hipermetrópico)
d5dd8fcb-9779-4db9-b92e-bf60f9a533e7	/uploads/prescriptions/1776293810173-175812.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-15 22:56:50.198296	eb65c951-041e-48b0-bf6e-bc5602239537	OJO DERECHO (OD):\n• Esfera (ESF): -1,25\n• Cilindro (CIL): -0,50\n• Eje: 10°\n• Adición (ADD): No especificado\n\nOJO IZQUIERDO (OI):\n• Esfera (ESF): -1,00\n• Cilindro (CIL): -0,50\n• Eje: 180°\n• Adición (ADD): No especificado\n\nDISTANCIA PUPILAR (DP): No especificado\n\nOBSERVACIONES: Receta para anteojos. Documento del Colegio Médico La Pampa.
7fe1220a-005b-4086-8618-74f3a1c8a1a6	/uploads/prescriptions/1776294343067-605348.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-15 23:05:43.084242	eb65c951-041e-48b0-bf6e-bc5602239537	OJO DERECHO (OD):\n• Esfera (ESF): -1.25\n• Cilindro (CIL): -0.50\n• Eje: 10°\n• Adición (ADD): No especificado\n\nOJO IZQUIERDO (OI):\n• Esfera (ESF): -1.00\n• Cilindro (CIL): -0.50\n• Eje: 180°\n• Adición (ADD): No especificado\n\nDISTANCIA PUPILAR (DP): No especificado\n\nOBSERVACIONES: Receta médica para anteojos. Documento del Colegio Médico La Pampa para uso médico exclusivo.
2c5c3997-14c6-40dd-9884-d95d98ffb787	/uploads/prescriptions/1776341073046-125985.jpeg	Lente: Necesita asesoramiento | Precio: Sin preferencia | Estilo: Sin preferencia	f	2026-04-16 12:04:33.075905	eb65c951-041e-48b0-bf6e-bc5602239537	OJO DERECHO (OD):\n• Esfera (ESF): -1,25\n• Cilindro (CIL): -0,50\n• Eje: 10°\n• Adición (ADD): No especificado\n\nOJO IZQUIERDO (OI):\n• Esfera (ESF): -1,00\n• Cilindro (CIL): -0,50\n• Eje: 180°\n• Adición (ADD): No especificado\n\nDISTANCIA PUPILAR (DP): No especificado\n\nOBSERVACIONES: Receta para anteojos. Documento del Colegio Médico La Pampa para uso médico exclusivo.
\.


--
-- Data for Name: quote_frames; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.quote_frames (id, "quoteId", "frameId") FROM stdin;
0d12de54-7834-40b0-9344-69b06d7dc4e4	37db18d7-7278-4cb1-aa85-cbf47a99afe6	40dfad7c-1f07-445c-800e-48dbc1b353bc
af7cb189-6bf8-4aab-8b37-a1c0a67d7716	7b860683-7a83-4e50-b814-b5c2a2e41630	40dfad7c-1f07-445c-800e-48dbc1b353bc
ad19d8c9-3d8b-47b0-b3a7-6fd138bf3075	64df2550-929d-4d15-b41d-e6f838df2708	40dfad7c-1f07-445c-800e-48dbc1b353bc
b52b31a6-1fd6-4703-859a-ab91c5f0f623	a375a6df-222d-4263-8eac-fbc4a4f5648a	0869ab69-4847-424f-9d54-e95275c85c82
e0e434ac-1f21-471a-8421-cd8519820fff	a46a99b7-a505-47e7-a495-0d6a3fb33ead	0869ab69-4847-424f-9d54-e95275c85c82
9ad773c6-0e52-4021-ac9e-37e8fffb94ce	573924cb-861a-4321-b31c-1422a21e717a	0869ab69-4847-424f-9d54-e95275c85c82
f744aed3-32d9-4dc0-befa-f8af61f6b5f6	c05ba556-45bb-4097-8b49-35ef4fa75332	0869ab69-4847-424f-9d54-e95275c85c82
b5e138ac-3e6f-4188-ac57-0ec79a61f5f3	a279b9a6-c2df-4534-9750-22b7c0419de3	0869ab69-4847-424f-9d54-e95275c85c82
a27afc5b-b4b3-433a-9da7-8b3d0908cae5	5d9575bd-82df-4165-aa34-322f56672552	40dfad7c-1f07-445c-800e-48dbc1b353bc
09027ab1-0bcf-4842-98d8-617b5a6d5f4f	6b037dd9-12b2-4fde-a684-6fecdf1df238	40dfad7c-1f07-445c-800e-48dbc1b353bc
eadd127d-140d-4f36-90a1-cb9d8352606f	bacce2b1-d98d-439a-8dce-9c4808d648d4	40dfad7c-1f07-445c-800e-48dbc1b353bc
89efcc65-3bab-4050-9760-ecf71d8fc48b	21c3511b-e97c-44ad-9780-2da6d488bee5	4c76e40b-cc3b-4bff-aa42-484600bd44e9
98789807-9a2d-4036-b2cd-0173f0d46335	2c4a4bbc-1ff4-4ac0-a44a-a9e994823f54	e71559cd-6e19-4500-bca2-ed93ba844bd0
4a7d2d77-a2d3-4b05-b12a-c1128b736854	4114eb4b-5db5-40b4-b02b-061f4f234184	70579035-c6e4-478c-8823-9dba3532d354
d508186c-d753-4f40-a65d-c18a302d400c	4114eb4b-5db5-40b4-b02b-061f4f234184	e71559cd-6e19-4500-bca2-ed93ba844bd0
dd0dc560-34da-43ec-92b8-9c0ae63217d1	d8b2bc12-3045-41f6-aac0-db7e65fb7961	0869ab69-4847-424f-9d54-e95275c85c82
5e518e7d-559e-4b68-ae4b-f9679cca6ccf	191abcc1-25d8-4b41-8dfa-5337d2879582	70579035-c6e4-478c-8823-9dba3532d354
d14d0cf3-bb78-4beb-aa42-a3cbd7830bfa	191abcc1-25d8-4b41-8dfa-5337d2879582	e71559cd-6e19-4500-bca2-ed93ba844bd0
3bac9862-d106-4244-acb1-e0facd4c61cf	7c2f794d-6192-4886-9cf2-3d203005d092	70579035-c6e4-478c-8823-9dba3532d354
e23df7eb-8488-47ac-bfa2-56a47abbf19e	bf50ca31-b310-4199-a789-fbce675e3f74	039b5db4-baf0-41e0-b596-69fb07b5da41
0c1f9450-854b-49ee-88a9-314390a8e252	b98eb687-ac70-4163-97b3-07cc703f2046	e71559cd-6e19-4500-bca2-ed93ba844bd0
32f2ecd4-1796-41b6-a1bb-cdcc96284211	b98eb687-ac70-4163-97b3-07cc703f2046	90f41835-4ef7-40b2-85ba-d48216ee2ad1
8fc166a6-ee61-43ca-a2f2-098b0abafc77	34ad0fd3-ccb5-4d0e-a479-9b63c2b32712	90f41835-4ef7-40b2-85ba-d48216ee2ad1
6a6bc500-71ed-4b30-8624-492192072d2f	34ad0fd3-ccb5-4d0e-a479-9b63c2b32712	e71559cd-6e19-4500-bca2-ed93ba844bd0
efac6baf-8cd5-4cd8-819e-d9f082793b82	ba23097a-888f-4683-8828-46525a1d15ce	039b5db4-baf0-41e0-b596-69fb07b5da41
85138e00-266c-495c-9db5-38f2fbcc8875	ba23097a-888f-4683-8828-46525a1d15ce	4c76e40b-cc3b-4bff-aa42-484600bd44e9
13f5d33e-df56-46fb-a2c7-35b3d49fe895	3d02be46-8e85-42fe-93e1-f17d0a150dcf	90f41835-4ef7-40b2-85ba-d48216ee2ad1
75061412-56b0-45e2-b70f-8617986ecb2a	69fd4f53-2924-4e83-ae0e-274612767ec1	90f41835-4ef7-40b2-85ba-d48216ee2ad1
12ed8c2f-5c2b-4b1e-8e3c-8138ecc22bef	0b0101fa-9a2b-407f-a0e9-7ab2a3230eaf	90f41835-4ef7-40b2-85ba-d48216ee2ad1
e7053d0d-4d82-473c-9ae9-fc3a3b9b2004	ad39552a-9b14-4311-b15f-446301b927b9	90f41835-4ef7-40b2-85ba-d48216ee2ad1
8d0c5609-d5b7-4bb3-b074-7efffd462eeb	52967c0b-db5d-405f-b0ce-c58d253109e3	90f41835-4ef7-40b2-85ba-d48216ee2ad1
44f5fa95-f731-40f8-9933-01edd236ee28	690bac1b-1dba-4e44-ac14-3991460d9654	90f41835-4ef7-40b2-85ba-d48216ee2ad1
ff9404ff-df9e-4ac0-8083-3aa7da5b159a	5e21868e-2b1e-4e8b-b9de-c8228bf6123a	e71559cd-6e19-4500-bca2-ed93ba844bd0
ae033e77-ad63-4cef-8fb5-05e1c936f226	4ecc9021-9321-43e6-9b8b-0ae7a38d3e54	039b5db4-baf0-41e0-b596-69fb07b5da41
0d633d2d-5c4b-4099-8931-0b33f5077d1b	21844ae2-a45b-4bed-b0c3-cc849057791c	90f41835-4ef7-40b2-85ba-d48216ee2ad1
43f845e5-1e25-4393-b429-b010ebd87d51	19dd39fc-4c6c-4042-844f-bdabd34cf787	90f41835-4ef7-40b2-85ba-d48216ee2ad1
90e07c32-4e64-4814-a657-8d2bc5976122	19dd39fc-4c6c-4042-844f-bdabd34cf787	e71559cd-6e19-4500-bca2-ed93ba844bd0
b63459d4-82b0-4af1-a675-e167d74f5876	f0c17848-98d3-44e0-b32a-e892df0b5be0	90f41835-4ef7-40b2-85ba-d48216ee2ad1
18f8c40e-35f9-4dfa-93c9-0fb7c607f2a9	cbfd1432-41b0-492f-b198-3d8c6f58d2d6	6d598b6f-9578-4d9c-9800-0bd058b50651
025ee073-39c6-474b-9b85-55872418e27f	61de1d5c-837e-440d-afa1-f48723b5eb61	6d598b6f-9578-4d9c-9800-0bd058b50651
5245d050-f127-4f21-a5ff-5fd31b4d040e	61de1d5c-837e-440d-afa1-f48723b5eb61	e71559cd-6e19-4500-bca2-ed93ba844bd0
fe05ff34-e5c4-49b3-b30e-e1695a5995f4	61de1d5c-837e-440d-afa1-f48723b5eb61	90f41835-4ef7-40b2-85ba-d48216ee2ad1
d493e448-e359-4e88-b2a6-11bd3a4a8011	61de1d5c-837e-440d-afa1-f48723b5eb61	cadc909b-f252-4c95-9157-45c137c3e54a
79943c9c-a134-4fc0-8e37-a7fa13d6461e	a30a210d-7bca-4cf3-a7aa-6c58cdaa7dc1	953559ac-7063-4093-a2c4-f91f20b7a502
b6e6f49d-9b51-4f6c-8e25-550bfc329372	a30a210d-7bca-4cf3-a7aa-6c58cdaa7dc1	4c76e40b-cc3b-4bff-aa42-484600bd44e9
ab851436-65fc-43bc-bb8d-c262348a3989	fc567eac-aee8-4604-bb49-57dc6c5261c1	cadc909b-f252-4c95-9157-45c137c3e54a
4a1b8f35-0fd2-4a89-a982-eab226865089	fc567eac-aee8-4604-bb49-57dc6c5261c1	90f41835-4ef7-40b2-85ba-d48216ee2ad1
c38b13df-a680-4f32-ad21-30a2540a2aa1	9a1e426e-0610-453d-9f96-9c975d2f3e51	28b89156-c147-472e-a2b9-33aae7f43fbb
4180a7d7-3215-4746-838e-a50b4ccb408e	9a1e426e-0610-453d-9f96-9c975d2f3e51	bbbd9bfe-fc5a-4484-b39c-06fb32f7e22b
cf25be67-83b7-4240-b611-8f692d6ca856	9a1e426e-0610-453d-9f96-9c975d2f3e51	bc723c4e-105e-440c-8e4e-f889177f0abb
0e8388df-d3d5-4bea-9949-3fb0ddb9b24c	9a1e426e-0610-453d-9f96-9c975d2f3e51	93e0ba97-6072-4acf-9d84-628b5d87b19e
d8046fe2-43da-4bf4-964e-70b7bbc0c44c	9a1e426e-0610-453d-9f96-9c975d2f3e51	2be50cea-8c03-4fdb-b044-f0d811801ce2
3e6e610a-fc10-4b42-879c-291984faf495	18d1331e-36d3-4070-bb7e-22eb463bb219	039b5db4-baf0-41e0-b596-69fb07b5da41
9ff6dd25-f07c-4dcc-b337-b6c98df62102	18d1331e-36d3-4070-bb7e-22eb463bb219	953559ac-7063-4093-a2c4-f91f20b7a502
a20c62d2-cc5f-42ed-95b0-395b922e51d7	18d1331e-36d3-4070-bb7e-22eb463bb219	4c76e40b-cc3b-4bff-aa42-484600bd44e9
2486f471-502b-483e-b984-34d6a095db83	e1219e82-592c-4b52-b0f0-3dc1a905fb07	bbbd9bfe-fc5a-4484-b39c-06fb32f7e22b
0571c386-7679-47da-8b52-562679dfd6ea	9652fa13-ce13-4a26-84aa-abeca35d46b1	92af84ba-52cc-4429-8e40-b182fa134ad1
e951ea32-30a1-4c77-99f2-b8ee1fee7e77	47219e3a-dc8b-46ad-be1e-486cb13693d8	92af84ba-52cc-4429-8e40-b182fa134ad1
e0a6d218-c9a4-4d87-ac75-ca852b2d652b	47219e3a-dc8b-46ad-be1e-486cb13693d8	16af3025-2916-4260-8694-9845320bfea4
\.


--
-- Data for Name: quote_requests; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.quote_requests (id, "lensType", "priceRangeMin", "priceRangeMax", "stylePreferences", "clientLat", "clientLng", status, "quotesReceived", "expiresAt", "createdAt", "clientId", "prescriptionId", "serviceType", observations, gender) FROM stdin;
b140147c-0220-4773-8df0-3fa22ea746f3	monofocal	40000	80000		-35.660629527546526	-63.75296363180908	expired	0	2026-04-04 15:07:05.122	2026-04-02 15:07:05.139656	eb65c951-041e-48b0-bf6e-bc5602239537	68b7ccf4-e236-4c4c-a6d1-38d095103c8c	lentes_receta	\N	\N
ed53c7a0-1dc7-4976-9a7a-c2d4122c5574	monofocal	40000	80000	metal	-35.660753265293856	-63.75320658129373	expired	0	2026-04-04 15:09:49.938	2026-04-02 15:09:49.944541	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	5b617281-953e-4357-b8c5-1328dec4b792	lentes_receta	\N	\N
8df4d5ef-c372-48a0-9ae3-b006314d610f	monofocal	40000	80000		-35.660706625929656	-63.752986599269825	expired	0	2026-04-04 15:12:39.718	2026-04-02 15:12:39.732238	140f6673-13ea-4c1b-aedd-481a6e900039	8bb306f6-a5a9-4b95-a12c-5757dfe69d0d	lentes_receta	\N	\N
eb954173-36f6-4df8-b7f2-690be7c23cdd	no_se	\N	\N		-35.660653373392066	-63.7528607579153	expired	0	2026-04-06 12:27:34.125	2026-04-04 12:27:34.15839	140f6673-13ea-4c1b-aedd-481a6e900039	c9c5bf9e-4427-4cae-9454-979ba1484b68	lentes_receta	\N	\N
02bb1359-b404-4117-be5a-cc7b6baebc83	no_se	\N	\N		-34.6037	-58.3816	filled	2	2026-04-09 01:43:27.529	2026-04-07 01:43:27.537044	eb65c951-041e-48b0-bf6e-bc5602239537	8f66b46d-5f92-4fbf-8388-5f5bafeb57af	lentes_receta	\N	\N
8f9332d2-957f-4b54-913d-1567fecbda65	filtro_azul	100000	200000	acetato	-35.66063065731508	-63.75295212163442	filled	1	2026-04-16 14:29:00.133	2026-04-14 14:29:00.142655	eb65c951-041e-48b0-bf6e-bc5602239537	f127fa25-7de4-4ee2-b1b7-15ba370170c0	lentes_receta	\N	femenino
39fc7dde-4913-49a8-80af-99fe4e7cbd20	no_se	\N	\N		-35.6741847	-63.7482058	filled	1	2026-04-12 00:06:31.53	2026-04-10 00:06:31.562953	eb65c951-041e-48b0-bf6e-bc5602239537	578b9b9b-ad73-4041-aa15-c7a456f0982a	lentes_receta	\N	no_especifica
593d83e7-9226-4764-853a-1634fd12ce91	no_se	\N	\N		-35.66077135103636	-63.75304271636482	filled	2	2026-04-09 20:06:29.801	2026-04-07 20:06:29.811857	eb65c951-041e-48b0-bf6e-bc5602239537	996801a4-a5bc-41b5-a08e-2156fcf7cbac	lentes_receta	\N	\N
7566619f-b94f-4dc1-b192-a2c7f25518e7	monofocal	150000	500000		-35.66066980136246	-63.75298613396756	filled	1	2026-04-10 15:35:12.484	2026-04-08 15:35:12.493826	eb65c951-041e-48b0-bf6e-bc5602239537	75301aa4-bc61-4625-8966-69183ec71e54	lentes_receta	\N	\N
d2a9d08a-251d-4152-a440-9678e9f3dc3f	no_se	\N	\N		-35.66072772650529	-63.75306973306605	filled	2	2026-04-08 11:45:48.82	2026-04-06 11:45:48.828585	eb65c951-041e-48b0-bf6e-bc5602239537	88988282-2c7b-4032-be79-971109d08252	lentes_receta	\N	\N
59fa455f-4112-4825-953e-2cbb715d3c9a	no_se	\N	\N		-35.66073670654611	-63.75306845893737	filled	1	2026-04-15 23:04:44.945	2026-04-13 23:04:44.955949	eb65c951-041e-48b0-bf6e-bc5602239537	0e5856ac-3449-4e39-8fb9-6be89b03011b	lentes_receta	\N	no_especifica
98cd1cd0-3c24-4961-a92c-d236f0bfd59b	no_se	\N	\N		-35.6742081	-63.7483747	filled	1	2026-04-12 01:10:49.427	2026-04-10 01:10:49.443314	eb65c951-041e-48b0-bf6e-bc5602239537	40d4e9d6-4e74-4446-a9a5-81cfbe7f1933	lentes_receta	\N	no_especifica
d8033c89-665d-4ad2-9f78-d07a65f29367	no_se	\N	\N		-35.66072536102242	-63.753004367407314	filled	2	2026-04-10 21:10:57.503	2026-04-08 21:10:57.514192	eb65c951-041e-48b0-bf6e-bc5602239537	e4dc5925-e958-495d-b317-c7685af17f62	lentes_receta	\N	\N
a60d13ce-4e89-467b-aa5b-c74f4fbcd775	no_se	\N	\N		-35.660673116447704	-63.75291186838432	filled	1	2026-04-10 22:09:53.888	2026-04-08 22:09:53.900258	eb65c951-041e-48b0-bf6e-bc5602239537	8a3936f3-f2a0-416a-ba66-30380307f717	lentes_receta	\N	\N
d1b89aba-fbc8-4589-8a7a-46b7de33cd18	no_se	\N	\N		-35.660677816479975	-63.75300840902629	filled	1	2026-04-08 21:33:14.851	2026-04-06 21:33:14.873136	eb65c951-041e-48b0-bf6e-bc5602239537	320a84f5-0847-48ec-951f-1b361a1684f4	lentes_receta	\N	\N
ab3f3fff-4bca-4d0f-bbf4-e51fb9e78efd	no_se	\N	\N		-35.66065732015918	-63.7529343989321	filled	1	2026-04-10 23:35:57.626	2026-04-08 23:35:57.643077	eb65c951-041e-48b0-bf6e-bc5602239537	b8bd1f24-99d8-4fcb-b4dc-74244fb12998	lentes_receta	\N	masculino
8adf442e-1724-4511-a083-a7a699370c0a	no_se	\N	\N		-35.6742167	-63.7483207	filled	1	2026-04-12 01:31:20.309	2026-04-10 01:31:20.319461	eb65c951-041e-48b0-bf6e-bc5602239537	6f35472f-76d1-4336-8eb1-fd981c91520f	lentes_receta	\N	no_especifica
b8fd20f2-36af-4d90-bc50-cbf403149811	no_se	400000	1000000		-35.66070917159545	-63.753010290785674	filled	1	2026-04-11 11:41:10.349	2026-04-09 11:41:10.35995	eb65c951-041e-48b0-bf6e-bc5602239537	d912b7f6-e772-4949-a186-9e9ee51e1f48	lentes_receta	\N	masculino
bd48452e-53a7-4ce9-a6a5-f3d99ce076f8	no_se	\N	\N		-35.6606605557928	-63.75296738088608	filled	6	2026-04-08 12:59:42.383	2026-04-06 12:59:42.393289	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	86b067d4-54b7-4fd7-bbe9-b6e4a2cae344	lentes_receta	\N	\N
615b27f3-2fc7-4a49-a625-388c583e2b4f	no_se	\N	\N		-35.660702903356956	-63.752950649436634	cancelled	6	2026-04-08 13:00:59.5	2026-04-06 13:00:59.548906	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	aa188cb3-f6b7-45ee-a20f-2cb30a2d23e3	lentes_receta	\N	\N
2d042991-1be5-4bba-b63f-ae12fdcd465f	no_se	\N	\N		-35.66069959078492	-63.75294627965184	cancelled	5	2026-04-08 13:02:30.619	2026-04-06 13:02:30.734684	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	54daa946-4ff6-4c79-b14b-6030760ca8ae	lentes_receta	\N	\N
f9f324a4-c644-4a3f-8430-33fa95718fcf	monofocal	40000	80000		-35.660731614543884	-63.75306206507891	filled	3	2026-04-08 21:42:42.354	2026-04-06 21:42:42.366424	140f6673-13ea-4c1b-aedd-481a6e900039	fae5f80c-3bd2-4840-8271-38f3f8c6d00b	lentes_receta	\N	\N
bec2a2fe-c617-4396-aa2d-142a446582b9	no_se	\N	\N		-35.66077738507342	-63.75304169648787	filled	1	2026-04-08 23:12:09.487	2026-04-06 23:12:09.493437	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	85660cee-dd0d-459b-af50-76c79b425d7f	lentes_receta	\N	\N
cb795c53-3227-4b93-9435-521fb5bfcb3f	monofocal	100000	200000		-35.66070772047378	-63.75313086959185	filled	3	2026-04-13 23:23:51.136	2026-04-11 23:23:51.143516	eb65c951-041e-48b0-bf6e-bc5602239537	29a70b0b-952b-4ae6-9156-e88ab32f892b	lentes_receta	\N	masculino
31bc556d-e6da-4b99-b7b0-5ff3b1b5a9c9	no_se	\N	\N		-35.66072209909329	-63.75300181238479	filled	1	2026-04-12 11:41:23.469	2026-04-10 11:41:23.477148	eb65c951-041e-48b0-bf6e-bc5602239537	d9aa941f-e9d5-4981-bf69-4bee03acdecc	lentes_receta	\N	no_especifica
64fd71da-d993-498b-a9e1-343dea9336f7	filtro_azul	50000	100000		-35.66068096370121	-63.75304169944592	filled	2	2026-04-11 22:20:36.173	2026-04-09 22:20:36.183555	eb65c951-041e-48b0-bf6e-bc5602239537	6c985e06-108d-4521-afd3-2811a1e1c6ad	lentes_receta	\N	masculino
0c38ecf0-3278-474a-9d03-bdeac8a5d195	bifocal	100000	200000		-35.660653687316454	-63.7530088696035	cancelled	1	2026-04-11 22:21:37.799	2026-04-09 22:21:37.804112	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	5d9d6cee-e7d8-44f1-9fca-21f00d21ce3f	lentes_receta	quisiera que no me queden como una gata	femenino
3acad3ca-6913-4c43-8f0d-5e94e22dc6b2	no_se	\N	\N	sin_aro	-35.66068977952849	-63.753052301781274	cancelled	0	2026-04-11 22:31:36.231	2026-04-09 22:31:36.238044	08dc4f7b-651a-4eb8-94cf-efc1fb752c69	189a990c-b0cb-4d2c-bc4b-1ba1811d0654	lentes_receta	\N	no_especifica
682319ad-b639-445f-81d9-8dafb86f5c84	no_se	\N	\N		-35.6607121011862	-63.752996151518936	filled	1	2026-04-12 12:13:43.897	2026-04-10 12:13:43.92522	eb65c951-041e-48b0-bf6e-bc5602239537	8e5ab94d-ec9c-4f9f-a474-59395f90569e	lentes_receta	\N	no_especifica
1901d90b-504a-45cc-ba3d-07607ab9d87f	no_se	\N	\N		-35.66072393748932	-63.75301772156587	filled	1	2026-04-12 12:53:55.353	2026-04-10 12:53:55.359943	eb65c951-041e-48b0-bf6e-bc5602239537	f070a201-b371-444d-b932-9fb42a7ae859	lentes_receta	\N	no_especifica
744c256b-7ac3-4ce6-bad6-fcab77783f8a	no_se	\N	\N		-35.660674603831716	-63.75305927472166	filled	1	2026-04-13 23:34:45.634	2026-04-11 23:34:45.648557	eb65c951-041e-48b0-bf6e-bc5602239537	39cc185a-edd3-4015-98e0-2c46cf10a1ff	lentes_receta	\N	no_especifica
2c8d1a66-2ad7-44b0-9af5-4f6ca67b50af	no_se	\N	\N		-34.6037	-58.3816	filled	1	2026-04-12 21:37:28.787	2026-04-10 21:37:28.797267	eb65c951-041e-48b0-bf6e-bc5602239537	8128b480-00c1-4bd4-8a2c-698f8cd7237b	lentes_receta	\N	no_especifica
551a1a1e-99df-4c33-96a7-ffd4141424d9	no_se	\N	\N		-35.66079966666666	-63.75308366666667	filled	1	2026-04-15 13:24:16.511	2026-04-13 13:24:16.529428	eb65c951-041e-48b0-bf6e-bc5602239537	486ecb12-2ae4-4d45-b4b5-231178debf14	lentes_receta	\N	no_especifica
0e1312a0-563d-4712-aa03-03ce6e220ca4	no_se	\N	\N		-35.660597871551204	-63.752869795616945	filled	1	2026-04-17 22:56:52.442	2026-04-15 22:56:52.449965	eb65c951-041e-48b0-bf6e-bc5602239537	d5dd8fcb-9779-4db9-b92e-bf60f9a533e7	lentes_receta	\N	no_especifica
2a3e3372-bd12-4625-8949-f533afbc8111	no_se	\N	\N		-35.660731632985346	-63.75302429877406	filled	1	2026-04-15 13:39:25.872	2026-04-13 13:39:25.901827	eb65c951-041e-48b0-bf6e-bc5602239537	72c0d015-a646-4629-a316-bea40f6fbaf9	lentes_receta	\N	no_especifica
6ac40bc7-e24b-40e0-81b1-6e4004275a06	filtro_azul	100000	200000	metal	-35.6664876	-63.7639905	filled	3	2026-04-16 12:43:24.029	2026-04-14 12:43:24.042454	4b754b35-7cc4-4661-9b9f-bc24cf753cfb	4e49b498-b012-49ea-b339-fea55fe06dd5	lentes_receta	Redondo	femenino
6af78875-17b1-463a-b9c2-172db279618c	monofocal	\N	\N	metal	-34.6037	-58.3816	filled	3	2026-04-16 21:44:09.296	2026-04-14 21:44:09.304029	eb65c951-041e-48b0-bf6e-bc5602239537	3e147608-afe7-41e9-bd23-d94e0c8226cc	lentes_receta	con filtro azul	femenino
d51bc527-2ee6-426f-873b-c53fff8a7534	no_se	\N	\N		-35.66067241435048	-63.752981841711	filled	1	2026-04-17 23:05:45.335	2026-04-15 23:05:45.345104	eb65c951-041e-48b0-bf6e-bc5602239537	7fe1220a-005b-4086-8618-74f3a1c8a1a6	lentes_receta	\N	no_especifica
cb21fae7-ee4a-4244-8b8b-3be09380256b	no_se	\N	\N		-35.660747951002286	-63.75316813780766	filled	1	2026-04-18 12:04:34.891	2026-04-16 12:04:34.900846	eb65c951-041e-48b0-bf6e-bc5602239537	2c5c3997-14c6-40dd-9884-d95d98ffb787	lentes_receta	\N	no_especifica
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.quotes (id, "totalPrice", "lensDescription", "estimatedDays", status, "createdAt", "requestId", "opticaId", "expiresAt", "tierBasicPrice", "tierBasicDesc", "tierRecommendedPrice", "tierRecommendedDesc", "tierPremiumPrice", "tierPremiumDesc", "selectedTier") FROM stdin;
18702b3e-663b-4bf3-9e30-f45f98ae702f	123	123	1	rejected	2026-04-06 20:27:42.066909	d2a9d08a-251d-4152-a440-9678e9f3dc3f	b738e8bf-3534-4956-9ec7-5301a47b0afa	\N	\N	\N	\N	\N	\N	\N	\N
1f581e7c-463b-4985-8163-da492d7a05a1	125000	asa	2	accepted	2026-04-06 20:27:02.0607	d2a9d08a-251d-4152-a440-9678e9f3dc3f	b738e8bf-3534-4956-9ec7-5301a47b0afa	\N	\N	\N	\N	\N	\N	\N	\N
64df2550-929d-4d15-b41d-e6f838df2708	12	as	2	accepted	2026-04-06 21:34:35.073249	d1b89aba-fbc8-4589-8a7a-46b7de33cd18	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	\N	\N	\N	\N	\N	\N	\N
e4f48ca7-0b64-453f-bee5-c2f0e78d48b4	123000	dfgd	3	rejected	2026-04-06 20:27:13.284956	bd48452e-53a7-4ce9-a6a5-f3d99ce076f8	b738e8bf-3534-4956-9ec7-5301a47b0afa	\N	\N	\N	\N	\N	\N	\N	\N
3d82d1e1-f168-4ea6-84fa-d23f95f849fd	234555	asee	1	rejected	2026-04-06 20:28:11.141761	bd48452e-53a7-4ce9-a6a5-f3d99ce076f8	b738e8bf-3534-4956-9ec7-5301a47b0afa	\N	\N	\N	\N	\N	\N	\N	\N
266e376e-22ad-4bf2-948e-e5612f9f9f56	123	ase	2	rejected	2026-04-06 20:28:36.948911	bd48452e-53a7-4ce9-a6a5-f3d99ce076f8	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	\N	\N	\N	\N	\N	\N	\N
dacb97f4-baef-4d5b-9b54-4814f469666c	12	as	2	rejected	2026-04-06 21:34:15.464548	bd48452e-53a7-4ce9-a6a5-f3d99ce076f8	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	\N	\N	\N	\N	\N	\N	\N
a46a99b7-a505-47e7-a495-0d6a3fb33ead	14	asqs	2	rejected	2026-04-06 21:43:30.632619	bd48452e-53a7-4ce9-a6a5-f3d99ce076f8	5ced47ba-406d-42fe-9cea-c63c70189a5d	\N	\N	\N	\N	\N	\N	\N	\N
da3df02f-9429-4481-9995-e828d21cf9dc	2	asd	2	accepted	2026-04-06 21:33:31.337966	bd48452e-53a7-4ce9-a6a5-f3d99ce076f8	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	\N	\N	\N	\N	\N	\N	\N
3b049bf2-bbb0-4acf-aff2-a0b3ac5eba1e	123	qse	1	rejected	2026-04-06 20:27:22.643013	615b27f3-2fc7-4a49-a625-388c583e2b4f	b738e8bf-3534-4956-9ec7-5301a47b0afa	\N	\N	\N	\N	\N	\N	\N	\N
075d0f82-b6f2-4242-a38b-aadad95c27c2	123	123	1	rejected	2026-04-06 20:27:32.707839	615b27f3-2fc7-4a49-a625-388c583e2b4f	b738e8bf-3534-4956-9ec7-5301a47b0afa	\N	\N	\N	\N	\N	\N	\N	\N
089970ec-8e1d-46a8-ae70-a795eea341f2	1223	11	1	rejected	2026-04-06 20:27:49.0179	615b27f3-2fc7-4a49-a625-388c583e2b4f	b738e8bf-3534-4956-9ec7-5301a47b0afa	\N	\N	\N	\N	\N	\N	\N	\N
0f4a80ed-0efc-4e2d-8968-4d8cd8f7b57a	1	ase	1	rejected	2026-04-06 21:29:42.996118	615b27f3-2fc7-4a49-a625-388c583e2b4f	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	\N	\N	\N	\N	\N	\N	\N
37db18d7-7278-4cb1-aa85-cbf47a99afe6	12	ase	2	rejected	2026-04-06 21:30:43.350051	615b27f3-2fc7-4a49-a625-388c583e2b4f	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	\N	\N	\N	\N	\N	\N	\N
a375a6df-222d-4263-8eac-fbc4a4f5648a	12	asd	1	rejected	2026-04-06 21:43:18.856661	615b27f3-2fc7-4a49-a625-388c583e2b4f	5ced47ba-406d-42fe-9cea-c63c70189a5d	\N	\N	\N	\N	\N	\N	\N	\N
ff1e0044-9591-4168-94fa-fa4480856985	123444	asee	1	rejected	2026-04-06 20:28:27.971091	2d042991-1be5-4bba-b63f-ae12fdcd465f	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	\N	\N	\N	\N	\N	\N	\N
630f834e-4dc9-48f6-a96f-d2cb772936c9	123	ase	2	rejected	2026-04-06 21:29:51.534801	2d042991-1be5-4bba-b63f-ae12fdcd465f	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	\N	\N	\N	\N	\N	\N	\N
7ef97d8c-5675-44cf-b141-d6c16a488c8f	123	asea	2	rejected	2026-04-06 21:30:00.184293	2d042991-1be5-4bba-b63f-ae12fdcd465f	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	\N	\N	\N	\N	\N	\N	\N
7b860683-7a83-4e50-b814-b5c2a2e41630	21	as	1	rejected	2026-04-06 21:34:26.647057	2d042991-1be5-4bba-b63f-ae12fdcd465f	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	\N	\N	\N	\N	\N	\N	\N
573924cb-861a-4321-b31c-1422a21e717a	53	xghe	2	rejected	2026-04-06 21:43:40.658986	2d042991-1be5-4bba-b63f-ae12fdcd465f	5ced47ba-406d-42fe-9cea-c63c70189a5d	\N	\N	\N	\N	\N	\N	\N	\N
c05ba556-45bb-4097-8b49-35ef4fa75332	52	xgt	2	rejected	2026-04-06 21:44:20.100247	f9f324a4-c644-4a3f-8430-33fa95718fcf	5ced47ba-406d-42fe-9cea-c63c70189a5d	\N	\N	\N	\N	\N	\N	\N	\N
5d9575bd-82df-4165-aa34-322f56672552	1	hfsd	2	rejected	2026-04-06 21:50:46.594104	f9f324a4-c644-4a3f-8430-33fa95718fcf	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	\N	\N	\N	\N	\N	\N	\N
a279b9a6-c2df-4534-9750-22b7c0419de3	33	sfvs	1	accepted	2026-04-06 21:47:32.196306	f9f324a4-c644-4a3f-8430-33fa95718fcf	5ced47ba-406d-42fe-9cea-c63c70189a5d	\N	\N	\N	\N	\N	\N	\N	\N
73535626-5274-4561-ae7c-796532395b71	17	filtro azul	1	accepted	2026-04-06 23:12:40.159527	bec2a2fe-c617-4396-aa2d-142a446582b9	b738e8bf-3534-4956-9ec7-5301a47b0afa	\N	\N	\N	\N	\N	\N	\N	\N
44f1cf57-34c9-40e9-963d-24c7fe57ccc7	124	sda	2	rejected	2026-04-07 01:46:11.619899	02bb1359-b404-4117-be5a-cc7b6baebc83	b738e8bf-3534-4956-9ec7-5301a47b0afa	\N	\N	\N	\N	\N	\N	\N	\N
6b037dd9-12b2-4fde-a684-6fecdf1df238	122	multifocal	1	accepted	2026-04-07 01:44:56.075542	02bb1359-b404-4117-be5a-cc7b6baebc83	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	\N	\N	\N	\N	\N	\N	\N	\N
21c3511b-e97c-44ad-9780-2da6d488bee5	12	feet	2	rejected	2026-04-07 20:10:06.052421	593d83e7-9226-4764-853a-1634fd12ce91	b738e8bf-3534-4956-9ec7-5301a47b0afa	2026-04-08 20:10:06.05	\N	\N	\N	\N	\N	\N	\N
bacce2b1-d98d-439a-8dce-9c4808d648d4	32	azasd	2	accepted	2026-04-07 20:06:56.466103	593d83e7-9226-4764-853a-1634fd12ce91	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-08 20:06:56.464	\N	\N	\N	\N	\N	\N	\N
2c4a4bbc-1ff4-4ac0-a44a-a9e994823f54	1	ghf	2	accepted	2026-04-08 15:37:07.437851	7566619f-b94f-4dc1-b192-a2c7f25518e7	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-09 15:37:07.436	\N	\N	\N	\N	\N	\N	\N
d8b2bc12-3045-41f6-aac0-db7e65fb7961	3	SDFSDFS	3	rejected	2026-04-08 21:12:52.50738	d8033c89-665d-4ad2-9f78-d07a65f29367	5ced47ba-406d-42fe-9cea-c63c70189a5d	2026-04-09 21:12:52.503	\N	\N	\N	\N	\N	\N	\N
4114eb4b-5db5-40b4-b02b-061f4f234184	12	LENTES CON FILTRO	2	accepted	2026-04-08 21:11:57.47874	d8033c89-665d-4ad2-9f78-d07a65f29367	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-09 21:11:57.476	\N	\N	\N	\N	\N	\N	\N
191abcc1-25d8-4b41-8dfa-5337d2879582	32	filtro azul	1	accepted	2026-04-08 22:13:40.649831	a60d13ce-4e89-467b-aa5b-c74f4fbcd775	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-09 22:13:40.647	\N	\N	\N	\N	\N	\N	\N
7c2f794d-6192-4886-9cf2-3d203005d092	4	\N	2	accepted	2026-04-09 11:32:18.507971	ab3f3fff-4bca-4d0f-bbf4-e51fb9e78efd	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-10 11:32:18.487	2	blancos	4	bluecut	6	fotocromaticos	recomendada
bf50ca31-b310-4199-a789-fbce675e3f74	2	\N	4	accepted	2026-04-09 12:00:48.823857	b8fd20f2-36af-4d90-bc50-cbf403149811	b738e8bf-3534-4956-9ec7-5301a47b0afa	2026-04-10 12:00:48.82	1	bl	2	ro	3	ne	recomendada
ba23097a-888f-4683-8828-46525a1d15ce	45	\N	1	rejected	2026-04-09 22:26:05.487022	64fd71da-d993-498b-a9e1-343dea9336f7	b738e8bf-3534-4956-9ec7-5301a47b0afa	2026-04-10 22:26:05.486	44	orgnaicos blancos	45	bue	46	foto	\N
b98eb687-ac70-4163-97b3-07cc703f2046	20	\N	1	accepted	2026-04-09 22:24:26.199716	64fd71da-d993-498b-a9e1-343dea9336f7	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-10 22:24:26.193	15	par de organicos balncos	20	bluecut	30	foto mas ar mas blue	recomendada
34ad0fd3-ccb5-4d0e-a479-9b63c2b32712	12	\N	10	rejected	2026-04-09 22:25:25.374067	0c38ecf0-3278-474a-9d03-bdeac8a5d195	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-10 22:25:25.372	10	bifocal blaancvo	12	bifocal bluecut	15	bifocal foto	\N
3d02be46-8e85-42fe-93e1-f17d0a150dcf	2	\N	2	accepted	2026-04-10 00:07:37.406546	39fc7dde-4913-49a8-80af-99fe4e7cbd20	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-11 00:07:37.404	2	Bla	5	Azu	\N	\N	basica
69fd4f53-2924-4e83-ae0e-274612767ec1	2	\N	2	accepted	2026-04-10 01:11:41.012607	98cd1cd0-3c24-4961-a92c-d236f0bfd59b	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-11 01:11:41.011	2	Blanco	2	Fre	\N	\N	basica
0b0101fa-9a2b-407f-a0e9-7ab2a3230eaf	12	\N	1	accepted	2026-04-10 01:56:26.246445	8adf442e-1724-4511-a083-a7a699370c0a	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-11 01:56:26.243	12	Vlak	22	Gru	\N	\N	basica
ad39552a-9b14-4311-b15f-446301b927b9	24	\N	2	accepted	2026-04-10 11:42:48.938324	31bc556d-e6da-4b99-b7b0-5ff3b1b5a9c9	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-11 11:42:48.936	12	blancos	24	filtro	224	foto	recomendada
fe18523a-cfd4-4227-8e0e-1d511a09f116	2	\N	2	accepted	2026-04-10 12:14:04.05729	682319ad-b639-445f-81d9-8dafb86f5c84	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-11 12:14:04.054	2	AX	2	ASDA	2	ASDA	recomendada
52967c0b-db5d-405f-b0ce-c58d253109e3	16	\N	2	accepted	2026-04-10 12:54:31.214371	1901d90b-504a-45cc-ba3d-07607ab9d87f	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-11 12:54:31.213	16	GVUYK	16	DDF	45	\N	recomendada
690bac1b-1dba-4e44-ac14-3991460d9654	30	\N	1	accepted	2026-04-10 21:37:59.810473	2c8d1a66-2ad7-44b0-9af5-4f6ca67b50af	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-11 21:37:59.807	20	blancos	30	ar	\N	\N	recomendada
3239513c-59d9-4b3f-9c6e-e8741ab5275a	32	\N	1	rejected	2026-04-11 23:27:15.639823	cb795c53-3227-4b93-9435-521fb5bfcb3f	5ced47ba-406d-42fe-9cea-c63c70189a5d	2026-04-12 23:27:15.639	15	blanco	32	blue	44	foto	\N
4ecc9021-9321-43e6-9b8b-0ae7a38d3e54	35	\N	2	rejected	2026-04-11 23:28:06.726243	cb795c53-3227-4b93-9435-521fb5bfcb3f	b738e8bf-3534-4956-9ec7-5301a47b0afa	2026-04-12 23:28:06.725	33	blanco	35	blue	55	foto	\N
5e21868e-2b1e-4e8b-b9de-c8228bf6123a	20000	\N	2	accepted	2026-04-11 23:26:17.399528	cb795c53-3227-4b93-9435-521fb5bfcb3f	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-12 23:26:17.394	10000	blancos	20000	blue	30000	foto	recomendada
21844ae2-a45b-4bed-b0c3-cc849057791c	30000	\N	2	accepted	2026-04-13 12:13:52.358525	744c256b-7ac3-4ce6-bad6-fcab77783f8a	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-14 12:13:52.324	20000	blanco	30000	bluecut	45000	fotocromaticos	recomendada
19dd39fc-4c6c-4042-844f-bdabd34cf787	230000	\N	1	accepted	2026-04-13 13:24:50.216451	551a1a1e-99df-4c33-96a7-ffd4141424d9	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-14 13:24:50.212	2234444	blan	230000	fliltro	\N	\N	recomendada
f0c17848-98d3-44e0-b32a-e892df0b5be0	20000	\N	1	accepted	2026-04-13 13:39:58.333639	2a3e3372-bd12-4625-8949-f533afbc8111	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-14 13:39:58.281	10000	45	20000	48	\N	\N	recomendada
cbfd1432-41b0-492f-b198-3d8c6f58d2d6	25000	\N	2	accepted	2026-04-13 23:05:52.186595	59fa455f-4112-4825-953e-2cbb715d3c9a	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-14 23:05:52.182	20000	blanco	25000	blue	75000	foto	recomendada
61de1d5c-837e-440d-afa1-f48723b5eb61	70000	\N	1	rejected	2026-04-14 12:46:02.630152	6ac40bc7-e24b-40e0-81b1-6e4004275a06	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-15 12:46:02.587	50000	organicos blancos	70000	filtro azul	90000	fotocromaticos	\N
63898c79-f7e1-4077-b71a-15029b67b853	55000	\N	2	rejected	2026-04-14 12:49:44.273274	6ac40bc7-e24b-40e0-81b1-6e4004275a06	5ced47ba-406d-42fe-9cea-c63c70189a5d	2026-04-15 12:49:44.272	33000	organicos blancos	55000	filtro azul	88000	bifocal	\N
a30a210d-7bca-4cf3-a7aa-6c58cdaa7dc1	98000	\N	2	accepted	2026-04-14 12:48:50.135275	6ac40bc7-e24b-40e0-81b1-6e4004275a06	b738e8bf-3534-4956-9ec7-5301a47b0afa	2026-04-15 12:48:50.13	66000	organicos blancos	98000	filtro azul	108000	fotocromativcos	recomendada
fc567eac-aee8-4604-bb49-57dc6c5261c1	30000	\N	1	accepted	2026-04-14 14:29:37.023301	8f9332d2-957f-4b54-913d-1567fecbda65	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-15 14:29:37.02	20000	blanco	30000	filtro azul	\N	\N	recomendada
9a1e426e-0610-453d-9f96-9c975d2f3e51	60000	\N	2	accepted	2026-04-14 21:47:03.641237	6af78875-17b1-463a-b9c2-172db279618c	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-15 21:47:03.637	20000	blanco	40000	filtro azul	60000	fotocromaticos	premium
18d1331e-36d3-4070-bb7e-22eb463bb219	29000	\N	1	rejected	2026-04-14 21:48:26.445486	6af78875-17b1-463a-b9c2-172db279618c	b738e8bf-3534-4956-9ec7-5301a47b0afa	2026-04-15 21:48:26.444	23000	organico blanco	29000	con anti reflejo	35000	fotocromatico	\N
e0d1ea64-20b1-41ab-aa6f-350bfaab1cb9	55000	\N	2	rejected	2026-04-14 21:49:16.070798	6af78875-17b1-463a-b9c2-172db279618c	5ced47ba-406d-42fe-9cea-c63c70189a5d	2026-04-15 21:49:16.069	22000	BLANCO	55000	AR	88000	FOTO	\N
e1219e82-592c-4b52-b0f0-3dc1a905fb07	60000	\N	1	accepted	2026-04-15 22:57:48.804256	0e1312a0-563d-4712-aa03-03ce6e220ca4	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-16 22:57:48.802	30000	organicos blancos	60000	filtro azul	\N	\N	recomendada
9652fa13-ce13-4a26-84aa-abeca35d46b1	50000	\N	1	accepted	2026-04-15 23:06:13.339723	d51bc527-2ee6-426f-873b-c53fff8a7534	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-16 23:06:13.338	25000	blanco	50000	bluecut	\N	\N	recomendada
47219e3a-dc8b-46ad-be1e-486cb13693d8	30000	\N	1	accepted	2026-04-16 12:05:07.869433	cb21fae7-ee4a-4244-8b8b-3be09380256b	8eab78e1-09b0-4f81-9f4a-9dc7a090551e	2026-04-17 12:05:07.864	20000	blanco	30000	bluecut	\N	\N	recomendada
\.


--
-- Data for Name: request_opticas; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.request_opticas (id, status, "createdAt", "requestId", "opticaId") FROM stdin;
1a1d1197-ead7-4b73-8233-07b828ec2f7b	ignored	2026-04-06 21:33:14.974594	d1b89aba-fbc8-4589-8a7a-46b7de33cd18	b738e8bf-3534-4956-9ec7-5301a47b0afa
d2431add-fffa-494c-bf46-48fdd28dae07	responded	2026-04-09 11:41:10.407322	b8fd20f2-36af-4d90-bc50-cbf403149811	b738e8bf-3534-4956-9ec7-5301a47b0afa
98536052-3406-4f88-b168-0f9059011c46	ignored	2026-04-08 23:35:57.676254	ab3f3fff-4bca-4d0f-bbf4-e51fb9e78efd	b738e8bf-3534-4956-9ec7-5301a47b0afa
d4226ffa-9fc0-4d44-b81a-158434217f09	ignored	2026-04-08 22:09:53.949258	a60d13ce-4e89-467b-aa5b-c74f4fbcd775	b738e8bf-3534-4956-9ec7-5301a47b0afa
fae07a57-5d94-47af-a1df-3a472e7bff04	responded	2026-04-06 11:45:48.852279	d2a9d08a-251d-4152-a440-9678e9f3dc3f	b738e8bf-3534-4956-9ec7-5301a47b0afa
dc75276c-0ec4-4605-a0b5-043c58165adf	responded	2026-04-06 13:02:59.979847	615b27f3-2fc7-4a49-a625-388c583e2b4f	b738e8bf-3534-4956-9ec7-5301a47b0afa
2122e350-5e8c-442e-af81-19f69a6571cf	responded	2026-04-06 13:01:43.223461	bd48452e-53a7-4ce9-a6a5-f3d99ce076f8	b738e8bf-3534-4956-9ec7-5301a47b0afa
f5966372-f301-4eca-965e-614c923cbb18	ignored	2026-04-08 21:10:57.540095	d8033c89-665d-4ad2-9f78-d07a65f29367	b738e8bf-3534-4956-9ec7-5301a47b0afa
b3c56d16-8e3d-4185-895d-06e2ef463345	ignored	2026-04-08 15:35:12.523956	7566619f-b94f-4dc1-b192-a2c7f25518e7	b738e8bf-3534-4956-9ec7-5301a47b0afa
fbc5c5ad-563c-4f14-8c5d-43b0a73582b9	ignored	2026-04-06 21:42:42.431092	f9f324a4-c644-4a3f-8430-33fa95718fcf	b738e8bf-3534-4956-9ec7-5301a47b0afa
9ef11f82-df32-4445-9358-3cf9dbfa50f5	ignored	2026-04-09 11:41:10.439121	b8fd20f2-36af-4d90-bc50-cbf403149811	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
4db063f3-d0cd-489f-9a9a-26c49a2e99b0	responded	2026-04-06 13:05:00.084224	615b27f3-2fc7-4a49-a625-388c583e2b4f	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
9025f1a8-5cdb-4d54-b72f-f2441954397d	pending	2026-04-06 21:33:14.94127	d1b89aba-fbc8-4589-8a7a-46b7de33cd18	5ced47ba-406d-42fe-9cea-c63c70189a5d
08f6455f-ec79-49eb-bfa9-9c1f1a876ab3	responded	2026-04-06 13:03:43.392328	bd48452e-53a7-4ce9-a6a5-f3d99ce076f8	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
ab74b567-59bb-4014-b3b7-2c8da1649fac	responded	2026-04-06 13:06:31.879364	2d042991-1be5-4bba-b63f-ae12fdcd465f	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
8e121adb-6144-4176-90a1-b256f59eb28f	responded	2026-04-06 21:33:15.004377	d1b89aba-fbc8-4589-8a7a-46b7de33cd18	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
f5b888c4-5af1-418d-b518-5122a1046bc0	responded	2026-04-06 13:00:59.707252	615b27f3-2fc7-4a49-a625-388c583e2b4f	5ced47ba-406d-42fe-9cea-c63c70189a5d
d8c07490-8d87-44c9-914a-691b5a11c7ec	responded	2026-04-06 12:59:42.41539	bd48452e-53a7-4ce9-a6a5-f3d99ce076f8	5ced47ba-406d-42fe-9cea-c63c70189a5d
c1a6af24-08f1-4b03-9a1c-05b641cec916	responded	2026-04-06 13:02:30.900666	2d042991-1be5-4bba-b63f-ae12fdcd465f	5ced47ba-406d-42fe-9cea-c63c70189a5d
7ab63639-dc45-4342-951d-b1e707ad42f5	pending	2026-04-09 22:20:36.275193	64fd71da-d993-498b-a9e1-343dea9336f7	5ced47ba-406d-42fe-9cea-c63c70189a5d
cda5f81d-750a-4258-b2b7-48c183940b83	responded	2026-04-06 21:42:42.396947	f9f324a4-c644-4a3f-8430-33fa95718fcf	5ced47ba-406d-42fe-9cea-c63c70189a5d
12eeb2e5-9e40-4feb-9ed4-c9abb49d9f61	expired	2026-04-06 13:04:31.041252	2d042991-1be5-4bba-b63f-ae12fdcd465f	b738e8bf-3534-4956-9ec7-5301a47b0afa
527f8fc3-9a39-41b4-a50a-05753cad2c15	responded	2026-04-06 21:42:42.458629	f9f324a4-c644-4a3f-8430-33fa95718fcf	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
7eaa608e-35e6-4dcb-9740-5a8d0c23e500	pending	2026-04-06 23:12:09.511083	bec2a2fe-c617-4396-aa2d-142a446582b9	5ced47ba-406d-42fe-9cea-c63c70189a5d
64d4fdbe-1ad4-489b-a91b-b2164f460e4f	responded	2026-04-06 23:12:09.533517	bec2a2fe-c617-4396-aa2d-142a446582b9	b738e8bf-3534-4956-9ec7-5301a47b0afa
8197c13a-4864-400d-8af9-11ef09b54814	pending	2026-04-07 01:43:27.570973	02bb1359-b404-4117-be5a-cc7b6baebc83	5ced47ba-406d-42fe-9cea-c63c70189a5d
95659e6c-4385-4122-871a-533962859343	responded	2026-04-07 01:43:27.630107	02bb1359-b404-4117-be5a-cc7b6baebc83	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
06875319-f0a9-45bf-a6b3-512379b39209	responded	2026-04-07 01:43:27.604701	02bb1359-b404-4117-be5a-cc7b6baebc83	b738e8bf-3534-4956-9ec7-5301a47b0afa
b0a5b466-8189-43b0-8f55-09fda9d157ec	pending	2026-04-07 20:06:29.836479	593d83e7-9226-4764-853a-1634fd12ce91	5ced47ba-406d-42fe-9cea-c63c70189a5d
157487cf-1f20-42db-9b47-92290929826d	responded	2026-04-07 20:06:29.892121	593d83e7-9226-4764-853a-1634fd12ce91	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
eda6d1e9-8a59-45a2-8fc8-448ff5e60b22	ignored	2026-04-06 23:12:09.558837	bec2a2fe-c617-4396-aa2d-142a446582b9	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
cf1751aa-3f2d-4f3e-be48-f9c866ea1f17	ignored	2026-04-06 11:47:48.949657	d2a9d08a-251d-4152-a440-9678e9f3dc3f	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
1eca7652-2271-42e1-b22c-b39490cda638	responded	2026-04-07 20:06:29.873079	593d83e7-9226-4764-853a-1634fd12ce91	b738e8bf-3534-4956-9ec7-5301a47b0afa
cd184ea0-6f77-44c7-adf3-9da41e2ed8f9	pending	2026-04-08 15:35:12.571862	7566619f-b94f-4dc1-b192-a2c7f25518e7	5ced47ba-406d-42fe-9cea-c63c70189a5d
6da1592a-6d80-4c53-8143-b217ee7b2250	responded	2026-04-08 15:35:12.55263	7566619f-b94f-4dc1-b192-a2c7f25518e7	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
4fcfb9c9-017b-40af-afac-b347b2e1ab0e	responded	2026-04-08 21:10:57.594278	d8033c89-665d-4ad2-9f78-d07a65f29367	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
5643e4ff-30e6-4989-a8c0-02c3c21d86f9	responded	2026-04-08 21:10:57.657687	d8033c89-665d-4ad2-9f78-d07a65f29367	5ced47ba-406d-42fe-9cea-c63c70189a5d
6f6db970-0f88-4453-9c4b-44849125710d	pending	2026-04-08 22:09:53.994701	a60d13ce-4e89-467b-aa5b-c74f4fbcd775	5ced47ba-406d-42fe-9cea-c63c70189a5d
890d520f-7da1-4c29-83ca-631a7a8fd1a4	responded	2026-04-08 22:09:53.97448	a60d13ce-4e89-467b-aa5b-c74f4fbcd775	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
b5c00880-520d-4533-b9b4-e87cb4e503cb	pending	2026-04-08 23:35:57.777176	ab3f3fff-4bca-4d0f-bbf4-e51fb9e78efd	5ced47ba-406d-42fe-9cea-c63c70189a5d
da12f9e0-072b-4055-89e9-68c95c30d9c9	responded	2026-04-08 23:35:57.727259	ab3f3fff-4bca-4d0f-bbf4-e51fb9e78efd	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
d40b5f0a-1903-40e0-861b-a718ed9cbde6	pending	2026-04-09 11:41:10.457551	b8fd20f2-36af-4d90-bc50-cbf403149811	5ced47ba-406d-42fe-9cea-c63c70189a5d
da8236ba-d873-4e1e-82aa-a9ef379a5a70	responded	2026-04-09 22:20:36.256915	64fd71da-d993-498b-a9e1-343dea9336f7	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
224905d2-fe7e-475d-acbc-ba718030e8fb	responded	2026-04-09 22:21:37.927615	0c38ecf0-3278-474a-9d03-bdeac8a5d195	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
e9a0b680-742a-4ddd-a0c4-5e7b75f7a6af	responded	2026-04-09 22:20:36.214484	64fd71da-d993-498b-a9e1-343dea9336f7	b738e8bf-3534-4956-9ec7-5301a47b0afa
7d1b62ff-17c1-4ef0-87a4-7178b545d1aa	ignored	2026-04-09 22:21:37.855562	0c38ecf0-3278-474a-9d03-bdeac8a5d195	b738e8bf-3534-4956-9ec7-5301a47b0afa
b2c4af13-aac2-4974-b8c7-24e4dcd2a227	expired	2026-04-09 22:21:37.993937	0c38ecf0-3278-474a-9d03-bdeac8a5d195	5ced47ba-406d-42fe-9cea-c63c70189a5d
ae27eae4-6c7b-4bd4-9b20-99f3e0987d3c	expired	2026-04-09 22:31:36.266685	3acad3ca-6913-4c43-8f0d-5e94e22dc6b2	b738e8bf-3534-4956-9ec7-5301a47b0afa
25a07a69-7de2-4844-a9fa-d1fabea804f1	expired	2026-04-09 22:31:36.295165	3acad3ca-6913-4c43-8f0d-5e94e22dc6b2	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
4386f323-b158-4bc9-b71c-df29eb231340	expired	2026-04-09 22:31:36.309471	3acad3ca-6913-4c43-8f0d-5e94e22dc6b2	5ced47ba-406d-42fe-9cea-c63c70189a5d
c6a04d60-cbbf-41d3-be81-355614bbdd72	pending	2026-04-10 00:06:31.73726	39fc7dde-4913-49a8-80af-99fe4e7cbd20	5ced47ba-406d-42fe-9cea-c63c70189a5d
dc1d38ab-09d3-4f51-bacc-cff98195c5ac	responded	2026-04-10 00:06:31.693186	39fc7dde-4913-49a8-80af-99fe4e7cbd20	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
0fe7a3f6-1560-4a81-9255-f51119826403	pending	2026-04-10 01:10:49.541748	98cd1cd0-3c24-4961-a92c-d236f0bfd59b	5ced47ba-406d-42fe-9cea-c63c70189a5d
03bd8e61-fd80-4b4c-a537-26bb9e4226d2	responded	2026-04-10 01:10:49.520591	98cd1cd0-3c24-4961-a92c-d236f0bfd59b	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
6a29f4f7-8e37-4f8f-bd18-656a2e8387c9	pending	2026-04-10 01:31:20.395839	8adf442e-1724-4511-a083-a7a699370c0a	5ced47ba-406d-42fe-9cea-c63c70189a5d
23a924c1-444d-4d51-b9f8-d78363522cd2	responded	2026-04-10 01:31:20.375174	8adf442e-1724-4511-a083-a7a699370c0a	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
7ab96270-589a-448f-aaab-3ec5a755d716	pending	2026-04-10 11:41:23.558137	31bc556d-e6da-4b99-b7b0-5ff3b1b5a9c9	5ced47ba-406d-42fe-9cea-c63c70189a5d
2f025185-60d0-4b6e-89d9-e6e80e8a3f9c	responded	2026-04-10 11:41:23.541327	31bc556d-e6da-4b99-b7b0-5ff3b1b5a9c9	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
c97f913d-6983-45fb-a9c2-160dbcb0466e	pending	2026-04-10 12:13:44.064487	682319ad-b639-445f-81d9-8dafb86f5c84	5ced47ba-406d-42fe-9cea-c63c70189a5d
2508091a-4580-4b16-8d36-8f59cdc95fe1	responded	2026-04-10 12:13:44.03897	682319ad-b639-445f-81d9-8dafb86f5c84	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
e5aeab87-e0fa-45ed-a894-4c783c407637	pending	2026-04-10 12:53:55.432985	1901d90b-504a-45cc-ba3d-07607ab9d87f	5ced47ba-406d-42fe-9cea-c63c70189a5d
7b279f7a-d8b2-47e6-ba95-dca7ff6179d2	responded	2026-04-10 12:53:55.415038	1901d90b-504a-45cc-ba3d-07607ab9d87f	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
1f54412f-50c9-430b-83c7-182560f83def	pending	2026-04-10 21:37:28.880916	2c8d1a66-2ad7-44b0-9af5-4f6ca67b50af	5ced47ba-406d-42fe-9cea-c63c70189a5d
1fe596a0-d57f-412a-8160-2f4d4caf4a4d	responded	2026-04-10 21:37:28.861777	2c8d1a66-2ad7-44b0-9af5-4f6ca67b50af	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
37cb43c2-cb90-4f0d-855a-170299fcbdf8	responded	2026-04-11 23:23:51.202317	cb795c53-3227-4b93-9435-521fb5bfcb3f	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
44a9e4c8-b802-472a-a468-d882f0e7a157	responded	2026-04-11 23:23:51.218126	cb795c53-3227-4b93-9435-521fb5bfcb3f	5ced47ba-406d-42fe-9cea-c63c70189a5d
28fe3e19-a819-4181-9870-4c29de794a14	responded	2026-04-11 23:23:51.17617	cb795c53-3227-4b93-9435-521fb5bfcb3f	b738e8bf-3534-4956-9ec7-5301a47b0afa
4b652a53-8053-4db4-b1ef-e1aa8025ac21	pending	2026-04-11 23:34:45.731051	744c256b-7ac3-4ce6-bad6-fcab77783f8a	5ced47ba-406d-42fe-9cea-c63c70189a5d
fb0bb331-dd9a-4a17-bf60-3ce483c17bc0	responded	2026-04-11 23:34:45.714586	744c256b-7ac3-4ce6-bad6-fcab77783f8a	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
6684631f-f92b-410d-abb4-1023abdb00ab	pending	2026-04-13 13:24:16.635275	551a1a1e-99df-4c33-96a7-ffd4141424d9	5ced47ba-406d-42fe-9cea-c63c70189a5d
aa7ca582-f72a-4102-8882-ad56e2581668	responded	2026-04-13 13:24:16.605452	551a1a1e-99df-4c33-96a7-ffd4141424d9	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
60ce8c66-24a6-4f1e-87f8-04fadcfcfbd6	pending	2026-04-13 13:39:26.307252	2a3e3372-bd12-4625-8949-f533afbc8111	5ced47ba-406d-42fe-9cea-c63c70189a5d
a888279a-b7de-4341-839b-63b12a1560a6	ignored	2026-04-10 12:13:43.980839	682319ad-b639-445f-81d9-8dafb86f5c84	b738e8bf-3534-4956-9ec7-5301a47b0afa
c6e6d457-e3bc-4b52-8f58-a044d0165a85	ignored	2026-04-10 01:31:20.347607	8adf442e-1724-4511-a083-a7a699370c0a	b738e8bf-3534-4956-9ec7-5301a47b0afa
5140bc67-8da4-4710-b92b-367cbd1cde80	ignored	2026-04-10 00:06:31.626254	39fc7dde-4913-49a8-80af-99fe4e7cbd20	b738e8bf-3534-4956-9ec7-5301a47b0afa
a27ad182-854c-46e8-a62a-093b2c7c3f2b	ignored	2026-04-13 13:39:25.975487	2a3e3372-bd12-4625-8949-f533afbc8111	b738e8bf-3534-4956-9ec7-5301a47b0afa
47aeac9c-13c4-41a9-8677-612ad41d5b9f	ignored	2026-04-10 21:37:28.831249	2c8d1a66-2ad7-44b0-9af5-4f6ca67b50af	b738e8bf-3534-4956-9ec7-5301a47b0afa
a8999465-9b64-471a-9e19-b0d431ede7da	ignored	2026-04-10 12:53:55.388279	1901d90b-504a-45cc-ba3d-07607ab9d87f	b738e8bf-3534-4956-9ec7-5301a47b0afa
88066e61-4f30-434f-ad78-7b98ccdf0488	ignored	2026-04-10 11:41:23.515251	31bc556d-e6da-4b99-b7b0-5ff3b1b5a9c9	b738e8bf-3534-4956-9ec7-5301a47b0afa
4bb49da1-a929-42f4-8c20-13696ab7bc70	ignored	2026-04-11 23:34:45.693529	744c256b-7ac3-4ce6-bad6-fcab77783f8a	b738e8bf-3534-4956-9ec7-5301a47b0afa
da9f5fed-653f-4d73-aeca-7c408b27fa33	ignored	2026-04-13 13:24:16.574284	551a1a1e-99df-4c33-96a7-ffd4141424d9	b738e8bf-3534-4956-9ec7-5301a47b0afa
af65feef-f07f-4d90-b94b-70b2e1caaa22	responded	2026-04-13 13:39:26.05593	2a3e3372-bd12-4625-8949-f533afbc8111	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
01b9db51-bee7-4940-ac5d-d28bbfdb7946	ignored	2026-04-10 01:10:49.488567	98cd1cd0-3c24-4961-a92c-d236f0bfd59b	b738e8bf-3534-4956-9ec7-5301a47b0afa
0365cd01-1cef-4941-a63a-8150ce6f0dfd	pending	2026-04-13 23:04:44.991172	59fa455f-4112-4825-953e-2cbb715d3c9a	b738e8bf-3534-4956-9ec7-5301a47b0afa
9a48d6b4-0179-4ecf-b34f-f61c6c6c31be	pending	2026-04-13 23:04:45.04137	59fa455f-4112-4825-953e-2cbb715d3c9a	5ced47ba-406d-42fe-9cea-c63c70189a5d
fae7e31f-6b3f-4dfb-bc53-06ed69ed068c	responded	2026-04-13 23:04:45.022308	59fa455f-4112-4825-953e-2cbb715d3c9a	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
e7a0e2e4-99cb-4506-9c6b-8c89d91e994c	responded	2026-04-14 12:43:24.14915	6ac40bc7-e24b-40e0-81b1-6e4004275a06	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
98aec120-84c8-4e85-a7b5-78cbff712030	responded	2026-04-14 12:43:24.091837	6ac40bc7-e24b-40e0-81b1-6e4004275a06	b738e8bf-3534-4956-9ec7-5301a47b0afa
13dfe19f-2dcc-4e9a-884a-edb19086b64c	responded	2026-04-14 12:43:24.172253	6ac40bc7-e24b-40e0-81b1-6e4004275a06	5ced47ba-406d-42fe-9cea-c63c70189a5d
e28ccb5b-3866-4c80-a6b0-be90f2b0d556	pending	2026-04-14 14:29:00.177114	8f9332d2-957f-4b54-913d-1567fecbda65	b738e8bf-3534-4956-9ec7-5301a47b0afa
cd9f7db0-5b12-4a59-b448-a3a3a0a431a0	pending	2026-04-14 14:29:00.231867	8f9332d2-957f-4b54-913d-1567fecbda65	5ced47ba-406d-42fe-9cea-c63c70189a5d
058289d8-342f-48df-82d9-a70dad1425de	responded	2026-04-14 14:29:00.209126	8f9332d2-957f-4b54-913d-1567fecbda65	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
4c1c6e34-29ac-43ba-9b42-caf686621a03	responded	2026-04-14 21:44:09.373912	6af78875-17b1-463a-b9c2-172db279618c	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
6507de06-77d1-422f-ba6f-48ebcfdf2730	responded	2026-04-14 21:44:09.342297	6af78875-17b1-463a-b9c2-172db279618c	b738e8bf-3534-4956-9ec7-5301a47b0afa
8dcd62da-1aac-455a-94b1-8057d3602320	responded	2026-04-14 21:44:09.393509	6af78875-17b1-463a-b9c2-172db279618c	5ced47ba-406d-42fe-9cea-c63c70189a5d
ee9641e2-09ec-4eda-ae23-5741c3ae5409	pending	2026-04-15 22:56:52.473667	0e1312a0-563d-4712-aa03-03ce6e220ca4	5ced47ba-406d-42fe-9cea-c63c70189a5d
4f41e14c-7ab8-4cb3-8f58-45b32f789dc9	pending	2026-04-15 22:56:52.496687	0e1312a0-563d-4712-aa03-03ce6e220ca4	b738e8bf-3534-4956-9ec7-5301a47b0afa
df6d296e-0d76-4738-8e7e-2c70fa33fed6	responded	2026-04-15 22:56:52.509795	0e1312a0-563d-4712-aa03-03ce6e220ca4	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
1af64f86-925a-4f41-92c5-d931efdcb3bc	pending	2026-04-15 23:05:45.373577	d51bc527-2ee6-426f-873b-c53fff8a7534	5ced47ba-406d-42fe-9cea-c63c70189a5d
c1936db3-6ef4-45d3-b4e0-2ccfc068b06e	pending	2026-04-15 23:05:45.403039	d51bc527-2ee6-426f-873b-c53fff8a7534	b738e8bf-3534-4956-9ec7-5301a47b0afa
b74686bb-434a-45a5-aa88-4c4544e066f6	responded	2026-04-15 23:05:45.444812	d51bc527-2ee6-426f-873b-c53fff8a7534	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
29d82d22-3dff-4477-b4d5-9dd99bc7ab0b	pending	2026-04-16 12:04:34.93747	cb21fae7-ee4a-4244-8b8b-3be09380256b	5ced47ba-406d-42fe-9cea-c63c70189a5d
e8061836-25c6-4f90-92ec-b0285c34833a	pending	2026-04-16 12:04:34.973285	cb21fae7-ee4a-4244-8b8b-3be09380256b	b738e8bf-3534-4956-9ec7-5301a47b0afa
efd190e7-9bea-4de9-be12-d79f725fe752	responded	2026-04-16 12:04:34.990599	cb21fae7-ee4a-4244-8b8b-3be09380256b	8eab78e1-09b0-4f81-9f4a-9dc7a090551e
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: lensia
--

COPY public.users (id, email, password, role, "fullName", phone, "isApproved", "isActive", "createdAt", "updatedAt", "resetToken", "resetTokenExpiry", "isEmailVerified", "emailVerifyToken", cuit, "razonSocial", "invoiceCondition") FROM stdin;
8cf6de52-3b97-4983-afcf-52a8dc96f370	monkeydev956@gmail.com	$2b$10$HTX9mkW3aDhEcbuddjsw7O7Yja2iE3RemnTEIcvbUnBR9FpobJPSu	cliente	testAccount	\N	t	t	2026-04-13 20:39:10.263406	2026-04-13 20:42:03.335352	\N	\N	f	eb5fa2eb9529c6e5f4c25a62e1c6ba758b006b0ad88e78b76e16dafabe46b53c	\N	\N	\N
140f6673-13ea-4c1b-aedd-481a6e900039	cliente@lensia.com	$2b$10$NW5s0qFbmL7zWl8vi4Rh2Op/so6MxSr3dWqm9.pr6XGuE6ZOs90g.	cliente	María García	\N	f	t	2026-03-20 09:47:19.912136	2026-04-06 01:58:34.674469	\N	\N	t	\N	\N	\N	\N
9ed7bc45-684f-4025-9edc-344d7b7a0d57	lensia.arg@gmail.com	$2b$10$fa71uvxqBnm.R3SkpaOp.O./d2Q8a3h6l8.k6mfhJ9NLScJAih3Wi	cliente	lensia	\N	t	t	2026-04-13 19:48:50.808708	2026-04-14 11:29:55.242492	\N	\N	t	\N	\N	\N	\N
a93780f3-9589-479f-866a-a787e88ea736	medico@lensia.com	$2b$10$NW5s0qFbmL7zWl8vi4Rh2Op/so6MxSr3dWqm9.pr6XGuE6ZOs90g.	medico	Dr. Carlos López	\N	t	t	2026-03-20 09:47:19.92532	2026-04-06 01:58:34.674469	\N	\N	t	\N	\N	\N	\N
4b754b35-7cc4-4661-9b9f-bc24cf753cfb	entreriosrominaceleste@gmail.com	$2b$10$51qa.yT/TIB53goSKyZ8AOyUs4N8L4FMC9pS3HG3gqcXIjE.qUNVa	cliente	Romina Entre Rios	\N	t	t	2026-04-14 12:36:04.913703	2026-04-14 12:36:30.213019	\N	\N	t	\N	\N	\N	\N
6eeb4336-6ecf-468f-9e61-8cabcb5cd990	optica@lensia.com	$2b$10$NW5s0qFbmL7zWl8vi4Rh2Op/so6MxSr3dWqm9.pr6XGuE6ZOs90g.	optica	Óptica Visión Norte	2302693990	t	t	2026-03-20 09:47:19.919677	2026-04-07 20:19:21.836272	\N	\N	t	\N	\N	\N	\N
42853302-6f6f-4d8b-bc31-c94cde6905af	martaz_61@hotmail.com	$2b$10$wfxTwCDRwyZDJc8CZUqTxemfHQv35ZUK/QlVwoUtjrozo7Eg6CINm	cliente	marta estela zabala	\N	t	t	2026-04-11 23:15:37.806901	2026-04-14 12:40:53.555392	\N	\N	f	538f139b2ba659d5b4981948e76e97999a390d58bb8a6a51ff846a30cc6aacc9	\N	\N	\N
084caba0-de8e-4dd8-bfdc-24cf3d41377e	zabalamarta813@gmail.com	$2b$10$UPBZctSurjUTo/CbrxbobOLvPupjEJiJJ0bWIeXgHrld7YQmdz7y6	cliente	Marta zabala	\N	t	t	2026-04-14 11:56:30.465118	2026-04-14 14:06:08.124649	\N	\N	t	\N	\N	\N	\N
61aa8df2-48fe-4a18-b6a4-125986281f42	martazabala61@gmail.com	$2b$10$P..0qKMD5CZNFLnSLw2lC./ygddPofw0pETuh/Jnyxj6Np20vxrwS	cliente	Marta estela zabala	\N	t	t	2026-04-14 11:53:43.057446	2026-04-14 11:54:41.910277	\N	\N	f	a06ac770bb3f9b5d1396618c669f0407b25b38bf71d735a0c46bf0485b043e9a	\N	\N	\N
08dc4f7b-651a-4eb8-94cf-efc1fb752c69	edreira24@gmail.com	$2b$10$4U8ZXkZmVh3CELaH2kdRRuYNWIn3uxXS600TsNlaTJqfnnYz.LkdS	cliente	sebastian edreira	2302693990	f	t	2026-03-20 12:35:39.603647	2026-04-15 22:41:45.39909	\N	\N	t	\N	20352847349	\N	responsable_inscripto
1c5eb771-888b-4833-9b97-90665e48bdeb	admin@lensia.com	$2b$10$NW5s0qFbmL7zWl8vi4Rh2Op/so6MxSr3dWqm9.pr6XGuE6ZOs90g.	admin	Admin Principal	2302693990	f	t	2026-03-20 09:47:19.904756	2026-04-15 22:44:03.978461	\N	\N	t	\N	\N	\N	\N
eb65c951-041e-48b0-bf6e-bc5602239537	bertino.fede@hotmail.com	$2b$10$A2sIkNQNK/4ic4iwAj0ZdeLdt/wlLYqcVpkDaYMuM/IrumfnUI9P6	cliente	federico bertino	2302460457	f	t	2026-03-26 14:53:11.048189	2026-04-15 22:58:38.380755	\N	\N	t	\N	20352847349	\N	responsable_inscripto
764a0320-c05b-476c-a691-baeb4fa3423a	ary.medinac@gmail.com	$2b$10$fUjteiSXhe.nU8hpFgA0/.6fOzLcIxtiiL3lTVIXnIXh.xobxfpcq	optica	Óptica Edreira	2302205845	t	t	2026-04-02 12:18:10.549784	2026-04-16 12:03:35.822496	\N	\N	t	\N	20352847349	edreira sebastian	responsable_inscripto
a22c74e8-c1c8-492c-8dea-24e0e21cacf3	edreira24@hotmail.com	$2b$10$Dp3abC45wEEgGElg0mvTdehvn7e9DZKML6tdSBZjOkgJ1yQufn5l6	optica	optica edreira beat	2302693990	t	t	2026-03-26 15:15:23.188454	2026-04-16 12:13:07.413716	\N	\N	t	\N	20352847349	edreira sebastian	responsable_inscripto
80cc60bf-bce5-4db4-a1df-1704643591af	martaezabala61@gmail.com	$2b$10$ol9sgOIJDJ0voael0BAWkO2MRvBljXU59fI/I9XTiVS4dFFswQc8m	cliente	marta estela zabala	\N	t	t	2026-04-14 12:21:34.526862	2026-04-14 12:33:03.68424	\N	\N	f	fa1839017c1a92f398891e74a4fad45e9821992a4541ceb4a5bf06027474d7d9	\N	\N	\N
f70b1c45-4811-4e93-9bb6-390f5e75f8d4	opticaedreira24@gmail.com	$2b$10$zjigRvotNYz17QDWrgypreIsTsBbciUdWZsNgOZHVQsIsXSt/L8Si	medico	carlos guzman	\N	t	t	2026-04-16 12:16:26.815168	2026-04-16 12:21:40.673721	\N	\N	t	\N	\N	\N	\N
\.


--
-- Name: prescriptions PK_097b2cc2f2b7e56825468188503; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT "PK_097b2cc2f2b7e56825468188503" PRIMARY KEY (id);


--
-- Name: frames PK_24f76d02278950b00a73dd6d363; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.frames
    ADD CONSTRAINT "PK_24f76d02278950b00a73dd6d363" PRIMARY KEY (id);


--
-- Name: request_opticas PK_25250798db5b79862492889197c; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.request_opticas
    ADD CONSTRAINT "PK_25250798db5b79862492889197c" PRIMARY KEY (id);


--
-- Name: disputes PK_3c97580d01c1a4b0b345c42a107; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT "PK_3c97580d01c1a4b0b345c42a107" PRIMARY KEY (id);


--
-- Name: quote_frames PK_510364f7ac740ef9002fbd636f1; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.quote_frames
    ADD CONSTRAINT "PK_510364f7ac740ef9002fbd636f1" PRIMARY KEY (id);


--
-- Name: platform_settings PK_5d9031e30fac3ec3ec8b9602e17; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT "PK_5d9031e30fac3ec3ec8b9602e17" PRIMARY KEY (key);


--
-- Name: medico_ratings PK_62fe504ddd3256a56031d79dae9; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.medico_ratings
    ADD CONSTRAINT "PK_62fe504ddd3256a56031d79dae9" PRIMARY KEY (id);


--
-- Name: orders PK_710e2d4957aa5878dfe94e4ac2f; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY (id);


--
-- Name: dispute_messages PK_8826f78d556a1846f8cbad5ed05; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.dispute_messages
    ADD CONSTRAINT "PK_8826f78d556a1846f8cbad5ed05" PRIMARY KEY (id);


--
-- Name: dispute_photos PK_9251deaaa052365b5c5b4bb1554; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.dispute_photos
    ADD CONSTRAINT "PK_9251deaaa052365b5c5b4bb1554" PRIMARY KEY (id);


--
-- Name: quotes PK_99a0e8bcbcd8719d3a41f23c263; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT "PK_99a0e8bcbcd8719d3a41f23c263" PRIMARY KEY (id);


--
-- Name: medico_locations PK_9d252ff7177138e356cb0150b44; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.medico_locations
    ADD CONSTRAINT "PK_9d252ff7177138e356cb0150b44" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: quote_requests PK_c05f72de8be0ec6b0985a851558; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.quote_requests
    ADD CONSTRAINT "PK_c05f72de8be0ec6b0985a851558" PRIMARY KEY (id);


--
-- Name: opticas PK_dbbc852c09d97e92842feb92b6d; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.opticas
    ADD CONSTRAINT "PK_dbbc852c09d97e92842feb92b6d" PRIMARY KEY (id);


--
-- Name: order_status_history PK_e6c66d853f155531985fc4f6ec8; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT "PK_e6c66d853f155531985fc4f6ec8" PRIMARY KEY (id);


--
-- Name: medicos PK_f16d578e9fd6df731d5e8551725; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.medicos
    ADD CONSTRAINT "PK_f16d578e9fd6df731d5e8551725" PRIMARY KEY (id);


--
-- Name: optica_ratings PK_f35fde5411d4d2e2e6776990b56; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.optica_ratings
    ADD CONSTRAINT "PK_f35fde5411d4d2e2e6776990b56" PRIMARY KEY (id);


--
-- Name: medicos REL_347c8031fbf206eeb990eea6c0; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.medicos
    ADD CONSTRAINT "REL_347c8031fbf206eeb990eea6c0" UNIQUE ("userId");


--
-- Name: disputes REL_8acbc1c3c0ba479dd4010eeb46; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT "REL_8acbc1c3c0ba479dd4010eeb46" UNIQUE ("orderId");


--
-- Name: opticas REL_8b55eaafb0e5be8d138b40b135; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.opticas
    ADD CONSTRAINT "REL_8b55eaafb0e5be8d138b40b135" UNIQUE ("userId");


--
-- Name: opticas UQ_10f0dd8408de06624d71dec85c4; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.opticas
    ADD CONSTRAINT "UQ_10f0dd8408de06624d71dec85c4" UNIQUE ("referralCode");


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: quote_frames FK_0192b19cb0202c281419dcffecb; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.quote_frames
    ADD CONSTRAINT "FK_0192b19cb0202c281419dcffecb" FOREIGN KEY ("quoteId") REFERENCES public.quotes(id) ON DELETE CASCADE;


--
-- Name: optica_ratings FK_06e8fc469536e1bbbe8bdc3111a; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.optica_ratings
    ADD CONSTRAINT "FK_06e8fc469536e1bbbe8bdc3111a" FOREIGN KEY ("orderId") REFERENCES public.orders(id);


--
-- Name: orders FK_1457f286d91f271313fded23e53; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_1457f286d91f271313fded23e53" FOREIGN KEY ("clientId") REFERENCES public.users(id);


--
-- Name: frames FK_1af9538cbab9a17e7b86c459ad0; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.frames
    ADD CONSTRAINT "FK_1af9538cbab9a17e7b86c459ad0" FOREIGN KEY ("opticaId") REFERENCES public.opticas(id);


--
-- Name: medico_ratings FK_1e28b19d234ed5ef00c2f9e723a; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.medico_ratings
    ADD CONSTRAINT "FK_1e28b19d234ed5ef00c2f9e723a" FOREIGN KEY ("medicoId") REFERENCES public.medicos(id) ON DELETE CASCADE;


--
-- Name: dispute_messages FK_288e9a3fe13cfe14abe9824e9ce; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.dispute_messages
    ADD CONSTRAINT "FK_288e9a3fe13cfe14abe9824e9ce" FOREIGN KEY ("disputeId") REFERENCES public.disputes(id) ON DELETE CASCADE;


--
-- Name: medicos FK_347c8031fbf206eeb990eea6c04; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.medicos
    ADD CONSTRAINT "FK_347c8031fbf206eeb990eea6c04" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: quote_requests FK_38ead8e85264eecbed3faaae182; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.quote_requests
    ADD CONSTRAINT "FK_38ead8e85264eecbed3faaae182" FOREIGN KEY ("clientId") REFERENCES public.users(id);


--
-- Name: dispute_photos FK_4b61eeff909a96ad139b4ebea52; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.dispute_photos
    ADD CONSTRAINT "FK_4b61eeff909a96ad139b4ebea52" FOREIGN KEY ("disputeId") REFERENCES public.disputes(id) ON DELETE CASCADE;


--
-- Name: request_opticas FK_5308f6ddd514100e940204607b4; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.request_opticas
    ADD CONSTRAINT "FK_5308f6ddd514100e940204607b4" FOREIGN KEY ("opticaId") REFERENCES public.opticas(id);


--
-- Name: medico_locations FK_64eeebf60e6e4a6e3ee5b45335e; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.medico_locations
    ADD CONSTRAINT "FK_64eeebf60e6e4a6e3ee5b45335e" FOREIGN KEY ("medicoId") REFERENCES public.medicos(id) ON DELETE CASCADE;


--
-- Name: medico_ratings FK_66b2c3725cb0b9e123e32f5a556; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.medico_ratings
    ADD CONSTRAINT "FK_66b2c3725cb0b9e123e32f5a556" FOREIGN KEY ("clientId") REFERENCES public.users(id);


--
-- Name: order_status_history FK_689db3835e5550e68d26ca32676; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT "FK_689db3835e5550e68d26ca32676" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: optica_ratings FK_79202cc45214fa821d4217dc5fe; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.optica_ratings
    ADD CONSTRAINT "FK_79202cc45214fa821d4217dc5fe" FOREIGN KEY ("clientId") REFERENCES public.users(id);


--
-- Name: disputes FK_8acbc1c3c0ba479dd4010eeb46a; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT "FK_8acbc1c3c0ba479dd4010eeb46a" FOREIGN KEY ("orderId") REFERENCES public.orders(id);


--
-- Name: opticas FK_8b55eaafb0e5be8d138b40b135d; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.opticas
    ADD CONSTRAINT "FK_8b55eaafb0e5be8d138b40b135d" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: orders FK_8bc9a8fdded2a382377ce18f01d; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_8bc9a8fdded2a382377ce18f01d" FOREIGN KEY ("opticaId") REFERENCES public.opticas(id);


--
-- Name: quotes FK_93ce3f956c9767630922cac78f8; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT "FK_93ce3f956c9767630922cac78f8" FOREIGN KEY ("opticaId") REFERENCES public.opticas(id);


--
-- Name: quotes FK_94b283a74da5d28a700add75f09; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT "FK_94b283a74da5d28a700add75f09" FOREIGN KEY ("requestId") REFERENCES public.quote_requests(id);


--
-- Name: orders FK_95a206b8b8cafbd842d39aba6cf; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_95a206b8b8cafbd842d39aba6cf" FOREIGN KEY ("quoteId") REFERENCES public.quotes(id);


--
-- Name: quote_requests FK_998f8ad74ef5acf3786b0a2af1f; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.quote_requests
    ADD CONSTRAINT "FK_998f8ad74ef5acf3786b0a2af1f" FOREIGN KEY ("prescriptionId") REFERENCES public.prescriptions(id);


--
-- Name: prescriptions FK_a119fc181f2ce9da3f915cd4961; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT "FK_a119fc181f2ce9da3f915cd4961" FOREIGN KEY ("clientId") REFERENCES public.users(id);


--
-- Name: quote_frames FK_a4d4f2158d114ec69b7bc94ddb9; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.quote_frames
    ADD CONSTRAINT "FK_a4d4f2158d114ec69b7bc94ddb9" FOREIGN KEY ("frameId") REFERENCES public.frames(id);


--
-- Name: optica_ratings FK_ad3d760309986c218a37871c6c4; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.optica_ratings
    ADD CONSTRAINT "FK_ad3d760309986c218a37871c6c4" FOREIGN KEY ("opticaId") REFERENCES public.opticas(id) ON DELETE CASCADE;


--
-- Name: disputes FK_cf9289f2af9e6714ded345d5138; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT "FK_cf9289f2af9e6714ded345d5138" FOREIGN KEY ("openedById") REFERENCES public.users(id);


--
-- Name: request_opticas FK_decf2632845082a9210079576b0; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.request_opticas
    ADD CONSTRAINT "FK_decf2632845082a9210079576b0" FOREIGN KEY ("requestId") REFERENCES public.quote_requests(id) ON DELETE CASCADE;


--
-- Name: dispute_messages FK_e154dd9c8d78610a275b5c72536; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.dispute_messages
    ADD CONSTRAINT "FK_e154dd9c8d78610a275b5c72536" FOREIGN KEY ("senderId") REFERENCES public.users(id);


--
-- Name: orders FK_f8b33ef190f92dcd611febdc07c; Type: FK CONSTRAINT; Schema: public; Owner: lensia
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_f8b33ef190f92dcd611febdc07c" FOREIGN KEY ("selectedFrameId") REFERENCES public.frames(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 93zh9SZYaBx41ucAdKM5ZE19HOcVEVHAQF65K5YuGXShd8eX3bMjpEHy5vQCEIT


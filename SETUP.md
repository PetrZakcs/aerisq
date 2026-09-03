# Setup checklist — po dnešních změnách

## 🆕 3. 9. 2026 (2) — rezervace z Calendly viditelné v adminu, s poznámkami

Tlačítka „Rezervovat hovor" na nabídkových a oborových stránkách teď otevírají Calendly rovnou
(viz sekce níže). Aby se dokončená rezervace propsala i do administrace — se jménem, e-mailem,
tím, ze které stránky/služby přišla, a polem na vaše poznámky — potřeba udělat dva kroky, oba mimo
tenhle repozitář (nemám přístup ani do Calendly, ani do Vercel dashboardu):

### 1. Supabase SQL Editor — nová tabulka `bookings`

```sql
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  invitee_name text,
  invitee_email text,
  service text,                    -- 'hospitality' | 'realestate' | 'offering_ai' | 'offering_mvp' | 'offering_enterprise' | 'offering_training'
  calendly_event_uri text,
  calendly_invitee_uri text,
  notes text
);

alter table bookings enable row level security;

create policy staff_full_access_bookings on bookings for all
  using (exists (select 1 from team_members where id = auth.uid()))
  with check (exists (select 1 from team_members where id = auth.uid()));
```

### 2. Calendly — webhook subscription (vyžaduje placený tarif; na Free Calendly webhooky nenabízí)

1. Calendly → Integrations → **Webhooks** → **Create Webhook Subscription**.
2. **URL**: `https://www.aerisq.tech/api/calendly-webhook`
3. **Events**: zaškrtněte jen **invitee.created** (ostatní se ignorují, není potřeba je posílat).
4. **Scope**: podle toho, jestli je to jeden uživatelský účet, nebo organizace.
5. Po vytvoření vám Calendly ukáže **signing secret** — zkopírujte ho.

### 3. Vercel — nová proměnná prostředí

Project Settings → Environment Variables → přidat pro **Production**:
```
CALENDLY_WEBHOOK_SIGNING_KEY = <signing secret z kroku 2>
```
a redeploy (stejně jako u `SUPABASE_SERVICE_ROLE_KEY` výše).

**Jak ověřit, že to funguje:** zarezervujte si sami testovací hovor přes některé z tlačítek
„Rezervovat hovor" na webu → mělo by se to objevit v adminu pod Leads → „REZERVACE HOVORŮ Z
CALENDLY" během pár vteřin, se správně přiřazenou službou. Pokud ne, zkontrolujte ve Vercel
dashboardu → Deployments → poslední produkční deployment → Functions/Logs u
`/api/calendly-webhook`, jestli tam nepadá `invalid_signature` (špatný/chybějící signing key) nebo
jiná chyba.

## 🆕 3. 9. 2026 — opraveno: poptávky a přihlášky se nepropisovaly

Nahlášený problém: poptávky z auditního formuláře a přihlášky uchazečů se neobjevovaly v adminu.
Příčina měla (nejspíš) dvě vrstvy — první je jistá a opravená v kódu, druhá je potřeba ověřit ručně
v Supabase (nemám tam přístup):

**1. Potvrzený bug ve frontendu (opraveno).** `handleSubmit` (audit) a `submitApplication`
(přihláška) v `index.html` nastavovaly `submitted`/`appSubmitted` na `true` **předtím**, než vůbec
doběhlo `await postToApi(...)`, a výsledek volání se nikde nekontroloval. Návštěvník tak vždycky
viděl "děkujeme" obrazovku, i kdyby `/api/submit-audit` nebo `/api/submit-application` spadly na
500 (např. kvůli chybějící `SUPABASE_SERVICE_ROLE_KEY` na Vercelu) — lead se ztratil tiše, beze
stopy. Teď se čeká na skutečnou odpověď; při chybě zůstane formulář otevřený s chybovou hláškou a
možností to zkusit znovu (audit navíc rovnou nabídne Calendly widget jako zálohu, přihláška e-mail
na `petr@aerisq.tech`).

**2. Nepotvrzené, ale pravděpodobné: chybějící SELECT policy pro tým.** Admin čte `audit_requests`
a `applications` přes `fetchTable`, který **tiše polyká chyby** (`if (!res.ok) return []`) — takže
i kdyby vám RLS blokovalo čtení, admin by prostě jen tiše ukázal prázdný seznam, přesně jak popisujete.
Insert teď jde přes `service_role` klíč (obchází RLS), ale to neznamená, že přihlášený admin má
právo si ta samá data přečíst zpátky přes anon klíč + JWT — v repozitáři není žádný `create policy`
pro SELECT na těchto třech tabulkách pro tým (na rozdíl od portálových tabulek níže, které mají
`staff_full_access_*`). Pro jistotu spusťte v Supabase SQL editoru (bezpečné spustit i opakovaně,
`alter table … enable row level security` nic nerozbije; jen `create policy` řádek smažte, pokud
ohlásí "already exists", a zbytek spusťte znovu):

```sql
alter table audit_requests enable row level security;
alter table applications enable row level security;
alter table newsletter_subscribers enable row level security;

create policy staff_full_access_audit_requests on audit_requests for all
  using (exists (select 1 from team_members where id = auth.uid()))
  with check (exists (select 1 from team_members where id = auth.uid()));
create policy staff_full_access_applications on applications for all
  using (exists (select 1 from team_members where id = auth.uid()))
  with check (exists (select 1 from team_members where id = auth.uid()));
create policy staff_full_access_newsletter_subscribers on newsletter_subscribers for all
  using (exists (select 1 from team_members where id = auth.uid()))
  with check (exists (select 1 from team_members where id = auth.uid()));
```

**Jak rychle ověřit, co se opravdu děje:** v Supabase dashboardu → Table Editor → `audit_requests`.
Pokud tam řádky ze starších poptávek **jsou** (jen v adminu chyběly), je to čistě bod 2 — SQL výše to
spraví. Pokud tam **nejsou vůbec žádné**, insert samotný selhává — zkontrolujte ve Vercel dashboardu
→ Project Settings → Environment Variables, že `SUPABASE_SERVICE_ROLE_KEY` je nastavený (a že je to
opravdu `service_role` klíč, ne `anon`), a případně → Deployments → přejít na poslední produkční
deployment → záložka Functions/Logs u `/api/submit-audit`, jestli tam nepadá chyba.

## 🆕 31. 8. 2026 — klientský portál (portal.aerisq.tech)

Nový klientský portál — magic-link přihlášení, přehled projektu (nabídka/fáze/milníky/faktury/
dokumenty), zprávy s jednosměrnou Slack notifikací. Kód je hotový a nasazený v repozitáři, ale
**bez kroků níže portál nepůjde reálně použít** — bez SQL migrace klientům chybí sloupce k
přihlášení, bez domény v Vercelu `portal.aerisq.tech` nikam nevede, bez `SLACK_WEBHOOK_URL` prostě
jen tiše nepřijdou notifikace (odeslání zprávy samo o sobě neselže).

### 1. Supabase SQL Editor — spustit jednorázově

**Update:** ukázalo se, že `clients`/`projects`/`milestones`/`invoices`/`documents` v Supabase
vůbec neexistovaly — proto Clients/Projects/Documents záložky v adminu vždycky tiše ukazovaly
prázdné seznamy (`fetchTable` chybu polyká a vrací `[]`). Skript níže je teď kompletní: založí
celé CRM schéma (ne jen sloupce navíc pro portál) a rovnou i RLS pro tým, ne jen pro klienty —
jakmile se na tabulce zapne RLS a nemá žádnou policy, i admin z ní přestane cokoliv vidět. Bezpečné
spustit celé najednou i opakovaně (`if not exists` všude, `create policy` bez `if not exists` —
pokud SQL Editor ohlásí `policy already exists` u konkrétního řádku, ten řádek jen smažte a zbytek
spusťte znovu).

```sql
-- === Základní CRM schéma (dosud neexistovalo) ===
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  company text,
  email text not null,
  auth_user_id uuid unique references auth.users(id),  -- napojení na portálový magic-link účet
  status text not null default 'active'                -- 'active' | 'archived'
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  client_id uuid not null references clients(id) on delete cascade,
  phase integer not null default 1,
  target_date date,
  phase_0_visible boolean not null default false,  -- klient smí vidět projekt už jako nabídku, před fází 1
  offer_summary text
);

create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  due_date date
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references projects(id) on delete cascade,
  amount numeric not null,
  currency text not null default 'EUR',
  status text not null default 'draft',  -- 'draft' | 'sent' | 'paid'
  due_date date
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  file_url text,               -- starý sloupec, nepovinný, nový kód ho už nepoužívá
  category text not null default 'general',  -- 'offer' | 'contract' | 'deliverable' | 'general'
  storage_path text             -- cesta v privátním Storage bucketu 'documents', podepisuje ji portal-document-url.js
);

-- Zprávy klient <-> tým (jednosměrně zrcadlené do Slacku při vzniku zprávy od klienta)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references projects(id) on delete cascade,
  sender text not null check (sender in ('client', 'team')),
  body text not null
);

-- Bezpečnostní síť: kdyby náhodou chyběl i team_members (admin.html na něj spoléhá už dnes, takže
-- pokud existuje, tenhle řádek nic neudělá — sloupce musí sedět s tím, co admin.html čte/píše).
create table if not exists team_members (
  id uuid primary key references auth.users(id),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  role text not null default 'admin'
);

-- Kdyby některá z tabulek nahoře už dřív existovala v neúplné podobě, doplní jen chybějící sloupce:
alter table clients add column if not exists auth_user_id uuid unique references auth.users(id);
alter table clients add column if not exists status text not null default 'active';
alter table projects add column if not exists phase_0_visible boolean not null default false;
alter table projects add column if not exists offer_summary text;
alter table documents add column if not exists category text not null default 'general';
alter table documents add column if not exists storage_path text;
alter table documents alter column file_url drop not null;

-- === RLS ===
alter table clients enable row level security;
alter table projects enable row level security;
alter table milestones enable row level security;
alter table invoices enable row level security;
alter table documents enable row level security;
alter table messages enable row level security;

-- Tým: kdokoliv s řádkem v team_members smí číst/psát celé CRM schéma — stejná důvěra, jakou
-- admin.html dnes dává "je to prostě přihlášený Supabase uživatel" (viz poznámka o team_members
-- RLS v sekci 3 níže, o roli 'admin' konkrétně).
create policy staff_full_access_clients on clients for all
  using (exists (select 1 from team_members where id = auth.uid()))
  with check (exists (select 1 from team_members where id = auth.uid()));
create policy staff_full_access_projects on projects for all
  using (exists (select 1 from team_members where id = auth.uid()))
  with check (exists (select 1 from team_members where id = auth.uid()));
create policy staff_full_access_milestones on milestones for all
  using (exists (select 1 from team_members where id = auth.uid()))
  with check (exists (select 1 from team_members where id = auth.uid()));
create policy staff_full_access_invoices on invoices for all
  using (exists (select 1 from team_members where id = auth.uid()))
  with check (exists (select 1 from team_members where id = auth.uid()));
create policy staff_full_access_documents on documents for all
  using (exists (select 1 from team_members where id = auth.uid()))
  with check (exists (select 1 from team_members where id = auth.uid()));
create policy staff_full_access_messages on messages for all
  using (exists (select 1 from team_members where id = auth.uid()))
  with check (exists (select 1 from team_members where id = auth.uid()));

-- Klient: jen čtení, jen svá vlastní data (přes clients.auth_user_id = auth.uid()).
create policy client_read_own_self on clients for select
  using (auth_user_id = auth.uid());
create policy client_read_own_projects on projects for select
  using (client_id in (select id from clients where auth_user_id = auth.uid()));
create policy client_read_own_milestones on milestones for select
  using (project_id in (select p.id from projects p join clients c on c.id = p.client_id where c.auth_user_id = auth.uid()));
create policy client_read_own_invoices on invoices for select
  using (project_id in (select p.id from projects p join clients c on c.id = p.client_id where c.auth_user_id = auth.uid()));
create policy client_read_own_documents on documents for select
  using (project_id in (select p.id from projects p join clients c on c.id = p.client_id where c.auth_user_id = auth.uid()));
create policy client_read_own_messages on messages for select
  using (project_id in (select p.id from projects p join clients c on c.id = p.client_id where c.auth_user_id = auth.uid()));
-- Klient nikdy nepíše do messages přímo (žádná INSERT policy pro klienty) — jde to výhradně přes
-- /api/portal-send-message.js (service_role), protože ten endpoint zároveň volá Slack webhook.
```

Pozn.: `team_members` RLS se tímto skriptem záměrně nedotýkám (jen ho z ostatních politik čtu) —
pokud už dnes existuje s vlastní RLS a Team & Permissions v adminu vám normálně funguje, nechte ho
být. Kdyby SQL Editor nahlásil chybu i na `team_members` (tzn. že ani ten dosud neexistoval),
napište mi a doladím schéma podle toho, co se v Supabase skutečně vytvořilo.

Bez tohoto kroku: portál se přihlásí, ale `clients`/`projects` dotazy vrátí prázdno (RLS default je
"nic", dokud není explicitní policy) a `/api/invite-client` selže na chybějící sloupec.

### 2. Vercel — doména portálu

**Settings → Domains** → přidat `portal.aerisq.tech`. Vercel zobrazí CNAME cíl — ten nastavte u
registrátora domény pro subdoménu `portal`. Routing (`vercel.json`) na to už reaguje: request s
hlavičkou `Host: portal.aerisq.tech` se přepíše na `/portal.html`, nezávisle na `/admin` a hlavním
catch-all pravidle pro `aerisq.tech`. Ověřte po nasazení `vercel dev` nebo přímo produkci — stejná
opatrnost jako u routing bugu z 21. 8.

### 3. Supabase Storage — bucket `documents` na privátní

Dokumenty teď portál i admin čtou přes krátkodobě podepsané URL (`/api/portal-document-url`), ne
přes přímý veřejný odkaz. V Supabase dashboardu → Storage → bucket `documents` **vypněte "Public
bucket"**, pokud je zapnuté. Nové nahrané soubory (přes upravený `uploadDocument` v `admin.html`)
už ukládají `storage_path` místo starého `file_url`; staré řádky (pokud nějaké existují) zůstanou
bez podepsaného odkazu funkční — `storage_path` je `null`, dokument v portálu/adminu jen nepůjde
otevřít, dokud ho někdo znovu nenahraje.

### 4. Vercel — nová env proměnná

| Klíč | Kde ho vzít | Poznámka |
|---|---|---|
| `SLACK_WEBHOOK_URL` | Slack → Apps → Incoming Webhooks, vytvořit webhook pro kanál, kam mají chodit zprávy z portálu | Volitelné — bez něj zprávy z portálu fungují dál, jen bez Slack notifikace (viz `portal-send-message.js`, fail-soft). |
| `PORTAL_URL` | `https://portal.aerisq.tech/` | Volitelné, jinak se použije tento default přímo v kódu (`portal-request-link.js`, `invite-client.js`). |

Po přidání proměnné je potřeba redeploy (stejně jako u ostatních `/api/*` proměnných výše).

### 5. Co portál (vědomě) neumí v této verzi

- Odpovědi ze Slacku se nepropisují zpět do portálu — komunikace je jednosměrná (portál → Slack),
  odpovídá se v `admin.html` → karta projektu → Messages.
- Statistiky (`admin.html` → Stats) jsou jen pro tým, klient je nevidí.
- `messages` nemá anonymní/authenticated INSERT policy záměrně — klientský zápis jde vždy přes
  `/api/portal-send-message.js`, aby šlo současně ověřit vlastnictví projektu a spustit Slack
  notifikaci na jednom místě.

## 🆕 21. 8. 2026 — konverzní blueprint: interní audit formulář znovu zapojen + demo pro hotelnictví

**Fáze 0 (routing, žádný manuální krok):** Hlavní CTA („Nasadit AI systém", „Postavit MVP", audit
tlačítka, ROI kalkulačka) už neotevírají Calendly rovnou v novém okně — vedou do stávajícího
3-krokového audit formuláře; Calendly se zobrazí inline až po odeslání, předvyplněné jménem a
e-mailem. ROI čísla a `utm_source/medium/campaign` se teď propisují do uloženého leadu (zapsáno do
pole `problem`, žádný nový sloupec v Supabase potřeba). Nic z tohohle nevyžaduje zásah mimo kód.

**Fáze 1 (nové demo, vyžaduje jeden SQL krok):** Na stránce Hotelnictví a gastro
(`/obory/hotelnictvi-gastro`) přibyla interaktivní sekce „vyzkoušej si agenta" — návštěvník zadá
název svého podniku, vybere jednu ze 4 situací (pozdní check-in, špatná recenze, storno, technický
problém) a uvidí naskriptovanou (ne živě volanou LLM) odpověď agenta, personalizovanou svým jménem.
Používá dvě nové tabulky a jednu Postgres funkci — **spusťte v Supabase dashboardu → SQL Editor**:

```sql
create table if not exists demo_stats (
  sector text primary key,
  completions integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists demo_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  company text,
  sector text,
  scenario text,
  lang text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

-- Atomic increment (avoids losing counts to a read-then-write race under ad traffic).
create or replace function increment_demo_stat(p_sector text)
returns integer
language plpgsql
security definer
as $$
declare
  new_count integer;
begin
  insert into demo_stats (sector, completions, updated_at)
  values (p_sector, 1, now())
  on conflict (sector) do update
    set completions = demo_stats.completions + 1, updated_at = now()
  returning completions into new_count;
  return new_count;
end;
$$;

alter table demo_stats enable row level security;
alter table demo_leads enable row level security;
-- No public policies needed: both tables are only ever read/written via the service_role key in
-- /api/demo-stat.js and /api/submit-demo-lead.js (same pattern as audit_requests), never directly
-- from the browser with the anon key.
```

Bez tohoto kroku demo dál funguje (formulář se odešle, Calendly se zobrazí), jen živý čítač
zůstane na 0 a `/api/submit-demo-lead` bude vracet chybu 500, dokud tabulka `demo_leads` neexistuje.

## 🔴 Nejdůležitější nález dneška: `/careers`, `/blog`, `/case-studies` vracely 404 v produkci

Otestoval jsem živý web (`aerisq.tech` → přesměruje na `www.aerisq.tech`) a **čisté URL vracely 404** —
nesouviselo to s ničím z dnešní práce, byl to existující bug ve `vercel.json`. Negative-lookahead
regex `"/((?!admin|api|assets|_vercel).*)$"` se u Vercel rewrites nechová jako běžný JS regex a
nikdy nic nematchoval — proto fungoval jen `/admin` (explicitní pravidlo) a `/` (už je to index.html).
Nahradil jsem to standardním, doloženým vzorcem (`/(.*)` → `/index.html`), který funguje díky tomu,
že Vercel u `rewrites` configu vždy nejdřív zkontroluje, jestli requestu neodpovídá reálný soubor
nebo `/api` funkce, a teprve pak aplikuje rewrite. Ověřeno lokálně přes `vercel dev`:
`/careers`, `/blog`, `/case-studies` → 200, `/admin` → 200, `/api/*` → funguje, statické soubory
(`favicon.png`, `sitemap.xml`, `/vendor/*`) → nejsou rewritem zastíněné. **Po nasazení prosím
znovu ručně ověřte `www.aerisq.tech/careers` v prohlížeči** — lokální test není stoprocentní náhrada
produkčního Vercel edge.

Kód je hotový a nasazený do repozitáře. Tohle jsou kroky, které musíte udělat **vy** mimo kód (env proměnné, Cloudflare účet, Supabase dashboard) — bez nich poběží web dál (nic se nerozbilo), ale nové bezpečnostní vrstvy nebudou aktivní.

## 1. Vercel — environment variables

V nastavení Vercel projektu → **Settings → Environment Variables** přidejte:

| Klíč | Kde ho vzít | Poznámka |
|---|---|---|
| `SUPABASE_URL` | Supabase dashboard → Project Settings → API | `https://multgoxlzarxexeeapuo.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API | stejný jako v kódu dnes (veřejný, není to tajemství) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API → `service_role` | **TAJNÉ.** Nikdy ho nedávejte do žádného `.html` souboru ani mi ho neposílejte do chatu. Jen vložte do Vercel env vars. |

Bez `SUPABASE_SERVICE_ROLE_KEY` nové `/api/*` endpointy vrátí chybu.

Po přidání proměnných je potřeba **redeploy** (Vercel je nenačte do běžících instancí automaticky).

## 2. ~~Cloudflare Turnstile~~ — odstraněno na žádost majitele webu

Turnstile (widget i server-side ověření v `/api/*`) byl z webu kompletně odstraněný — viditelný testovací
banner byl matoucí a bez nastaveného `TURNSTILE_SECRET_KEY` beztak nic reálně neověřoval. Formuláře (Audit,
Newsletter, Kariéra) teď mají jen honeypot pole (`website_hp` / `auditHp` / `appHp` / `newsletterHp`) —
skryté pole, které vyplní jen bot. Pokud budete chtít bot ochranu zpátky, `api/_lib/turnstile.js` bylo
smazané, ale vzorec (widget + `verifyTurnstile()` volání před insertem) je zachovaný v gitové historii.

## 3. Supabase — Row Level Security checklist

Tohle bych rád zkontroloval, ale nemám přístup do vašeho Supabase dashboardu. Prosím ověřte:

- **`audit_requests`, `newsletter_subscribers`, `applications`, `team_members`, `blog_posts`, `case_studies`, `job_roles`, `clients`, `projects`, `milestones`, `invoices`, `documents`, `site_settings`** — všechny by měly mít RLS **zapnuté** (Supabase to defaultně nabízí při vytvoření tabulky, ale dá se to i vypnout).
- Insert do `audit_requests` / `newsletter_subscribers` / `applications` teď jde přes nové `/api/*` endpointy se `service_role` klíčem — to obchází RLS úplně (to je zamýšlené, protože ověření/validace teď dělá server). **Klidně proto můžete anonymní INSERT policy na těchto třech tabulkách úplně zrušit** — veřejný formulář na ně už nepíše přímo.
- **`team_members`** — nový endpoint `/api/admin-create-user` zatím kontroluje jen to, že volající má platný přihlašovací token (je to nějaký přihlášený uživatel), ne že má roli `admin`. Doporučuju přidat RLS politiku na `team_members`, která dovolí INSERT/UPDATE/DELETE jen řádkům, kde `auth.uid()` odpovídá existujícímu členu s `role = 'admin'`. Bez toho může teoreticky založit nového admina kdokoliv, kdo se dokáže přihlásit (např. editor/viewer účet).
- **Storage bucket `cvs`** — soubor životopisu se pořád nahrává přímo z prohlížeče (anon key), ne přes server (Vercel serverless funkce mají tvrdý limit 4.5 MB na request, base64 PDF by se tam nevešel spolehlivě). V Supabase dashboardu → Storage → `cvs` bucket nastavte:
  - **Allowed MIME types**: `application/pdf`
  - **Max file size**: 8 MB
  - Bucket by měl dovolovat jen INSERT anonymnímu klíči, ne READ/LIST/DELETE (kromě `public` cesty pro čtení, pokud ji používáte).

## 4a. Bugy, které odhalil dnešní test (`vercel dev` + headless Chromium)

Reálně jsem spustil web a proklikal ho (ne jen si přečetl kód) — díky tomu se ukázaly 3 chyby,
které jsem taky rovnou opravil:

1. **`vercel.json` routing** — viz sekce výše, nejzávažnější nález.
2. **`<helmet>` blok nepodporuje `{{ }}` binding.** support.js mountuje `<title>`/`<meta>`/`<link>`
   tagy z `<helmet>` jen jednou, staticky — první verze dynamických meta tagů proto na stránce
   doslova zobrazovala text `{{ metaTitle }}` místo skutečného titulku. Opraveno: `<helmet>` teď má
   rozumné statické výchozí hodnoty (pro roboty bez JS) a `renderVals()` je navíc přepisuje
   imperativně přes `document.title =` / `setAttribute()` — stejný fungující princip, jaký jsem
   použil pro `document.documentElement.lang`.
3. **Cloudflare Turnstile widget dostával doslovný text `{{ turnstileSiteKey }}` jako sitekey** —
   race condition: Turnstile's implicit auto-render naskenoval DOM dřív, než template engine stihl
   dosadit hodnotu. Přepnuto na `?render=explicit` + vlastní `window.turnstile.render(...)` volané
   ve stejném imperativním bloku jako meta tagy — ověřeno screenshotem, widget teď reálně naběhne
   ("Success!" s testovacím klíčem).

Mimochodem se při opravě #2 chytla i skutečná TDZ (temporal dead zone) JS chyba — `ogImageUrl`
použité o řádek dřív, než bylo `const`-em deklarované — která by shodila `renderVals()` na každém
renderu. I to je teď opravené a ověřené (`console --errors` čisté na home/careers/admin).

## 4. Co jsem změnil (shrnutí pro changelog)

- Sitemap opraven na aktuální čisté URL + přidán hreflang cs/en.
- `<html lang>` je teď dynamický podle jazyka (default `cs`, `?lang=en` pro angličtinu — opraven i bug, kdy reload anglické verze spadl zpět na češtinu).
- Title/description/canonical/og:*/twitter:* jsou teď per-page a per-jazyk (dřív byly statické a stejné na všech podstránkách).
- pdf.js aktualizován z 3.11.174 (stará, CVE-2024-4367) na 6.2.108, vendorováno lokálně (`/vendor/pdfjs/`) místo CDN — žádná externí závislost navíc.
- `prefers-reduced-motion` respektováno.
- Google Fonts ořezány o nepoužívaný řez 300.
- CV upload: client-side kontrola typu (PDF) a velikosti (max 8 MB) s chybovou hláškou.
- `node_modules` odtracknuto z gitu, přidán `.gitignore`.
- ARIA atributy na jazykovém přepínači, tabech kódu a ROI slidérech.
- Nová `/api/*` vrstva (Vercel serverless): `submit-audit`, `submit-application`, `subscribe-newsletter`, `admin-create-user` — server-side validace, honeypot pole, Turnstile ověření, a `service_role` klíč zůstává mimo prohlížeč.
- Opravený bug: zakládání nového admin uživatele dřív nikam neposílalo heslo (uživatel se pak nikdy nemohl přihlásit) — teď reálně vytváří Supabase Auth účet.

## 5. Co jsem NEudělal (vědomě, mimo rozsah dneška)

- **Privacy Policy** má pořád placeholder text (`[DATABASE PROVIDER, e.g. Supabase...]`) — potřebuju od vás konkrétní fakta (název firmy, adresa, kontakt na zpracování údajů), abych to mohl dopsat správně.
- **Self-hosting Google Fonts** — funkční, ale nechal jsem na později, ať se dnešní dávka nerozroste ještě víc.
- **Reálné rate-limiting** (přes IP/čas) na `/api/*` endpointech — bez Vercel KV/Upstash Redis nejde spolehlivě udělat ve stateless serverless funkci. Honeypot je teď jediná obrana proti spamu (Turnstile byl odstraněn, viz sekce 2); rate-limit můžeme přidat, pokud se ukáže potřeba.
- **Vlastní Open Graph obrázek** (1200×630) — teď se pro `og:image`/`twitter:image` používá `favicon.png`, což není ideální poměr stran pro social share karty.

# Setup checklist — po dnešních změnách

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
| `TURNSTILE_SECRET_KEY` | Cloudflare dashboard → Turnstile (viz krok 2) | **TAJNÉ**, jen do Vercel env vars |

Bez `SUPABASE_SERVICE_ROLE_KEY` nové `/api/*` endpointy vrátí chybu. Bez `TURNSTILE_SECRET_KEY` ověření Turnstile potichu projde (vypíše warning do server logu) — formuláře fungují, ale bez bot ochrany, takže tohle je vlastně priorita č. 1.

Po přidání proměnných je potřeba **redeploy** (Vercel je nenačte do běžících instancí automaticky).

## 2. Cloudflare Turnstile (anti-spam na formulářích)

1. Jděte na [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile** → **Add site**.
2. Doména: `aerisq.tech`.
3. Zkopírujte **Site Key** a **Secret Key**.
4. **Secret Key** → Vercel env var `TURNSTILE_SECRET_KEY` (krok 1).
5. **Site Key** → nahraďte placeholder v [index.html:916](index.html#L916) (a stejně v `AerisQ.dc.html`):
   ```js
   const TURNSTILE_SITE_KEY = 'VÁŠ_SITE_KEY_ZDE';
   ```
   Momentálně tam je Cloudflare oficiální **testovací** klíč (`1x00000000000000000000AA`), který vždy projde — web funguje, ale reálně nechrání proti botům, dokud klíč nevyměníte.
6. Po nasazení **ručně vyzkoušejte** všechny tři formuláře (Audit, Newsletter, Kariéra) — widget jsem naimplementoval v „implicit render" režimu, který je nejjednodušší a nejodolnější vůči tomu, jak tenhle vlastní šablonovací engine (`support.js`) přerenderovává DOM. Nemám tu ale prohlížeč, ve kterém bych to mohl reálně otestovat, takže první test po nasazení má na starosti prosím někdo lidský.

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
- **Reálné rate-limiting** (přes IP/čas) na `/api/*` endpointech — bez Vercel KV/Upstash Redis nejde spolehlivě udělat ve stateless serverless funkci. Turnstile + honeypot je dnešní obrana; rate-limit můžeme přidat, pokud se ukáže potřeba.
- **Vlastní Open Graph obrázek** (1200×630) — teď se pro `og:image`/`twitter:image` používá `favicon.png`, což není ideální poměr stran pro social share karty.

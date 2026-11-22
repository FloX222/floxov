# FLOXOV — Security Hardening (2026-11-22)

## Что изменено в архиве

- **CSP**: политика Content Security Policy добавлена в HTML как fallback для GitHub Pages (включая 404 и страницы-переадресации). JavaScript разрешён только с сайта, esm.sh, Cloudflare Turnstile и 4 встроенных скрипта с точными SHA-256 hash. Произвольный inline JS и `eval` запрещены.
- **HTTP security headers**: `_headers` для Cloudflare Pages. Содержит CSP с `frame-ancestors 'none'`, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS, CORP, cache-control. **GitHub Pages не читает `_headers`**. На GitHub Pages применяется только meta CSP: `frame-ancestors` и HSTS через неё не установить.
- **Supabase**: проверка URL Supabase перед передачей публичного ключа, конкретная версия browser SDK `@supabase/supabase-js@2.119.2` вместо плавающего `@2`.
- **Безопасный DOM**: заменён один `innerHTML` в счётчике портфолио на создание DOM-узлов.
- **Защита анонимной регистрации**: добавлена опциональная поддержка Cloudflare Turnstile перед `signInAnonymously()`; выключена по умолчанию, пока не настроены облачные сервисы. Включается через `reputation.turnstileSiteKey` в `assets/config.js`. Секретный ключ сохраняется **только в Supabase**, не в HTML/JS.
- **Аудит Supabase**: `security/SUPABASE_SECURITY_AUDIT.sql` — проверка RLS/грантов/функций без изменения данных. Оригинальная SQL-миграция и голоса **не изменены**.
- **Проверки**: `security/verify_security.py` сверяет CSP, хеши скриптов и конфигурацию. Запускайте при каждом изменении HTML.

## Что необходимо сделать в облаке (сам архив это НЕ включает)

### 1. Cloudflare и хостинг

**Вариант A (рекомендован):** разверните содержимое папки `floxov-main` в Cloudflare Pages (output directory `.` при корне проекта). Привяжите свой домен, убедитесь в HTTPS и корректном DNS. Тогда файл `_headers` будет применён к статическим ответам.

**Вариант B:** оставьте GitHub Pages и подключите Cloudflare proxy на собственном домене с корректной поддержкой origin TLS. Настройте заголовки на Cloudflare вручную (Transform Rules / Workers) — `_headers` GitHub Pages игнорирует. Для `*.github.io` Cloudflare вашей зоны не управляет.

В Cloudflare отдельно включите HTTP DDoS Protection, WAF Managed Rules (если доступны), Bot Management / Bot Fight Mode, Security Analytics и Managed Challenge по сигналам риска. Для анонимных страниц не применяйте низкий rate limit ко всем изображениям, JS и видео. Дайте отдельные лимиты на `/auth/v1/signup`, `/auth/v1/token`, `/rest/v1/rpc/vote_floxov` **только если такие запросы проходят через ваш домен / edge gateway**: прямые вызовы `*.supabase.co` Cloudflare сайта не фильтрует.

**Важно о доступности**: текущий frontend напрямую вызывает Supabase. Защита главного домена сама по себе НЕ обеспечивает серверный rate limit для RPC в Supabase. Для повышения защиты от накрутки нужны CAPTCHA на Auth, настройки Auth rate limits, аудит RLS и, при необходимости, отдельный backend gateway с закрытием прямого обхода защищённых операций.

### 2. Включение Turnstile и Supabase CAPTCHA — только вместе

1. В Cloudflare Turnstile создайте widget с доменом вашего сайта. Получите **site key** и **secret key**.
2. В **Supabase Dashboard → Authentication → Bot and Abuse Protection** включите CAPTCHA, выберите **Turnstile** и внесите **secret key**. Убедитесь, что Turnstile разрешён для анонимных регистраций вашей версии Supabase.
3. В `assets/config.js` установите `reputation.turnstileSiteKey: "ВАШ_PUBLIC_SITE_KEY"`. **Не записывайте secret key в frontend.**
4. Разверните проект и в приватной вкладке проверьте первое голосование/инициализацию новой сессии. Для существующих сессий новая CAPTCHA не появляется.
5. Только после проверки включайте ограничения агрессивнее. В противном случае новые посетители могут потерять доступ к репутации.

**Честное ограничение:** Turnstile замедляет массовую автоматизированную регистрацию, но не гарантирует «один человек = один голос». Глобальная репутация на анонимных идентификаторах всё равно подвержена Sybil-атакам. Для более высокого доверия необходимо изменить политику идентификации/голосования, что нельзя сделать незаметно без изменения модели продукта.

### 3. Аудит базы и секретов

- Выполните `security/SUPABASE_SECURITY_AUDIT.sql` в SQL Editor и проверьте, что `anon` не имеет `EXECUTE` на приватные RPC, а `authenticated` не имеет прямой записи в `floxov_votes`.
- Не запускайте повторно SQL-миграции без резервной копии и проверки фактического состояния БД.
- `sb_publishable_*` в frontend **не секрет** — безопасен при корректных RLS/ACL. Никогда не загружайте `service_role`, `sb_secret_*`, Turnstile secret, пароль БД, GitHub token в HTML/репозиторий.
- Настройте уведомления об аномальном числе пользователей, запросов/ошибок, ежедневные бэкапы и возможность отката деплоя.
- Проверьте открытость настроек в публичном GitHub-репозитории: весь клиентский JS доступен посетителям независимо от сокрытия исходников.

### 4. Меняем политику после изменения HTML

CSP использует точные SHA-256 хеши **каждого** встроенного скрипта. При любом изменении `<script>...</script>` в HTML новые хеши нужно пересчитать и синхронно обновить meta CSP и `_headers`. Проверяйте `python security/verify_security.py` до публикации. Если проверка не проходит, **не деплойте** — возможна блокировка логики в браузере.

### 5. Ограничения текущего результата

В ZIP нет доступа к Cloudflare, GitHub или Supabase admin, поэтому **внешние WAF, DDoS, rate limits, CAPTCHA и бэкапы не включены автоматически**. Этот архив содержит локальные изменения кода и инструкции по безопасному включению облачной защиты. Проверки на реальном iPhone/Safari и нагрузочные тесты должны выполняться после размещения на тестовом HTTPS-домене.

## Источники

- Cloudflare Pages `_headers`: https://developers.cloudflare.com/pages/configuration/headers/
- Supabase CAPTCHA: https://supabase.com/docs/guides/auth/auth-captcha
- Supabase анонимные сессии: https://supabase.com/docs/guides/auth/auth-anonymous
- Supabase JS: https://supabase.com/docs/reference/javascript/auth-signinanonymously

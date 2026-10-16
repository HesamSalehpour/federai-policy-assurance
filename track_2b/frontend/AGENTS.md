<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## FEDERAI frontend
- All backend calls go through `src/services/federai-api.ts` (POST /api/analyze with `{title, text}`, GET /api/health); base URL from public `VITE_FEDERAI_API_URL`. Why: the existing FastAPI/Apertus backend must stay untouched and swappable.
- Evidence "exact match" is a deterministic client-side substring check only; never label findings as verified facts. Why: brief's integrity rules.
- UI strings live in `src/i18n/dictionaries.ts`; Rumantsch falls back to English until reviewed. Why: no unreviewed translations shown.
- Demo/illustrative data lives only in `src/lib/demo-data.ts` and is always bannered. Why: never present demo data as real.

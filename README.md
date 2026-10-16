# FEDERAI — Sovereign AI for Resilient Public Decisions

FEDERAI is an evidence-centred policy assurance platform designed to help
public institutions examine policy documents, identify implementation gaps,
trace findings to source text, and explore hypothetical failure scenarios.

It combines Apertus-based structured analysis with deterministic evidence
checks and human review. FEDERAI supports decision assurance; it does not
replace institutional accountability or professional judgement.

## Core workflow

1. Submit a policy document and title.
2. Generate structured findings using the Apertus model family.
3. inspect source quotations and evidence-verification status.
4. Review relationships, assumptions, limitations, and hypothetical scenarios.
5. Use the results to support human-led policy review.

A verified text match means a quotation occurs in the submitted source.
It does not prove that the quotation is factually correct or that a claim
derived from it is valid.

## Architecture

- **Frontend:** React, TanStack Start, TypeScript, and Vite.
- **API:** FastAPI with request validation and structured analysis responses.
- **Model:** `swiss-ai/apertus-v1.5-8b`, accessed through the configured
  Public AI API endpoint.
- **Evidence checks:** deterministic exact-text quotation matching.
- **Deployment:** Docker Compose with frontend, API, and Nginx reverse proxy.

The current model endpoint is external. Swiss data residency, Swiss
jurisdiction, on-premise deployment, and air-gapped operation have not been
verified for this running configuration. Do not submit confidential or
sensitive documents to the hosted endpoint.

## Requirements

- Docker Engine with Docker Compose
- `make`
- A valid API token for the configured inference endpoint

## Configuration

Create a local environment file from the example:

```bash
cp track_2b/.env.example track_2b/.env
```

Edit `track_2b/.env` locally and set `HF_TOKEN` to your authorized token.
Never commit `.env` or share its contents.

The default model settings are:

```env
MODEL_BASE_URL=https://api.publicai.co/v1
MODEL_NAME=swiss-ai/apertus-v1.5-8b
```

## Run the application

From the repository root:

```bash
make run
```

Open [http://localhost:8000](http://localhost:8000).

Check API health at [http://localhost:8000/api/health](http://localhost:8000/api/health).

To stop the containers, open another terminal in `track_2b/` and run:

```bash
docker compose down
```

## Repository layout

```text
.
├── Makefile
├── README.md
└── track_2b/
    ├── Dockerfile
    ├── Makefile
    ├── docker-compose.yml
    ├── nginx.conf
    ├── technical_report.md
    ├── frontend/
    ├── src/
    └── data/
```

## Evaluation status

The integrated frontend, API health endpoint, and Docker services have been
smoke-tested locally. End-to-end analysis should be tested again from a clean
checkout before submission. No quantitative accuracy benchmark is claimed.

## Security and limitations

- Keep API credentials in the ignored local `.env` file.
- Do not commit tokens, private keys, or confidential policy documents.
- Model-generated findings can be incomplete or incorrect.
- Exact-text evidence verification is not factual verification.
- Hypothetical scenarios are prompts for review, not predictions.
- The hosted inference endpoint means this configuration is not verified
  as sovereign Swiss infrastructure.

## License

See [LICENSE](LICENSE) and the Hack Apertus terms and conditions:
https://hackapertus.ch/terms-and-conditions

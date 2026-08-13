# Serverless API patterns

## When to use Lambda

Use AWS Lambda behind API Gateway for:

- Chat `/ask` endpoints that retrieve documents and call a model.
- Lightweight auth callbacks if not using Cognito hosted UI.

## Suggested layout for the portal

| Route | Purpose |
| --- | --- |
| `POST /auth/signup` | Register member (Cognito in production) |
| `POST /auth/forgot` | Trigger reset email (SES in production) |
| `POST /chat` | Member question → grounded answer + sources |

## Local stand-in

Express, FastAPI, or Flask with the same routes is fine for the hackathon demo.

## Limits to mention in pitch

- Lambda timeout and memory affect long jobs — size functions appropriately for your workload.
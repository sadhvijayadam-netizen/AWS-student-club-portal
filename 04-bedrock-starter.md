# Getting started with Amazon Bedrock

## What is Bedrock?

Amazon Bedrock is a managed service to call foundation models through an API. For the Club Member Portal chatbot, teams often use Bedrock in the **AWS deployment story** (pitch and Builder Center), even when the hackathon demo runs locally with another model.

## Typical RAG flow on AWS

1. **Ingest** — club documents in Amazon S3.
2. **Index** — embeddings in OpenSearch Serverless or Bedrock Knowledge Bases.
3. **Retrieve** — top chunks for the user question.
4. **Generate** — Bedrock model answers using only retrieved context.
5. **Cite** — return source file names in the UI.

## Responsible use

- Ground answers in retrieved documents.
- Do not invent AWS pricing, limits, or policies — use the campus AWS contact fallback instead.
- Do not invent service limits, pricing, or policies.

## Local prototype

For the hackathon, a local vector store + open-source or API model is fine. In your article, map each step to the AWS service you would use in production.

## Learn more

- [Amazon Bedrock documentation](https://docs.aws.amazon.com/bedrock/)
- [Bedrock Knowledge Bases](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html)
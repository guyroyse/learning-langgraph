# Learning LangGraph.js

Just a simple repository with examples of agents built with LangGraph.js, demonstrating various agent patterns and workflows.

## Blog Post Series

This repository exists alongside a blog posts series called _Learning LangGraph.js_. Read the series if you get lost and are worried you might be eaten by a grue:

- **[Part 1: It's Just a Graph](PLACEHOLDER_URL)** - Introduction to LangGraph.js fundamentals

This repo and the blog posts are a distillation of what I learned building [Agents & Arbiters](https://github.com/guyroyse/agents-and-arbiters), a demo exploring multi-agent AI workflows in the context of a text adventure game. So, check that out as well.

## Prerequisites

- **Node.js** >= 22.0.0
- **Docker** (for running [Redis](https://redis.io/))
- **OpenAI API Key** (although if you're ambitious you can probably use [Ollama](https://ollama.com/) or something)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and add your OpenAI API key:

```bash
cp .env.example .env
```

Then edit `.env` and replace `<your_open_ai_key>` with your actual OpenAI API key.

### 3. Start Redis

Start the Redis server using Docker Compose:

```bash
docker compose up
```

Redis will automatically load the pre-configured Zork facts from `redis/dump.rdb`.

## Running the Examples

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

Build the TypeScript code:

```bash
npm run build
```

Run the compiled code:

```bash
npm start
```

## Examples

The project includes several example agents:

### 01-just-a-graph.ts

A simple Zork expert agent that answers questions about the classic text adventure game. The workflow includes:

- **zork_agent**: Answers questions about Zork using GPT-4o-mini
- **zork_fact_checker**: Edits and fact-checks the agent's response

The file also includes commented-out alternative agents:

- **dumbZorkAgent**: Returns a static response
- **randomZorkAgent**: Returns a random Zork fact from Redis

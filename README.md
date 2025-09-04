# YCombinator News Crawler

A **web crawler** built with TypeScript that scrapes news from [Hacker News](https://news.ycombinator.com).

---

## Requirements
- [**Node.js**](https://nodejs.org/) (>v20)  
- [**Git Bash**](https://git-scm.com/downloads/win) (recommended for Windows users)

## Installation
### 1. Clone or download the repository:
```bash
git clone https://github.com/rucev/ycombinator-news-crawler
````
### 2. Navigate to the project folder:
```bash
cd ycombinator-news-crawler
```
### 3. Install dependencies:
```bash
npm i
```

## Running the Project

```bash
npm run start
```

## Tests & Coverage

Run tests and/or generate coverage reports:

```bash
npm run test
npm run test-coverage
```

## Project Structure

```sh
src/
│
├── crawler/ # Core crawling logic (fetching, parsing, scheduling)
├── storage/ # Data persistence layer (JSON)
├── tests/   # Unit tests
└── index.ts # Application entry point
```
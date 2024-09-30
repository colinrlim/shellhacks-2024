# ShellHacks 2024 - Team Rich Mahogany Chair

Welcome to the ShellHacks 2024 repository! This is where our team will store and manage our code for the ShellHacks hackathon.

## Table of Contents

- [ShellHacks 2024 - Team Rich Mahogany Chair](#shellhacks-2024---team-rich-mahogany-chair)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Team Members](#team-members)
  - [Project Details](#project-details)
    - [Inspiration](#inspiration)
    - [What it does](#what-it-does)
    - [How we built it](#how-we-built-it)
    - [Challenges we ran into](#challenges-we-ran-into)
    - [Accomplishments that we're proud of](#accomplishments-that-were-proud-of)
    - [What we learned](#what-we-learned)
    - [What’s next for Bigsby](#whats-next-for-bigsby)
  - [Installation \& Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [AUTH0](#auth0)
- [MONGODB](#mongodb)
- [OPENAI](#openai)
- [DEBUG](#debug)

## Introduction

This repository is set up as a framework for our project during the ShellHacks 2024 hackathon. We will update this README with more details as we progress.

## Team Members

- **Member 1**: [Kevin Willoughby](https://github.com/kvnwdev)
- **Member 2**: [Colin Lim](https://github.com/colinrlim)
- **Member 3**: [Trevor Yates](https://github.com/trevor4416)

## Project Details

### Inspiration

The idea for Bigsby was inspired by tools like ChatGPT and Khan Academy as aids to rapid development of experience and skills. Our goal was to create a web application that allows users to engage deeply with a subject as efficiently as possible. By integrating the strengths of large language models (LLMs) and dynamic learning, we set out to build an intuitive platform that makes learning both engaging and efficient.

### What it does

Bigsby is a web application designed to help users rapidly explore and learn about any subject. When a user inputs a topic, Bigsby generates a series of related questions to guide the learning process. As users answer these questions, the app intelligently shifts the focus to related or prerequisite topics, ensuring a comprehensive and tailored learning path.

### How we built it

Bigsby was developed using Next.js with React, taking advantage of TypeScript for robust type-checking and better maintainability. The backend is powered by the OpenAI API, which drives the intelligent question generation and topic-shifting logic. MongoDB and Mongoose are used to handle user data and session management, ensuring that users can return to their learning path seamlessly.

### Challenges we ran into

One of the main challenges we faced during development was integrating the LLM’s question and explanation generation with the frontend. Ensuring that the transitions between topics felt smooth and natural required careful synchronization of backend and frontend components. Another challenge was optimizing the performance of the app.

### Accomplishments that we're proud of

We’re proud of the complexity and ambition of Bigsby. Not only did we manage to build a system that dynamically generates questions and shifts topics based on user input, but we were able to integrate it into an intuitive web interface. The seamless connection between AI-driven content and education is one of our major achievements in this project.

### What we learned

Throughout the development of Bigsby, we gained valuable insights into the integration of LLMs within web applications. We also learned a great deal about managing state and synchronizing data between different parts of a complex system, especially in terms of real-time user interactions. The project gave us a deeper understanding of how to effectively use AI in educational applications.

### What’s next for Bigsby

While we're still exploring the future possibilities for Bigsby, there are several directions we’re considering. This could include adding personalization features, allowing for collaborative learning, allowing for visualization, or expanding the question types and response complexity that Bigsby can offer. We're excited about the potential of Bigsby and eager to see where we can take it next.

## Installation & Setup

First, clone the repository:

```bash
# HTTPS
git clone https://github.com/colinrlim/shellhacks-2024.git

# SSH
git clone git@github.com:colinrlim/shellhacks-2024.git

cd shellhacks-2024

# Install dependencies
cd frontend
npm install

# Create a .env.local in the frontend directory
touch .env.local
```

Then, configure the environment variables:

```bash

```

# Environment Variables

# AUTH0

AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_REDIRECT_URI=
AUTH0_POST_LOGOUT_REDIRECT_URI=

# MONGODB

MONGODB_URI=

# OPENAI

OPENAI_API_KEY=
OPENAI_MODEL=

# DEBUG

DEBUG_FLAG=true

````

Finally, run the development server:

```bash
npm run dev
````

Navigate to [http://localhost:3000](http://localhost:3000) to see the app running.

That's it! You're ready to start developing with Bigsby.

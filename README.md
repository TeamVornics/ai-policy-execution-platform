# 🚀 AI Policy Execution Platform

> **Revolutionizing Policy Management with AI & Real-Time Analytics**

![Platform Banner](https://via.placeholder.com/1200x400.png?text=AI+Policy+Execution+Platform)

## 🌟 Overview

The **AI Policy Execution Platform** is a cutting-edge solution designed to automate, analyze, and visualize complex policy documents. Leveraging advanced **Natural Language Processing (NLP)** and **3D Data Visualization**, it transforms static PDF policies into actionable, real-time workflows.

This repository contains the complete source code for the platform, organized into a modern monorepo structure.

## 📂 Repository Structure

```
ai-policy-execution-platform/
├── frontend/           # Next.js 15 + React 19 Client Application
├── backend/            # Python FastAPI Backend & Integration Logic
├── simulation/         # Simulation Engine for Testing & Demo
├── contracts/          # Data Schemas and API Contracts
└── demo/               # Demo Scripts and Walkthroughs
```

## ✨ Key Features

### 🧠 AI-Powered Analysis
- **Automated Rule Extraction**: Instantly converts PDF policy documents into structured rules.
- **Ambiguity Detection**: Identifies vague clauses and suggests clarifications using LLMs.
- **Neural Network Visualization**: Visualizes the AI's decision-making process in real-time.

### 📊 Mission Control Dashboard
- **Real-Time Monitoring**: Live tracking of task execution, escalations, and system health.
- **Role-Based Task Management**: Auto-assigns tasks to 'Admin', 'Officer', or 'Clerk' based on policy rules.
- **Audit Logging**: Immutable logs of every action for compliance and transparency.

### 🎨 Immersive Experience
- **3D Data Visualization**: "Victory Chamber" results page with interactive 3D elements.
- **Glassmorphism UI**: Modern, sleek interface with dynamic animations and glow effects.
- **Interactive Timelines**: Visual history of document processing and user activities.

### 📄 Smart Export
- **PDF Generation**: One-click export of processed policies with resolved ambiguities.
- **Structured Data**: Export results as JSON for integration with other systems.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Heroicons

### Backend & AI
- **Server**: Python FastAPI
- **Database**: MongoDB
- **AI Models**: Custom NLP Pipeline (SpaCy/Transformers)

## 🚀 Getting Started

### 1. Frontend Setup (The Dashboard)

The frontend is the heart of the user experience.

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
# Create a .env file with:
# NEXT_PUBLIC_API_URL=https://eighty-clubs-stop.loca.lt

# Run the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to launch the dashboard.

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install requirements
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

## 📸 Screenshots

| Dashboard | 3D Results |
|-----------|------------|
| ![Dashboard](https://via.placeholder.com/400x200?text=Dashboard) | ![Results](https://via.placeholder.com/400x200?text=Results) |

## 🤝 Contributors

- **Ankit Saini** - *Lead Developer*
- **Team** - *AI & Backend Integration*

---

*Built with ❤️ for [Hackathon Name]*
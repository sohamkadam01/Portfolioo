import { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';

// Lightweight Native Web Audio API sound engine for UI feedback & diagram sonification
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.lastClickAt = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playNodeClick(freq = 580) {
    if (this.muted) return;
    const now = Date.now();
    if (now - this.lastClickAt < 60) return;
    this.lastClickAt = now;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Audio is unavailable in this browser context.
    }
  }

  playStepPulse(stepIndex) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const baseFreq = 400 + stepIndex * 80;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {
      // Audio is unavailable in this browser context.
    }
  }

  playCompletion() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((f, i) => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.07);
        gain.gain.setValueAtTime(0.07, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.25);
      } catch {
        // Audio is unavailable in this browser context.
      }
    });
  }

  playHover() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio is unavailable in this browser context.
    }
  }
}

const audioFX = new SoundEngine();

const SearchIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const VolumeIcon = ({ className = "w-4 h-4", muted = false }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {muted ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    )}
  </svg>
);

const PlayIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const MailIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const FileTextIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CloseIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExternalLinkIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const MirrorShineText = ({ children }) => (
  <>
    {Array.from(children).map((character, index) => (
      <span
        key={`${character}-${index}`}
        className="mirror-shine-character"
        style={{ animationDelay: `${index * 85}ms` }}
      >
        {character === ' ' ? '\u00a0' : character}
      </span>
    ))}
  </>
);

const RESUME_URL = "https://github.com/sohamkadam";
const SOHAM_EMAIL = "sohamsk0015@gmail.com";
const GITHUB_URL = "https://github.com/sohamkadam01";
const LINKEDIN_URL = "https://www.linkedin.com/in/kadamsoham0015/";

const HERO_SYSTEM_FLOW = {
  id: 'hero-system',
  title: '',
  showStepStatus: false,
  themeColor: '#6366f1',
  nodes: [
   { id: 'client', label: 'React Client UI', type: 'frontend', x: 80, y: 140, info: 'Interactive web interface handling user input, AI queries, dashboard views, and live system metric rendering.' },
{ id: 'gateway', label: 'Spring Boot / FastAPI API', type: 'gateway', x: 260, y: 140, info: 'API layer responsible for authentication, request validation, routing, and communication between frontend and backend services.' },
{ id: 'ai-agent', label: 'LangGraph AI Agent', type: 'ai', x: 480, y: 70, info: 'Orchestrates AI workflows by analyzing user intent and deciding between tool execution, semantic retrieval, or direct LLM response generation.' },
{ id: 'java-service', label: 'Spring Boot Backend', type: 'backend', x: 480, y: 210, info: 'Handles core business logic, system monitoring, transactional processing, metric collection, and backend APIs.' },
{ id: 'vector-db', label: 'PostgreSQL / pgvector', type: 'db', x: 700, y: 70, info: 'Stores structured application data and vector embeddings used for semantic search and RAG-based knowledge retrieval.' },
{ id: 'redis', label: 'Redis Cache', type: 'cache', x: 700, y: 210, info: 'Provides low-latency caching and transient state management for frequently accessed data and real-time processing.' },
{ id: 'websocket', label: 'WebSocket / STOMP', type: 'realtime', x: 900, y: 210, info: 'Maintains real-time communication between the Spring Boot backend and React client for live system metrics and monitoring updates.' },
  ],
  edges: [
    { from: 'client', to: 'gateway', label: 'REST / WS' },
    { from: 'gateway', to: 'ai-agent', label: 'Async Request' },
    { from: 'gateway', to: 'java-service', label: 'Service Call' },
    { from: 'ai-agent', to: 'vector-db', label: 'RAG Lookup' },
    { from: 'java-service', to: 'redis', label: 'Pub/Sub Cache' },
    { from: 'redis', to: 'websocket', label: 'Cache Event Stream' },
  ]
};

const ALETHEIA_FLOW = {
  id: 'aletheia-agent',
  // title: 'Aletheia MCP Agent Execution Loop',
  themeColor: '#818cf8',
 nodes: [
  { id: 'u-req', label: 'User Request', type: 'input', x: 60, y: 140, info: 'Receives user prompts through the web interface or client API request.' },
  { id: 'fastapi', label: 'FastAPI Service', type: 'gateway', x: 190, y: 140, info: 'API layer that validates incoming requests, manages request handling, and forwards the query to the AI workflow.' },
  { id: 'langgraph', label: 'LangGraph Agent', type: 'ai', x: 330, y: 140, info: 'Orchestrates the stateful agent workflow, maintains execution state, and controls transitions between reasoning, tools, retrieval, and response generation.' },
  { id: 'llm-reason', label: 'LLM Reasoning', type: 'decision', x: 470, y: 140, info: 'Analyzes the user query and determines whether to answer directly, invoke an MCP tool, or retrieve relevant context through RAG.' },
  { id: 'mcp-tool', label: 'MCP Tool Execution', type: 'branch-mcp', x: 620, y: 55, info: 'Invokes available MCP tools with structured arguments to interact with external services, system resources, or APIs.' },
  { id: 'vector-rag', label: 'Vector Context Search', type: 'branch-rag', x: 620, y: 225, info: 'Performs semantic similarity search against ChromaDB or pgvector to retrieve relevant knowledge for the current query.' },
  { id: 'llm-synth', label: 'LLM Response Generation', type: 'synthesis', x: 750, y: 140, info: 'Combines the user query with tool results, retrieved context, or direct reasoning to generate the final response.' },
  { id: 'final-resp', label: 'Final User Response', type: 'output', x: 860, y: 140, info: 'Returns the generated response to the client through the FastAPI service.' },
],

edges: [
  { from: 'u-req', to: 'fastapi', label: 'User Query' },
  { from: 'fastapi', to: 'langgraph', label: 'Query + State' },
  { from: 'langgraph', to: 'llm-reason', label: 'Agent Step' },
  { from: 'llm-reason', to: 'mcp-tool', label: 'Tool Call' },
  { from: 'llm-reason', to: 'vector-rag', label: 'Retrieve Context' },
  { from: 'llm-reason', to: 'llm-synth', label: 'Direct Response' },
  { from: 'mcp-tool', to: 'llm-synth', label: 'Tool Result' },
  { from: 'vector-rag', to: 'llm-synth', label: 'Retrieved Context' },
  { from: 'llm-synth', to: 'final-resp', label: 'Generated Response' },
]
};

const AI_FINANCE_FLOW = {
  id: 'ai-finance-flow',
  title: 'AI Finance Receipt & Analytics Pipeline',
  themeColor: '#34d399',
 nodes: [
  { id: 'user-react', label: 'React Frontend', type: 'frontend', x: 60, y: 140, info: 'User interface for entering financial transactions, uploading receipt images, viewing budgets, and exploring AI-generated financial insights.' },
  { id: 'spring-api', label: 'Spring Boot API', type: 'gateway', x: 180, y: 140, info: 'Handles API requests, authentication, validation, transaction management, and coordination between frontend and backend services.' },
  { id: 'ocr-micro', label: 'OCR Microservice', type: 'process', x: 320, y: 60, info: 'FastAPI-based microservice that processes receipt images and extracts readable text and document information.' },
  { id: 'extract-cat', label: 'AI Data Extraction & Categorization', type: 'ai', x: 460, y: 60, info: 'Extracts financial entities such as vendor, date, amount, and payment details, then automatically categorizes transactions by expense type.' },
  { id: 'postgres-db', label: 'PostgreSQL Ledger', type: 'db', x: 580, y: 140, info: 'Persists structured financial transactions, user data, budgets, categories, and historical financial records.' },
  { id: 'analytics-engine', label: 'Financial Analytics Engine', type: 'process', x: 700, y: 140, info: 'Analyzes historical transactions to calculate spending trends, budget status, anomalies, and future financial projections.' },
  { id: 'react-dash', label: 'AI Insights Dashboard', type: 'output', x: 840, y: 140, info: 'Displays spending analytics, forecasts, budget insights, recommendations, and interactive financial visualizations.' },
],

edges: [
  { from: 'user-react', to: 'spring-api', label: 'REST Request' },
  { from: 'spring-api', to: 'ocr-micro', label: 'Receipt Image' },
  { from: 'ocr-micro', to: 'extract-cat', label: 'OCR Text' },
  { from: 'extract-cat', to: 'postgres-db', label: 'Structured Transaction' },
  { from: 'spring-api', to: 'postgres-db', label: 'Transaction Data' },
  { from: 'postgres-db', to: 'analytics-engine', label: 'Historical Transactions' },
  { from: 'analytics-engine', to: 'react-dash', label: 'Financial Insights' },
]
};

const TELEMETRY_FLOW = {
  id: 'telemetry-stream',
  title: 'Real-Time System Telemetry Stream',
  themeColor: '#fbbf24',
 nodes: [
  { id: 'os-layer', label: 'Operating System', type: 'sensor', x: 60, y: 140, info: 'System layer providing CPU, memory, disk, network, and other hardware-level performance metrics.' },
  { id: 'oshi-lib', label: 'OSHI Sensor Engine', type: 'process', x: 210, y: 140, info: 'Java system-information library used to read operating system and hardware metrics with low overhead.' },
  { id: 'spring-mon', label: 'Spring Boot Monitoring Service', type: 'backend', x: 370, y: 140, info: 'Collects system metrics periodically and exposes monitoring APIs and real-time communication endpoints.' },
  { id: 'metric-proc', label: 'Metric Processing', type: 'process', x: 530, y: 140, info: 'Processes raw system metrics, calculates utilization and changes over time, detects threshold-based conditions, and prepares structured data for the dashboard.' },
  { id: 'websocket-chan', label: 'WebSocket / STOMP Channel', type: 'stream', x: 690, y: 140, info: 'Provides real-time push communication for streaming processed system metrics and monitoring events to connected clients.' },
  { id: 'react-viz', label: 'React Monitoring Dashboard', type: 'frontend', x: 840, y: 140, info: 'Displays live system metrics through interactive charts, status indicators, and real-time monitoring visualizations.' },
],
edges: [
  { from: 'os-layer', to: 'oshi-lib', label: 'System Metrics' },
  { from: 'oshi-lib', to: 'spring-mon', label: 'Metric Data' },
  { from: 'spring-mon', to: 'metric-proc', label: 'Raw Metrics' },
  { from: 'metric-proc', to: 'websocket-chan', label: 'Processed Metrics' },
  { from: 'websocket-chan', to: 'react-viz', label: 'Live Updates' },
]
};

const MEDICARE_FLOW = {
  id: 'medicare-flow',
  title: 'MedicarePlus Enterprise Portal Workflow',
  themeColor: '#38bdf8',
  nodes: [
  { id: 'patient-doc', label: 'Patient / Doctor', type: 'user', x: 60, y: 140, info: 'End users accessing the healthcare portal for appointment booking, scheduling, and account management.' },
  { id: 'react-app', label: 'React Frontend', type: 'frontend', x: 190, y: 140, info: 'Client application providing authentication forms, appointment scheduling, calendar views, dashboards, and notifications.' },
  { id: 'spring-rest', label: 'Spring Boot REST API', type: 'gateway', x: 330, y: 140, info: 'Backend entry point handling authentication, appointment requests, scheduling operations, and portal APIs.' },
  { id: 'jwt-security', label: 'JWT Security Filter', type: 'process', x: 460, y: 140, info: 'Authenticates requests by validating JWT bearer tokens and enforcing role-based access for patients and doctors.' },
  { id: 'biz-logic', label: 'Appointment Service', type: 'backend', x: 590, y: 140, info: 'Handles appointment booking, slot availability, conflict validation, doctor schedules, and appointment management.' },
  { id: 'mysql-db', label: 'MySQL Database', type: 'db', x: 720, y: 60, info: 'Persists users, doctors, patients, appointments, schedules, and other application data.' },
  { id: 'redis-cache', label: 'Redis Cache', type: 'cache', x: 720, y: 220, info: 'Provides fast access to frequently requested data such as doctor availability, schedules, and temporary application state.' },
  { id: 'ws-notify', label: 'WebSocket Notifications', type: 'stream', x: 850, y: 140, info: 'Provides real-time appointment and status notifications to connected patient and doctor dashboards.' },
],

edges: [
  { from: 'patient-doc', to: 'react-app', label: 'User Action' },
  { from: 'react-app', to: 'spring-rest', label: 'HTTPS Request' },
  { from: 'spring-rest', to: 'jwt-security', label: 'Authenticate' },
  { from: 'jwt-security', to: 'biz-logic', label: 'Authorized Request' },
  { from: 'biz-logic', to: 'mysql-db', label: 'Persist Data' },
  { from: 'biz-logic', to: 'redis-cache', label: 'Cache / Lookup' },
  { from: 'redis-cache', to: 'ws-notify', label: 'Cache Event Stream' },
  { from: 'biz-logic', to: 'ws-notify', label: 'Publish Event' },
  { from: 'ws-notify', to: 'react-app', label: 'Real-Time Update' },
]
};

const WHATSAPP_ANALYZER_FLOW = {
  id: 'whatsapp-analyzer-flow',
  title: 'WhatsApp Chat Analysis Pipeline',
  themeColor: '#06b6d4',
  nodes: [
    { id: 'user', label: 'User', type: 'input', x: 60, y: 140, info: 'Uploads an exported WhatsApp chat in .txt format through the Streamlit interface.' },
    { id: 'streamlit', label: 'Streamlit UI', type: 'frontend', x: 190, y: 140, info: 'Provides the interactive interface for uploading chat data, selecting users, and exploring analysis results.' },
    { id: 'preprocess', label: 'Chat Preprocessing', type: 'process', x: 330, y: 140, info: 'Parses raw WhatsApp chat text using regular expressions and converts messages into structured records such as date, time, sender, and message content.' },
    { id: 'dataframe', label: 'Pandas DataFrame', type: 'data', x: 470, y: 140, info: 'Stores the cleaned and structured chat data for efficient filtering, aggregation, and statistical analysis.' },
    { id: 'stats', label: 'Chat Statistics', type: 'analytics', x: 610, y: 55, info: 'Calculates total messages, words, media messages, links, user contributions, and overall chat activity.' },
    { id: 'timeline', label: 'Activity Timeline', type: 'analytics', x: 610, y: 140, info: 'Analyzes message activity across daily, weekly, monthly, yearly, and hourly time periods.' },
    { id: 'text-analysis', label: 'Text & Emoji Analysis', type: 'analytics', x: 610, y: 225, info: 'Extracts frequent words, filtered words, emojis, and generates word-cloud based text insights.' },
    { id: 'visualization', label: 'Data Visualization', type: 'process', x: 770, y: 140, info: 'Transforms analytical results into interactive charts, bar graphs, line charts, pie charts, heatmaps, and word clouds.' },
    { id: 'dashboard', label: 'Analytics Dashboard', type: 'output', x: 910, y: 140, info: 'Displays interactive WhatsApp chat insights including user activity, timelines, heatmaps, common words, emojis, and message statistics.' },
  ],
  edges: [
    { from: 'user', to: 'streamlit', label: 'Upload .txt' },
    { from: 'streamlit', to: 'preprocess', label: 'Raw Chat' },
    { from: 'preprocess', to: 'dataframe', label: 'Structured Data' },
    { from: 'dataframe', to: 'stats', label: 'Aggregate Data' },
    { from: 'dataframe', to: 'timeline', label: 'Time Data' },
    { from: 'dataframe', to: 'text-analysis', label: 'Message Text' },
    { from: 'stats', to: 'visualization', label: 'Statistics' },
    { from: 'timeline', to: 'visualization', label: 'Activity Metrics' },
    { from: 'text-analysis', to: 'visualization', label: 'Text Insights' },
    { from: 'visualization', to: 'dashboard', label: 'Charts & Insights' },
  ],
};

const OLYMPIC_ANALYSIS_FLOW = {
  id: 'olympic-analysis-flow',
  title: 'Olympic Data Analysis Pipeline',
  themeColor: '#06b6d4',
  nodes: [
    { id: 'data-source', label: 'Olympic Dataset', type: 'input', x: 60, y: 140, info: 'Historical Olympic datasets containing athlete records, events, countries, years, sports, medals, and participation details.' },
    { id: 'streamlit', label: 'Streamlit UI', type: 'frontend', x: 190, y: 140, info: 'Interactive application interface allowing users to explore Olympic statistics, select countries, and analyze historical performance.' },
    { id: 'data-loader', label: 'Data Loading', type: 'process', x: 330, y: 140, info: 'Loads Olympic CSV datasets into Python using Pandas and prepares the data for analysis.' },
    { id: 'data-cleaning', label: 'Data Cleaning', type: 'process', x: 470, y: 140, info: 'Cleans missing values, removes inconsistencies, standardizes columns, and prepares reliable datasets for analysis.' },
    { id: 'pandas-data', label: 'Pandas DataFrame', type: 'data', x: 610, y: 140, info: 'Stores transformed Olympic data and enables filtering, grouping, aggregation, and statistical operations.' },
    { id: 'medal-analysis', label: 'Medal Analysis', type: 'analytics', x: 750, y: 55, info: 'Analyzes medal counts by country, year, sport, gender, and medal type to identify Olympic performance trends.' },
    { id: 'athlete-analysis', label: 'Athlete & Sport Analysis', type: 'analytics', x: 750, y: 140, info: 'Examines athlete participation, gender distribution, sports participation, and historical athlete performance.' },
    { id: 'trend-analysis', label: 'Historical Trends', type: 'analytics', x: 750, y: 225, info: 'Analyzes changes in participation, medals, countries, sports, and Olympic performance across different editions.' },
    { id: 'visualization', label: 'Data Visualization', type: 'process', x: 890, y: 140, info: 'Converts analytical results into charts, graphs, heatmaps, and other visual representations for easier interpretation.' },
    { id: 'dashboard', label: 'Olympic Analytics Dashboard', type: 'output', x: 1030, y: 140, info: 'Presents interactive Olympic insights, medal statistics, athlete trends, country comparisons, and historical visualizations.' },
  ],
  edges: [
    { from: 'data-source', to: 'data-loader', label: 'CSV Dataset' },
    { from: 'streamlit', to: 'data-loader', label: 'Analysis Request' },
    { from: 'data-loader', to: 'data-cleaning', label: 'Raw Data' },
    { from: 'data-cleaning', to: 'pandas-data', label: 'Clean Data' },
    { from: 'pandas-data', to: 'medal-analysis', label: 'Medal Data' },
    { from: 'pandas-data', to: 'athlete-analysis', label: 'Athlete Data' },
    { from: 'pandas-data', to: 'trend-analysis', label: 'Historical Data' },
    { from: 'medal-analysis', to: 'visualization', label: 'Medal Insights' },
    { from: 'athlete-analysis', to: 'visualization', label: 'Athlete Insights' },
    { from: 'trend-analysis', to: 'visualization', label: 'Trend Insights' },
    { from: 'visualization', to: 'dashboard', label: 'Charts & Insights' },
  ],
};

const AI_PROJECTS = [
  {
    id: 'aletheia',
    number: 'AI-01',
    category: 'AI / LLM Agents',
    title: 'Aletheia',
    subtitle: 'MCP-based AI Assistant System',
    tags: ['Python', 'FastAPI', 'LangChain', 'LangGraph', 'Ollama', 'MCP Protocol'],
    summary: 'An autonomous AI agent framework leveraging Model Context Protocol (MCP) for tool calling, external API execution, and dynamic context reasoning.',
    built: 'The system receives a user request through FastAPI and passes it to a LangGraph-based agent. The agent uses the LLM to determine whether the request can be answered directly or requires external tools or contextual knowledge. When a tool is required, the agent invokes the appropriate MCP tool and receives the result.',
    learned: 'Engineered clean decision branching inside agentic state graphs, precise schema definitions for MCP tool dispatches, and hybrid vector context synthesis.',
    flowDiagram: ALETHEIA_FLOW,
    github: 'https://github.com/sohamkadam01/Aletheia',
    relatedCredentials: ['Google 5-Day AI Agents Course', 'Agentic AI Foundations Associate'],
  },
  {
    id: 'ai-finance',
    number: 'AI-02',
    category: 'AI / Intelligent OCR',
    title: 'AI Finance Management',
    subtitle: 'Intelligent Receipt & Expense Analytics',
    tags: ['Python', 'FastAPI', 'OCR', 'Spring Boot', 'PostgreSQL', 'React'],
    summary: 'Data processing pipeline that ingests financial receipts via OCR, extracts transactional entities, classifies expense categories, and provides user insight visualizers.',
    built: 'The application accepts financial transactions or receipt images through the React frontend. Spring Boot handles the API layer and sends receipt-processing tasks to the OCR service when required. Extracted financial information is categorized and persisted in PostgreSQL.',
    learned: 'Gained expertise in multi-service asynchronous queue synchronization between Spring Boot and Python OCR workers.',
    flowDiagram: AI_FINANCE_FLOW,
    github: 'https://github.com/sohamkadam01/AI-Driven-Finance-Plathform',
    relatedCredentials: ['Full-Stack Microservices Architecture'],
  }
];

const JAVA_PROJECTS = [
  {
    id: 'system-monitor',
    number: 'JV-01',
    category: 'Java / High-Frequency Telemetry',
    title: 'Real-Time System Monitor',
    subtitle: 'Telemetry Streaming & System Metrics Dashboard',
    tags: ['Java', 'Spring Boot', 'OSHI', 'WebSocket', 'React', 'Tailwind'],
    summary: 'Low-overhead real-time telemetry collector streaming system CPU, memory, process metrics, and network state directly to a React frontend via WebSockets.',
    built: 'OSHI collects system-level CPU, memory, disk, and network metrics. Spring Boot processes and aggregates the telemetry and exposes it through a WebSocket connection. The React frontend receives the live stream and updates the monitoring dashboard.',
    learned: 'Focused on low-latency non-blocking system sampling, backpressure management over WebSocket channels, and continuous 60fps canvas UI re-rendering.',
    flowDiagram: TELEMETRY_FLOW,
    github: 'https://github.com/sohamkadam01/Real-time-system-monitoring-with-AI-prediction',
    relatedCredentials: ['Spring Boot Backend Engineering'],
  },
  {
    id: 'medicare-plus',
    number: 'JV-02',
    category: 'Java / Full-Stack Enterprise',
    title: 'MedicarePlus',
    subtitle: 'Full-Stack Healthcare Appointment & Patient Portal',
    tags: ['Java', 'Spring Boot', 'React', 'MySQL', 'Redis', 'JWT Security', 'WebSocket'],
    summary: 'Comprehensive healthcare portal managing doctor schedules, appointment booking, patient histories, and real-time appointment alerts.',
    built: 'Users interact with the React application to authenticate and manage appointments. Spring Boot handles business logic and REST APIs, while Spring Security/JWT manages authentication and authorization.',
    learned: 'Implemented dual database caching layers with Redis and MySQL, JWT RBAC security chains, and transactional event notifications via WebSockets.',
    flowDiagram: MEDICARE_FLOW,
    github: 'https://github.com/sohamkadam01/MediCarePlus-Doctor-Appointment-System',
    relatedCredentials: ['Java & Microservices Specialist'],
  }
];

const ANALYSIS_PROJECTS = [
  {
    id: 'whatsapp-chat-analyzer',
    number: 'DA-01',
    category: 'Python / Data Analytics',
    title: 'WhatsApp Chat Analyzer',
    subtitle: 'Conversation Insights & Interactive Visualizations',
    tags: ['Python', 'Streamlit', 'Pandas', 'Matplotlib', 'NLP'],
    summary: 'Transforms exported WhatsApp conversations into meaningful insights and interactive visualizations.',
    built: 'Upload a WhatsApp chat export (.txt) to explore message statistics, user activity, timelines, emoji usage, word clouds, and more.',
    flowDiagram: WHATSAPP_ANALYZER_FLOW,
    github: 'https://github.com/sohamkadam01/Whatsapp-Chat-Analysis',
  },
  {
    id: 'olympic-data-analysis',
    number: 'DA-02',
    category: 'Python / Data Analytics',
    title: 'Olympic Data Analysis',
    subtitle: 'Historical Olympic Games Analytics Dashboard',
    tags: ['Python', 'Streamlit', 'Pandas', 'Matplotlib'],
    summary: 'Interactive dashboard for exploring and visualizing historical Olympic Games data.',
    built: 'Analyze medal distributions, athlete performances, country-wise achievements, and Olympic trends through interactive charts and filters.',
    flowDiagram: OLYMPIC_ANALYSIS_FLOW,
    github: 'https://github.com/sohamkadam01/Olympic-data-analysis',
  },
];

const ALL_PROJECTS = [...AI_PROJECTS, ...JAVA_PROJECTS, ...ANALYSIS_PROJECTS];

const PROOF_HIGHLIGHTS = [
  {
    type: 'CERTIFICATION',
    number: '01',
    title: 'Agentic AI Foundations Associate',
    issuer: 'Agentic AI Institute',
    year: '2026',
    detail: 'Demonstrates verified grounding in autonomous multi-agent graph workflows, MCP protocol tooling, and decision loop mechanics.',
    badge: 'VERIFIED CREDENTIAL',
  },
  {
    type: 'OPEN SOURCE',
    number: '02',
    title: 'GirlScript Summer of Code (GSSoC)',
    issuer: 'GirlScript Foundation',
    year: '2026',
    detail: 'Accepted participant contributing production bug fixes, documentation, and feature code to open-source developer tool repositories.',
    badge: 'ACCEPTED CONTRIBUTOR',
  },
  {
    type: 'ACHIEVEMENT',
    number: '03',
    title: '290+ DSA Problems Solved',
    issuer: 'LeetCode / GeeksforGeeks',
    year: '2026',
    detail: 'Consistent algorithm problem-solving focused on data structures, time complexity optimization, and dynamic programming.',
    badge: 'VERIFIED MILESTONE',
  },

  {
    type: 'HACKATHON',
    number: '04',
    title: 'Agentic System & MCP Challenge',
    issuer: 'Community AI Hackathon',
    year: '2026',
    detail: 'Designed and submitted Aletheia: an MCP tool calling agent architecture capable of structured tool execution.',
    badge: 'PARTICIPATED & SUBMITTED',
  }
];

const CERTIFICATIONS_DATA = [
  {
    id: 'cert-java',
    title: 'Java Certification',
    issuer: 'Programming Certification',
    year: '2026',
    verifyUrl: 'https://drive.google.com/file/d/1pqDsjvpGHcbmc83yFgVAvNGPMPIZhl4a/view?usp=sharing',
    category: 'CERTIFICATIONS',
    whyItMatters: 'Validates my foundation in Java programming and object-oriented software development.',
    skills: ['Java', 'OOP', 'Data Structures', 'Core Java'],
  },
  {
    id: 'cert-python',
    title: 'Python Certification',
    issuer: 'Programming Certification',
    year: '2026',
    verifyUrl: 'https://drive.google.com/file/d/1ZayaoM0POMNOb4DQfGWMmQZYkuzsMmZP/view?usp=sharing',
    category: 'CERTIFICATIONS',
    whyItMatters: 'Validates my Python programming foundation for automation, data work, and AI-focused development.',
    skills: ['Python', 'Problem Solving', 'Automation', 'Data Handling'],
  },
  {
    id: 'cert-agentic-ai',
    title: 'Agentic AI Certified Foundations Associate',
    issuer: 'Oracle',
    year: '2026',
    verifyUrl: 'https://drive.google.com/file/d/1rOo1uzl3t4MUOFNggX_etHzN5y_1TRoa/view?usp=sharing',
    category: 'CERTIFICATIONS',
    whyItMatters: 'Strengthened my practical and structural foundation for agentic decision state loops, structured Pydantic tool schemas, and local LLM orchestration.',
    skills: ['LangGraph', 'Agentic Patterns', 'MCP Protocol', 'LLM Tool Calling'],
    relatedProjectId: 'aletheia',
  },
  {
    id: 'cert-oci-ai-foundations',
    title: 'Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate',
    issuer: 'Oracle Cloud Infrastructure',
    year: '2025',
    verifyUrl: 'https://drive.google.com/file/d/1r0Y8X1v4Qs-_t935suLwdIoWyzwM6SHs/view?usp=sharing',
    category: 'CERTIFICATIONS',
    whyItMatters: 'Demonstrates foundational knowledge of AI use cases, OCI services, and infrastructure considerations for deploying intelligence solutions.',
    skills: ['OCI', 'AI Foundations', 'Cloud Architecture', 'Model Deployment'],
  },
  {
    id: 'cert-google-ai',
    title: 'Google 5-Day AI Agents Course',
    issuer: 'Kaggle',
    year: '2026',
    verifyUrl: 'https://github.com/sohamkadam',
    category: 'CERTIFICATIONS',
    whyItMatters: 'Gained hands-on experience with Google agent design principles, tool grounding, multi-modal context routing, and evaluation benchmarks.',
    skills: ['AI Agents', 'Context Engineering', 'Prompt Evaluation', 'Tool Grounding'],
    relatedProjectId: 'aletheia',
  },
  {
    id: 'cert-claude-code',
    title: 'Claude Code Certification',
    issuer: 'Anthropic / Claude',
    year: '2026',
    verifyUrl: 'https://drive.google.com/file/d/10-y5xTbRLhk5Wtpx-uj8r6mehrRg9oo-/view?usp=sharing',
    category: 'CERTIFICATIONS',
    whyItMatters: 'Validated practical experience with Claude model workflows, prompt engineering, and safe code generation strategies.',
    skills: ['Claude', 'LLM Prompting', 'AI Safety', 'Code Generation'],
  },
  {
    id: 'cert-intro-llms',
    title: 'Introduction to LLMs',
    issuer: 'IBM SkilsBuild',
    year: '2026',
    verifyUrl: 'https://drive.google.com/file/d/1LeDsfr6_Pgra_I4833otH-hnPmsfvjNJ/view?usp=sharing',
    category: 'CERTIFICATIONS',
    whyItMatters: 'Built a strong foundational understanding of large language model architectures, inference patterns, and practical applications.',
    skills: ['LLM Architecture', 'Inference', 'Prompt Engineering', 'Model Evaluation'],
  },
  {
    id: 'cert-ai-management-system',
    title: 'Artificial Intelligence Management System',
    issuer: 'Executive AI Leadership',
    year: '2026',
    verifyUrl: 'https://drive.google.com/file/d/1Y5b9aQEDVT706X-lT8rgGlA1GSErBThw/view?usp=sharing',
    category: 'CERTIFICATIONS',
    whyItMatters: 'Demonstrated capability to manage AI initiatives, governance, and system-level strategy across technical and business domains.',
    skills: ['AI Strategy', 'Governance', 'Project Management', 'System Design'],
  },
  {
    id: 'cert-sql-postgresql',
    title: 'SQL & PostgreSQL Certification',
    issuer: 'Data Platform Certification',
    year: '2026',
    verifyUrl: 'https://drive.google.com/file/d/1I9qg5AcWfDmxObYpjSlBNIBKb3j5qADp/view?usp=sharing',
    category: 'CERTIFICATIONS',
    whyItMatters: 'Confirmed proficiency in relational database design, query optimization, and PostgreSQL-specific administration techniques.',
    skills: ['SQL', 'PostgreSQL', 'Query Optimization', 'Database Design'],
  }
];

const ACHIEVEMENTS_DATA = [
  {
    id: 'ach-dsa-290',
    year: '2026',
    title: '290+ DSA Problems Solved',
    organization: 'LeetCode & GeeksforGeeks',
    category: 'ACHIEVEMENTS',
    whatHappened: 'Maintained continuous practice across array manipulation, graphs, dynamic programming, trees, and system-level algorithm constraints.',
    whyItMatters: 'Builds sharp intuition for low-overhead memory allocations, time complexity bounds, and data structures used in high-frequency backend services.',
    status: 'Verified Milestone',
    relatedSkills: ['Data Structures', 'Algorithms', 'Java', 'Complexity Analysis']
  },
  {
    id: 'ach-thynk-tech',
    year: '2025 - 2026',
    title: 'Associate Software Engineer Trainee',
    organization: 'Thynk Tech India',
    category: 'ACHIEVEMENTS',
    whatHappened: 'Worked on real-world software tasks, backend REST API integration, component maintenance, and team code reviews.',
    whyItMatters: 'Provided practical exposure to enterprise codebase organization, production Git workflows, and collaborative feature implementation.',
    status: 'Verified Experience',
    relatedSkills: ['Spring Boot', 'REST APIs', 'Codebase Maintenance', 'Git']
  }
];

const HACKATHONS_DATA = [
  {
    id: 'hack-xprize-gemini',
    title: 'XPRIZE – Build With Gemini',
    organization: 'XPRIZE',
    year: '2026',
    projectName: 'Gemini Submission Ideas',
    problem: 'Explored how large language models can unlock innovative, high-impact product ideas for the Build With Gemini challenge.',
    solution: 'Contributed submission concepts and research focused on responsible generative AI applications for global problem solving.',
    stack: ['AI Strategy', 'Generative Models', 'Innovation', 'Product Ideation'],
    role: 'Submission Ideator',
    result: 'PARTICIPATED',
    category: 'HACKATHONS',
    whyItMatters: 'Highlights experience translating Gemini capabilities into concrete challenge entries with practical and ethical value.'
  },

  {
    id: 'hack-openai-codex',
    title: 'OpenAI Codex Hackathon',
    organization: 'OpenAI / NamasteDev',
    year: '2026',
    projectName: 'Codex Challenge Participation',
    problem: 'Competed in a global hackathon focused on AI-assisted code generation and developer tooling.',
    solution: 'Delivered a productive Codex-based submission and ranked within the top 30% among 2,989 participants.',
    stack: ['OpenAI Codex', 'JavaScript', 'Hackathon Collaboration', 'Rapid Prototyping'],
    role: 'Participant',
    result: 'TOP 30% / PARTICIPATED',
    category: 'HACKATHONS',
    whyItMatters: 'Showcases competitive engineering skill and practical experience with large language model coding challenges.',
    link: {
      label: 'Codex Challenge Certificate',
      url: 'https://drive.google.com/file/d/1DR4LU4MEHNsubwoxeOo7ZrfPmuQyYB2w/view?usp=sharing'
    }
  },
  {
    id: 'hack-signoz-blog',
    title: 'Signoz Blogwriting',
    organization: 'SigNoz',
    year: '2026',
    projectName: 'Breaking My FastAPI App on Purpose',
    problem: 'Investigated real production-like FastAPI bugs using observability data from SigNoz.',
    solution: 'Authored a technical blog post documenting five real bugs and how SigNoz helped investigate and resolve them.',
    stack: ['FastAPI', 'Observability', 'SigNoz', 'Debugging'],
    role: 'Technical Writer',
    result: 'PUBLISHED',
    category: 'HACKATHONS',
    whyItMatters: 'Demonstrates the ability to turn debugging experience into educational content for development teams.',
    link: {
      label: 'Read on Medium',
      url: 'https://medium.com/@sohamsk0015/breaking-my-fastapi-app-on-purpose-how-signoz-helped-me-investigate-five-real-bugs-f673aea21af5'
    }
  }
];

const OPEN_SOURCE_DATA = [
  {
    id: 'os-gssoc',
    title: 'GirlScript Summer of Code (GSSoC)',
    organization: 'GirlScript Foundation',
    year: '2026',
    role: 'Open Source Contributor',
    status: 'ACCEPTED PARTICIPANT',
    category: 'OPEN_SOURCE',
    details: 'Participating in open-source projects by fixing frontend bugs, improving backend API documentation, and submitting code contributions.',
    whyItMatters: 'Engages directly with community maintainers, adhering to repository coding standards, issue tracking, and peer code reviews.',
    links: [
      // { label: 'Program Acceptance', url: GITHUB_URL },
      { label: 'GSSoC Certificate', url: 'https://drive.google.com/file/d/1CF_BhNRv4kaIQd4mDwoZLsLTsvhrNxBj/view?usp=sharing' }
    ],
    relatedSkills: ['Git', 'GitHub', 'Code Review', 'Open Source']
  }
];

const JOURNEY_MILESTONES = [
  { year: '2023', label: 'FULL-STACK DEVELOPMENT', note: 'Learned core web concepts, DOM, React & relational database fundamentals.' },
  { year: '2025', label: 'SPRING BOOT & MICROSERVICES', note: 'Deep-dived into Java, Spring Security JWT, REST services, and Redis caching.' },
  { year: '2026', label: 'AI AGENTS & MCP PROTOCOL', note: 'Mastered LangGraph decision loops, Model Context Protocol, and local LLM tooling.' },
  { year: '2026', label: 'OPEN SOURCE CONTRIBUTIONS', note: 'Accepted into GSSoC and actively contributing to developer tools.' }
];

const AnimatedFlowDiagram = ({ diagramData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const speed = 4000;
  const containerRef = useRef(null);
  const workflowViewportRef = useRef(null);
  const dragStateRef = useRef(null);

  const totalSteps = diagramData.nodes.length;
  const maxNodeX = Math.max(900, ...diagramData.nodes.map((node) => node.x));

  useEffect(() => {
    const targetEl = containerRef.current;
    if (!targetEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsPlaying(entry.isIntersecting);
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(targetEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frameId;
    const updateParallax = () => {
      const viewportCenter = window.innerHeight / 2;
      document.querySelectorAll('[data-scroll-parallax]').forEach((element) => {
        const rect = element.getBoundingClientRect();
        const strength = Number(element.dataset.scrollParallax) || 0;
        const distanceFromCenter = viewportCenter - (rect.top + rect.height / 2);
        const shift = Math.max(-42, Math.min(42, distanceFromCenter * strength));
        element.style.setProperty('--scroll-shift', `${shift}px`);
      });
      frameId = undefined;
    };
    const handleScroll = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateParallax);
    };
    updateParallax();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep((prev) => {
          const next = (prev + 1) % totalSteps;
          return next;
        });
      }, speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps, speed]);

  const handleNodeClick = (index) => {
    setActiveStep(index);
  };

  const handleDiagramPointerDown = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const viewport = workflowViewportRef.current;
    if (!viewport) return;
    dragStateRef.current = { pointerId: event.pointerId, startX: event.clientX, startScrollLeft: viewport.scrollLeft };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDiagramPointerMove = (event) => {
    const dragState = dragStateRef.current;
    const viewport = workflowViewportRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId || !viewport) return;
    viewport.scrollLeft = dragState.startScrollLeft - (event.clientX - dragState.startX);
  };

  const stopDiagramDrag = (event) => {
    if (dragStateRef.current?.pointerId === event.pointerId) dragStateRef.current = null;
  };

  const computeNodeLeft = (node, index) => {
    const baseLeft = (node.x / maxNodeX) * 90 + 4;
    const shiftLeft = (index - activeStep) * 10;
    return baseLeft + shiftLeft;
  };

  // Keep nodes within the center of the canvas so the connected explainer card
  // always has space above or below it.
  const computeNodeTop = (node) => (node.y / 280) * 55 + 22;

  const nodeMap = diagramData.nodes.reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {});

  const activeNode = diagramData.nodes[activeStep];
  const activeNodeLeft = activeNode ? computeNodeLeft(activeNode, activeStep) : 50;
  const activeNodeTop = activeNode ? computeNodeTop(activeNode) : 50;
  const calloutLeft = Math.max(14, Math.min(86, activeNodeLeft));
  const calloutAbove = activeNodeTop >= 51;
  const calloutTop = calloutAbove ? activeNodeTop - 12 : activeNodeTop + 12;

  useEffect(() => {
    const viewport = workflowViewportRef.current;
    if (!viewport || !activeNode) return;

    const nodeLeftPercent = computeNodeLeft(activeNode, activeStep);
    const nodeCenter = (nodeLeftPercent / 100) * viewport.scrollWidth;
    viewport.scrollTo({
      left: Math.max(0, nodeCenter - viewport.clientWidth / 2),
      behavior: 'smooth',
    });
  }, [activeNode, activeStep]);

  return (
    <div ref={containerRef} className="w-full bg-[#0a0c10] rounded-xl p-4 sm:p-6 font-mono relative overflow-hidden shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: diagramData.themeColor }}></span>
            {diagramData.title && (
              <span className="text-xs font-bold text-white uppercase tracking-wider">{diagramData.title}</span>
            )}
          </div>
          {diagramData.showStepStatus !== false && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              Step {activeStep + 1} of {totalSteps}: <span className="text-slate-200 font-semibold">{activeNode?.label}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/80 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-slate-200 transition hover:border-indigo-400/80 hover:text-white"
          >
            {isExpanded ? 'Collapse' : 'Expand'} Diagram
          </button>
        </div>
      </div>

      <div
        ref={workflowViewportRef}
        onPointerDown={handleDiagramPointerDown}
        onPointerMove={handleDiagramPointerMove}
        onPointerUp={stopDiagramDrag}
        onPointerCancel={stopDiagramDrag}
        className="workflow-scroll w-full cursor-grab overflow-x-auto overflow-y-hidden rounded-lg bg-slate-950/60 active:cursor-grabbing"
      >
        <div
          className="flow-diagram-canvas relative w-full bg-slate-950/60 select-none"
          style={{ minWidth: isExpanded ? '2200px' : '1600px', height: isExpanded ? '46rem' : '36rem' }}
        >
        <div className="flow-diagram-ambient pointer-events-none absolute inset-0" />
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <filter id={`${diagramData.id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {diagramData.edges.map((edge, idx) => {
            const source = nodeMap[edge.from];
            const target = nodeMap[edge.to];
            if (!source || !target) return null;

            const sourceIdx = diagramData.nodes.findIndex(n => n.id === edge.from);
            const targetIdx = diagramData.nodes.findIndex(n => n.id === edge.to);

            const sx = `${computeNodeLeft(source, sourceIdx)}%`;
            const sy = `${computeNodeTop(source)}%`;
            const tx = `${computeNodeLeft(target, targetIdx)}%`;
            const ty = `${computeNodeTop(target)}%`;

            const isEdgeActive = (sourceIdx === activeStep) || (targetIdx === activeStep);

            return (
              <g key={idx}>
                <line
                  x1={sx}
                  y1={sy}
                  x2={tx}
                  y2={ty}
                  stroke={isEdgeActive ? diagramData.themeColor : '#334155'}
                  strokeWidth={isEdgeActive ? 2.5 : 1.5}
                  strokeDasharray={isEdgeActive ? "6,6" : "none"}
                  className={isEdgeActive ? "animate-[dash_1s_linear_infinite]" : "opacity-35"}
                />

                {isEdgeActive && (
                  <circle
                    r="4"
                    fill="#60a5fa"
                    filter={`url(#${diagramData.id}-glow)`}
                  >
                    <animate
                      attributeName="cx"
                      from={sx}
                      to={tx}
                      dur={`${speed / 1000}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="cy"
                      from={sy}
                      to={ty}
                      dur={`${speed / 1000}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}
          {activeNode && (
            <line
              x1={`${activeNodeLeft}%`}
              y1={`${activeNodeTop}%`}
              x2={`${calloutLeft}%`}
              y2={`${calloutTop}%`}
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="4 4"
              filter={`url(#${diagramData.id}-glow)`}
              className="animate-[dash_1s_linear_infinite] opacity-90"
            />
          )}
        </svg>

        <div className="absolute inset-0 p-6">
          {diagramData.nodes.map((node, index) => {
            const isActive = index === activeStep;
            const isProcessed = index < activeStep;
            const isDecision = node.type.includes('decision');

            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(index)}
                style={{
                  left: `${computeNodeLeft(node, index)}%`,
                  top: `${computeNodeTop(node)}%`,
                }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10 min-w-[130px] max-w-[175px] p-3 rounded-lg border text-center ${
                  isActive
                    ? 'flow-active-node scale-110 bg-indigo-950/90 border-indigo-300 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/50'
                    : isProcessed
                    ? 'bg-slate-900/90 border-slate-700 text-slate-300 opacity-90'
                    : 'bg-slate-950/80 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                } ${isDecision ? 'ring-1 ring-amber-500/60 bg-amber-950/30' : ''}`}
              >
                {isActive && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                  </span>
                )}

                <div className="text-[9px] font-mono text-slate-400 mb-0.5 uppercase tracking-tight flex items-center justify-center gap-1">
                  <span>0{index + 1}</span>
                  {isActive && <span className="text-emerald-400 text-[8px]">ACTIVE</span>}
                </div>

                <div className="text-sm font-bold leading-tight font-sans whitespace-normal">
                  {node.label}
                </div>

                <div className="text-[10px] text-slate-400 mt-1 whitespace-normal">
                  {node.type}
                </div>
              </div>
            );
          })}
        </div>
        <div
          className={`absolute z-20 w-[18rem] max-w-[calc(100%-2rem)] -translate-x-1/2 transition-[left,top] duration-500 ease-out ${calloutAbove ? '-translate-y-full' : ''}`}
          style={{ left: `${calloutLeft}%`, top: `${calloutTop}%` }}
          aria-live="polite"
        >
          <div key={activeNode?.id} className="flow-explainer-glow animate-[hero-reveal_300ms_ease-out] rounded-xl border border-sky-400/50 bg-slate-950/95 px-4 py-3 shadow-2xl shadow-indigo-950/70 backdrop-blur-sm sm:px-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">Flow explainer</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">{activeNode?.type}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-white">{activeNode?.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              {activeNode?.info || 'This component participates in the current system workflow.'}
            </p>
          </div>
        </div>
        </div>
      </div>

    </div>
  );
};

export default function App() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [soundMuted, setSoundMuted] = useState(false);

  // PROOF OF WORK STATES
  const [activePowCategory, setActivePowCategory] = useState('ALL');
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [selectedProofDetail, setSelectedProofDetail] = useState(null);

  // TIMELINE ANIMATION STATE
  const [activeMilestone, setActiveMilestone] = useState(0);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const timelineRef = useRef(null);

  useEffect(() => {
    const revealItems = document.querySelectorAll('.scroll-reveal');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12 }
    );
    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const playClickSound = () => audioFX.playNodeClick();
    document.addEventListener('click', playClickSound, true);
    return () => document.removeEventListener('click', playClickSound, true);
  }, []);

  const toggleSound = () => {
    audioFX.muted = !soundMuted;
    setSoundMuted(!soundMuted);
    if (soundMuted) audioFX.playNodeClick(800);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        setCmdOpen(prev => !prev);
        audioFX.playNodeClick(600);
      }
      if (e.key === 'Escape') {
        setCmdOpen(false);
        setSelectedProject(null);
        setSelectedCredential(null);
        setSelectedProofDetail(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-advance timeline when playing
  useEffect(() => {
    let timer;
    if (isTimelinePlaying) {
      timer = setInterval(() => {
        setActiveMilestone((prev) => {
          const next = (prev + 1) % JOURNEY_MILESTONES.length;
          return next;
        });
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isTimelinePlaying]);

  // Intersection Observer for timeline scroll-triggered animation
  useEffect(() => {
    const targetEl = timelineRef.current;
    if (!targetEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsTimelinePlaying(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(targetEl);
    return () => observer.disconnect();
  }, []);

  const commandResults = [
    { label: 'Proof of Work Archive', target: 'proof-of-work' },
    { label: 'Certifications', target: 'pow-certs' },
    { label: 'Achievements Timeline', target: 'pow-achievements' },
    { label: 'Hackathons & Competitions', target: 'pow-hackathons' },
    { label: 'Open Source Contributions', target: 'pow-open-source' },
    { label: 'AI Projects', target: 'ai-work' },
    { label: 'Java Projects', target: 'java-work' },
    { label: 'Data Analysis Projects', target: 'analysis-work' },
    { label: 'Aletheia - MCP AI Assistant', target: 'project-aletheia' },
    { label: 'Real-Time System Monitor', target: 'project-system-monitor' },
    { label: 'Technical Toolkit', target: 'stack' },
    { label: 'About & Principles', target: 'about' },
    { label: 'Contact', target: 'contact' },
  ].filter(item => item.label.toLowerCase().includes(cmdQuery.toLowerCase()));

  const scrollToSection = (id) => {
    setCmdOpen(false);
    audioFX.playNodeClick(450);
    if (id.startsWith('project-')) {
      const projId = id.replace('project-', '');
      const proj = ALL_PROJECTS.find(p => p.id === projId);
      if (proj) setSelectedProject(proj);
      const el = document.getElementById(proj?.category.includes('AI') ? 'ai-work' : 'java-work');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenProjectFromRelation = (projectId) => {
    const proj = ALL_PROJECTS.find(p => p.id === projectId);
    if (proj) {
      setSelectedCredential(null);
      setSelectedProofDetail(null);
      setSelectedProject(proj);
      audioFX.playNodeClick(600);
    }
  };

  const handleTimelineClick = (index) => {
    setActiveMilestone(index);
    setIsTimelinePlaying(false);
  };

  const toggleTimelinePlay = () => {
    setIsTimelinePlaying(!isTimelinePlaying);
  };

  return (
      <div className="min-h-screen bg-[#0b0c10] text-[#e2e8f0] font-sans selection:bg-indigo-600 selection:text-white antialiased">

      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-40 w-full border-b border-indigo-950/70 bg-[#0b0c10]/90 shadow-lg shadow-black/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[4.5rem] flex items-center justify-end gap-6">
          <nav className="flex items-center gap-2 sm:gap-5 text-[11px] sm:text-xs font-mono font-medium text-slate-400">
            <a href="#proof-of-work" onClick={() => audioFX.playHover()} className="rounded-md px-2 py-1.5 text-indigo-300 hover:bg-indigo-950/60 hover:text-indigo-200 transition-colors font-semibold">Proof of Work</a>
            <a href="#ai-work" onClick={() => audioFX.playHover()} className="hidden sm:inline rounded-md px-2 py-1.5 hover:bg-slate-900 hover:text-indigo-300 transition-colors">AI Projects</a>
            <a href="#java-work" onClick={() => audioFX.playHover()} className="hidden md:inline rounded-md px-2 py-1.5 hover:bg-slate-900 hover:text-amber-300 transition-colors">Java Projects</a>
            <a href="#stack" onClick={() => audioFX.playHover()} className="hidden lg:inline rounded-md px-2 py-1.5 hover:bg-slate-900 hover:text-white transition-colors">Toolkit</a>
            <a href="#about" onClick={() => audioFX.playHover()} className="rounded-md px-2 py-1.5 hover:bg-slate-900 hover:text-white transition-colors">About</a>
            <a href="#contact" onClick={() => audioFX.playHover()} className="rounded-md border border-indigo-800/70 bg-indigo-950/50 px-3 py-1.5 text-indigo-200 hover:bg-indigo-900/70 transition-colors">Contact</a>
          </nav>
        </div>
      </header>
      
      {/* HERO SECTION */}
      <section className="hero-section max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          
          <div data-scroll-parallax="0.09" className="hero-copy lg:col-span-4 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs md:text-sm font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Computer Science Engineer · Systems &amp; AI
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              SOHAM KADAM
            </h1>

            <p className="text-lg md:text-xl font-medium text-slate-300 leading-relaxed max-w-2xl">
              Building intelligent applications and scalable backend systems with <span className="text-amber-300 font-semibold">Java, Spring Boot</span>, <span className="text-indigo-300 font-semibold">Python</span>, React and modern AI technologies.
            </p>

            <p className="text-sm md:text-base font-mono text-slate-300 border-l-2 border-indigo-500/80 pl-4 py-2">
              AI Agents | MCP Protocol | Decision Workflows | Microservices
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <a 
                href="#proof-of-work" 
                onClick={() => audioFX.playNodeClick(550)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
              >
                <span>Proof of Work</span>
                <span className="text-[10px] opacity-75 font-mono">’</span>
              </a>
              <a 
                href="#ai-work" 
                onClick={() => audioFX.playNodeClick(500)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700/80 font-medium text-xs transition-all"
              >
                AI Projects
              </a>
              <a 
                href="#java-work" 
                onClick={() => audioFX.playNodeClick(450)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/80 font-medium text-xs transition-all"
              >
                Java Projects
              </a>
              <a
                href="#analysis-work"
                onClick={() => audioFX.playNodeClick(400)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700/80 font-medium text-xs transition-all"
              >
                Analysis Projects
              </a>
            </div>
          </div>

          <div data-scroll-parallax="-0.045" className="hero-diagram lg:col-span-8 w-full mt-8 lg:mt-0">
            <AnimatedFlowDiagram diagramData={HERO_SYSTEM_FLOW} interactive={true} />
          </div>

        </div>
      </section>

      {/* PROOF OF WORK SECTION */}
      <section id="proof-of-work" className="scroll-reveal max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/80">
        
        {/* EDITORIAL INTRO HEADING */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-7">
            <span className="text-xs font-mono text-indigo-400 tracking-widest uppercase font-semibold block mb-3">
              VERIFIED ARCHIVE &amp; CREDENTIALS
            </span>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9] font-sans">
              PROOF<br />
              OF<br />
              <span className="work-water">
                WORK.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-5 space-y-4 lg:pb-2 border-l border-slate-800 pl-6">
            <p className="milestone-message text-xl md:text-2xl font-semibold leading-relaxed tracking-tight">
              <MirrorShineText>"Projects show what I build."</MirrorShineText><br />
              <MirrorShineText>"These milestones show how I've grown."</MirrorShineText>
            </p>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Credentials, milestones, competitions, and contributions that document my journey as an engineer beyond code repositories.
            </p>
          </div>
        </div>



        {/* CERTIFICATIONS */}
        {(activePowCategory === 'ALL' || activePowCategory === 'CERTIFICATIONS') && (
          <div id="pow-certs" className="mb-16">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]"></span>
              <h3 className="text-2xl font-bold text-white tracking-tight">CERTIFICATIONS</h3>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full bg-amber-950/70 border border-amber-800/80 text-amber-200">Verified Credentials</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CERTIFICATIONS_DATA.map((cert) => (
                <div 
                  key={cert.id}
                  className="group overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800 hover:border-amber-400/70 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-950/40 transition-all duration-300 space-y-5 relative flex flex-col justify-between"
                >
                  <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-400/20 transition-colors"></div>
                  <div className="relative space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-950/90 border border-amber-700 text-amber-200 font-bold">
                        <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> Verified
                      </span>
                      <span className="text-xs font-mono px-2 py-1 rounded-md bg-slate-950/70 border border-slate-800 text-slate-300">{cert.year}</span>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-white leading-snug group-hover:text-amber-100 transition-colors">{cert.title}</h4>
                      <p className="text-xs font-mono text-amber-300 mt-1">Issued by {cert.issuer}</p>
                    </div>


                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      <strong className="text-amber-300 block mb-1.5 font-mono text-[10px] uppercase tracking-wider">Why it matters</strong>
                      {cert.whyItMatters}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cert.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700 text-slate-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="relative pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setSelectedCredential(cert);
                        audioFX.playNodeClick(700);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 border border-amber-400/50 text-white text-xs font-mono font-medium transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-950/50"
                    >
                      <FileTextIcon className="w-3.5 h-3.5" /> Inspect Credential Document
                    </button>

                    {cert.relatedProjectId && (
                      <button
                        onClick={() => handleOpenProjectFromRelation(cert.relatedProjectId)}
                        className="text-xs font-mono text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <span>Related Project</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS */}
  

        {/* HACKATHONS */}
        {(activePowCategory === 'ALL' || activePowCategory === 'HACKATHONS') && (
          <div id="pow-hackathons" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <h3 className="text-xl font-bold text-white tracking-tight">HACKATHONS &amp; COMPETITIONS</h3>
              <span className="text-xs font-mono text-slate-500">Case Study &amp; Challenge Submissions</span>
            </div>

            <div className="space-y-6">
              {HACKATHONS_DATA.map((hack) => (
                <div 
                  key={hack.id}
                  className="p-6 md:p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 transition-all grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                >
                  <div className="lg:col-span-8 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        {hack.result}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{hack.year} · {hack.organization}</span>
                    </div>

                    <h4 className="text-2xl font-bold text-white">{hack.projectName}</h4>
                    <p className="text-xs font-mono text-emerald-400">{hack.title}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 pt-2">
                      <div className="p-3 rounded bg-slate-950/60 border border-slate-800">

                        <strong className="text-slate-400 block font-mono text-[10px] uppercase mb-1">THE PROBLEM</strong>
                        {hack.problem}
                      </div>
                      <div className="p-3 rounded bg-slate-950/60 border border-slate-800">
                        <strong className="text-emerald-300 block font-mono text-[10px] uppercase mb-1">THE SOLUTION</strong>
                        {hack.solution}
                      </div>
                    </div>

                    <div className="p-3 rounded bg-slate-950/40 border border-slate-800 text-xs text-slate-300">
                      <strong className="text-indigo-300 block font-mono text-[10px] uppercase mb-1">WHY IT MATTERS</strong>
                      {hack.whyItMatters}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {hack.stack.map((st, stIdx) => (
                        <span key={stIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-4 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">ROLE</span>
                      <span className="text-xs font-mono font-bold text-slate-200">{hack.role}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">VERIFIED RESULT</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">{hack.result}</span>
                    </div>

                    {hack.link && (
                      <a
                        href={hack.link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-medium uppercase tracking-[0.08em] py-2 transition-all shadow-md border border-slate-700"
                      >
                        {hack.link.label} <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {hack.relatedProjectId && (
                      <button
                        onClick={() => handleOpenProjectFromRelation(hack.relatedProjectId)}
                        className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-medium transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        Inspect Main Project
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OPEN SOURCE */}
        {(activePowCategory === 'ALL' || activePowCategory === 'OPEN_SOURCE') && (
          <div id="pow-open-source" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <h3 className="text-xl font-bold text-white tracking-tight">OPEN SOURCE CONTRIBUTIONS</h3>
              <span className="text-xs font-mono text-slate-500">Verified Community Participation</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {OPEN_SOURCE_DATA.map((os) => (
                <div key={os.id} className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                      {os.status}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{os.year}</span>
                  </div>

                  <h4 className="text-lg font-bold text-white">{os.title}</h4>
                  <p className="text-xs font-mono text-slate-400">{os.organization} · {os.role}</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{os.details}</p>

                  <div className="p-3 rounded bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-cyan-300 block font-mono text-[10px] uppercase mb-1">WHY IT MATTERS</strong>
                    {os.whyItMatters}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {os.relatedSkills.map((sk, skIdx) => (
                        <span key={skIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {sk}
                        </span>
                      ))}
                    </div>

                    {os.links.map((link, lIdx) => (
                      <a 
                        key={lIdx} 
                        href={link.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                      >
                        {link.label} <ExternalLinkIcon />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* JOURNEY MILESTONES */}
        {(activePowCategory === 'ALL' || activePowCategory === 'ACHIEVEMENTS') && (
          <div id="pow-achievements" ref={timelineRef} className="journey-timeline mb-16">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.9)]"></span>
                <h3 className="text-2xl font-bold text-white tracking-tight">JOURNEY MILESTONES</h3>
              </div>
            </div>

            <div className="journey-timeline-grid grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {JOURNEY_MILESTONES.map((milestone, index) => {
                const isActive = index === activeMilestone;
                return (
                  <button
                    key={`${milestone.year}-${milestone.label}`}
                    type="button"
                    onClick={() => {
                      setActiveMilestone(index);
                    }}
                    className={`journey-milestone-card rounded-xl border p-5 text-left transition-all ${
                      isActive
                        ? 'is-active border-indigo-500 bg-indigo-950/60 shadow-[0_0_24px_rgba(99,102,241,0.16)]'
                        : 'border-slate-800 bg-slate-900/40 hover:border-indigo-700/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-300">{milestone.year}</span>
                      <span className="journey-milestone-node" aria-hidden="true" />
                    </div>
                    <h4 className="mt-3 text-sm font-bold leading-snug text-white">{milestone.label}</h4>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{milestone.note}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PROOF OF WORK CONCLUSION */}
        <div className="pt-12 border-t border-slate-800/80 text-center">
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-semibold block">THE JOURNEY CONTINUES.</span>
          <div className="mx-auto mt-6 max-w-2xl rounded-[2rem] border border-indigo-500/20 bg-indigo-950/40 p-6 shadow-[0_26px_60px_rgba(99,102,241,0.12)]">
            <p className="text-lg md:text-xl font-semibold text-slate-100 leading-9">
              “Every credential represents something learned.<br />
              Every project represents something built.<br />
              Every challenge represents something understood.”
            </p>
          </div>
        </div>

      </section>

      {/* AI PROJECTS SECTION */}
      <section id="ai-work" className="scroll-reveal max-w-6xl mx-auto px-6 py-16 border-t border-slate-800/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-mono font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              02 / AI &amp; INTELLIGENT SYSTEMS
            </div>
            <h2 className="text-3xl font-bold text-white">AI Agents &amp; Intelligent Workflows</h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Production-oriented architectures featuring agent decision loops, MCP integrations, vector context retrieval, and structured pipelines.
          </p>
        </div>

        <div className="space-y-12">
          {AI_PROJECTS.map((project) => (
            <div 
              key={project.id} 
              data-scroll-parallax="0.025"
              className="project-card-3d p-6 md:p-8 rounded-2xl bg-gradient-to-b from-indigo-950/20 via-slate-900/60 to-slate-900/40 border border-indigo-900/40 hover:border-indigo-700/60 transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-start shadow-xl shadow-indigo-950/10"
            >
              <div className="lg:col-span-5 space-y-4 lg:col-start-1 lg:col-end-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 font-bold">
                    {project.number}
                  </span>
                  <span className="text-xs font-mono text-indigo-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                    {project.category}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white">{project.title}</h3>
                <p className="text-sm text-indigo-300/90 font-mono">{project.subtitle}</p>
                <p className="text-slate-300 text-sm leading-relaxed">{project.summary}</p>

                <div className="pt-2 space-y-1">
                  <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">Workflow &amp; Architecture Details</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{project.built}</p>
                </div>

                <div className="pt-2 flex flex-wrap gap-1.5">
                  {project.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-950/60 border border-indigo-800/50 text-indigo-200">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => audioFX.playNodeClick(650)}
                    className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    <GithubIcon className="w-4 h-4" /> View AI Source Code
                  </a>
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      audioFX.playNodeClick(700);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-200 hover:text-white px-3 py-1.5 rounded bg-indigo-950 border border-indigo-800 transition-colors"
                  >
                    Inspect Workflow
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 w-full min-w-0 lg:col-start-6 lg:col-end-13">
                <AnimatedFlowDiagram diagramData={project.flowDiagram} interactive={true} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* JAVA PROJECTS SECTION */}
      <section id="java-work" className="scroll-reveal max-w-6xl mx-auto px-6 py-16 border-t border-slate-800/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300 text-xs font-mono font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              03 / JAVA &amp; BACKEND SYSTEMS
            </div>
            <h2 className="text-3xl font-bold text-white">Spring Boot Microservices &amp; Infrastructure</h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Robust enterprise architectures built with Java, Spring Boot, WebSockets, Redis caching, and relational databases.
          </p>
        </div>

        <div className="space-y-12">
          {JAVA_PROJECTS.map((project) => (
            <div 
              key={project.id} 
              data-scroll-parallax="0.025"
              className="project-card-3d p-6 md:p-8 rounded-2xl bg-gradient-to-b from-amber-950/10 via-slate-900/60 to-slate-900/40 border border-slate-800 hover:border-amber-700/50 transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-start shadow-xl"
            >
              <div className="lg:col-span-5 space-y-4 lg:col-start-1 lg:col-end-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 font-bold">
                    {project.number}
                  </span>
                  <span className="text-xs font-mono text-amber-300/90 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                    {project.category}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white">{project.title}</h3>
                <p className="text-sm text-amber-300/80 font-mono">{project.subtitle}</p>
                <p className="text-slate-300 text-sm leading-relaxed">{project.summary}</p>

                <div className="pt-2 space-y-1">
                  <h4 className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">Workflow &amp; Implementation Details</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{project.built}</p>
                </div>

                <div className="pt-2 flex flex-wrap gap-1.5">
                  {project.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800/90 border border-slate-700/80 text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <a 
                    href={project.github} 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={() => audioFX.playNodeClick(600)}
                    className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 hover:text-amber-300 font-medium transition-colors"
                  >
                    <GithubIcon className="w-4 h-4" /> View Backend Code
                  </a>
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      audioFX.playNodeClick(700);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white px-3 py-1.5 rounded bg-slate-800 border border-slate-700 transition-colors"
                  >
                    Inspect Workflow ’
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 w-full min-w-0 lg:col-start-6 lg:col-end-13">
                <AnimatedFlowDiagram diagramData={project.flowDiagram} interactive={true} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DATA ANALYSIS PROJECTS SECTION */}
      <section id="analysis-work" className="scroll-reveal max-w-6xl mx-auto px-6 py-16 border-t border-slate-800/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              04 / DATA ANALYSIS PROJECTS
            </div>
            <h2 className="text-3xl font-bold text-white">Data Stories &amp; Interactive Dashboards</h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Python analytics applications that turn real-world data into clear, interactive insights.
          </p>
        </div>

        <div className="space-y-12">
          {ANALYSIS_PROJECTS.map((project) => (
            <article
              key={project.id}
              data-scroll-parallax="0.02"
              className="project-card-3d grid grid-cols-1 items-start gap-8 rounded-2xl border border-cyan-900/50 bg-gradient-to-b from-cyan-950/20 via-slate-900/70 to-slate-900/40 p-6 shadow-xl shadow-cyan-950/10 transition-all hover:border-cyan-700/60 md:p-8 lg:grid-cols-12"
            >
              <div className="space-y-4 lg:col-span-5 lg:col-start-1 lg:col-end-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-200 border border-cyan-700/60 font-bold">
                    {project.number}
                  </span>
                  <span className="text-xs font-mono text-cyan-300/90 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                    {project.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">{project.title}</h3>
                <p className="text-sm font-mono text-cyan-300/90">{project.subtitle}</p>
                <p className="text-sm leading-relaxed text-slate-300">{project.summary}</p>
                <div className="pt-2 space-y-1">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">Analysis Details</h4>
                  <p className="text-sm leading-relaxed text-slate-300">{project.built}</p>
                </div>
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded bg-cyan-950/50 border border-cyan-900/60 px-2.5 py-1 text-xs font-mono text-cyan-100">
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => audioFX.playNodeClick(620)}
                  className="inline-flex items-center gap-2 pt-3 text-xs font-mono font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  <GithubIcon className="w-4 h-4" /> View Analysis Source Code
                </a>
              </div>
              <div className="w-full min-w-0 lg:col-span-7 lg:col-start-6 lg:col-end-13">
                <AnimatedFlowDiagram diagramData={project.flowDiagram} />
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-indigo-900/50 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-cyan-950/30 px-6 py-8 text-center shadow-xl shadow-indigo-950/10">
          <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-indigo-300">Explore the archive</p>
          <h3 className="mt-2 text-2xl font-bold text-white">Want to see more projects?</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-400">
            Visit my GitHub profile for additional projects, experiments, and open-source work.
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => audioFX.playNodeClick(650)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500"
          >
            <GithubIcon className="w-4 h-4" /> Go to GitHub
          </a>
        </div>
      </section>

      {/* TECHNICAL TOOLKIT */}
      <section id="stack" className="toolkit-section scroll-reveal max-w-6xl mx-auto px-6 py-16 border-t border-slate-800/60">
        <div className="toolkit-heading mb-10">
          <span className="text-xs font-mono text-indigo-400 tracking-wider uppercase font-semibold">
            04 / STACK &amp; CAPABILITIES
          </span>
          <h2 className="text-3xl font-bold text-white mt-1">Technical Toolkit</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">A practical stack for building responsive interfaces, reliable backend services, and intelligent AI-driven systems.</p>
        </div>

        <div className="toolkit-grid grid grid-cols-1 gap-4 font-mono text-xs sm:grid-cols-2 xl:grid-cols-4">

    {/* Languages */}
    <div className="min-w-0 p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
      <h3 className="text-amber-400 font-bold uppercase tracking-wider text-xs">
        Languages
      </h3>
      <ul className="space-y-1.5 text-slate-300">
        <li className="flex items-center justify-between">
          <span>Java</span>
          <span className="text-slate-500">Backend &amp; OOP</span>
        </li>
        <li className="flex items-center justify-between">
          <span>Python</span>
          <span className="text-slate-500">AI &amp; APIs</span>
        </li>
        <li className="flex items-center justify-between">
          <span>JavaScript</span>
          <span className="text-slate-500">Frontend</span>
        </li>
        <li className="flex items-center justify-between">
          <span>SQL</span>
          <span className="text-slate-500">Data Queries</span>
        </li>
      </ul>
    </div>

    {/* Frontend */}
    <div className="min-w-0 p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
      <h3 className="text-cyan-400 font-bold uppercase tracking-wider text-xs">
        Frontend
      </h3>
      <ul className="space-y-1.5 text-slate-300">
        <li className="flex items-center justify-between">
          <span>React.js</span>
          <span className="text-slate-500">UI Development</span>
        </li>
        <li className="flex items-center justify-between">
          <span>Tailwind CSS</span>
          <span className="text-slate-500">Responsive UI</span>
        </li>
        <li className="flex items-center justify-between">
          <span>WebSockets</span>
          <span className="text-slate-500">Real-Time UI</span>
        </li>
        <li className="flex items-center justify-between">
          <span>REST APIs</span>
          <span className="text-slate-500">API Integration</span>
        </li>
      </ul>
    </div>

    {/* Backend */}
    <div className="min-w-0 p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
      <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-xs">
        Backend
      </h3>
      <ul className="space-y-1.5 text-slate-300">
        <li className="flex items-center justify-between">
          <span>Spring Boot</span>
          <span className="text-slate-500">REST &amp; Microservices</span>
        </li>
        <li className="flex items-center justify-between">
          <span>Spring Security</span>
          <span className="text-slate-500">JWT &amp; RBAC</span>
        </li>
        <li className="flex items-center justify-between">
          <span>FastAPI</span>
          <span className="text-slate-500">Async Services</span>
        </li>
        <li className="flex items-center justify-between">
          <span>WebSocket / STOMP</span>
          <span className="text-slate-500">Real-Time Streaming</span>
        </li>
      </ul>
    </div>

    {/* AI */}
    <div className="min-w-0 p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
      <h3 className="text-indigo-400 font-bold uppercase tracking-wider text-xs">
        AI &amp; Intelligent Systems
      </h3>
      <ul className="space-y-1.5 text-slate-300">
        <li className="flex items-center justify-between">
          <span>LangChain</span>
          <span className="text-slate-500">LLM Applications</span>
        </li>
        <li className="flex items-center justify-between">
          <span>LangGraph</span>
          <span className="text-slate-500">Agent Workflows</span>
        </li>
        <li className="flex items-center justify-between">
          <span>MCP</span>
          <span className="text-slate-500">Tool Integration</span>
        </li>
        <li className="flex items-center justify-between">
          <span>RAG</span>
          <span className="text-slate-500">Context Retrieval</span>
        </li>
      </ul>
    </div>

    {/* Vector & LLM */}
    <div className="min-w-0 p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
      <h3 className="text-purple-400 font-bold uppercase tracking-wider text-xs">
        LLM &amp; Vector Stack
      </h3>
      <ul className="space-y-1.5 text-slate-300">
        <li className="flex items-center justify-between">
          <span>Ollama</span>
          <span className="text-slate-500">Local Inference</span>
        </li>
        <li className="flex items-center justify-between">
          <span>OpenRouter</span>
          <span className="text-slate-500">LLM Gateway</span>
        </li>
        <li className="flex items-center justify-between">
          <span>ChromaDB</span>
          <span className="text-slate-500">Vector Search</span>
        </li>
        <li className="flex items-center justify-between">
          <span>pgvector</span>
          <span className="text-slate-500">Embeddings</span>
        </li>
      </ul>
    </div>

    {/* Databases */}
    <div className="min-w-0 p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
      <h3 className="text-rose-400 font-bold uppercase tracking-wider text-xs">
        Data &amp; Storage
      </h3>
      <ul className="space-y-1.5 text-slate-300">
        <li className="flex items-center justify-between">
          <span>PostgreSQL</span>
          <span className="text-slate-500">Relational DB</span>
        </li>
        <li className="flex items-center justify-between">
          <span>MySQL</span>
          <span className="text-slate-500">Application Data</span>
        </li>
        <li className="flex items-center justify-between">
          <span>Redis</span>
          <span className="text-slate-500">Caching</span>
        </li>
        <li className="flex items-center justify-between">
          <span>MongoDB</span>
          <span className="text-slate-500">Document Data</span>
        </li>
      </ul>
    </div>

    {/* Tools */}
    <div className="min-w-0 p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
      <h3 className="text-orange-400 font-bold uppercase tracking-wider text-xs">
        Tools &amp; DevOps
      </h3>
      <ul className="space-y-1.5 text-slate-300">
        <li className="flex items-center justify-between">
          <span>Git / GitHub</span>
          <span className="text-slate-500">Version Control</span>
        </li>
        <li className="flex items-center justify-between">
          <span>Docker</span>
          <span className="text-slate-500">Containerization</span>
        </li>
        <li className="flex items-center justify-between">
          <span>Postman</span>
          <span className="text-slate-500">API Testing</span>
        </li>
        <li className="flex items-center justify-between">
          <span>GCP</span>
          <span className="text-slate-500">Cloud Services</span>
        </li>
      </ul>
    </div>

        </div>
      </section>

      {/* ABOUT & EXPERIENCE */}
    <section id="about" className="mindset-section scroll-reveal max-w-6xl mx-auto px-6 py-16 border-t border-slate-800/60">
  <div className="mindset-panel grid grid-cols-1 lg:grid-cols-12 gap-12">

    <div className="lg:col-span-6 space-y-6">
      <div>
        <span className="text-xs font-mono text-indigo-400 tracking-wider uppercase font-semibold">
          05 / ABOUT ME
        </span>
        <h2 className="text-3xl font-bold text-white mt-1">
          Engineering Mindset
        </h2>
      </div>

      <p className="text-slate-300 text-sm leading-relaxed">
        I am a Computer Science engineer focused on building backend and
        AI-powered systems. I enjoy understanding how things work beneath
        the surface — from JVM internals, Java and Spring Boot architecture
        to real-time systems, RAG pipelines, and agentic AI workflows.
      </p>

      <p className="text-slate-300 text-sm leading-relaxed">
        My approach is simple: build things, understand the underlying
        mechanics, and keep experimenting. I am particularly interested in
        combining reliable backend engineering with modern AI technologies
        to build practical, intelligent software.
      </p>

      <div className="mindset-principles grid grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
          <span className="block font-mono text-indigo-400 font-bold text-xs">
            BUILD
          </span>
          <span className="text-[11px] text-slate-400">
            Ideas to Software
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
          <span className="block font-mono text-amber-400 font-bold text-xs">
            UNDERSTAND
          </span>
          <span className="text-[11px] text-slate-400">
            Systems &amp; Internals
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
          <span className="block font-mono text-emerald-400 font-bold text-xs">
            EXPERIMENT
          </span>
          <span className="text-[11px] text-slate-400">
            Test &amp; Iterate
          </span>
        </div>
      </div>
    </div>

  </div>
</section>

      {/* CONTACT SECTION */}
      <section id="contact" className="scroll-reveal max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/60">
        <div className="p-8 md:p-12 rounded-2xl bg-gradient-to-b from-indigo-950/30 to-slate-900 border border-indigo-900/40 max-w-3xl mx-auto space-y-6">
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-semibold">07 / GET IN TOUCH</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Let's build something intelligent.</h2>
          
          <p className="text-sm text-slate-300 max-w-md leading-relaxed">
            Interested in AI engineering, backend systems, or building software together?
          </p>

          <div className="pt-4 flex flex-wrap justify-start items-center gap-4">
            <a 
              href={`mailto:${SOHAM_EMAIL}`}
              onClick={() => audioFX.playNodeClick(800)}
              className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
            >
              <MailIcon className="w-4 h-4" /> Email Soham
            </a>
            <a 
              href={GITHUB_URL} 
              target="_blank" 
              rel="noreferrer"
              className="px-5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm flex items-center gap-2 transition-all"
            >
              <GithubIcon className="w-4 h-4" /> GitHub
            </a>
            <a 
              href={LINKEDIN_URL} 
              target="_blank" 
              rel="noreferrer"
              className="px-5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm flex items-center gap-2 transition-all"
            >
              <LinkedinIcon className="w-4 h-4" /> LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-8 text-xs font-mono text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-slate-300 font-semibold">SOHAM KADAM</span> · AI Engineer / Full-Stack Developer
          </div>
          <div>
            © 2026 Soham Kadam. Verified Proof of Work &amp; System Topologies.
          </div>
        </div>
      </footer>

      {/* MODALS - same as before */}
      {selectedCredential && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-950 border border-indigo-900/80 rounded-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button 
              onClick={() => {
                setSelectedCredential(null);
                audioFX.playNodeClick(300);
              }}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <CloseIcon className="w-4 h-4" />
            </button>

            <div className="p-8 rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500/40 space-y-4 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">OFFICIAL CREDENTIAL RECORD</span>
                  <h3 className="text-2xl font-bold text-white font-sans">{selectedCredential.title}</h3>
                  <p className="text-xs font-mono text-indigo-300">{selectedCredential.issuer}</p>
                </div>
                <div className="w-12 h-12 rounded-full border border-indigo-400/50 bg-indigo-950/80 flex items-center justify-center text-indigo-300 font-mono font-bold text-xs">
                  {selectedCredential.year}
                </div>
              </div>


              <div className="pt-2 border-t border-indigo-900/60 text-xs text-slate-300 leading-relaxed font-sans">
                <strong className="text-indigo-300 font-mono text-[10px] uppercase block mb-1">WHY IT MATTERS</strong>
                {selectedCredential.whyItMatters}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircleIcon className="w-3.5 h-3.5" /> VERIFIED CREDENTIAL RECORD
                </span>
                <span className="text-[10px] font-mono text-slate-500">ISSUED {selectedCredential.year}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {selectedCredential.verifyUrl && (
                <a
                  href={selectedCredential.verifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => audioFX.playNodeClick(700)}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
                >
                  <ExternalLinkIcon className="w-3.5 h-3.5" /> Open Verified Credential Link
                </a>
              )}


              <button
                onClick={() => {
                  setSelectedCredential(null);
                  audioFX.playNodeClick(300);
                }}
                className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs transition-colors"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProofDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 relative">
            <button 
              onClick={() => setSelectedProofDetail(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <CloseIcon className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">{selectedProofDetail.type} Detail</span>
              <h3 className="text-xl font-bold text-white mt-1">{selectedProofDetail.title}</h3>
              <p className="text-xs font-mono text-slate-400">{selectedProofDetail.organization} · {selectedProofDetail.year}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              {selectedProofDetail.description}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedProofDetail(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-indigo-900/60 rounded-2xl max-w-3xl w-full p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setSelectedProject(null);
                audioFX.playNodeClick(300);
              }}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <CloseIcon className="w-4 h-4" />
            </button>

            <div>
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">{selectedProject.category}</span>
              <h2 className="text-2xl font-bold text-white mt-1">{selectedProject.title}</h2>
              <p className="text-xs font-mono text-slate-400">{selectedProject.subtitle}</p>
            </div>

            <div className="space-y-3">
              <div className="pb-3 border-b border-slate-800/70">
                <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">Workflow Diagram</h4>
                <p className="text-sm text-slate-400 leading-relaxed">Explore the system architecture, component flow, and decision pipeline for the selected project.</p>
              </div>

              <div className="py-4">
                <AnimatedFlowDiagram diagramData={selectedProject.flowDiagram} interactive={true} />
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <div>
                <h4 className="text-xs font-mono text-indigo-400 uppercase font-semibold mb-1">Overview</h4>
                <p>{selectedProject.summary}</p>
              </div>

              <div>
                <h4 className="text-xs font-mono text-indigo-400 uppercase font-semibold mb-1">Workflow Pipeline</h4>
                <p>{selectedProject.built}</p>
              </div>

              <div>
                <h4 className="text-xs font-mono text-indigo-400 uppercase font-semibold mb-1">Key Takeaway</h4>
                <p>{selectedProject.learned}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono text-indigo-400 uppercase font-semibold mb-2">Technologies</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.tags.map((t, idx) => (
                  <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3 border-t border-slate-800">
              <a 
                href={selectedProject.github} 
                target="_blank" 
                rel="noreferrer"
                onClick={() => audioFX.playNodeClick(700)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 transition-colors"
              >
                <GithubIcon className="w-3.5 h-3.5" /> Source Code
              </a>
              <button 
                onClick={() => {
                  setSelectedProject(null);
                  audioFX.playNodeClick(300);
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMAND PALETTE */}
      {cmdOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-3 border-b border-slate-800 flex items-center gap-2">
              <SearchIcon className="w-4 h-4 text-indigo-400" />
              <input 
                type="text" 
                placeholder="Type to search sections or proof items... (Esc to close)"
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                autoFocus
                className="w-full bg-transparent border-none text-slate-100 text-sm focus:outline-none placeholder-slate-500 font-mono"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto p-2">
              {commandResults.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500 font-mono">No matching results</div>
              ) : (
                commandResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToSection(res.target)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-indigo-950/60 text-xs font-mono text-slate-300 hover:text-indigo-200 flex items-center justify-between transition-colors"
                  >
                    <span>{res.label}</span>
                    <span className="text-[10px] text-slate-500">Jump’</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <Analytics />
    </div>
  );
}

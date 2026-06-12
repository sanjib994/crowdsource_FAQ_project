# FAQ Crowdsourcing Platform — System Architecture

---

## 1. High-Level Architecture Overview

The platform follows a **modular monolith** design for MVP (Phases 1–2), evolving into a **service-oriented architecture** for Phases 3–4. This allows rapid development early on while keeping clean boundaries for future extraction.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │  Web App      │  │  Mobile PWA  │  │  Embed Widget│  │  Admin Panel   │   │
│  │  (Next.js)    │  │  (PWA)       │  │  (JS SDK)    │  │  (Next.js)     │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬─────────┘   │
│         │                  │                  │                  │            │
└─────────┼──────────────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │                  │
          ▼                  ▼                  ▼                  ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY / BFF LAYER                             │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │  API Gateway (Rate Limiting, Auth, CORS, Request Routing)             │   │
│  │  - REST API (public)   - WebSocket (real-time notifications)          │   │
│  │  - Webhook Dispatcher  - GraphQL (optional, Phase 3+)                 │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          ▼                        ▼                        ▼
┌──────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  CORE SERVICES   │  │  AI / INTELLIGENCE   │  │  PLATFORM SERVICES   │
│                  │  │                      │  │                      │
│ • Question Svc   │  │ • Semantic Search    │  │ • Auth & User Svc    │
│ • Answer Svc     │  │ • Duplicate Detect   │  │ • Notification Svc   │
│ • Voting Svc     │  │ • AI Summary Engine  │  │ • Moderation Svc     │
│ • Tag Svc        │  │ • Tiered Generation  │  │ • Analytics Svc      │
│ • Search Svc     │  │ • Self-Improvement   │  │ • Reputation Svc     │
│ • Dashboard Svc  │  │ • Key Term Extract   │  │ • Webhook Svc        │
│                  │  │ • Voice Transcribe   │  │ • Translation Svc    │
│                  │  │ • Quality Scoring    │  │ • Report Svc         │
└────────┬─────────┘  └──────────┬───────────┘  └──────────┬───────────┘
         │                       │                          │
         ▼                       ▼                          ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                        │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │  PostgreSQL   │  │ Elasticsearch│  │    Redis      │  │  Object Store  │   │
│  │  (Primary DB) │  │ (Search +    │  │  (Cache +     │  │  (S3/MinIO)    │   │
│  │              │  │  Vectors)    │  │   Sessions +  │  │  Images/Media  │   │
│  │              │  │              │  │   Queues)     │  │                │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture — Detailed Breakdown

### 2.1 Client Layer

```mermaid
graph TD
    subgraph "Client Applications"
        WEB["Web App<br/>(Next.js + React)"]
        PWA["Mobile PWA<br/>(Same codebase, responsive)"]
        WIDGET["Embeddable Widget<br/>(Vanilla JS SDK)"]
        ADMIN["Admin Dashboard<br/>(Next.js, role-gated)"]
    end

    subgraph "Client-Side Capabilities"
        RTE["Rich Text Editor<br/>(Markdown + Code Blocks)"]
        VOICE["Voice Input Module<br/>(Web Speech API)"]
        I18N["i18n Framework<br/>(next-intl)"]
        RTL["RTL Layout Engine"]
        THEME["Theme Engine<br/>(Dark/Light/High Contrast)"]
        TOUR["Guided Tour<br/>(Onboarding Walkthrough)"]
    end

    WEB --> RTE
    WEB --> VOICE
    WEB --> I18N
    WEB --> RTL
    WEB --> THEME
    WEB --> TOUR
    PWA --> RTE
    PWA --> VOICE
```

| Client | Tech | Maps to Product Feature |
|--------|------|------------------------|
| **Web App** | Next.js 14+ (App Router, SSR for SEO pages) | §4.5 SEO-optimized pages, §14.4 Mobile Responsiveness |
| **PWA** | Same Next.js codebase, service worker | §14.4 Progressive Web App |
| **Widget** | Standalone JS bundle (`<script>` tag embed) | §10.2 Embeddable Widget |
| **Admin Panel** | Next.js with role-gated routes | §12.3 Admin Dashboard |
| **Voice Input** | Web Speech API → review → submit | §4.2 Voice Input |
| **Rich Text Editor** | TipTap or MDXEditor (Markdown + code) | §4.2, §4.3 Rich text support |
| **i18n** | next-intl + ICU message format | §13 Multilingual Support |

---

### 2.2 API Gateway Layer

```mermaid
graph LR
    subgraph "API Gateway"
        RL["Rate Limiter<br/>(Token Bucket)"]
        AUTH["Auth Middleware<br/>(JWT Validation)"]
        CORS["CORS Handler"]
        ROUTER["Request Router"]
        WS["WebSocket Server<br/>(Socket.io)"]
    end

    RL --> AUTH --> CORS --> ROUTER
    ROUTER -->|REST| SERVICES["Backend Services"]
    WS -->|Real-time| SERVICES

    subgraph "Security Layer (§15)"
        CSRF["CSRF Protection"]
        CSP["Content Security Policy"]
        SANITIZE["Input Sanitization<br/>(XSS Prevention)"]
        CAPTCHA["CAPTCHA Gate<br/>(Low-rep users)"]
    end

    AUTH --> CSRF
    ROUTER --> SANITIZE
    ROUTER --> CAPTCHA
```

**Rate Limiting Rules (§5.3, §15):**

| Endpoint | Limit | Scope |
|----------|-------|-------|
| `POST /questions` | 5/hour | Per user (new users: 2/hour) |
| `POST /answers` | 10/hour | Per user |
| `POST /vote` | 30/hour | Per user |
| `GET /search` | 60/min | Per IP |
| `POST /auth/login` | 5/min | Per IP |

---

### 2.3 Core Services Layer

#### 2.3.1 Question Service

```mermaid
graph TD
    QS["Question Service"]

    QS -->|Create| DEDUP["Duplicate Detection<br/>(§5.1)"]
    QS -->|Create| KEYW["Key Term Extractor<br/>(§4.8)"]
    QS -->|Create| INDEX["Search Indexer<br/>(Elasticsearch)"]
    QS -->|Create| NOTIFY["Notification Dispatch"]
    QS -->|Read| PHASE["Phase-Aware Filter<br/>(§4.8)"]
    QS -->|Read| RANK["Ranking Engine<br/>(§4.4)"]

    DEDUP -->|Similar found| SUGGEST["Suggest Existing Q's"]
    DEDUP -->|No match| PERSIST["Save to PostgreSQL"]
    KEYW --> PERSIST

    subgraph "Question Lifecycle"
        OPEN["Open"] --> ANSWERED["Answered"]
        ANSWERED --> ACCEPTED["Has Accepted Answer"]
        OPEN --> DUPLICATE["Marked Duplicate"]
        ACCEPTED --> LOCKED["Locked/Archived"]
    end
```

**Responsibilities:**
- CRUD operations on questions
- Trigger duplicate detection before saving (§5.1)
- Extract key terms on creation (§4.8)
- Index into Elasticsearch for full-text + semantic search
- Track question lifecycle state machine
- Emit events: `question.created`, `question.updated`, `question.closed`

---

#### 2.3.2 Answer Service

```mermaid
graph TD
    AS["Answer Service"]

    AS -->|Create| QUALITY["Quality Scorer<br/>(§5.2)"]
    AS -->|Create| REVIEW["Review Queue<br/>(§5.4)"]
    AS -->|Update| CONFIDENCE["Confidence Meter<br/>Calculator (§5.2)"]
    AS -->|Read| BEST["Best Answer Isolator<br/>(§11.3)"]
    AS -->|Read| FORMAT["Multi-Format<br/>Renderer (§4.3)"]

    QUALITY -->|Score < threshold| FLAG["Auto-Flag<br/>Low Quality"]
    QUALITY -->|Score OK| PUBLISH["Publish Answer"]

    BEST --> COMPOSITE["Composite Score:<br/>Expert ✓ > Votes > Recency > AI"]

    FORMAT -->|Toggle| LONG["Long-Form<br/>(Full Detail)"]
    FORMAT -->|Toggle| SHORT["Short-Form<br/>(Concise Summary)"]
```

**Confidence Meter Calculation (§5.2):**
```
confidence_score = (
    (expert_upvotes × 3.0) +
    (contributor_upvotes × 1.0) -
    (expert_downvotes × 2.0) -
    (contributor_downvotes × 0.5) +
    (is_verified × 25) +
    (is_accepted × 20)
) / max_possible_score × 100
```

**Best Answer Composite Score (§11.3):**
```
best_score = (
    (is_expert_verified × 50) +
    (net_votes × 2) +
    (recency_decay × 5) +
    (ai_confidence × 10)
)
```

---

#### 2.3.3 Voting & Ranking Service

```mermaid
graph TD
    VS["Voting Service"]

    VS -->|Check| REP_GATE["Reputation Gate<br/>(§5.5)"]
    VS -->|Check| ANTI_GAME["Anti-Gaming<br/>Detection (§4.4)"]
    VS -->|Write| VOTE_DB["Vote Record"]
    VS -->|Update| RANKING["Ranking Engine"]

    REP_GATE -->|< 15 rep| DENY["Deny Vote"]
    REP_GATE -->|≥ 15 rep| ALLOW["Allow Vote"]

    ANTI_GAME -->|Ring detected| BLOCK["Block + Alert"]
    ANTI_GAME -->|Clean| ALLOW

    RANKING -->|Answers| WEIGHTED["Expert-Weighted<br/>Score (§4.4)"]
    RANKING -->|Questions| HOT["Hot/Trending<br/>Algorithm"]

    HOT --> FORMULA["score = log10(votes) +<br/>(age_hours / 12.5)"]
```

**Reputation Gating Thresholds (§5.5):**

| Action | Min Reputation |
|--------|---------------|
| Upvote | 15 |
| Comment | 50 |
| Downvote | 100 |
| Edit others' posts | 500 |
| Moderation tools | 1,000 |

---

#### 2.3.4 Personalized Dashboard Service

```mermaid
graph TD
    DS["Dashboard Service"]

    DS -->|Fetch| PROFILE["User Profile<br/>+ Phase Data"]
    DS -->|Compute| REC["Recommendation<br/>Engine"]
    DS -->|Compute| PROGRESS["Progress<br/>Summary"]
    DS -->|Fetch| FAQ_PHASE["Phase-Aware<br/>FAQ List (§4.1)"]

    PROFILE -->|Tags followed| REC
    PROFILE -->|Past activity| REC
    PROFILE -->|Start date| FAQ_PHASE

    REC --> FEED["Personalized<br/>Question Feed"]
    FAQ_PHASE --> STEPS["Future Steps<br/>for User Phase"]
    PROGRESS --> STATS["Weekly Stats:<br/>Questions, Answers, Rep"]

    FEED --> DASHBOARD["Assembled<br/>Dashboard View"]
    STEPS --> DASHBOARD
    STATS --> DASHBOARD
```

**Dashboard Composition (§4.1):**

| Panel | Data Source | Update Frequency |
|-------|-----------|-----------------|
| Phase-based FAQs & Future Steps | Question DB + Phase Config | On login |
| Recommended Questions | User tags + ML collaborative filter | Every 6 hours (cached) |
| Unanswered in Your Expertise | Tag-based query | Real-time |
| Progress Summary | Aggregated from activity log | On login |

---

### 2.4 AI & Intelligence Layer

```mermaid
graph TD
    subgraph "AI & Intelligence Layer (§11)"
        SEMANTIC["Semantic Search<br/>Engine (§4.5)"]
        DEDUP_AI["Duplicate Detection<br/>NLP (§5.1)"]
        SUMMARY["AI Summary<br/>Generator (§11.1)"]
        TIERED["Tiered Answer<br/>Engine (§11.2)"]
        IMPROVE["Hybrid Self-<br/>Improvement (§11.4)"]
        KEYTERM["Key Term<br/>Extractor (§4.8)"]
        VOICE_AI["Voice Transcription<br/>(§4.2)"]
        QUALITY_AI["Quality Scorer<br/>(§5.2)"]
        SPAM_AI["Spam Detector<br/>(§5.3)"]
        TRANSLATE["Translation<br/>Engine (§13)"]
    end

    subgraph "AI Infrastructure"
        EMBED["Embedding Model<br/>(all-MiniLM-L6-v2)"]
        LLM["LLM API<br/>(GPT-4o / Claude)"]
        WHISPER["Speech-to-Text<br/>(Whisper API)"]
        TRANS_API["Translation API<br/>(Google/DeepL)"]
        VECTOR["Vector Store<br/>(Elasticsearch kNN)"]
    end

    SEMANTIC --> EMBED --> VECTOR
    DEDUP_AI --> EMBED
    SUMMARY --> LLM
    TIERED --> LLM
    IMPROVE --> LLM
    KEYTERM --> EMBED
    VOICE_AI --> WHISPER
    QUALITY_AI --> EMBED
    SPAM_AI --> EMBED
    TRANSLATE --> TRANS_API
```

#### Tiered Answer Generation Flow (§11.2)

```mermaid
sequenceDiagram
    participant U as User
    participant API as API
    participant S1 as Stage 1: Auto-FAQ
    participant S2 as Stage 2: Human Queue
    participant S3 as Stage 3: AI Generation

    U->>API: Ask Question
    API->>S1: Search existing FAQs (semantic match)
    alt Match found (similarity > 0.85)
        S1-->>U: Return existing FAQ + future steps
    else No match
        API->>S2: Route to contributors/experts
        Note over S2: Wait for human answer<br/>(configurable timeout: 24h)
        alt Human answers within timeout
            S2-->>U: Return human answer
        else Timeout reached
            API->>S3: Generate AI-drafted answer
            S3-->>U: Return AI answer (labeled "AI-generated")
            Note over S3: Flag for human review
        end
    end
```

#### Hybrid Self-Improvement Loop (§11.4)

```mermaid
graph TD
    CRON["Scheduled Job<br/>(Weekly)"] --> SCAN["Scan Low-Score<br/>Answers"]
    CRON --> GAP["Identify FAQ<br/>Coverage Gaps"]

    SCAN -->|Score < 3| SUGGEST_EDIT["AI Suggests<br/>Answer Improvements"]
    GAP -->|Frequent search,<br/>no matching Q| SUGGEST_NEW["AI Suggests<br/>New FAQ Entries"]

    SUGGEST_EDIT --> REVIEW["Human Reviewer<br/>Queue"]
    SUGGEST_NEW --> REVIEW

    REVIEW -->|Approve| PUBLISH["Publish Changes"]
    REVIEW -->|Reject| DISCARD["Discard + Feedback<br/>to AI Model"]
    REVIEW -->|Edit + Approve| MODIFY["Publish Modified"]
```

---

### 2.5 Platform Services Layer

#### 2.5.1 Auth & User Service

```mermaid
graph TD
    AUTH_SVC["Auth & User Service"]

    AUTH_SVC -->|Register| SIGNUP["Email/Password<br/>+ OAuth2 (Google, GitHub)"]
    AUTH_SVC -->|Login| JWT["Issue JWT<br/>(Access + Refresh)"]
    AUTH_SVC -->|Profile| PROF["User Profile<br/>Management"]
    AUTH_SVC -->|GDPR| DELETE["Account Deletion<br/>+ Data Anonymization"]
    AUTH_SVC -->|Admin| TWOF["2FA Enforcement<br/>(TOTP)"]
    AUTH_SVC -->|Age| AGE_CHECK["Age Verification<br/>(18+ Required)"]

    SIGNUP --> HASH["Password Hashing<br/>(Argon2id)"]
    SIGNUP --> COC["Accept Code<br/>of Conduct (§8.3)"]
    SIGNUP --> ONBOARD["Trigger Guided<br/>Tour (§7)"]
```

#### 2.5.2 Reputation & Gamification Service

```mermaid
graph TD
    REP["Reputation Service"]

    REP -->|Calculate| POINTS["Points Engine"]
    REP -->|Award| BADGES["Badge Engine"]
    REP -->|Track| STREAKS["Streak Tracker"]
    REP -->|Rank| LEADER["Leaderboard<br/>Calculator"]

    POINTS -->|+2| ASK["Question Asked"]
    POINTS -->|+15| ACCEPT["Answer Accepted"]
    POINTS -->|+10| UP_ANS["Answer Upvoted"]
    POINTS -->|+5| UP_Q["Question Upvoted"]
    POINTS -->|-2| DOWN["Answer Downvoted"]

    BADGES --> FIRST["First Answer"]
    BADGES --> HELPFUL["Helpful<br/>(10 upvotes)"]
    BADGES --> EXPERT_B["Expert"]
    BADGES --> TOP["Top Contributor"]

    LEADER --> WEEKLY["Weekly"]
    LEADER --> MONTHLY["Monthly"]
    LEADER --> ALLTIME["All-Time"]
```

#### 2.5.3 Notification Service

```mermaid
graph TD
    NOTIFY["Notification Service"]

    NOTIFY -->|Real-time| WS_PUSH["WebSocket Push<br/>(In-App)"]
    NOTIFY -->|Async| EMAIL["Email Service<br/>(Transactional)"]
    NOTIFY -->|Async| DIGEST["Digest Compiler<br/>(Daily/Weekly)"]

    subgraph "Event Triggers (§4.9)"
        E1["New answer on your question"]
        E2["Answer accepted/upvoted"]
        E3["Followed question activity"]
        E4["Badge earned"]
        E5["Moderation action on your post"]
    end

    E1 --> NOTIFY
    E2 --> NOTIFY
    E3 --> NOTIFY
    E4 --> NOTIFY
    E5 --> NOTIFY

    NOTIFY --> PREFS["User Preference<br/>Filter"]
    PREFS -->|Opted in| WS_PUSH
    PREFS -->|Opted in| EMAIL
```

#### 2.5.4 Moderation Service

```mermaid
graph TD
    MOD["Moderation Service"]

    MOD --> FLAG_Q["Community<br/>Flag Queue"]
    MOD --> FIRST_POST["First-Post<br/>Review Queue"]
    MOD --> EDIT_Q["Suggested Edit<br/>Review Queue"]
    MOD --> AUTO["Auto-Actions"]

    FLAG_Q -->|N+ flags| AUTO_REMOVE["Auto-Remove"]
    FLAG_Q -->|< N flags| MOD_REVIEW["Moderator Review"]

    MOD_REVIEW -->|Approve| RESTORE["Restore Content"]
    MOD_REVIEW -->|Remove| LOG_ACTION["Log + Notify User"]
    MOD_REVIEW -->|Escalate| ADMIN_ESC["Escalate to Admin"]

    AUTO --> SPAM_CHECK["Spam Detection<br/>(AI)"]
    AUTO --> SHADOW["Shadow-Ban<br/>Repeat Offenders"]

    subgraph "Discipline Pipeline (§8.3)"
        WARN["Warning"] --> TEMP_BAN["Temp Ban"]
        TEMP_BAN --> PERM_BAN["Permanent Ban"]
    end

    LOG_ACTION --> WARN
```

#### 2.5.5 Analytics & Reporting Service

```mermaid
graph TD
    ANALYTICS["Analytics Service"]

    ANALYTICS --> REALTIME["Real-Time<br/>Dashboard (§12.3)"]
    ANALYTICS --> WEEKLY_RPT["Weekly Report<br/>Generator (§12.4)"]
    ANALYTICS --> EXPORT["Export Engine<br/>(CSV, PDF)"]

    subgraph "Metrics Pipeline"
        EVENTS["Event Stream"] --> AGG["Aggregator"]
        AGG --> STORE["Time-Series<br/>Store"]
        STORE --> REALTIME
        STORE --> WEEKLY_RPT
    end

    WEEKLY_RPT --> EMAIL_RPT["Email to Admins<br/>& Moderators"]

    subgraph "Weekly Report Contents"
        R1["New questions count"]
        R2["Answer rate"]
        R3["Top contributors"]
        R4["Trending topics"]
        R5["Unresolved questions"]
        R6["Moderation actions"]
        R7["Week-over-week trends"]
    end
```

---

## 3. Data Layer — Database Schema

### 3.1 PostgreSQL (Primary Relational Store)

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar email UK
        varchar display_name
        varchar password_hash
        varchar oauth_provider
        varchar oauth_id
        enum role "visitor|contributor|expert|moderator|admin"
        int reputation_score
        varchar preferred_language
        jsonb phase_data
        timestamp start_date
        timestamp created_at
        boolean is_shadow_banned
        boolean is_2fa_enabled
    }

    QUESTIONS {
        uuid id PK
        uuid author_id FK
        varchar title
        text body_markdown
        text body_html
        varchar status "open|answered|accepted|duplicate|locked"
        uuid canonical_question_id FK
        int vote_score
        int view_count
        varchar detected_language
        jsonb extracted_key_terms
        varchar phase_level "beginner|intermediate|advanced"
        timestamp created_at
        timestamp updated_at
    }

    ANSWERS {
        uuid id PK
        uuid question_id FK
        uuid author_id FK
        text body_markdown
        text body_html
        text short_form_summary
        int vote_score
        float confidence_score
        float composite_best_score
        boolean is_accepted
        boolean is_expert_verified
        boolean is_ai_generated
        varchar ai_model_used
        varchar status "published|flagged|removed|pending_review"
        timestamp created_at
        timestamp updated_at
    }

    VOTES {
        uuid id PK
        uuid user_id FK
        uuid target_id
        enum target_type "question|answer"
        enum vote_type "up|down"
        float weight "1.0 regular, 3.0 expert"
        timestamp created_at
    }

    TAGS {
        uuid id PK
        varchar name UK
        varchar slug UK
        uuid parent_tag_id FK
        text description
        int question_count
    }

    QUESTION_TAGS {
        uuid question_id FK
        uuid tag_id FK
    }

    COMMENTS {
        uuid id PK
        uuid author_id FK
        uuid target_id
        enum target_type "question|answer"
        text body
        timestamp created_at
    }

    FLAGS {
        uuid id PK
        uuid reporter_id FK
        uuid target_id
        enum target_type "question|answer|comment"
        enum reason "spam|inappropriate|off_topic|duplicate|low_quality"
        text details
        enum status "pending|reviewed|dismissed"
        uuid reviewed_by FK
        timestamp created_at
    }

    BADGES {
        uuid id PK
        varchar name UK
        text description
        varchar icon
        varchar criteria_type
        int criteria_threshold
    }

    USER_BADGES {
        uuid user_id FK
        uuid badge_id FK
        timestamp awarded_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        enum type "answer|vote|badge|moderation|system"
        varchar title
        text message
        jsonb metadata
        boolean is_read
        timestamp created_at
    }

    EDIT_HISTORY {
        uuid id PK
        uuid target_id
        enum target_type "question|answer"
        uuid editor_id FK
        text previous_body
        text new_body
        varchar edit_reason
        timestamp created_at
    }

    AI_SUGGESTIONS {
        uuid id PK
        enum type "answer_improvement|new_faq|gap_fill"
        uuid target_id
        text suggested_content
        enum status "pending|approved|rejected|modified"
        uuid reviewed_by FK
        timestamp created_at
    }

    WEBHOOK_SUBSCRIPTIONS {
        uuid id PK
        uuid owner_id FK
        varchar endpoint_url
        varchar secret
        jsonb event_types
        boolean is_active
    }

    USERS ||--o{ QUESTIONS : "asks"
    USERS ||--o{ ANSWERS : "writes"
    USERS ||--o{ VOTES : "casts"
    USERS ||--o{ COMMENTS : "posts"
    USERS ||--o{ FLAGS : "reports"
    USERS ||--o{ USER_BADGES : "earns"
    USERS ||--o{ NOTIFICATIONS : "receives"
    QUESTIONS ||--o{ ANSWERS : "has"
    QUESTIONS ||--o{ QUESTION_TAGS : "tagged_with"
    TAGS ||--o{ QUESTION_TAGS : "applied_to"
    QUESTIONS ||--o{ COMMENTS : "has"
    ANSWERS ||--o{ COMMENTS : "has"
    QUESTIONS ||--o{ EDIT_HISTORY : "tracks"
    ANSWERS ||--o{ EDIT_HISTORY : "tracks"
```

### 3.2 Elasticsearch (Search + Vector Store)

```
Index: faq_questions
├── title (text, analyzed)
├── body (text, analyzed)
├── tags (keyword[])
├── key_terms (keyword[])
├── phase_level (keyword)
├── language (keyword)
├── status (keyword)
├── vote_score (integer)
├── created_at (date)
├── embedding (dense_vector, dims: 384)  ← for semantic search
└── author_reputation (integer)

Index: faq_answers
├── body (text, analyzed)
├── question_id (keyword)
├── confidence_score (float)
├── is_expert_verified (boolean)
├── is_ai_generated (boolean)
├── language (keyword)
├── embedding (dense_vector, dims: 384)
└── created_at (date)
```

### 3.3 Redis (Cache + Sessions + Queues)

| Key Pattern | Purpose | TTL |
|-------------|---------|-----|
| `session:{token}` | User session data | 24h |
| `user:{id}:rep` | Cached reputation score | 5min |
| `question:{id}:votes` | Vote count cache | 1min |
| `rate:{user_id}:{action}` | Rate limiting counter | 1h |
| `dashboard:{user_id}` | Cached dashboard data | 6h |
| `trending:questions` | Trending questions list | 10min |
| `leaderboard:{period}` | Leaderboard cache | 30min |
| `search:suggestions:{prefix}` | Autocomplete cache | 1h |

**Redis Queues (Bull MQ):**

| Queue | Purpose | Priority |
|-------|---------|----------|
| `notifications` | Email + push notification dispatch | Normal |
| `indexing` | Elasticsearch indexing jobs | Normal |
| `ai-summary` | AI summary generation | Low |
| `ai-improvement` | Self-improvement scan jobs | Low |
| `reports` | Weekly report generation | Low |
| `webhooks` | Webhook event delivery | High |
| `moderation` | Auto-moderation checks | High |
| `translation` | Content translation jobs | Normal |

---

## 4. Key Data Flows

### 4.1 Question Submission Flow (with Voice + Dedup + Key Terms)

```mermaid
sequenceDiagram
    actor U as User
    participant WEB as Web Client
    participant VOICE as Voice Module
    participant API as API Gateway
    participant QS as Question Service
    participant DEDUP as Duplicate Detector
    participant KT as Key Term Extractor
    participant ES as Elasticsearch
    participant DB as PostgreSQL
    participant Q as Job Queue
    participant NS as Notification Service

    U->>WEB: Click "Ask Question"
    alt Voice Input (§4.2)
        U->>VOICE: Speak question
        VOICE->>API: Audio blob
        API->>VOICE: Whisper STT → text
        VOICE-->>WEB: Transcribed text (editable)
    end
    U->>WEB: Submit question (title, body, tags)
    WEB->>API: POST /api/questions
    API->>API: Auth + Rate Limit + Sanitize
    API->>QS: createQuestion()

    QS->>DEDUP: checkDuplicates(title, body)
    DEDUP->>ES: kNN vector search (embedding)
    ES-->>DEDUP: Similar questions (score > 0.85)

    alt Duplicates found
        DEDUP-->>QS: Return similar questions
        QS-->>API: 200 + suggestions
        API-->>WEB: Show "Similar questions found"
        U->>WEB: Confirm submit anyway / choose existing
    end

    QS->>KT: extractKeyTerms(body)
    KT-->>QS: key_terms[], phase_level

    QS->>DB: INSERT question
    QS->>Q: Enqueue indexing job
    Q->>ES: Index question + embedding
    QS->>Q: Enqueue notification job
    Q->>NS: Notify followers of relevant tags
    QS-->>API: 201 Created
    API-->>WEB: Question published
```

### 4.2 Search Flow (Full-Text + Semantic + Phase-Aware)

```mermaid
sequenceDiagram
    actor U as User
    participant WEB as Web Client
    participant API as API Gateway
    participant SS as Search Service
    participant ES as Elasticsearch
    participant TRANS as Translation Svc
    participant CACHE as Redis

    U->>WEB: Type search query
    WEB->>API: GET /api/search?q=...&lang=...&phase=...
    API->>SS: search(query, filters)

    SS->>CACHE: Check cached results
    alt Cache hit
        CACHE-->>SS: Return cached results
    else Cache miss
        SS->>TRANS: Detect query language
        TRANS-->>SS: language_code

        par Full-Text Search
            SS->>ES: text match query (BM25)
        and Semantic Search (§4.5)
            SS->>ES: Encode query → embedding
            SS->>ES: kNN vector search (cosine similarity)
        end

        ES-->>SS: Combined results (RRF fusion)
        SS->>SS: Apply phase filter (§4.8)
        SS->>SS: Boost by confidence_score
        SS->>CACHE: Cache results (10min TTL)
    end

    SS-->>API: Ranked results + key term highlights
    API-->>WEB: Display results
```

### 4.3 Answer Lifecycle Flow (Tiered + Quality + Confidence)

```mermaid
sequenceDiagram
    actor U as User / AI
    participant API as API Gateway
    participant AS as Answer Service
    participant QC as Quality Checker
    participant CONF as Confidence Calculator
    participant REV as Review Queue
    participant AI as AI Engine
    participant DB as PostgreSQL

    Note over API,AI: Stage 2: Human Answer
    U->>API: POST /api/questions/:id/answers
    API->>AS: createAnswer()
    AS->>QC: scoreQuality(answer)

    alt Quality too low (§5.2)
        QC-->>AS: Flag as low quality
        AS->>REV: Send to review queue
    else Quality OK
        AS->>DB: INSERT answer (status: published)
        AS->>CONF: calculateConfidence()
        CONF-->>DB: UPDATE confidence_score
    end

    Note over API,AI: Stage 3: AI Fallback (§11.2)
    Note over AI: Triggered after 24h timeout
    AI->>AS: createAnswer(ai_generated=true)
    AS->>DB: INSERT answer (is_ai_generated=true, labeled)
    AS->>REV: Flag for human review

    Note over API,AI: Best Answer Isolation (§11.3)
    AS->>DB: SELECT answer ORDER BY composite_best_score DESC LIMIT 1
    AS-->>API: Return best answer (expandable for others)
```

---

## 5. Technology Stack

### 5.1 Recommended Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14+ (React, App Router) | SSR for SEO, API routes, PWA support |
| **UI Library** | Radix UI + custom CSS | Accessible, composable, WCAG 2.1 AA |
| **Rich Text** | TipTap (ProseMirror-based) | Markdown + code blocks + extensible |
| **State Mgmt** | TanStack Query + Zustand | Server state + client state |
| **i18n** | next-intl | ICU format, SSR-compatible, RTL support |
| **Backend** | Node.js (Express or Fastify) | Same language as frontend, async I/O |
| **ORM** | Prisma | Type-safe, migrations, PostgreSQL native |
| **Auth** | NextAuth.js + custom JWT | OAuth2 + credentials, session management |
| **Primary DB** | PostgreSQL 16+ | JSONB, full-text search, robust |
| **Search** | Elasticsearch 8+ (with kNN) | Full-text + vector search (semantic) |
| **Cache/Queue** | Redis 7+ + BullMQ | Caching, sessions, job queues |
| **Object Store** | AWS S3 / MinIO | Image uploads, media attachments |
| **AI Embeddings** | all-MiniLM-L6-v2 (self-hosted) | Sentence embeddings for semantic search |
| **LLM** | OpenAI GPT-4o / Anthropic Claude | Summaries, tiered answers, self-improvement |
| **Speech-to-Text** | OpenAI Whisper API | Voice input transcription |
| **Translation** | Google Cloud Translate / DeepL | Multilingual support |
| **Email** | Resend / AWS SES | Transactional + digest emails |
| **Real-time** | Socket.io | WebSocket notifications |
| **Monitoring** | Prometheus + Grafana | Metrics, alerts, dashboards |
| **Logging** | Pino + ELK Stack | Structured logging, searchable |
| **CI/CD** | GitHub Actions | Automated testing + deployment |
| **Hosting** | AWS (ECS/EKS) or Vercel + Railway | Scalable, managed infrastructure |

### 5.2 Stack Diagram

```mermaid
graph TB
    subgraph "Frontend (Vercel)"
        NEXT["Next.js 14+<br/>SSR + PWA"]
        WIDGET_SDK["Embed Widget<br/>(JS Bundle via CDN)"]
    end

    subgraph "Backend (Railway / AWS ECS)"
        FASTIFY["Fastify API Server"]
        BULL["BullMQ Workers"]
        SOCKET["Socket.io Server"]
        CRON_JOB["Cron Scheduler<br/>(Weekly Reports, Self-Improvement)"]
    end

    subgraph "Data (Managed)"
        PG["PostgreSQL 16<br/>(Supabase / RDS)"]
        ES_CLUSTER["Elasticsearch 8<br/>(Elastic Cloud)"]
        REDIS_CLUSTER["Redis 7<br/>(Upstash / ElastiCache)"]
        S3["S3 / MinIO<br/>(Object Storage)"]
    end

    subgraph "AI Services"
        EMBED_SVC["Embedding Service<br/>(Self-hosted / HuggingFace)"]
        LLM_API["LLM API<br/>(OpenAI / Anthropic)"]
        WHISPER_API["Whisper API<br/>(OpenAI)"]
        TRANS_SVC["Translation API<br/>(Google / DeepL)"]
    end

    subgraph "External"
        EMAIL_SVC["Resend / SES"]
        OAUTH["Google / GitHub OAuth"]
        SLACK["Slack / Discord<br/>Webhooks"]
    end

    NEXT -->|REST + WS| FASTIFY
    NEXT -->|SSR| PG
    WIDGET_SDK -->|REST| FASTIFY
    FASTIFY --> PG
    FASTIFY --> ES_CLUSTER
    FASTIFY --> REDIS_CLUSTER
    FASTIFY --> S3
    FASTIFY --> EMBED_SVC
    FASTIFY --> LLM_API
    FASTIFY --> WHISPER_API
    FASTIFY --> TRANS_SVC
    BULL --> PG
    BULL --> ES_CLUSTER
    BULL --> EMAIL_SVC
    BULL --> SLACK
    CRON_JOB --> BULL
    SOCKET --> REDIS_CLUSTER
    FASTIFY --> OAUTH
```

---

## 6. Deployment Architecture

```mermaid
graph TB
    subgraph "CDN (CloudFront / Vercel Edge)"
        EDGE["Edge Network<br/>Static Assets + SSR Cache"]
    end

    subgraph "Load Balancer"
        ALB["Application Load Balancer<br/>SSL Termination"]
    end

    subgraph "Application Tier (Auto-Scaling)"
        API1["API Server 1"]
        API2["API Server 2"]
        API_N["API Server N"]
        WS1["WebSocket Server 1"]
        WS2["WebSocket Server 2"]
    end

    subgraph "Worker Tier (Auto-Scaling)"
        W1["Queue Worker 1<br/>(Notifications, Indexing)"]
        W2["Queue Worker 2<br/>(AI Jobs, Reports)"]
    end

    subgraph "Data Tier (Managed)"
        PG_PRIMARY["PostgreSQL Primary"]
        PG_READ["PostgreSQL Read Replica"]
        ES_NODE["Elasticsearch Cluster<br/>(3 nodes)"]
        REDIS_PRI["Redis Primary<br/>(Sessions + Cache)"]
        REDIS_PUB["Redis Pub/Sub<br/>(WebSocket fanout)"]
    end

    EDGE --> ALB
    ALB --> API1
    ALB --> API2
    ALB --> API_N
    ALB --> WS1
    ALB --> WS2

    API1 --> PG_PRIMARY
    API1 --> PG_READ
    API2 --> PG_PRIMARY
    API2 --> PG_READ
    API1 --> ES_NODE
    API1 --> REDIS_PRI
    WS1 --> REDIS_PUB
    WS2 --> REDIS_PUB
    W1 --> PG_PRIMARY
    W1 --> ES_NODE
    W2 --> PG_PRIMARY
```

**Scaling Strategy:**

| Component | Scaling Method | Trigger |
|-----------|---------------|---------|
| API Servers | Horizontal (auto-scale) | CPU > 70% or p95 latency > 200ms |
| WebSocket Servers | Horizontal + Redis Pub/Sub | Connection count > 5,000/instance |
| Queue Workers | Horizontal | Queue depth > 1,000 |
| PostgreSQL | Read replicas | Read QPS > 10,000 |
| Elasticsearch | Add nodes | Index size > 50GB or latency > 500ms |
| Redis | Cluster mode | Memory > 80% |

---

## 7. Security Architecture (§15)

```mermaid
graph TD
    subgraph "Perimeter"
        WAF["Web Application Firewall"]
        DDOS["DDoS Protection<br/>(CloudFlare / AWS Shield)"]
        TLS["TLS 1.3 Everywhere"]
    end

    subgraph "Application Security"
        SANITIZE["Input Sanitization<br/>(DOMPurify)"]
        CSRF_TOK["CSRF Tokens<br/>(Double Submit Cookie)"]
        CSP_HDR["Content Security Policy<br/>Headers"]
        RATE["Rate Limiting<br/>(Token Bucket per user/IP)"]
        PARAM["Parameterized Queries<br/>(Prisma ORM)"]
    end

    subgraph "Auth Security"
        ARGON["Argon2id Password Hashing"]
        JWT_ROT["JWT Rotation<br/>(15min access, 7d refresh)"]
        TOTP["Admin 2FA<br/>(TOTP)"]
        OAUTH_SEC["OAuth2 PKCE Flow"]
    end

    subgraph "Data Security"
        ENCRYPT["AES-256 Encryption<br/>(Sensitive Fields)"]
        ANON["Data Anonymization<br/>(Account Deletion)"]
        AUDIT["Audit Log<br/>(All Admin Actions)"]
        BACKUP["Encrypted Backups<br/>(Daily)"]
    end

    subgraph "Monitoring"
        VULN["Dependency Scanning<br/>(Snyk / Dependabot)"]
        PENTEST["Annual Penetration Testing"]
        ALERT["Security Alert Pipeline"]
    end

    WAF --> SANITIZE --> PARAM
    TLS --> JWT_ROT --> TOTP
    ENCRYPT --> BACKUP
```

---

## 8. Feature-to-Architecture Mapping

| Product Feature (§) | Services Involved | Data Stores | AI Component |
|---------------------|------------------|-------------|-------------|
| 4.1 Personalized Dashboard | Dashboard Svc, Reputation Svc | PostgreSQL, Redis (cache) | Collaborative filter |
| 4.2 Question + Voice Input | Question Svc | PostgreSQL, Elasticsearch | Whisper STT |
| 4.3 Multi-Format Answers | Answer Svc | PostgreSQL | LLM (short-form generation) |
| 4.4 Expert-Weighted Voting | Voting Svc, Reputation Svc | PostgreSQL, Redis | — |
| 4.5 Semantic Search | Search Svc | Elasticsearch (kNN) | Embedding model |
| 4.6 Tags & Categories | Tag Svc | PostgreSQL | — |
| 4.7 Reputation & Badges | Reputation Svc | PostgreSQL, Redis | — |
| 4.8 Key Term & Phase ID | Question Svc | PostgreSQL, Elasticsearch | Embedding + NER |
| 4.9 Notifications | Notification Svc | PostgreSQL, Redis (Pub/Sub) | — |
| 5.1 Duplicate Detection | Question Svc | Elasticsearch (kNN) | Embedding model |
| 5.2 Confidence Meter | Answer Svc, Voting Svc | PostgreSQL | Scoring algorithm |
| 5.3 Spam Prevention | Moderation Svc | PostgreSQL, Redis | Spam classifier |
| 5.4 Quality Check Process | Moderation Svc | PostgreSQL | Quality scorer |
| 5.5 Trust Gating | Auth Svc, Reputation Svc | PostgreSQL, Redis | — |
| 10.1 REST API | API Gateway | All | — |
| 10.2 Widget | Widget SDK (CDN) | — | — |
| 10.3 Webhooks | Webhook Svc | PostgreSQL, Redis (queue) | — |
| 11.1 AI Summaries | AI Engine | PostgreSQL | LLM |
| 11.2 Tiered Answers | AI Engine, Answer Svc | PostgreSQL, Elasticsearch | LLM |
| 11.3 Best Answer | Answer Svc | PostgreSQL | Scoring algorithm |
| 11.4 Self-Improvement | AI Engine, Cron | PostgreSQL, Elasticsearch | LLM |
| 12.3 Admin Dashboard | Analytics Svc | PostgreSQL (aggregated) | — |
| 12.4 Weekly Reports | Report Svc, Cron | PostgreSQL | — |
| 13 Multilingual | Translation Svc, i18n | PostgreSQL | Translation API |

---

## 9. Performance Targets vs Architecture

| Requirement (§14) | Target | Architecture Solution |
|-------------------|--------|----------------------|
| Page load | < 2s | Next.js SSR + CDN + Redis page cache |
| Search results | < 500ms | Elasticsearch with warm cache + Redis |
| API response (p95) | < 200ms | Fastify + connection pooling + read replicas |
| 10,000+ concurrent | Supported | Horizontal auto-scaling + WebSocket fanout via Redis Pub/Sub |
| WCAG 2.1 AA | Compliant | Radix UI primitives + semantic HTML + ARIA |

---

## 10. Environment Setup

```
├── apps/
│   ├── web/                    # Next.js frontend (user-facing + admin)
│   └── widget/                 # Embeddable widget JS SDK
├── packages/
│   ├── api/                    # Fastify backend API
│   ├── db/                     # Prisma schema + migrations
│   ├── ai/                     # AI service (embeddings, LLM, STT)
│   ├── queue/                  # BullMQ job definitions + workers
│   ├── shared/                 # Shared types, utils, constants
│   └── config/                 # Environment configs
├── docker-compose.yml          # Local dev (PG + ES + Redis + MinIO)
├── .github/workflows/          # CI/CD pipelines
├── turbo.json                  # Turborepo config
└── package.json                # Monorepo root
```

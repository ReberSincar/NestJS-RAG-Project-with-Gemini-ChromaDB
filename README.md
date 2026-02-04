# Gemini RAG Project (NestJS + ChromaDB)

This project is a high-performance **Retrieval-Augmented Generation (RAG)** system built with **NestJS**. It allows you to create knowledge bases from **PDFs**, **TXT files**, and **Websites**, and then ask questions about them using **Google Gemini AI**.

## 🌟 Features

- **Multi-Source Embedding**: Support for PDF, TXT, and Website crawling.
- **Smart Chunking**: Overlap-aware text chunking for better context preservation.
- **Vector Search**: Uses **ChromaDB** for efficient similarity search.
- **Multi-Language Support**: Automatically detects the user's question language and answers in the same language (English/Turkish/etc).
- **Docker Ready**: ChromaDB runs isolated in a Docker container with data persistence.
- **Clean Architecture**: Modular NestJS structure (Controller, Service, Repository layers).

---

## 🛠 Prerequisites

- **Node.js**: v18 or higher
- **Docker & Docker Compose**: For running ChromaDB
- **Gemini API Key**: Get it from [Google AI Studio](https://makersuite.google.com/app/apikey)

---

## 🚀 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/gemini-rag-project.git
   cd gemini-rag-project
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   CHROMA_URL=http://localhost:8000
   PORT=3000
   ```

4. **Start ChromaDB (Vector Database)**

   ```bash
   docker-compose up -d
   ```

5. **Run the Application**

   ```bash
   # Development
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

---

## 📡 API Endpoints

### 1. Create Knowledge Base (Embedding)

#### 📄 Upload PDF

**POST** `/embed/pdf`

- **Body (`form-data`)**:
  - `file`: (File) The PDF file
  - `collectionId`: (String) e.g., "my-knowledge-base"

#### 📝 Upload TXT

**POST** `/embed/txt`

- **Body (`form-data`)**:
  - `file`: (File) The TXT file
  - `collectionId`: (String) e.g., "my-knowledge-base"

#### 🌐 Embed Website

**POST** `/embed/website`

- **Body (`application/json`)**:
  ```json
  {
    "collectionId": "my-knowledge-base",
    "url": "https://example.com/about"
  }
  ```

#### ✍️ Embed Raw Text

**POST** `/embed/text`

- **Body (`application/json`)**:
  ```json
  {
    "collectionId": "my-knowledge-base",
    "text": "This is a sample text content."
  }
  ```

---

### 2. Ask Questions (RAG Query)

**POST** `/ask`

- **Body (`application/json`)**:
  ```json
  {
    "collectionId": "my-knowledge-base",
    "question": "What is the summary of the document?",
    "nResults": 3
  }
  ```
  > **Note:** The system will answer in the same language as your question

---

### 3. Manage Collections

- **GET** `/collections` - List all active collections.
- **GET** `/collections/:id` - Get details of a specific collection.
- **DELETE** `/collections/:id` - Delete a collection.

---

## 📂 Project Structure

```
src/
├── app.module.ts            # Root Module
├── main.ts                  # Entry Point
├── collection/              # Collection Management Module
├── embedding/               # Embedding & Parsing Logic
│   ├── dto/                 # Data Transfer Objects
│   └── services/
│       ├── chroma.service.ts   # ChromaDB Integration
│       ├── gemini.service.ts   # Google AI Integration
│       └── content-extractor.service.ts # File Parsers
└── query/                   # Search & QA Module
```

## 📄 License

This project is licensed under the MIT License.

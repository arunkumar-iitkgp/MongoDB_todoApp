const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Todo App - Complete Setup Guide</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #1f2937;
    background: #ffffff;
    padding: 40px;
    line-height: 1.7;
  }

  .cover {
    text-align: center;
    padding: 80px 40px;
    background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
    color: white;
    border-radius: 16px;
    margin-bottom: 40px;
    page-break-after: always;
  }

  .cover h1 {
    font-size: 36px;
    font-weight: 800;
    margin-bottom: 12px;
    letter-spacing: -0.5px;
  }

  .cover .subtitle {
    font-size: 18px;
    color: #a5b4fc;
    margin-bottom: 8px;
  }

  .cover .date {
    font-size: 14px;
    color: #6b7280;
    margin-top: 40px;
  }

  .cover .tech-stack {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 30px;
    flex-wrap: wrap;
  }

  .cover .tech-badge {
    background: rgba(255,255,255,0.1);
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 14px;
    border: 1px solid rgba(255,255,255,0.15);
  }

  .toc {
    page-break-after: always;
    margin-bottom: 40px;
  }

  .toc h2 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 24px;
    color: #111827;
    border-bottom: 3px solid #6366f1;
    padding-bottom: 8px;
    display: inline-block;
  }

  .toc-list {
    list-style: none;
  }

  .toc-list li {
    padding: 10px 0;
    border-bottom: 1px solid #e5e7eb;
    font-size: 15px;
  }

  .toc-list li a { color: #6366f1; text-decoration: none; font-weight: 500; }
  .toc-list li a:hover { text-decoration: underline; }
  .toc-list .toc-sub { padding-left: 24px; font-size: 14px; color: #6b7280; }

  .section {
    margin-bottom: 40px;
    page-break-inside: avoid;
  }

  .section h2 {
    font-size: 26px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 3px solid #6366f1;
    display: inline-block;
  }

  .section h3 {
    font-size: 18px;
    font-weight: 600;
    color: #374151;
    margin-top: 24px;
    margin-bottom: 12px;
    padding-left: 12px;
    border-left: 4px solid #6366f1;
  }

  .section h4 {
    font-size: 15px;
    font-weight: 600;
    color: #4b5563;
    margin-top: 16px;
    margin-bottom: 8px;
  }

  .section p { margin-bottom: 12px; font-size: 14px; color: #4b5563; }

  .highlight-box {
    background: #f0fdf4;
    border: 1px solid #86efac;
    border-left: 4px solid #22c55e;
    padding: 16px 20px;
    border-radius: 8px;
    margin: 16px 0;
  }

  .highlight-box strong { color: #15803d; }

  .warning-box {
    background: #fefce8;
    border: 1px solid #fde68a;
    border-left: 4px solid #eab308;
    padding: 16px 20px;
    border-radius: 8px;
    margin: 16px 0;
  }

  .warning-box strong { color: #a16207; }

  .info-box {
    background: #eff6ff;
    border: 1px solid #93c5fd;
    border-left: 4px solid #3b82f6;
    padding: 16px 20px;
    border-radius: 8px;
    margin: 16px 0;
  }

  .info-box strong { color: #1d4ed8; }

  .code-block {
    background: #1e293b;
    color: #e2e8f0;
    padding: 16px 20px;
    border-radius: 10px;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.6;
    overflow-x: auto;
    margin: 12px 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .code-block .comment { color: #94a3b8; font-style: italic; }
  .code-block .cmd { color: #22d3ee; }
  .code-block .output { color: #a78bfa; }

  ol.steps { margin: 12px 0 12px 24px; }
  ol.steps li { margin-bottom: 10px; font-size: 14px; color: #4b5563; }

  ul.checklist { list-style: none; margin: 12px 0; }
  ul.checklist li { 
    padding: 8px 12px;
    margin-bottom: 6px;
    background: #f9fafb;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    font-size: 14px;
  }
  ul.checklist li::before { content: '☐ '; color: #6366f1; font-weight: 700; }
  ul.checklist li.done::before { content: '✅ '; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 13px;
  }

  table th {
    background: #f3f4f6;
    font-weight: 600;
    text-align: left;
    padding: 10px 14px;
    border: 1px solid #d1d5db;
  }

  table td {
    padding: 10px 14px;
    border: 1px solid #d1d5db;
  }

  table tr:nth-child(even) { background: #fafafa; }

  .page-break { page-break-before: always; }

  @media print {
    body { padding: 0; }
    .cover { border-radius: 0; }
  }
</style>
</head>
<body>

<!-- ===== COVER PAGE ===== -->
<div class="cover">
  <h1>📋 Todo App</h1>
  <p class="subtitle">Complete CI/CD Setup Guide</p>
  <p style="color:#9ca3af; font-size:14px;">Node.js + Express + MongoDB + Jenkins + Docker</p>
  <div class="tech-stack">
    <span class="tech-badge">Node.js 20</span>
    <span class="tech-badge">Express 5</span>
    <span class="tech-badge">MongoDB</span>
    <span class="tech-badge">Jest</span>
    <span class="tech-badge">Jenkins</span>
    <span class="tech-badge">Docker</span>
  </div>
  <p class="date">Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
</div>

<!-- ===== TABLE OF CONTENTS ===== -->
<div class="toc">
  <h2>📑 Table of Contents</h2>
  <ol class="toc-list">
    <li><a href="#s1">1. Overview — What We Built</a></li>
    <li class="toc-sub">1.1 Project Stack</li>
    <li class="toc-sub">1.2 Jenkins Pipeline Flow</li>
    <li><a href="#s2">2. Prerequisites</a></li>
    <li class="toc-sub">2.1 Software You Need to Install</li>
    <li class="toc-sub">2.2 Accounts You Need</li>
    <li><a href="#s3">3. Push to GitHub</a></li>
    <li class="toc-sub">3.1 Initialize Git</li>
    <li class="toc-sub">3.2 Create GitHub Repository</li>
    <li class="toc-sub">3.3 Push the Code</li>
    <li><a href="#s4">4. Install &amp; Configure Docker</a></li>
    <li class="toc-sub">4.1 Installing Docker Desktop</li>
    <li class="toc-sub">4.2 Building the Docker Image</li>
    <li class="toc-sub">4.3 Running the App in Docker</li>
    <li class="toc-sub">4.4 Docker Hub Account &amp; Push</li>
    <li><a href="#s5">5. Install &amp; Configure Jenkins</a></li>
    <li class="toc-sub">5.1 Installing Jenkins</li>
    <li class="toc-sub">5.2 Installing Plugins</li>
    <li class="toc-sub">5.3 Configuring Credentials</li>
    <li class="toc-sub">5.4 Creating the Pipeline Job</li>
    <li class="toc-sub">5.5 Running the Pipeline</li>
    <li><a href="#s6">6. Understanding the Jenkins Pipeline</a></li>
    <li class="toc-sub">6.1 Stage-by-Stage Breakdown</li>
    <li class="toc-sub">6.2 Failure Scenarios</li>
    <li><a href="#s7">7. Running the App Locally</a></li>
    <li class="toc-sub">7.1 Without Docker</li>
    <li class="toc-sub">7.2 With Docker</li>
    <li><a href="#s8">8. Running Tests</a></li>
    <li><a href="#s9">9. Project File Structure</a></li>
    <li><a href="#s10">10. Troubleshooting</a></li>
  </ol>
</div>

<!-- ===== SECTION 1: OVERVIEW ===== -->
<div class="section page-break" id="s1">
  <h2>1. Overview — What We Built</h2>
  <p>This is a <strong>Todo Application</strong> built with Node.js, Express, and MongoDB. It includes a full <strong>CI/CD pipeline</strong> using Jenkins, with automated testing, code quality checks, security audits, Docker image building, and deployment readiness.</p>

  <h3>1.1 Project Stack</h3>
  <table>
    <tr><th>Component</th><th>Technology</th></tr>
    <tr><td>Backend Framework</td><td>Express 5 (Node.js)</td></tr>
    <tr><td>Database</td><td>MongoDB (via Mongoose ODM)</td></tr>
    <tr><td>Frontend</td><td>Vanilla JavaScript + CSS (SPA)</td></tr>
    <tr><td>Testing</td><td>Jest + Supertest + mongodb-memory-server</td></tr>
    <tr><td>Code Quality</td><td>ESLint</td></tr>
    <tr><td>CI/CD</td><td>Jenkins (Declarative Pipeline)</td></tr>
    <tr><td>Containerization</td><td>Docker (multi-stage, production)</td></tr>
  </table>

  <h3>1.2 Jenkins Pipeline Flow</h3>
  <div class="highlight-box">
    <strong>Pipeline Sequence:</strong><br><br>
    1. <strong>Checkout</strong> — Pull code from Git<br>
    2. <strong>Install Dependencies</strong> — npm ci<br>
    3. <strong>Code Quality Checks (Parallel)</strong> — Lint + Security Audit + Unit Tests all run concurrently<br>
    4. <strong>Build Check</strong> — Syntax validation<br>
    5. <strong>Docker Build</strong> — Build production image (main branch only)<br>
    6. <strong>Docker Push</strong> — Push to registry (main branch only)<br>
    7. <strong>Post</strong> — Cleanup + notifications
  </div>
</div>

<!-- ===== SECTION 2: PREREQUISITES ===== -->
<div class="section page-break" id="s2">
  <h2>2. Prerequisites</h2>

  <h3>2.1 Software You Need to Install</h3>
  <ul class="checklist">
    <li><strong>Git</strong> — <a href="https://git-scm.com/downloads">git-scm.com</a></li>
    <li><strong>Node.js 20+</strong> — <a href="https://nodejs.org/">nodejs.org</a> (includes npm)</li>
    <li><strong>Docker Desktop</strong> — <a href="https://www.docker.com/products/docker-desktop/">docker.com</a></li>
    <li><strong>Jenkins</strong> — <a href="https://www.jenkins.io/download/">jenkins.io</a> (WAR or installer)</li>
    <li><strong>MongoDB</strong> (for local testing) — <a href="https://www.mongodb.com/try/download/community">mongodb.com</a></li>
    <li><strong>MongoDB Compass</strong> (optional, GUI) — <a href="https://www.mongodb.com/products/compass">mongodb.com/products/compass</a></li>
  </ul>

  <div class="info-box">
    <strong>Note:</strong> You don't need Docker running to develop locally. Docker is only needed when you want to build and run the containerized app or use the Jenkins pipeline's Docker build/push stages.
  </div>

  <h3>2.2 Accounts You Need</h3>
  <ul class="checklist">
    <li><strong>GitHub (or GitLab/Bitbucket)</strong> — to host your repository</li>
    <li><strong>Docker Hub</strong> — <a href="https://hub.docker.com/">hub.docker.com</a> (free account) to store Docker images</li>
  </ul>
</div>

<!-- ===== SECTION 3: PUSH TO GITHUB ===== -->
<div class="section page-break" id="s3">
  <h2>3. Push to GitHub</h2>

  <h3>3.1 Initialize Git</h3>
  <p>If Git is not already initialized in the project:</p>
  <div class="code-block">cd C:\\Users\\arunk\\monogdb
git init
git add .
git commit -m "Initial commit - Todo App with full CI/CD pipeline"</div>

  <h3>3.2 Create a GitHub Repository</h3>
  <ol class="steps">
    <li>Go to <a href="https://github.com/new">github.com/new</a></li>
    <li>Repository name: <strong>todo-app</strong> (or any name you prefer)</li>
    <li>Keep it <strong>Public</strong> (or Private — either works)</li>
    <li>Do <strong>not</strong> initialize with README, .gitignore, or license (we already have these)</li>
    <li>Click <strong>"Create repository"</strong></li>
  </ol>

  <h3>3.3 Push the Code</h3>
  <div class="code-block"># Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/todo-app.git
git branch -M main
git push -u origin main</div>

  <div class="highlight-box">
    <strong>✅ Done!</strong> Your code is now on GitHub. Jenkins will pull from this repository.
  </div>
</div>

<!-- ===== SECTION 4: DOCKER ===== -->
<div class="section page-break" id="s4">
  <h2>4. Install &amp; Configure Docker</h2>

  <div class="warning-box">
    <strong>⚠️ Do you need Docker?</strong> The app runs fine without Docker for local development. Docker is only needed for:
    <ul style="margin-top:8px; padding-left:20px;">
      <li>Building a production container image</li>
      <li>The Jenkins pipeline's Docker build/push stages</li>
      <li>Running the app in a containerized environment</li>
    </ul>
  </div>

  <h3>4.1 Installing Docker Desktop</h3>
  <ol class="steps">
    <li>Download Docker Desktop from <a href="https://www.docker.com/products/docker-desktop/">docker.com</a></li>
    <li>Run the installer and follow the setup wizard</li>
    <li>After installation, <strong>restart your computer</strong></li>
    <li>Open Docker Desktop — it should show the Docker whale icon</li>
    <li>Verify it works:</li>
  </ol>
  <div class="code-block">docker --version
docker info</div>

  <h3>4.2 Building the Docker Image</h3>
  <p>Navigate to the project folder and build:</p>
  <div class="code-block">cd C:\\Users\\arunk\\monogdb
docker build -t todo-app .</div>

  <p>This uses the <code>Dockerfile</code> in the project to create a production-ready image with:</p>
  <ul style="margin:8px 0 12px 24px;">
    <li>Node.js 20 (Alpine Linux — very small footprint)</li>
    <li>Only production dependencies (no dev dependencies like Jest)</li>
    <li>Non-root user for security</li>
    <li>Health check configured</li>
  </ul>

  <h3>4.3 Running the App in Docker</h3>
  <div class="code-block"># Run the container (replace MONGO_URI with your MongoDB connection)
docker run -p 3000:3000 -e MONGO_URI="mongodb://host.docker.internal:27017/todo-app" todo-app</div>

  <p>Then open <a href="http://localhost:3000">http://localhost:3000</a> in your browser.</p>

  <div class="info-box">
    <strong>💡 Note:</strong> <code>host.docker.internal</code> is a special Docker DNS name that lets the container reach MongoDB running on your host machine. If MongoDB is also running in Docker, use the container name instead.
  </div>

  <h3>4.4 Docker Hub Account &amp; Push</h3>
  <ol class="steps">
    <li>Create a free account at <a href="https://hub.docker.com/">hub.docker.com</a></li>
    <li>Log in from command line:</li>
  </ol>
  <div class="code-block">docker login -u YOUR_DOCKER_HUB_USERNAME</div>

  <p>Then tag and push your image:</p>
  <div class="code-block"># Tag with your Docker Hub username
docker tag todo-app YOUR_USERNAME/todo-app:latest
docker tag todo-app YOUR_USERNAME/todo-app:v1.0.0

# Push to Docker Hub
docker push YOUR_USERNAME/todo-app:latest
docker push YOUR_USERNAME/todo-app:v1.0.0</div>

  <div class="highlight-box">
    <strong>✅ Done!</strong> Your image is now on Docker Hub. The Jenkins pipeline automates this for you on every push to <code>main</code>.
  </div>
</div>

<!-- ===== SECTION 5: JENKINS ===== -->
<div class="section page-break" id="s5">
  <h2>5. Install &amp; Configure Jenkins</h2>

  <h3>5.1 Installing Jenkins</h3>
  <p><strong>Option A: Using the Windows installer</strong></p>
  <ol class="steps">
    <li>Download the Windows installer from <a href="https://www.jenkins.io/download/">jenkins.io/download</a></li>
    <li>Run the installer — it will install Jenkins as a Windows service</li>
    <li>Complete the setup wizard at <a href="http://localhost:8080">http://localhost:8080</a></li>
    <li>Use the initial admin password from: <code>C:\\ProgramData\\Jenkins\\.jenkins\\secrets\\initialAdminPassword</code></li>
    <li>Install the <strong>"suggested plugins"</strong></li>
    <li>Create your admin user</li>
  </ol>

  <p><strong>Option B: Using Docker (easier)</strong></p>
  <div class="code-block">docker run -p 8080:8080 -p 50000:50000 \\
  -v jenkins_home:/var/jenkins_home \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  jenkins/jenkins:lts</div>

  <div class="info-box">
    <strong>💡 Recommended:</strong> The Docker approach is simpler and includes Docker CLI inside Jenkins automatically (with the socket mount). Access Jenkins at <a href="http://localhost:8080">http://localhost:8080</a>.
  </div>

  <h3>5.2 Required Jenkins Plugins</h3>
  <p>If you installed "suggested plugins", most are already there. Verify these are installed:</p>
  <table>
    <tr><th>Plugin</th><th>Purpose</th></tr>
    <tr><td>Pipeline</td><td>For Declarative Pipeline syntax</td></tr>
    <tr><td>Git</td><td>To pull code from GitHub</td></tr>
    <tr><td>Docker Pipeline</td><td>To build/push Docker images</td></tr>
    <tr><td>Credentials Binding</td><td>To securely use credentials</td></tr>
    <tr><td>Blue Ocean</td><td>Better pipeline UI (optional but nice)</td></tr>
  </table>

  <p>To install plugins: <strong>Manage Jenkins → Plugins → Available plugins</strong></p>

  <h3>5.3 Configuring Credentials</h3>
  <p>Go to <strong>Manage Jenkins → Credentials → System → Global credentials → Add Credentials</strong></p>

  <h4>Credential 1: Docker Hub (for Docker push)</h4>
  <table>
    <tr><th>Field</th><th>Value</th></tr>
    <tr><td>Kind</td><td>Username with password</td></tr>
    <tr><td>Username</td><td><em>Your Docker Hub username</em></td></tr>
    <tr><td>Password</td><td><em>Your Docker Hub password or access token</em></td></tr>
    <tr><td>ID</td><td><strong>docker-registry-credentials</strong></td></tr>
    <tr><td>Description</td><td>Docker Hub credentials</td></tr>
  </table>

  <h4>Credential 2: MongoDB URI (for pipeline tests)</h4>
  <table>
    <tr><th>Field</th><th>Value</th></tr>
    <tr><td>Kind</td><td>Secret text</td></tr>
    <tr><td>Secret</td><td><code>mongodb://localhost:27017/todo-app</code></td></tr>
    <tr><td>ID</td><td><strong>mongo-uri</strong></td></tr>
    <tr><td>Description</td><td>MongoDB connection string</td></tr>
  </table>

  <h3>5.4 Creating the Pipeline Job</h3>
  <ol class="steps">
    <li>From Jenkins dashboard, click <strong>"New Item"</strong></li>
    <li>Enter name: <strong>todo-app-pipeline</strong></li>
    <li>Select <strong>"Pipeline"</strong> and click OK</li>
    <li>Scroll to the <strong>"Pipeline"</strong> section</li>
    <li>Set <strong>Definition</strong> → <strong>"Pipeline script from SCM"</strong></li>
    <li>Set <strong>SCM</strong> → <strong>Git</strong></li>
    <li>Enter Repository URL: <code>https://github.com/YOUR_USERNAME/todo-app.git</code></li>
    <li>Branch: <code>*/main</code></li>
    <li>Script Path: <code>Jenkinsfile</code></li>
    <li>Click <strong>"Save"</strong></li>
  </ol>

  <div class="highlight-box">
    <strong>✅ Jenkins will automatically find the Jenkinsfile</strong> from your repository and run the pipeline!
  </div>

  <h3>5.5 Running the Pipeline</h3>
  <ol class="steps">
    <li>From the pipeline page, click <strong>"Build Now"</strong></li>
    <li>Watch the pipeline run stage by stage in the <strong>"Stage View"</strong></li>
    <li>You'll see parallel stages (Lint, Security, Tests) running concurrently</li>
    <li>If on <code>main</code> branch, Docker build and push will run after all checks pass</li>
  </ol>

  <div class="info-box">
    <strong>💡 Pro tip:</strong> Install the <strong>Blue Ocean</strong> plugin for a much nicer pipeline visualization. Click "Open Blue Ocean" from the Jenkins dashboard.
  </div>
</div>

<!-- ===== SECTION 6: PIPELINE BREAKDOWN ===== -->
<div class="section page-break" id="s6">
  <h2>6. Understanding the Jenkins Pipeline</h2>

  <h3>6.1 Stage-by-Stage Breakdown</h3>
  <table>
    <tr><th>#</th><th>Stage</th><th>What it does</th><th>What can go wrong</th></tr>
    <tr>
      <td>1</td><td><strong>Checkout</strong></td>
      <td>Pulls code from GitHub</td>
      <td>Network down, bad credentials, wrong branch</td>
    </tr>
    <tr>
      <td>2</td><td><strong>Install Dependencies</strong></td>
      <td>Runs <code>npm ci</code> to install packages</td>
      <td>Registry unreachable, lockfile mismatch, disk full</td>
    </tr>
    <tr>
      <td>3a</td><td><strong>Lint</strong> (parallel)</td>
      <td>ESLint code quality check</td>
      <td>Code style violations exceed threshold</td>
    </tr>
    <tr>
      <td>3b</td><td><strong>Security Audit</strong> (parallel)</td>
      <td><code>npm audit</code> checks for CVEs</td>
      <td>High/critical vulnerabilities found</td>
    </tr>
    <tr>
      <td>3c</td><td><strong>Unit Tests</strong> (parallel)</td>
      <td>Runs 31 Jest tests with in-memory MongoDB</td>
      <td>Tests fail, flaky tests, timeout</td>
    </tr>
    <tr>
      <td>4</td><td><strong>Build Check</strong></td>
      <td>Syntax validation of all JS files</td>
      <td>Syntax errors in source code</td>
    </tr>
    <tr>
      <td>5</td><td><strong>Docker Build</strong> (main only)</td>
      <td>Builds production Docker image</td>
      <td>Docker not available, Dockerfile error</td>
    </tr>
    <tr>
      <td>6</td><td><strong>Docker Push</strong> (main only)</td>
      <td>Pushes image to Docker Hub</td>
      <td>Registry credentials expired, network error</td>
    </tr>
  </table>

  <h3>6.2 Failure Scenarios</h3>
  
  <div class="warning-box">
    <strong>❌ Pipeline fails at Docker Build/Push</strong><br>
    <strong>Fix:</strong> Ensure Docker is installed on the Jenkins node and the <code>docker-registry-credentials</code> credential is configured correctly in Jenkins.
  </div>

  <div class="warning-box">
    <strong>❌ Tests fail</strong><br>
    <strong>Fix:</strong> Run <code>npm test</code> locally to reproduce. Check test output in the Jenkins console log.
  </div>

  <div class="warning-box">
    <strong>❌ Lint fails</strong><br>
    <strong>Fix:</strong> Run <code>npm run lint</code> locally and fix the issues. Or adjust the ESLint config if rules are too strict.
  </div>

  <div class="warning-box">
    <strong>❌ Security audit fails</strong><br>
    <strong>Fix:</strong> Run <code>npm audit</code> to see the vulnerabilities. Update affected packages with <code>npm update</code> or <code>npm audit fix</code>.
  </div>
</div>

<!-- ===== SECTION 7: RUNNING LOCALLY ===== -->
<div class="section page-break" id="s7">
  <h2>7. Running the App Locally</h2>

  <h3>7.1 Without Docker</h3>
  <ol class="steps">
    <li>Make sure MongoDB is running locally (default: <code>mongodb://localhost:27017</code>)</li>
    <li>Install dependencies: <code>npm install</code></li>
    <li>Start the app: <code>npm start</code></li>
    <li>Open <a href="http://localhost:3000">http://localhost:3000</a></li>
  </ol>

  <div class="code-block"># Quick start
npm install
npm start
# App runs at http://localhost:3000</div>

  <h3>7.2 With Docker</h3>
  <div class="code-block"># Build the image
docker build -t todo-app .

# Run with MongoDB on host
docker run -p 3000:3000 -e MONGO_URI="mongodb://host.docker.internal:27017/todo-app" todo-app</div>

  <div class="highlight-box">
    <strong>💡 Tip:</strong> If you don't have MongoDB installed, use Docker Compose:
    <div class="code-block" style="margin-top:8px;"># docker-compose.yml
version: '3'
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/todo-app
    depends_on:
      - mongodb</div>
  </div>
</div>

<!-- ===== SECTION 8: TESTS ===== -->
<div class="section page-break" id="s8">
  <h2>8. Running Tests</h2>
  <p>The project includes <strong>31 comprehensive unit tests</strong> covering all API routes:</p>

  <table>
    <tr><th>API Route</th><th>Tests</th><th>Edge Cases</th></tr>
    <tr><td>POST /api/todos</td><td>5</td><td>valid, empty, missing, trimmed, >200 chars</td></tr>
    <tr><td>GET /api/todos</td><td>3</td><td>empty list, sort order, sub-items</td></tr>
    <tr><td>GET /api/todos/:id</td><td>3</td><td>found, 404, invalid ObjectId</td></tr>
    <tr><td>PUT /api/todos/:id</td><td>6</td><td>update title, toggle, both, empty, 404</td></tr>
    <tr><td>DELETE /api/todos/:id</td><td>2</td><td>existing, non-existent</td></tr>
    <tr><td>POST /:id/items</td><td>4</td><td>add, multiple, empty, 404</td></tr>
    <tr><td>PUT /:id/items/:itemId</td><td>5</td><td>title, toggle, 404 todo, 404 sub-item</td></tr>
    <tr><td>DELETE /:id/items/:itemId</td><td>3</td><td>delete, 404 todo, 404 sub-item</td></tr>
    <tr><td>Full workflow</td><td>1</td><td>create → sub-items → toggle → delete</td></tr>
  </table>

  <h3>Run tests:</h3>
  <div class="code-block"># Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run syntax check only
npm run test:syntax</div>

  <div class="info-box">
    <strong>🔬 How it works:</strong> Tests use <code>mongodb-memory-server</code> which downloads and runs a real MongoDB binary in-memory. No separate MongoDB installation is needed for testing. Each test run gets a completely fresh database.
  </div>
</div>

<!-- ===== SECTION 9: FILE STRUCTURE ===== -->
<div class="section page-break" id="s9">
  <h2>9. Project File Structure</h2>
  <div class="code-block">C:\\Users\\arunk\\monogdb\\
├── 📄 <strong>Jenkinsfile</strong>          # CI/CD pipeline definition
├── 📄 <strong>Dockerfile</strong>            # Production container build
├── 📄 <strong>package.json</strong>          # Dependencies &amp; scripts
├── 📄 <strong>server.js</strong>             # Express app entry point
├── 📄 <strong>.eslintrc.json</strong>        # ESLint configuration
├── 📄 <strong>.gitignore</strong>            # Files to exclude from Git
│
├── 📁 <strong>routes/</strong>
│   └── 📄 todos.js              # All API route handlers
│
├── 📁 <strong>models/</strong>
│   └── 📄 Todo.js               # Mongoose schema (todos + sub-items)
│
├── 📁 <strong>public/</strong>
│   ├── 📄 index.html            # SPA frontend
│   ├── 📄 style.css             # Styling
│   └── 📄 script.js             # Frontend logic
│
├── 📁 <strong>__tests__/</strong>
│   ├── 📄 setup.js              # MongoDB memory server helper
│   └── 📄 todos.test.js         # 31 comprehensive API tests
│
└── 📁 <strong>scripts/</strong>
    └── 📄 generate-guide.js     # This PDF generator</div>
</div>

<!-- ===== SECTION 10: TROUBLESHOOTING ===== -->
<div class="section page-break" id="s10">
  <h2>10. Troubleshooting</h2>

  <table>
    <tr><th>Problem</th><th>Solution</th></tr>
    <tr>
      <td>npm install fails</td>
      <td>Delete <code>node_modules</code> and <code>package-lock.json</code>, then run <code>npm install</code> again</td>
    </tr>
    <tr>
      <td>Docker build fails</td>
      <td>Make sure Docker Desktop is running. Check the Dockerfile for syntax errors</td>
    </tr>
    <tr>
      <td>Jenkins can't find Git repo</td>
      <td>Verify the repository URL in the pipeline config. Make sure the repo is not private without SSH keys configured</td>
    </tr>
    <tr>
      <td>Tests fail with MongoDB timeout</td>
      <td>mongodb-memory-server needs to download the MongoDB binary on first run. This can take a few minutes. Increase <code>testTimeout</code> in package.json</td>
    </tr>
    <tr>
      <td>Docker push fails in Jenkins</td>
      <td>Verify <code>docker-registry-credentials</code> exists in Jenkins credentials. Check that the Docker Hub username/password is correct</td>
    </tr>
    <tr>
      <td>Port 3000 already in use</td>
      <td>Change the port: <code>set PORT=3001 && npm start</code> (Windows) or <code>PORT=3001 npm start</code> (Mac/Linux)</td>
    </tr>
    <tr>
      <td>MongoDB connection refused</td>
      <td>Make sure MongoDB is running. Default: <code>mongodb://localhost:27017</code>. Check if the MongoDB service is started</td>
    </tr>
    <tr>
      <td>ESLint not found in pipeline</td>
      <td>The lint stage is conditional — it only runs if an ESLint config file exists. We have one, so verify <code>.eslintrc.json</code> is committed</td>
    </tr>
  </table>

  <div class="highlight-box" style="margin-top:30px;">
    <strong>🎉 You're all set!</strong><br><br>
    Your Todo App now has a complete CI/CD pipeline with:
    <ul style="margin-top:10px; padding-left:20px;">
      <li>✅ Automated testing (31 tests)</li>
      <li>✅ Code quality checks (ESLint)</li>
      <li>✅ Security auditing (npm audit)</li>
      <li>✅ Parallel pipeline stages for faster feedback</li>
      <li>✅ Docker containerization</li>
      <li>✅ Automated Docker build &amp; push</li>
      <li>✅ Jenkins Declarative Pipeline</li>
    </ul>
  </div>
</div>

</body>
</html>`;

async function generatePDF() {
  console.log('🚀 Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  
  // Set content and wait for fonts to load
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  // Give fonts time to render
  await page.evaluate(() => document.fonts.ready);

  const outputPath = path.join(__dirname, '..', 'Todo-App-CI-CD-Setup-Guide.pdf');
  
  console.log('📄 Generating PDF...');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:9px; color:#9ca3af; padding:5px 20mm; width:100%; text-align:center;">Todo App — Complete CI/CD Setup Guide</div>',
    footerTemplate: '<div style="font-size:9px; color:#9ca3af; padding:5px 20mm; width:100%; text-align:center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
  });

  await browser.close();
  console.log(`✅ PDF generated successfully: ${outputPath}`);
  return outputPath;
}

generatePDF().catch(err => {
  console.error('❌ Failed to generate PDF:', err);
  process.exit(1);
});

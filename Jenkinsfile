/*
 * ============================================================
 *  Jenkinsfile — Todo App (Node.js / Express / MongoDB)
 * ============================================================
 *  Pipeline checks included:
 *     1. Checkout (SCM)            2. Install Dependencies
 *     3. Code Quality Checks (parallel) — Lint / Security / Tests
 *     4. Build Check (syntax)       5. Docker Build
 *     6. Docker Push (main only)    7. Post (cleanup + notify)
 * ============================================================
 *
 *  Prerequisites for Docker stages:
 *   - Jenkins credentials:
 *       • 'docker-registry-credentials' (Username with Password type)
 *         — OR — update the `withCredentials` block to match your setup
 *       • Docker must be installed on the Jenkins node
 *   - Environment variables (set in Jenkins or via credentials):
 *       • IMAGE_NAME    — Docker image name (default: 'todo-app')
 *       • IMAGE_TAG     — Override image tag (default: build number + commit)
 *       • DOCKER_REGISTRY — Registry host (default: Docker Hub, no prefix)
 * ============================================================
 */

pipeline {
    // ------------------------------------------------------------------
    // Agent: use 'none' so we can set per-stage agents
    //   - Code stages (1-4): run inside the node:20-alpine Docker image
    //   - Docker stages (5-6): run on the Jenkins node directly (needs Docker)
    // ------------------------------------------------------------------
    agent none

    // ------------------------------------------------------------------
    // Environment variables
    // ------------------------------------------------------------------
    environment {
        // MongoDB connection string — provided via Jenkins Credentials
        MONGO_URI = credentials('mongo-uri')

        // Docker image configuration
        IMAGE_NAME = 'todo-app'
        IMAGE_TAG  = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'latest'}"
        // DOCKER_REGISTRY = 'my-registry.example.com'  // uncomment for private registry
        DOCKER_REGISTRY = ''  // empty = Docker Hub

        // Slack webhook for notifications (optional)
        // SLACK_WEBHOOK = credentials('slack-webhook')
    }

    // ------------------------------------------------------------------
    // Pipeline triggers
    // ------------------------------------------------------------------
    triggers {
        // Poll SCM every 5 minutes (or use webhooks — preferred)
        pollSCM('H/5 * * * *')

        // Trigger on push to main branch (requires webhook configured)
    }

    // ------------------------------------------------------------------
    // Build options
    // ------------------------------------------------------------------
    options {
        // Prevent concurrent builds on the same branch
        disableConcurrentBuilds()

        // Abort if the build runs longer than 15 minutes
        timeout(time: 15, unit: 'MINUTES')

        // Keep only the last 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))

        // Skip default checkout — we do it explicitly in the first stage
        skipDefaultCheckout true

        // Retry the build once on agent failure
        retry(1)
    }

    // ------------------------------------------------------------------
    // Stages
    // ------------------------------------------------------------------
    stages {
        // ---- Stage 1: Checkout ------------------------------------
        stage('1. Checkout') {
            agent {
                docker {
                    image 'node:20-alpine'
                    args '-v /etc/ssl/certs:/etc/ssl/certs:ro'
                }
            }
            steps {
                checkout scm
            }
            post {
                failure {
                    error '❌ Checkout failed — check SCM credentials and connectivity'
                }
            }
        }

        // ---- Stage 2: Install Dependencies -------------------------
        stage('2. Install Dependencies') {
            agent {
                docker {
                    image 'node:20-alpine'
                    args '-v /etc/ssl/certs:/etc/ssl/certs:ro'
                }
            }
            steps {
                sh '''
                    echo "📦 Installing dependencies..."
                    npm ci --ignore-scripts
                '''
            }
            post {
                failure {
                    error '❌ Dependency install failed — check registry, lockfile, or disk space'
                }
            }
        }

        // ---- Stage 3: Code Quality Checks (parallel) -----------------
        // Lint, Security Audit, and Unit Tests run concurrently
        // to reduce total pipeline feedback time.
        stage('3. Code Quality Checks') {
            parallel {
                // ---- 3a. Lint / Static Analysis --------------------
                stage('Lint') {
                    agent {
                        docker {
                            image 'node:20-alpine'
                            args '-v /etc/ssl/certs:/etc/ssl/certs:ro'
                        }
                    }
                    when {
                        expression { fileExists('.eslintrc.json') || fileExists('.eslintrc.js') || fileExists('.eslintrc') }
                    }
                    steps {
                        sh '''
                            echo "🔍 Running ESLint..."
                            npx eslint . --max-warnings=50
                        '''
                    }
                    post {
                        failure {
                            echo '❌ Lint failed — fix code style issues or reduce warnings'
                        }
                        unstable {
                            echo '⚠️  Lint warnings exceeded threshold (max: 50)'
                        }
                    }
                }

                // ---- 3b. Security Audit (npm audit) -----------------
                stage('Security') {
                    agent {
                        docker {
                            image 'node:20-alpine'
                            args '-v /etc/ssl/certs:/etc/ssl/certs:ro'
                        }
                    }
                    steps {
                        sh '''
                            echo "🔒 Running npm security audit..."
                            npm audit --audit-level=high
                        '''
                    }
                    post {
                        failure {
                            echo '❌ Security audit found vulnerabilities — review npm audit output'
                        }
                        unstable {
                            echo '⚠️  Moderate vulnerabilities found — consider updating dependencies'
                        }
                    }
                }

                // ---- 3c. Unit Tests --------------------------------
                stage('Tests') {
                    agent {
                        docker {
                            image 'node:20-alpine'
                            args '-v /etc/ssl/certs:/etc/ssl/certs:ro'
                        }
                    }
                    steps {
                        sh '''
                            echo "🧪 Running unit tests..."
                            npm test
                        '''
                    }
                    post {
                        failure {
                            echo '❌ Tests failed — check test output for details'
                        }
                        unstable {
                            echo '⚠️  Some tests are unstable — check for flaky tests'
                        }
                    }
                }
            }
        }

        // ---- Stage 4: Build Check (syntax validation) --------------
        stage('4. Build Check') {
            agent {
                docker {
                    image 'node:20-alpine'
                    args '-v /etc/ssl/certs:/etc/ssl/certs:ro'
                }
            }
            steps {
                sh '''
                    echo "🔧 Running syntax validation..."
                    node --check server.js
                    node --check routes/todos.js
                    node --check models/Todo.js
                    echo "✅ All files passed syntax check"
                '''
            }
            post {
                failure {
                    error '❌ Build check failed — syntax error in source files'
                }
            }
        }

        // ---- Stage 5: Docker Build ---------------------------------
        // NOTE: Stages 5-6 run on the Jenkins node (not inside a container)
        // because they need access to the host's Docker daemon.
        // The Jenkins node must have Docker CLI installed.
        stage('5. Docker Build') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Verify Docker is available before proceeding
                    sh 'docker info > /dev/null 2>&1 || { echo "❌ Docker is not available on this node"; exit 1; }'

                    def registryPrefix = env.DOCKER_REGISTRY ? "${env.DOCKER_REGISTRY}/" : ''
                    def fullImageName = "${registryPrefix}${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                    def latestTag = "${registryPrefix}${env.IMAGE_NAME}:latest"

                    echo "🐳 Building Docker image: ${fullImageName}"

                    sh """
                        docker build \
                            --pull \
                            --label "BUILD_NUMBER=${env.BUILD_NUMBER}" \
                            --label "GIT_COMMIT=${env.GIT_COMMIT}" \
                            --label "BUILD_URL=${env.BUILD_URL}" \
                            -t ${fullImageName} \
                            -t ${latestTag} \
                            -f Dockerfile \
                            .
                    """

                    echo "✅ Docker image built successfully: ${fullImageName}"

                    // Store the image name for the push stage
                    env.DOCKER_IMAGE = fullImageName
                }
            }
            post {
                failure {
                    error '❌ Docker build failed — check Dockerfile and build logs'
                }
            }
        }

        // ---- Stage 6: Docker Push ----------------------------------
        stage('6. Docker Push') {
            when {
                branch 'main'
            }
            environment {
                DOCKER_IMAGE = "${env.DOCKER_REGISTRY ? env.DOCKER_REGISTRY + '/' : ''}${env.IMAGE_NAME}"
            }
            steps {
                script {
                    def registryPrefix = env.DOCKER_REGISTRY ? "${env.DOCKER_REGISTRY}/" : ''
                    def taggedImage = "${registryPrefix}${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                    def latestImage = "${registryPrefix}${env.IMAGE_NAME}:latest"

                    // Authenticate with the Docker registry
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'docker-registry-credentials',
                            usernameVariable: 'REGISTRY_USER',
                            passwordVariable: 'REGISTRY_PASS'
                        )
                    ]) {
                        sh '''
                            echo "🔑 Logging into Docker registry..."
                            echo "${REGISTRY_PASS}" | docker login \
                                ${DOCKER_REGISTRY:+"$DOCKER_REGISTRY"} \
                                -u "${REGISTRY_USER}" \
                                --password-stdin
                        '''

                        echo "📤 Pushing tagged image: ${taggedImage}"
                        sh "docker push ${taggedImage}"

                        echo "📤 Pushing latest tag: ${latestImage}"
                        sh "docker push ${latestImage}"

                        echo "✅ Docker images pushed successfully"
                    }
                }
            }
            post {
                success {
                    echo "✅ Image pushed: ${env.DOCKER_IMAGE}:${env.IMAGE_TAG}"
                    // Uncomment to record the image URL as a build badge:
                    // writeFile file: 'image.txt', text: "${env.DOCKER_IMAGE}:${env.IMAGE_TAG}"
                    // archiveArtifacts artifacts: 'image.txt'
                }
                failure {
                    error '❌ Docker push failed — check registry credentials and connectivity'
                }
            }
        }
    }

    // ------------------------------------------------------------------
    // Post-build actions
    // ------------------------------------------------------------------
    post {
        // Always clean up the workspace
        always {
            script {
                node {
                    cleanWs()
                }
            }
        }

        success {
            echo '✅ Pipeline completed successfully!'
            // Uncomment to send a Slack notification:
            // slackSend(
            //     color: '#00FF00',
            //     message: "✅ ${env.JOB_NAME} - Build #${env.BUILD_NUMBER} succeeded\n" +
            //              "📦 Image: ${env.DOCKER_IMAGE}:${env.IMAGE_TAG}\n" +
            //              "🔗 <${env.BUILD_URL}|Open Build>"
            // )
        }

        failure {
            echo '❌ Pipeline failed — check the logs above for details'
            // Uncomment to send a Slack notification:
            // slackSend(
            //     color: '#FF0000',
            //     message: "❌ ${env.JOB_NAME} - Build #${env.BUILD_NUMBER} failed (<${env.BUILD_URL}|Open>)"
            // )
        }

        unstable {
            echo '⚠️  Pipeline finished with unstable status'
        }

        aborted {
            echo '⏹️  Pipeline was aborted'
        }
    }
}

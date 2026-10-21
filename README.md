# TaskFlow

TaskFlow is a full-stack task management application built with **Spring Boot, React, and PostgreSQL**, developed as a hands-on project to explore and demonstrate modern **DevOps, containerization, Kubernetes, and CI/CD practices**.

The project covers the journey from local development with Docker Compose to Kubernetes orchestration, Helm-based deployments, and CI/CD automation with GitHub Actions. It also includes a workflow for publishing Docker images to Amazon ECR and deploying the backend to Amazon ECS Fargate.

> **Project status:** Docker, Kubernetes, Helm, and the GitHub Actions workflow have been developed as learning exercises. The end-to-end AWS deployment workflow has not yet been validated against provisioned AWS infrastructure.

## 🏗️ Architecture

### Kubernetes application architecture

```text
                         Client
                           │
                           │ HTTP/HTTPS
                           ▼
                     Kubernetes Ingress
                           │
                ┌──────────┴──────────┐
                │                     │
                │ /                   │ /api
                ▼                     ▼
        Frontend Service        Backend Service
                │                     │
                ▼                     ▼
           React Pods          Spring Boot Pods
                                      │
                                      │ JDBC
                                      ▼
                              PostgreSQL Service
                                      │
                                      ▼
                              PostgreSQL Pod
                                      │
                                      ▼
                              Persistent Storage
```

The frontend and backend run as independent Kubernetes workloads. Ingress routes `/` to the React frontend and `/api` to the Spring Boot backend. The backend accesses PostgreSQL through an internal Kubernetes Service.

### CI/CD and AWS deployment architecture

```text
                       GitHub Repository
                              │
                       Push / Pull Request
                              │
                              ▼
                        GitHub Actions
                              │
                  ┌───────────┴───────────┐
                  │                       │
                  ▼                       ▼
             Backend CI              Frontend CI
           Java 17 / Maven          Node.js 22 / Vite
           Tests + JAR              Build + dist/
           Surefire reports         Artifact
                  │                       │
                  └───────────┬───────────┘
                              │
                       Push to main only
                              │
                              ▼
                         Docker Buildx
                              │
                  ┌───────────┴───────────┐
                  ▼                       ▼
             Backend image          Frontend image
                  │                       │
                  └───────────┬───────────┘
                              ▼
                           Amazon ECR
                              │
                    Backend image URI
                              │
                              ▼
                   ECS Task Definition
                              │
                              ▼
                      Amazon ECS Fargate
                              │
                              ▼
                      HTTP Health Check
```

The GitHub Actions pipeline builds and publishes **both** Docker images. The current ECS deployment job targets **only the Spring Boot backend**; the frontend image is published to ECR but is not deployed by this workflow.

The Kubernetes/Helm setup and ECS/Fargate workflow are **alternative deployment approaches**, not a single connected runtime environment.

---

## 🛠️ Tech Stack

### Application

**Backend**
- Java 17
- Spring Boot
- Spring Data JPA
- Spring Boot Actuator
- Flyway
- Maven

**Frontend**
- React
- TypeScript
- Vite

**Database**
- PostgreSQL

### DevOps & Cloud

- Docker and Docker Compose
- Docker multi-stage builds
- Kubernetes
- Helm
- GitHub Actions
- Docker Buildx
- Amazon Elastic Container Registry (ECR)
- Amazon Elastic Container Service (ECS) / AWS Fargate
- AWS IAM and OpenID Connect (OIDC)

---

## 🐳 Docker

Both frontend and backend use **multi-stage Docker builds** to separate build-time dependencies from runtime images.

### Backend

```text
Maven + JDK
     │
     │ mvn package
     ▼
Spring Boot JAR
     │
     ▼
  JRE Image
```

The final runtime image does not need Maven or the application's build toolchain.

### Frontend

```text
Node.js
   │
   │ npm run build
   ▼
React dist/
   │
   ▼
 Nginx
```

Node.js is only needed during the frontend build stage; Nginx serves the compiled static assets.

---

## 🐳 Local Development with Docker Compose

Run the complete application locally:

```bash
docker compose up --build
```

The local environment contains:

```text
Frontend
   │
Backend
   │
PostgreSQL
   │
Named Volume
```

Docker's internal DNS allows containers to communicate through Compose service names instead of `localhost`.

For example, the backend can connect to PostgreSQL using:

```text
jdbc:postgresql://postgres:5432/taskflow
```

This assumes the PostgreSQL Compose service is named `postgres` and the database is named `taskflow`.

---

## ☸️ Kubernetes

TaskFlow is designed to run in a dedicated Kubernetes namespace.

The Kubernetes configuration includes:

- Deployments for stateless frontend and backend workloads
- StatefulSet for PostgreSQL
- ClusterIP Services for internal communication
- ConfigMaps for non-sensitive application configuration
- Secrets for credentials
- Persistent storage for PostgreSQL
- Startup, readiness, and liveness probes
- CPU and memory requests and limits
- Ingress for HTTP routing
- Horizontal Pod Autoscaler (HPA) for backend scaling

### Backend workload

```text
Backend Deployment
       │
       ▼
   ReplicaSet
       │
   ┌───┴───┐
   ▼       ▼
 Pod     Pod
```

A ClusterIP Service provides a stable internal endpoint for backend Pods:

```text
backend-service:80
        │
        ▼
Spring Boot Pods:8080
```

---

## ❤️ Health Checks

Spring Boot Actuator exposes endpoints used by Kubernetes probes:

- **startupProbe** — determines whether the application has finished starting
- **readinessProbe** — determines whether the Pod is ready to receive traffic
- **livenessProbe** — detects an unhealthy application that should be restarted

Example endpoints:

```text
/actuator/health/liveness
/actuator/health/readiness
```

These are Kubernetes-level probes. The CI/CD pipeline also includes a separate **post-deployment HTTP health check** after the ECS deployment stage.

---

## 💾 PostgreSQL Persistence

PostgreSQL runs as a Kubernetes StatefulSet with persistent storage:

```text
PostgreSQL Pod
      │
      ▼
     PVC
      │
      ▼
Persistent Volume
```

Persistent storage allows database data to survive Pod recreation, subject to the configured storage and retention policies.

The backend accesses PostgreSQL through the internal Service:

```text
jdbc:postgresql://postgres-service:5432/taskflow
```

The database Service is not exposed publicly.

---

## ⚙️ Configuration

Application configuration is separated from Docker images.

```text
ConfigMap
   └── DB_URL

Secret
   ├── DB_USERNAME
   └── DB_PASSWORD
```

ConfigMaps hold non-sensitive values, while Kubernetes Secrets hold credentials and other sensitive configuration. Secrets should be protected through appropriate RBAC, encryption, and access controls.

The same container image can be deployed across environments with different configuration values.

> Never commit production credentials or plaintext secret values to the repository.

---

## 📈 Resource Management & Autoscaling

Backend Pods define CPU and memory requests and limits.

Example:

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

The backend can be scaled with a Horizontal Pod Autoscaler:

```text
HPA
 │
 ▼
Backend Deployment
 │
 ▼
ReplicaSet
 │
 ▼
Spring Boot Pods
```

The HPA adjusts the number of backend replicas within configured minimum and maximum bounds, based on CPU utilization. CPU-based scaling requires resource requests and an available metrics pipeline, such as Metrics Server.

---

## 🌐 Ingress

Ingress provides HTTP routing into the Kubernetes cluster:

```text
taskflow.example.com
        │
        ▼
      Ingress
        │
    ┌───┴───────────┐
    │               │
    │ /             │ /api
    ▼               ▼
Frontend         Backend
Service          Service
```

This allows the frontend to call the backend using a relative URL:

```javascript
fetch("/api/tasks")
```

An Ingress controller and suitable DNS configuration are required for external access.

---

## ⎈ Helm

The Kubernetes deployment is packaged as a Helm chart.

Example structure:

```text
helm/
└── taskflow/
    ├── Chart.yaml
    ├── values.yaml
    ├── values-prod.yaml
    └── templates/
        ├── backend-deployment.yaml
        ├── backend-service.yaml
        ├── frontend-deployment.yaml
        ├── frontend-service.yaml
        ├── postgres-statefulset.yaml
        ├── postgres-service.yaml
        ├── configmap.yaml
        ├── secret.yaml
        ├── ingress.yaml
        └── backend-hpa.yaml
```

Render the manifests locally:

```bash
helm template taskflow ./helm/taskflow
```

Validate the chart:

```bash
helm lint ./helm/taskflow
```

Install or upgrade the application:

```bash
helm upgrade --install taskflow ./helm/taskflow
```

Apply production-specific values:

```bash
helm upgrade --install taskflow ./helm/taskflow \
  -f ./helm/taskflow/values-prod.yaml
```

Helm allows environment-specific configuration without duplicating Kubernetes manifests.

---

## 🔄 CI/CD with GitHub Actions

TaskFlow includes a **multi-job GitHub Actions workflow** for continuous integration, Docker image publishing, and an AWS ECS Fargate deployment process.

The workflow is defined under `.github/workflows/` and uses five jobs:

| Job | Responsibility |
| --- | --- |
| `backend` | Compile and test Spring Boot; upload JAR and Surefire reports |
| `frontend` | Install dependencies, build React, and upload `dist/` |
| `docker` | Build and publish backend/frontend images to ECR |
| `deploy` | Update the ECS Task Definition and deploy the backend |
| `health-check` | Verify the deployed application's HTTPS endpoint |

### Workflow triggers

CI runs on:

- Pushes to `main` and `develop`
- Pull requests targeting `main` and `develop`

Image publishing and deployment are restricted to **pushes to `main`**, after successful CI jobs.

### Backend CI

The backend job:

1. Checks out the repository.
2. Configures Java 17 (Eclipse Temurin).
3. Enables Maven dependency caching.
4. Runs `mvn verify` from the `backend/` directory.
5. Uploads the compiled JAR as the `backend-jar` artifact.
6. Uploads Maven Surefire reports even if tests fail, provided the workflow has not been cancelled.

The report-upload step uses:

```yaml
- name: Upload Surefire reports
  if: ${{ !cancelled() }}
  uses: actions/upload-artifact@v4
  with:
    name: surefire-reports
    path: backend/target/surefire-reports/
    if-no-files-found: warn
```

This preserves useful test diagnostics without hiding the original build failure.

### Frontend CI

The frontend job:

1. Checks out the repository.
2. Configures Node.js 22.
3. Caches npm dependencies using `frontend/package-lock.json`.
4. Runs `npm ci` from `frontend/`.
5. Runs `npm run build`.
6. Uploads the compiled `frontend/dist/` directory as the `frontend-dist` artifact.

The backend and frontend jobs can run in parallel. The Docker publishing job depends on both:

```yaml
needs: [backend, frontend]
```

### Docker Buildx and Amazon ECR

After successful CI on `main`, the workflow builds and pushes both Docker images using `docker/build-push-action` and Docker Buildx.

Images are tagged with the Git commit SHA:

```text
<ecr-registry>/taskmanager-backend:<commit-sha>
<ecr-registry>/taskmanager-frontend:<commit-sha>
```

Commit-based tags help associate an image with the source revision that produced it.

Separate GitHub Actions cache scopes are used to avoid backend and frontend cache collisions:

```yaml
cache-from: type=gha,scope=backend
cache-to: type=gha,mode=max,scope=backend
```

The frontend uses `scope=frontend` instead.

The Dockerfiles independently build their application artifacts, so the image build does not require downloading the JAR or `dist/` artifacts produced by the CI jobs.

### Secure AWS authentication with OIDC

GitHub Actions authenticates to AWS using **OpenID Connect (OIDC)** and an IAM role, rather than long-lived AWS access keys.

```text
GitHub Actions
      │
      ▼
 GitHub OIDC Token
      │
      ▼
     AWS STS
      │
      ▼
   IAM Role
      │
      ▼
Temporary AWS Credentials
      │
      ▼
  Amazon ECR / ECS
```

The AWS jobs request:

```yaml
permissions:
  contents: read
  id-token: write
```

The IAM trust policy should restrict which repository and GitHub context may assume the deployment role. Its permission policy should grant only the AWS actions required for image publishing and deployment.

The role ARN is provided through the GitHub Actions variable `AWS_DEPLOY_ROLE_ARN`.

### ECS Fargate deployment

The deployment job:

1. Receives the backend image URI from the Docker job output.
2. Assumes the AWS deployment role through OIDC.
3. Renders an updated ECS Task Definition containing the new backend image.
4. Deploys the rendered Task Definition to an existing ECS Service.
5. Waits for service stability.

```text
Amazon ECR
    │
    ▼
Backend Image URI
    │
    ▼
ECS Task Definition
    │
    ▼
ECS Service
    │
    ▼
AWS Fargate Task
    │
    ▼
Spring Boot Application
```

The deployment action uses the rendered Task Definition output, not the unchanged JSON file from the repository.

**Important:** This stage assumes that ECR repositories, IAM roles, ECS cluster/service, networking, load balancing, and required application dependencies already exist. The workflow does not provision that infrastructure.

The frontend image is published to ECR, but deploying the frontend is outside the scope of the current ECS job.

### Post-deployment health check

The final job calls the endpoint defined in the GitHub Actions variable `BACKEND_HEALTH_URL`.

```bash
curl -fsS \
  --retry 5 \
  --retry-delay 5 \
  --retry-all-errors \
  --connect-timeout 5 \
  --max-time 15 \
  "$HEALTH_URL"
```

The check:

- Fails on unsuccessful HTTP responses.
- Retries failed requests with a delay.
- Limits connection and request duration.
- Marks the workflow as failed if the endpoint remains unavailable.

For a Spring Boot application, the configured URL can point to a reachable Actuator health endpoint such as `/actuator/health`.

### GitHub Actions configuration

The AWS workflow expects the following repository variables:

| Variable | Purpose |
| --- | --- |
| `AWS_DEPLOY_ROLE_ARN` | IAM role assumed by GitHub Actions through OIDC |
| `BACKEND_HEALTH_URL` | Publicly reachable HTTPS health-check URL |

It also uses workflow-level configuration for the AWS region, ECR repositories, ECS cluster/service, Task Definition path, and backend container name.

> **Note:** The example ECR repository names and ECS resource names still use the `taskmanager-*` identifiers from the exercise. They should be updated if the deployed AWS resources are renamed to `taskflow-*`.

### CI/CD practices demonstrated

- Event-driven CI on push and pull request
- Parallel and dependent jobs using `needs`
- Conditional deployment to `main`
- Maven and npm dependency caching
- Build artifact and test report retention
- Docker Buildx and layer caching
- Versioned image publishing to ECR
- Short-lived AWS credentials with OIDC
- Cross-job outputs for image references
- ECS Task Definition rendering and service updates
- Post-deployment health verification

---

## 🔍 Kubernetes Troubleshooting

Useful commands:

```bash
kubectl get pods
kubectl get svc
kubectl get ingress
kubectl get pvc
kubectl get hpa
```

Inspect a Pod:

```bash
kubectl describe pod <pod-name>
```

View application logs:

```bash
kubectl logs <pod-name>
```

Inspect logs from a previously terminated container:

```bash
kubectl logs <pod-name> --previous
```

Inspect backend Service endpoints:

```bash
kubectl get endpoints backend-service
```

A request can be traced through:

```text
DNS
 │
 ▼
Ingress
 │
 ▼
Service
 │
 ▼
Endpoints
 │
 ▼
Pod
 │
 ▼
Spring Boot
 │
 ▼
PostgreSQL Service
 │
 ▼
PostgreSQL
```

For the AWS deployment path, useful diagnostics include ECS service events, stopped-task reasons, CloudWatch application logs, target group health, security groups, and the deployed Task Definition revision.

---

## 📚 What This Project Demonstrates

TaskFlow was developed to strengthen and demonstrate practical knowledge of:

- Containerizing full-stack applications with Docker
- Building optimized multi-stage images
- Running multi-container applications with Docker Compose
- Kubernetes workload orchestration
- Service discovery and internal networking
- Stateful workloads and persistent storage
- Application health probes and monitoring
- CPU and memory resource management
- Horizontal Pod Autoscaling
- Ingress-based routing
- ConfigMaps, Secrets, and environment-specific configuration
- Helm templating and chart-based deployments
- Kubernetes troubleshooting
- Designing multi-job GitHub Actions workflows
- Automating Java and React builds and tests
- Managing artifacts and Maven Surefire reports
- Optimizing Docker builds with Buildx and caching
- Publishing versioned images to Amazon ECR
- Authenticating GitHub Actions to AWS with OIDC
- Preparing ECS Fargate deployments and post-deployment checks

---

## 🚀 Roadmap

### Implemented in the project

- [x] Docker multi-stage containerization
- [x] Local development with Docker Compose
- [x] Kubernetes Deployments, Services, and Ingress
- [x] PostgreSQL StatefulSet and persistent storage
- [x] Kubernetes health probes and resource management
- [x] Horizontal Pod Autoscaler
- [x] Helm chart and environment-specific values
- [x] GitHub Actions backend and frontend CI jobs
- [x] Build artifacts and Surefire report retention
- [x] Docker Buildx and caching configuration
- [x] Amazon ECR publishing workflow
- [x] OIDC-based AWS authentication configuration
- [x] ECS Fargate deployment workflow
- [x] Post-deployment health-check workflow

### Planned / to validate

- [ ] Run and validate the full GitHub Actions workflow end to end
- [ ] Provision AWS infrastructure with Terraform
- [ ] Deploy and verify the backend on ECS Fargate
- [ ] Establish a frontend hosting/deployment strategy
- [ ] Configure CloudWatch monitoring and alerting
- [ ] Add production environment approvals and rollback mechanisms
- [ ] Deploy Kubernetes workloads on Amazon EKS
- [ ] Automate infrastructure provisioning and deployment

The long-term goal is to evolve TaskFlow into an end-to-end **Cloud & DevOps portfolio project**, covering infrastructure automation, container orchestration, continuous delivery, security, and observability.

---

## 👤 Author

**Domenico Sarcina**

Full Stack Java Developer expanding into Cloud & DevOps engineering.

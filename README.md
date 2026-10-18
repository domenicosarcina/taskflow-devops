# TaskFlow

TaskFlow is a full-stack task management application built with **Spring Boot, React and PostgreSQL**, designed primarily as a hands-on project to explore and demonstrate modern **DevOps, containerization and Kubernetes practices**.

The project covers the complete journey from local containerization with Docker to Kubernetes orchestration and Helm-based deployment.

## 🏗️ Architecture

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

The frontend and backend run as independent workloads inside Kubernetes.

The Ingress routes:

- `/` → React frontend
- `/api` → Spring Boot backend

The backend communicates with PostgreSQL through an internal Kubernetes Service.

---

## 🛠️ Tech Stack

### Application

**Backend**
- Java
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

### DevOps

- Docker
- Docker Compose
- Kubernetes
- Helm

---

## 🐳 Docker

Both the frontend and backend are containerized using **multi-stage Docker builds**.

### Backend

The backend Docker image uses Maven and Java to build the application and a separate JRE image for runtime.

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

This keeps build dependencies such as Maven and the application source code out of the final runtime image.

### Frontend

The React application follows a similar approach:

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

Node.js is therefore only required during the build stage.

---

## 🐳 Local Development with Docker Compose

Docker Compose can be used to run the complete application locally:

```bash
docker compose up --build
```

The local environment consists of:

```text
Frontend
   │
Backend
   │
PostgreSQL
   │
Named Volume
```

Docker's internal DNS allows containers to communicate using their service names rather than `localhost`.

For example, the backend connects to PostgreSQL using:

```text
jdbc:postgresql://postgres:5432/taskflow
```

---

## ☸️ Kubernetes

The application is designed to run inside a dedicated Kubernetes namespace.

The Kubernetes architecture includes:

- Deployments for stateless frontend and backend workloads
- StatefulSet for PostgreSQL
- ClusterIP Services for internal communication
- ConfigMaps for application configuration
- Secrets for credentials
- Persistent storage for PostgreSQL
- Startup, readiness and liveness probes
- CPU and memory requests/limits
- Ingress for HTTP routing
- Horizontal Pod Autoscaler for backend scaling

### Backend

The Spring Boot backend runs with multiple replicas managed by a Kubernetes Deployment.

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

A ClusterIP Service provides a stable endpoint for the backend Pods.

```text
backend-service:80
        │
        ▼
Spring Boot Pods:8080
```

---

## ❤️ Health Checks

Spring Boot Actuator is used to expose Kubernetes health endpoints.

The backend uses three different probes:

- **startupProbe** — determines when the application has successfully started
- **readinessProbe** — determines whether the Pod is ready to receive traffic
- **livenessProbe** — detects an unhealthy application that needs to be restarted

Example endpoints:

```text
/actuator/health/liveness
/actuator/health/readiness
```

---

## 💾 PostgreSQL Persistence

PostgreSQL runs as a Kubernetes StatefulSet.

Persistent storage ensures database data survives Pod recreation.

```text
PostgreSQL Pod
      │
      ▼
     PVC
      │
      ▼
Persistent Volume
```

The backend reaches the database through the internal PostgreSQL Service:

```text
jdbc:postgresql://postgres-service:5432/taskflow
```

The database itself is not exposed outside the cluster.

---

## ⚙️ Configuration

Application configuration is separated from the container images.

Non-sensitive configuration is stored using **ConfigMaps**, while credentials are provided using **Secrets**.

Example:

```text
ConfigMap
   └── DB_URL

Secret
   ├── DB_USERNAME
   └── DB_PASSWORD
```

This allows the same Docker image to be deployed across different environments without rebuilding it.

> Production credentials should never be committed to the repository.

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

The backend can also be horizontally scaled using a **Horizontal Pod Autoscaler (HPA)**.

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

The HPA scales the backend between configured minimum and maximum replica counts based on CPU utilization.

---

## 🌐 Ingress

External HTTP traffic enters the cluster through Kubernetes Ingress.

Example routing:

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

This allows the React application to call the backend using relative URLs:

```javascript
fetch("/api/tasks")
```

without exposing the backend Kubernetes Service directly to the browser.

---

## ⎈ Helm

The Kubernetes deployment is packaged as a **Helm Chart**.

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

Default manifests can be rendered locally before deployment:

```bash
helm template taskflow ./helm/taskflow
```

The chart can also be validated with:

```bash
helm lint ./helm/taskflow
```

Install or upgrade the application:

```bash
helm upgrade --install taskflow ./helm/taskflow
```

Production-specific configuration can be applied using:

```bash
helm upgrade --install taskflow ./helm/taskflow \
  -f ./helm/taskflow/values-prod.yaml
```

This allows environment-specific configuration without duplicating Kubernetes manifests.

---

## 🔍 Kubernetes Troubleshooting

Useful commands for inspecting the application:

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

Inspect logs from a previously crashed container:

```bash
kubectl logs <pod-name> --previous
```

Check Service endpoints:

```bash
kubectl get endpoints backend-service
```

A typical request can be traced through:

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

---

## 📚 What This Project Demonstrates

TaskFlow was developed as a practical project to strengthen and demonstrate knowledge of:

- Containerizing applications with Docker
- Building optimized multi-stage Docker images
- Running multi-container applications with Docker Compose
- Kubernetes workload orchestration
- Service discovery and internal networking
- Stateful workloads and persistent storage
- Application health monitoring
- CPU and memory resource management
- Horizontal autoscaling
- Ingress-based routing
- Configuration and secret management
- Helm templating and environment-specific deployments
- Kubernetes troubleshooting

---

## 🚀 Roadmap

The project will be progressively extended with:

- Infrastructure as Code using **Terraform**
- CI/CD pipelines using **GitHub Actions**
- Docker image publishing to **Amazon ECR**
- Kubernetes deployment on **Amazon EKS**
- AWS infrastructure provisioning with Terraform
- Automated build and deployment workflows

The long-term goal is to evolve TaskFlow into a complete end-to-end **Cloud & DevOps portfolio project**.

---

## 👤 Author

**Domenico Sarcina**

Full Stack Java Developer expanding into Cloud & DevOps engineering.
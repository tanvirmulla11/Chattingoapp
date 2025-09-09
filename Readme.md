# 🚀 Chattingo – DevOps Deployment Guide

### Project: Chattingo – Real-time Chat App (React + Spring Boot)
### Owner: Tanvir Mulla


### This repo contains a complete CI/CD deployment plan using Jenkins, Docker, DockerHub, and Hostinger VPS, with atomic blue/green-style release swap and automatic rollback.
--- 
# 🎯 Quick Summary

### Image Tagging: YYYYmmddHHMM-<gitshort> → readable & deterministic

### Atomic Release Swap: Deploys to /opt/chattingo/releases/<TAG> → swaps current → previous if health fails

### Frontend Fingerprinting: Injects BUILD_ID into index.html to prevent cache issues

### Health-Gated Rollback: Automatic rollback if http://YOUR_VPS_IP:8080/actuator/health fails within 60s

### Minimal Downtime: Users always see a working site during deployment

### Reproducible: Scripts, Dockerfiles, docker-compose, Jenkinsfile included
---
# ✅ Prerequisites

### Before deployment, ensure you have the following:

| Placeholder           | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `YOUR_DOCKERHUB_USER` | DockerHub username                                            |
| `YOUR_VPS_IP`         | Hostinger VPS IP                                              |
| `SSH_USER`            | VPS SSH username (root/ubuntu)                                |
| `GIT_BRANCH`          | Git branch to deploy (e.g., `devops-implementation`)          |
| Jenkins Credentials   | DockerHub username/password + VPS SSH private key (`vps-ssh`) |

# 🏗 File Structure Overview
## chattingo/
## frontend/
### ├─ Dockerfile
### └─ nginx.frontend.conf
### ├─ backend/
### ├─ Dockerfile
### └─ src/...
### ├─ jenkins/
### └─ Jenkinsfile
### ├─ docker-compose.yml
### ├─ .env.template
### └─ README.md
---
# 📅 4-Day Deployment
### Day 1 – VPS Environment Setup & Verification 🖥️

### Objective: Prepare VPS for Docker + Nginx deployment.
| Task                     | Commands / Notes                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| SSH into VPS             | `ssh SSH_USER@YOUR_VPS_IP`                                                                                                 |
| Update system            | `sudo apt update && sudo apt upgrade -y`                                                                                   |
| Install Docker & Compose | `sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin` <br> `sudo usermod -aG docker $(whoami)` |
| Install Nginx & Git      | `sudo apt install -y nginx git`                                                                                            |
| Test Docker              | `docker run hello-world`                                                                                                   |
| Create release dirs      | `sudo mkdir -p /opt/chattingo/releases /opt/chattingo/current /opt/chattingo/previous`                                     |

---
Deliverable: VPS ready, Docker/Nginx installed, directories created. ✅
###  Day 2 – Dockerize App & Local Deployment 🐳

### Objective: Build frontend/backend images & run locally.
| Task                | Description / Commands                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Backend Dockerfile  | Multi-stage Gradle → JRE build (`backend/Dockerfile`)                                                                                 |
| Frontend Dockerfile | Inject `BUILD_ID` in `index.html` (`frontend/Dockerfile`)                                                                             |
| Docker Compose      | Connect frontend + backend + MySQL (`docker-compose.yml`)                                                                             |
| Run containers      | `docker compose up -d --build`                                                                                                        |
| Test API            | `curl -X POST http://localhost:8081/api/login -H "Content-Type: application/json" -d '{"username":"testuser","password":"testpass"}'` |
---
### Deliverable: Application running on VPS IP (http://72.60.111.20) ✅

###   Day 3 – CI/CD with Jenkins 🔧

###  Objective: Automate build, scan, push, and deploy.
| Task                    | Commands / Notes                                            |
| ----------------------- | ----------------------------------------------------------- |
| Install Jenkins         | `sudo apt install jenkins`                                  |
| Configure Jenkins creds | DockerHub + VPS SSH key (`vps-ssh`)                         |
| Create Jenkinsfile      | Stages: Checkout → Build → Scan → Push → Deploy             |
| Configure pipeline      | Branch: `devops-implementation`                             |
| Test pipeline           | Push commit → Jenkins auto-build & deploy                   |
| Deploy Script           | `/usr/local/bin/deploy_release.sh` – atomic swap + rollback |
---
###   Deliverable: Jenkins automates Docker image build and deployment. ✅
###  Day 4 – Application Testing & Monitoring 🔍
###  Objective: Ensure the app is fully functional and monitored.
| Task                | Commands / Notes                                                        |
| ------------------- | ----------------------------------------------------------------------- |     
| Verify login/signup | Access frontend → test APIs via React UI                                |
| Database check      | `docker exec -it <db_container> mysql -uroot -p` → verify tables & data |
| Container check     | `docker ps` and `docker compose logs -f`                                |
---
### Deliverable: Application fully tested
## ⚠️ Common Problems & Solutions
| Problem                       | Cause                                    | Solution                                                                  |
| ----------------------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| Backend exits immediately     | DB not ready                             | Use Docker `depends_on` or wait-for-db script                             |
| Frontend cannot reach backend | Nginx proxy points to wrong port/service | Update `nginx.frontend.conf` to correct backend port/service name         |
| API returns connection error  | Docker network not configured            | Ensure all services are on same Docker network (bridge)                   |
| Docker build fails            | Missing dependencies                     | Verify Dockerfile COPY paths & Gradle/npm installed                       |
| Cache issues                  | Frontend assets cached in browser        | Use `__BUILD_ID__` placeholder → replaced in Dockerfile for cache busting |
| Jenkins cannot SSH            | Wrong credentials                        | Add correct SSH private key in Jenkins credentials (`vps-ssh`)            |
---
## 🛠️ Troubleshooting Quick Commands
| Command                                              | Purpose                    |
| ---------------------------------------------------- | -------------------------- |
| `sudo docker ps`                                     | List running containers    |
| `sudo docker compose logs -f`                        | View logs                  |
| `sudo docker compose up -d --build --remove-orphans` | Rebuild containers         |
| `docker network ls`                                  | Verify Docker networks     |
| `docker exec -it <container> bash`                   | Access container for debug |
---


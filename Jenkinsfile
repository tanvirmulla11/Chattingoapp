// Jenkinsfile: Chattingo CI/CD Pipeline
// Author: Tanvir Mulla
// Description: CI/CD pipeline for Chattingo app (Frontend + Backend) with email notifications

pipeline {
    agent any

    environment {
        REGISTRY = "tanvirmulla11"
        IMAGE_TAG = "build-${BUILD_NUMBER}"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {

        stage('Git Clone') {
            steps {
                echo "Cloning repository..."
                git branch: 'main', url: 'https://github.com/tanvirmulla11/Chattingoapp.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "Building Docker images..."
                script {
                    try {
                        sh """
                            docker build -t $REGISTRY/chattingo-frontend:$IMAGE_TAG ./frontend
                            docker build -t $REGISTRY/chattingo-backend:$IMAGE_TAG ./backend
                        """
                    } catch (err) {
                        error("Docker build failed: ${err}")
                    }
                }
            }
        }

        stage('Filesystem Security Scan') {
            steps {
                echo "Scanning backend source code for vulnerabilities..."
                sh "trivy fs ./backend || echo 'Trivy scan failed but continuing...'"
            }
        }

        stage('Docker Image Security Scan') {
            steps {
                echo "Scanning Docker images for vulnerabilities..."
                sh """
                    trivy image --severity HIGH,CRITICAL $REGISTRY/chattingo-frontend:$IMAGE_TAG || echo 'Frontend scan warning'
                    trivy image --severity HIGH,CRITICAL $REGISTRY/chattingo-backend:$IMAGE_TAG || echo 'Backend scan warning'
                """
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                echo "Pushing images to Docker Hub..."
                withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh """
                        echo $PASS | docker login -u $USER --password-stdin
                        docker push $REGISTRY/chattingo-frontend:$IMAGE_TAG
                        docker push $REGISTRY/chattingo-backend:$IMAGE_TAG
                    """
                }
            }
        }

        stage('Update docker-compose on VPS') {
            steps {
                echo "Updating docker-compose with new image tags..."
                sshagent(credentials: ['hostinger-ssh']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no root@72.60.111.20 '
                            sed -i "s|image: $REGISTRY/chattingo-frontend:.*|image: $REGISTRY/chattingo-frontend:$IMAGE_TAG|g" /root/chattingo/docker-compose.yml
                            sed -i "s|image: $REGISTRY/chattingo-backend:.*|image: $REGISTRY/chattingo-backend:$IMAGE_TAG|g" /root/chattingo/docker-compose.yml
                        '
                    """
                }
            }
        }

        stage('Deploy on VPS') {
            steps {
                echo " Deploying containers on VPS..."
                sshagent(credentials: ['hostinger-ssh']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no root@72.60.111.20 '
                            docker-compose -f /root/chattingo/docker-compose.yml up -d
                            docker ps
                        '
                    """
                }
            }
        }

    }

    post {
        success {
            emailext(
                subject: "✅ SUCCESS: Chattingo Build #${BUILD_NUMBER}",
                body: "The Jenkins build ${BUILD_NUMBER} for Chattingo was successful.\nCheck details here: ${BUILD_URL}",
                to: "tanvirmulla73@gmail.com" 
                attachLog: true
            )
        }
        failure {
            emailext(
                subject: "❌ FAILURE: Chattingo Build #${BUILD_NUMBER}",
                body: "The Jenkins build ${BUILD_NUMBER} for Chattingo failed.\nCheck details here: ${BUILD_URL}",
                to: "tanvirmulla73@gmail.com" 
                attachLog: true
            )
        }
    }
}

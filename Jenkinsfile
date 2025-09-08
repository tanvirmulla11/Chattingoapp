pipeline {
    agent any

    environment {
        REGISTRY = "tanvirmulla11"
        IMAGE_TAG = "build-${BUILD_NUMBER}"
    }

    stages {
        stage('Git Clone') { 
            steps {
                echo "Cloning repository..."
                git branch: 'main', url: 'https://github.com/tanvirmulla11/Chattingoapp.git'
            }
        }

        stage('Image Build') { 
            steps {
                echo " Building Docker images..."
                sh """
                  docker build -t $REGISTRY/chattingo-frontend:$IMAGE_TAG ./frontend
                  docker build -t $REGISTRY/chattingo-backend:$IMAGE_TAG ./backend
                """
            }
        }

        stage('Filesystem Scan') { 
            steps {
                echo "🔍 Scanning source code for vulnerabilities..."
                sh "trivy fs ./backend || true"   // optional, install trivy if needed
            }
        }

        stage('Image Scan') { 
            steps {
                echo "🛡️ Scanning Docker images..."
                sh """
                  trivy image $REGISTRY/chattingo-frontend:$IMAGE_TAG || true
                  trivy image $REGISTRY/chattingo-backend:$IMAGE_TAG || true
                """
            }
        }

        stage('Push to Registry') { 
            steps {
                echo "📤 Pushing Docker images to Docker Hub..."
                withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh """
                      echo $PASS | docker login -u $USER --password-stdin
                      docker push $REGISTRY/chattingo-frontend:$IMAGE_TAG
                      docker push $REGISTRY/chattingo-backend:$IMAGE_TAG
                    """
                }
            }
        }

        stage('Update Compose') { 
            steps {
                echo "🔄 Updating docker-compose with new image tags..."
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

        stage('Deploy') { 
            steps {
                echo "🚀 Deploying on VPS..."
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
}

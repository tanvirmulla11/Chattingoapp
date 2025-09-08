pipeline {
    agent any

    environment {
        REGISTRY = "tanvirmulla11"
        IMAGE_TAG = "build-${BUILD_NUMBER}"
    }

    stages {
        stage('Git Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/tanvirmulla11/Chattingoapp.git'
            }
        }

        stage('Image Build') {
            steps {
                sh """
                  echo "🚀 Building Docker images..."
                  docker build -t $REGISTRY/chattingo-frontend:$IMAGE_TAG ./frontend
                  docker build -t $REGISTRY/chattingo-backend:$IMAGE_TAG ./backend
                """
            }
        }

        stage('Push to Registry') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh """
                      echo "🔑 Logging in to Docker Hub..."
                      echo $PASS | docker login -u $USER --password-stdin
                      echo "📦 Pushing images..."
                      docker push $REGISTRY/chattingo-frontend:$IMAGE_TAG
                      docker push $REGISTRY/chattingo-backend:$IMAGE_TAG
                    """
                }
            }
        }

        stage('Deploy to VPS') {
            steps {
                sshagent(credentials: ['hostinger-ssh']) {
                    sh """
                      ssh -o StrictHostKeyChecking=no root@72.60.111.20 '
                        echo "📥 Pulling latest images..."
                        docker pull $REGISTRY/chattingo-frontend:$IMAGE_TAG
                        docker pull $REGISTRY/chattingo-backend:$IMAGE_TAG
                        echo "🚀 Restarting services..."
                        docker-compose -f /root/chattingo/docker-compose.yml up -d
                        docker ps
                      '
                    """
                }
            }
        }
    }
}

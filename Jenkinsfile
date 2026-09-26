pipeline {
    agent any

    stages {

        stage('Verify Tools') {
            steps {
                bat 'java --version'
                bat 'git --version'
                bat 'docker --version'
                bat 'docker-compose version'
            }
        }

        stage('Validate Docker Compose') {
            steps {
                bat 'docker-compose config'
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker-compose build'
            }
        }

        stage('Start Application') {
            steps {
                bat 'docker-compose up -d'
            }
        }

        stage('Health Check') {
            steps {
                powershell '.\\scripts\\health-check.ps1'
            }
        }
    }

    post {
        success {
            echo 'CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'CI/CD pipeline failed. Check the console output.'
        }
    }
}
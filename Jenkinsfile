#!/usr/bin/env groovy

/* IMPORTANT:
 *
 * In order to make this pipeline work, the following configuration on Jenkins is required:
 * - slave with a specific label (see pipeline.agent.label below)
 * - credentials plugin should be installed and have the secrets with the following names:
 *   + lciadm100credentials (token to access Artifactory)
 */

def defaultBobImage = 'armdocker.rnd.ericsson.se/sandbox/adp-staging/adp-cicd/bob.2.0:1.5.2-0'
def bob = new BobCommand()
        .bobImage(defaultBobImage)
        .envVars([ISO_VERSION: '${ISO_VERSION}', ENM_ISO_REPO_VERSION: '${ENM_ISO_REPO_VERSION}'])
        .needDockerSocket(true)
        .toString()
def GIT_COMMITTER_NAME = 'enmadm100'
def GIT_COMMITTER_EMAIL = 'enmadm100@ericsson.com'
def credentials_id = 'rcduser1'
def password_variable = 'pass'
def username_variable = 'user'
def remote_name = 'seliius37704'
def remote_host = 'seliius37704.seli.gic.ericsson.se'
def failedStage = ''
pipeline {
    agent {
        label 'Cloud-Native'
    }
    environment {
        GERRIT_HTTP_CREDENTIALS_FUser = credentials('FUser_gerrit_http_username_password')
    }
    stages {
        stage('Clean') {
            steps {
                deleteDir()
            }
        }
        stage('Inject Credential Files') {
            steps {
                withCredentials([file(credentialsId: 'lciadm100-docker-auth', variable: 'dockerConfig')]) {
                    //sh "install -m 600 ${dockerConfig} ${HOME}/.docker/config.json"
                    sh '''    
                        if [ ! -f ${HOME}/.docker/config.json ]; then
                            echo "File not found!  Installing permission change file"
                            install -m 600 ${dockerConfig} ${HOME}/.docker/config.json
                        else
                            echo "Config.json file exists . Moving to next stage"
                        fi
                    '''
                }
            }
        }
        stage('Checkout Base Image Git Repository') {
            steps {
                git branch: 'master',
                     credentialsId: 'enmadm100_private_key',
                     url: '${GERRIT_MIRROR}/OSS/ENM-Parent/SQ-Gate/com.ericsson.oss.deployment.tools/online-sed'
                sh '''
                    git remote set-url origin --push https://${GERRIT_HTTP_CREDENTIALS_FUser}@${GERRIT_CENTRAL_HTTP_E2E}/OSS/ENM-Parent/SQ-Gate/com.ericsson.oss.deployment.tools/online-sed
                '''
            }
        }
        stage('Build & Push Image') {
            steps {
                sh "docker system prune -a -f"
                sh "${bob} generate-new-version build-image push-image"
            }
            post {
                always {
                    script {
                        failedStage = env.STAGE_NAME
                        sh "${bob} remove-image"
                    }
                }
            }
        }
        stage('Publish changes to SED VM') {
            steps{
                script{
                    withCredentials([usernamePassword(credentialsId: credentials_id, passwordVariable: password_variable, usernameVariable: username_variable)]) {
                        def remote = [:]
                        remote.name = remote_name
                        remote.host = remote_host
                        remote.user = user
                        remote.password = pass
                        remote.allowAnyHosts = true
                        env.API_SERVER_CURRENT_VERSION = sshCommand remote: remote, sudo: true, command: "docker ps --format '{{.Image}}' |grep backend: |cut -d: -f2 | head -n1"
                        env.EXTERNAL_CURRENT_VERSION = sshCommand remote: remote, sudo: true, command: "docker ps --format '{{.Image}}' |grep frontend: |cut -d: -f2 | head -n1"
                        env.VERSION = sh(script: "cat .bob/var.version", returnStdout:true).trim()
                        sshCommand remote: remote, sudo: true, command: "bash /var/tmp/store_container_logs.sh external"
                        sshCommand remote: remote, sudo: true, command: "docker stop sedapiserver sedexternal || true"
                        sshCommand remote: remote, sudo: true, command: "docker rm sedapiserver sedexternal || true"
                        sshCommand remote: remote, sudo: true, command: "docker network rm sed_network"
                        sshCommand remote: remote, sudo: true, command: "docker network create --driver bridge sed_network"
                        sshCommand remote: remote, sudo: true, command: "docker run --restart always --pull=always -d -v /online_sed_dev/ssl/:/ssl_certs -v /online_sed_dev/data/:/web/res/data --network sed_network --name sedapiserver armdocker.rnd.ericsson.se/proj-online-sed/sed-backend:${VERSION}"
                        sshCommand remote: remote, sudo: true, command: "docker run --restart always --pull=always -d -v /online_sed_dev/ssl/:/ssl_certs -v /online_sed_dev/data/:/web/data --network sed_network -p 443:443 --name sedexternal armdocker.rnd.ericsson.se/proj-online-sed/sed-frontend:${VERSION}"
                        sshCommand remote: remote, sudo: true, command: "docker run --rm armdocker.rnd.ericsson.se/proj-online-sed/alpine/curl:8.5.0 sh -c 'curl --retry 5 --retry-delay 1 --retry-all-errors --fail -s https://siteengineeringdata.internal.ericsson.com'"
                        sshCommand remote: remote, sudo: true, command: "curl -sf --retry-delay 5 --retry 10 https://siteengineeringdata.internal.ericsson.com:443/healthcheck/"
                        sshCommand remote: remote, sudo: true, command: "docker image prune --all --force"
                    }
                }
            }
            post {
                failure {
                    script {
                        failedStage = env.STAGE_NAME
                        withCredentials([usernamePassword(credentialsId: credentials_id, passwordVariable: password_variable, usernameVariable: username_variable)]) {
                            def remote = [:]
                            remote.name = remote_name
                            remote.host = remote_host
                            remote.user = user
                            remote.password = pass
                            remote.allowAnyHosts = true
                            sshCommand remote: remote, sudo: true, command: "bash /var/tmp/store_container_logs.sh external"
                            sshCommand remote: remote, sudo: true, command: "docker stop sedapiserver sedexternal || true"
                            sshCommand remote: remote, sudo: true, command: "docker rm sedapiserver sedexternal || true"
                            sshCommand remote: remote, sudo: true, command: "docker run --restart always --pull=always -d -v /online_sed_dev/ssl/:/ssl_certs -v /online_sed_dev/data/:/web/res/data --network sed_network --name sedapiserver armdocker.rnd.ericsson.se/proj-online-sed/sed-backend:${API_SERVER_CURRENT_VERSION}"
                            sshCommand remote: remote, sudo: true, command: "docker run --restart always --pull=always -d -v /online_sed_dev/ssl/:/ssl_certs -v /online_sed_dev/data/:/web/data --network sed_network -p 443:443 --name sedexternal armdocker.rnd.ericsson.se/proj-online-sed/sed-frontend:${EXTERNAL_CURRENT_VERSION}"
                        }
                    }
                }
            }
        }
    }
    post {
        success {
            mail to: 'PDLTORDEPL@pdl.internal.ericsson.com',
                 subject: "Release of Online-Sed Successful: ${currentBuild.fullDisplayName}",
                 body: "Job instance: ${env.BUILD_URL}\n\nReleased Artifact: armdocker.rnd.ericsson.se/proj-online-sed/sed:${env.VERSION}"
        }
        failure {
           mail to: 'PDLTORDEPL@pdl.internal.ericsson.com',
                subject: "Release of Online-Sed Failed: ${currentBuild.fullDisplayName}",
                body: "Job instance: ${env.BUILD_URL}"
        }
    }
}


// More about @Builder: http://mrhaki.blogspot.com/2014/05/groovy-goodness-use-builder-ast.html
import groovy.transform.builder.Builder
import groovy.transform.builder.SimpleStrategy

@Builder(builderStrategy = SimpleStrategy, prefix = '')
class BobCommand {
    def bobImage = 'bob.2.0:latest'
    def envVars = [:]
    def needDockerSocket = false

    String toString() {
        def env = envVars
                .collect({ entry -> "-e ${entry.key}=\"${entry.value}\"" })
                .join(' ')

        def cmd = """\
            |docker run
            |--init
            |--rm
            |--workdir \${PWD}
            |--user \$(id -u):\$(id -g)
            |-v \${PWD}:\${PWD}
            |-v /home/enmadm100/doc_push/group:/etc/group:ro
            |-v /home/enmadm100/doc_push/passwd:/etc/passwd:ro
            |-v \${HOME}/.m2:\${HOME}/.m2
            |-v \${HOME}/.docker:\${HOME}/.docker
            |${needDockerSocket ? '-v /var/run/docker.sock:/var/run/docker.sock' : ''}
            |${env}
            |\$(for group in \$(id -G); do printf ' --group-add %s' "\$group"; done)
            |--group-add \$(stat -c '%g' /var/run/docker.sock)
            |${bobImage}
            |"""
        return cmd
                .stripMargin()           // remove indentation
                .replace('\n', ' ')      // join lines
                .replaceAll(/[ ]+/, ' ') // replace multiple spaces by one
    }
}
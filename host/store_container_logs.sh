#!/bin/bash
#This script stores the site engineering data docker containers logs
#It deletes the stored data after thirty days
#The script is executed at the site engineering data update release jenkins step
#The stored data is uploaded to the site engineering data ddp site

release=$1

sed_frontend_staging="sed_staging"
sed_backend_staging="sedapiserver_staging"
sed_frontend="sedexternal"
sed_backend="sedapiserver"

get_docker_container_id() {
    container_name="$1"
    sudo docker ps  --no-trunc |grep -w ${container_name} | cut -d " " -f1
}

sed_frontend_staging_id=$(get_docker_container_id "${sed_frontend_staging}")
sed_backend_staging_id=$(get_docker_container_id "${sed_backend_staging}")
sed_frontend_id=$(get_docker_container_id "${sed_frontend}")
sed_backend_id=$(get_docker_container_id "${sed_backend}")

get_and_save_logs() {
    local container_id="$1"
    local container_name="$2"
    local log_filename="${container_name}"_"$(date +%d%m%Y_%H%M%S)"_"${container_id}".log
    sudo cp -r /var/lib/docker/containers/${container_id}/*-json.log /sed/containerslogs/${log_filename}
}

if [ "${release}" == "staging" ];
then
    get_and_save_logs "${sed_frontend_staging_id}" "${sed_frontend_staging}"
    get_and_save_logs "${sed_backend_staging_id}" "${sed_backend_staging}"
fi

if [ "${release}" == "external" ];
then
    get_and_save_logs "${sed_frontend_id}" "${sed_frontend}"
    get_and_save_logs "${sed_backend_id}" "${sed_backend}"
fi

find /sed/containerslogs/ -maxdepth 1 -type f -mtime +60 -delete


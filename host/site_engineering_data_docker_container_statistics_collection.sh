#!/bin/bash
# Plugin config file i.e. dat file
# The .dat file e.g. /var/ericsson/ddc_data/config/plugins/<app>.dat or  /etc/ddc.d/plugins/<app>.dat provides the interface between DDC and the application's main worker script.
# The script identified in the <app>.dat file needs to be executable and DDC will execute the script with the same ownership as the script.

# Basic Operation
# A DDC trigger is executed at 15 min intervals starting at 5 mins past the hour. (e.g. 00:05, 00:20, 00:35, 00:50).
# A tarball is created during the STOP procedure at 23:59 and when a MAKETAR is called.
# The DDC interface performs a call on each worker script associated to the <app>.dat file, with various timeouts depending on the operation (i.e. START 60 seconds,STOP 300 seconds,TRIGGER 30 seconds).
# It is expected that an application's worker script will execute from start to finish within 10 second period.

# Important Variables
# $1: the task i.e. one of  START, TRIGGER, STOP or MAKETAR.
# $2: the plugin output folder e.g. /var/ericsson/ddc_data/ieatlms4926_TOR/150419/plugin_data
# DATAROOT: the root folder on this host for DDC e.g. DATAROOT=/var/ericsson/ddc_data/ieatlms4926_TOR
# SITEDATAROOT: the root folder for DDC e.g. SITEDATAROOT=/var/ericsson/ddc_data
# DATE: Date in SQL format widely ddmmyy used by DDC e.g. DATE=150419
# DDC_LOG_FILE: Current log file e.g. /var/ericsson/ddc_data/svc-4-scripting_TOR/log/ddc.2021-05-25.log
# OUTPUT_DIR: e.g. /var/ericsson/ddc_data/<hostname>_TOR/<ddmmyy>/plugin_data

# Logs
# DDC log file is in ${DATAROOT}/log/ddc.<yyyy-mm-dd>.log and will show problems with plugin execution
# e.g. tail /var/ericsson/ddc_data/$(hostname)_TOR/log/ddc.$(date '+%Y')-$(date '+%m')-$(date '+%d').log

# DDC Master
# In some cases where multiple DDC instances execute a DDC master needs to be nominated to consolidate all DDC files.
# The DDC instance which has the file ${DATAROOT}/${DATE}/DDC_MASTER is the DDC master and plugins can be used to set that flag file.

usage()
{
   echo "Usage: $0 <task> <output directory>"
   exit 1
}

do_start()
{
    echo " Action: start"
    # Perform operations required for START procedure
    #e.g. xml configuration, create directory structure
}

store_versions_files()
{
    if [  "$(diff /online_sed_dev/data/pENM/internalVersions.json $(ls -t /sed/versionsbackup/pENM/internal* | head -1))" != "" ]; then
        sudo cp /online_sed_dev/data/pENM/internalVersions.json /sed/versionsbackup/pENM/internalVersions_$(date +%d%m%Y_%H).json
    fi

    if [ "$(diff /online_sed_dev/data/pENM/externalVersions.json $(ls -t /sed/versionsbackup/pENM/external* | head -1))" != "" ]; then
        sudo cp /online_sed_dev/data/pENM/externalVersions.json /sed/versionsbackup/pENM/externalVersions_$(date +%d%m%Y_%H).json
    fi

    if [ "$(diff /online_sed_dev/data/cENM/internalVersions.json $(ls -t /sed/versionsbackup/cENM/internal* | head -1))" != "" ]; then
        sudo cp /online_sed_dev/data/cENM/internalVersions.json /sed/versionsbackup/cENM/internalVersions_$(date +%d%m%Y_%H).json
    fi

    if [ "$(diff /online_sed_dev/data/cENM/externalVersions.json $(ls -t /sed/versionsbackup/cENM/external* | head -1))" != ""]; then
        sudo cp /online_sed_dev/data/cENM/externalVersions.json /sed/versionsbackup/cENM/externalVersions_$(date +%d%m%Y_%H).json
    fi

    sudo find /sed/versionsbackup/pENM/ -maxdepth 1 -type f -mtime +60 -delete
    sudo find /sed/versionsbackup/cENM/ -maxdepth 1 -type f -mtime +60 -delete
    cp -r /sed/versionsbackup/ $OUTPUT_DIR

}

store_containers_logs()
{
    cp -r /sed/containerslogs/ $OUTPUT_DIR
    docker stats -a --no-stream >> $OUTPUT_DIR/site_engineering_data_docker_container_statistics_collection.txt
    chmod +rwx $OUTPUT_DIR/*.log
}

store_statistics_logs()
{
    timestamp=$(($(date +%s%N)/1000000))
    sed_staging_stats=$(docker stats -a --no-stream |grep -w sed_staging)
    sedapiserver_staging_stats=$(docker stats -a --no-stream |grep -w sedapiserver_staging)
    sedexternal_stats=$(docker stats -a --no-stream |grep -w sedexternal)
    sedapiserver_stats=$(docker stats -a --no-stream |grep -w sedapiserver)

    statistics=("sed_staging" "sedapiserver_staging" "sedexternal" "sedapiserver")
    ports_users=("sed_staging" "sedexternal")
    data_values=("3" "4" "7" "10" "13" "14")

    if [ -d "$OUTPUT_DIR/../remote_writer/" ];
    then
        gzip -d $OUTPUT_DIR/../remote_writer/dump.001.gz
        sed -i '/nginx_/d' $OUTPUT_DIR/../remote_writer/dump.001


        for statistic in "${statistics[@]}"; do
            statistic_stats=$(echo "${statistic}_stats")
            data_value_instantiates=0
            for data in "cpu_usage" "mem_usage" "mem" "net_io" "block_io" "pids"; do
                sed -i -e '/\<'$(echo ${statistic}_${data})'\>/s/]/,'$(echo $timestamp)']/1' -e '/\<'$(echo ${statistic}_${data})'\>/s/]/,'$(echo ${!statistic_stats} | xargs | cut -d ' ' -f$(echo ${data_values[$(echo ${data_value_instantiates})]}) | tr -d '[:alpha:]' | cut -d '%' -f1 )']/2' $OUTPUT_DIR/../remote_writer/dump.001
                data_value_instantiates=$((data_value_intantiates+1))
            done
        done

        for user in "${ports_users[@]}"
        do
            python3 var/tmp/nginx_metrics.py "$(echo ${user})" | while IFS= read -r line ; do
                echo "$line" >> $OUTPUT_DIR/../remote_writer/dump.001
            done
        done

        sed -i '/fetching/d' $OUTPUT_DIR/../remote_writer/dump.001
        sed -i '/^[[:space:]]*$/d' $OUTPUT_DIR/../remote_writer/dump.001
        gzip $OUTPUT_DIR/../remote_writer/dump.001
    else

        sudo mkdir $OUTPUT_DIR/../remote_writer/
        echo -e '{ "version": 1 }' > $OUTPUT_DIR/../remote_writer/dump.001


        for statistic in "${statistics[@]}"; do
            statistic_stats=$(echo "${statistic}_stats")
            data_value_updates=0
            for data in "cpu_usage" "mem_usage" "mem" "net_io" "block_io" "pids"; do
                echo -e '{"Labels":{"__name__":"sed_'"${data}"'", "sed_instance":"'$(echo "${statistic}")'", "statistic":"'$(echo "${statistic}")'_'"${data}"'"},"Timestamps":['"${timestamp}"'],"Values":['$(echo "${!statistic_stats}" | xargs | cut -d ' ' -f$(echo ${data_values[$(echo ${data_value_updates})]}) | tr -d '[:alpha:]' | cut -d '%' -f1)']}' >> "$OUTPUT_DIR/../remote_writer/dump.001"
                data_value_updates=$((data_value_updates+1))
            done
        done

        gzip $OUTPUT_DIR/../remote_writer/dump.001
    fi
}

do_trigger()
{
    echo " Action: trigger"
    # Perform operations required for TRIGGER procedure
    # copy files to $OUTPUT_DIR i.e. /var/ericsson/ddc_data/<hostname>_TOR/<ddmmyy>/plugin_data
    #date >> $OUTPUT_DIR/log.info:

    store_versions_files
    store_containers_logs
    store_statistics_logs
}

do_stop()
{
    echo " Action: stop"
    # Perform operations required for STOP procedure
}

# IMPORTANT:
# Since DDC runs on all server nodes and /var/ericsson/ddc_data/config/plugins is seen by all DDC services, it is important that you ensure that you only run app specific commands on your own node types.
# One suggested way to do this is via rpm command to check that your RPM is installed on the server and a flag file/folder could also be use
# rpm -q <SG RPM> || exit 0
# Local folder /etc/ddc.d/plugins can also be used.


TASK=$1         # START, TRIGGER, STOP or MAKETAR
OUTPUT_DIR=$2   # This is passed to the plugin script by DDC and output data/files should go here. Sub-folders are recommended to be created.


case ${TASK} in
   "START") do_start
              ;;
   "TRIGGER") do_trigger
              ;;
   "STOP") do_stop
              ;;
   "MAKETAR") ;;
   *) usage
      ;;
esac

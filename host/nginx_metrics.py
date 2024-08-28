import re
import sys
import requests
import datetime
import pickle
import os
import urllib3
import shutil


urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

today = datetime.datetime.now()
datestring = today.strftime("%Y%m%d")
parent_dir = '/var/tmp/nginx_metrics/'
dir_path = parent_dir + datestring


def fetch_and_modify_metrics(sed_instance):
    url = ''
    if sed_instance == 'sed_cenm':
        url = 'https://siteengineeringdata.internal.ericsson.com:1234/nginx_status'
    elif sed_instance == 'sed_staging':
        url = 'https://siteengineeringdata.internal.ericsson.com:8888/nginx_status'
    elif sed_instance == 'sedexternal':
        url = 'https://siteengineeringdata.internal.ericsson.com/nginx_status'

    response = requests.request(
        "GET", url, verify=False)
    if response.status_code == 200:
        metrics = response.text
        return modify_metrics(metrics, sed_instance)
    else:
        return f"Error fetching data from {url}"


def modify_metrics(metrics, sed_instance):
    starting_word = '{"Labels":'
    modified_metrics = ""
    nginx_metrics = ['nginx_connections_active', 'nginx_connections_accepted', 'nginx_connections_handled',
                     'nginx_http_requests_total', 'nginx_connections_writing', 'nginx_connections_reading',
                     'nginx_connections_waiting']

    # Updating dir with daily metrics
    update_folder()
    values_for_metrics = store_results(metrics, sed_instance)
    timestamps_for_metrics = store_timestamps(sed_instance)

    for i in range(len(nginx_metrics)):
        modified_line = (f'{starting_word}{{"__name__":"{nginx_metrics[i]}", "sed_instance":"{sed_instance}",'
                         f' "statistic":"{nginx_metrics[i] + "_" + sed_instance}"'"},"
                         f'"Timestamps":{timestamps_for_metrics},"Values":{values_for_metrics[i]}}}')
        modified_metrics += modified_line + '\n'
    return modified_metrics


def update_folder():
    dir_exists = os.path.isdir(dir_path)
    if (dir_exists == False):
        for root, dirs, files in os.walk(parent_dir):
            for f in files:
                os.unlink(os.path.join(root, f))
            for d in dirs:
                shutil.rmtree(os.path.join(root, d))
        os.mkdir(dir_path)


def  store_timestamps(sed_instance):
    unix_timestamp = int(datetime.datetime.timestamp(today) * 1000)
    path_to_file = dir_path + '/' + sed_instance +'_timestamps.pk'
    timestamps = []
    file_exists = os.path.exists(path_to_file)
    if file_exists:
        with open(path_to_file, 'rb') as fi:
            timestamps = pickle.load(fi)

    timestamps.append(unix_timestamp)

    with open(path_to_file,'wb') as fi:
        pickle.dump(timestamps,fi)

    return timestamps


def store_results(metrics, sed_instance):
    values_for_metrics = [[] for _ in range (7)]
    filename = '_values.pk'
    match1 = re.search(r"Active connections:\s+(\d+)", metrics)
    match2 = re.search(r"\s*(\d+)\s+(\d+)\s+(\d+)", metrics)
    match3 = re.search(r'Reading:\s*(\d+)\s*Writing:\s*(\d+)\s*Waiting:\s*(\d+)', metrics)
    path_to_file = dir_path + '/' + sed_instance + filename
    file_exists = os.path.exists(path_to_file)
    if file_exists:
        with open(path_to_file, 'rb') as fi:
            values_for_metrics = pickle.load(fi)

    values_for_metrics[0].append((int(match1.group(1))))
    values_for_metrics[1].append((int(match2.group(1))))
    values_for_metrics[2].append((int(match2.group(2))))
    values_for_metrics[3].append((int(match2.group(3))))
    values_for_metrics[4].append((int(match3.group(1))))
    values_for_metrics[5].append((int(match3.group(2))))
    values_for_metrics[6].append((int(match3.group(3))))

    with open(path_to_file,'wb') as fi:
        pickle.dump(values_for_metrics,fi)

    return values_for_metrics


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py [SED_INSTANCE]")
        sys.exit(1)

    sed_instance = sys.argv[1]

    # Fetch and modify the metrics
    metrics_for_script = fetch_and_modify_metrics(sed_instance)
    print(metrics_for_script)

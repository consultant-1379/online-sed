#!/usr/bin/env python3
import sys
BORDER_STRONG = "##################################################################"
BORDER_WEAK = "------------------------------------------------------------------"

'''
A custom error class for no key and value
Args:
    Exception: Exception of the error
'''
class NoKeyValueException(Exception):
    pass

'''
A list of keys to be ignored
Returns:
    set: a set of keys to be ignored
'''
def to_ignore():
    ignore_keys = set()
    # Ignoring diffs between IP autopopulation details
    ignore_keys.add("Jgroups_ipaddress_end")
    ignore_keys.add("Storage_ipaddress_end")
    ignore_keys.add("Jgroups_ipaddress_start")
    ignore_keys.add("jgroups_ipaddress_start")
    ignore_keys.add("Internal_ipaddress_start")
    ignore_keys.add("Services (public IPv6)_ipaddress_start")
    ignore_keys.add("Variable_Name")
    ignore_keys.add("Start_Ip_Range")
    ignore_keys.add("Services (public IPv6)_ipaddress_end")
    ignore_keys.add("Internal_ipaddress_end")
    ignore_keys.add("Storage_ipaddress_start")
    ignore_keys.add("storage_ipaddress_end")
    ignore_keys.add("servicesIpv4_ipaddress_end")
    ignore_keys.add("internal_ipaddress_end")
    ignore_keys.add("internal_ipaddress_start")
    ignore_keys.add("servicesIpv6_ipaddress_end")
    ignore_keys.add("storage_ipaddress_start")
    ignore_keys.add("backup_ipaddress_start")
    ignore_keys.add("jgroups_ipaddress_end")
    ignore_keys.add("servicesIpv4_ipaddress_start")
    ignore_keys.add("backup_ipaddress_end")
    ignore_keys.add("servicesIpv6_ipaddress_start")
    ignore_keys.add("## THIS SED FILE IS INCOMPLETE AND NOT SUITABLE TO USE, PLEASE UPLOAD THIS FILE TO THE ONLINE SED AND POPULATE ALL INCOMPLETE VALUES  ##")
    ignore_keys.add("enable_fallback_fm_services_ipv4")
    ignore_keys.add("enable_fallback_domain_proxy")
    ignore_keys.add("enable_fallback_fm_services_ipv6")
    ignore_keys.add("enable_fallback_category")

    return ignore_keys

'''
Compare keys and output the differences in two files
Args:
    keys_a(set): set of keys in file A
    keys_b(set): set of keys in file B
'''
def compare_keys(keys_a, keys_b):
    ignore_keys = to_ignore()

    missing_in_a = keys_b - keys_a - ignore_keys
    missing_in_b = keys_a - keys_b - ignore_keys

    print(BORDER_STRONG)
    print("Comparing keys...")
    print(BORDER_STRONG)
    if not missing_in_a and not missing_in_b:
        print("All keys are present in both files.")
        print(BORDER_STRONG)
    else:
        if missing_in_a:
            print(len(missing_in_a), " keys missing in: " + file_a)
            for key in missing_in_a:
                print(key)
        print()
        print(BORDER_WEAK)
        if missing_in_b:
            print(len(missing_in_b), " keys missing in: " + file_b)
            for key in missing_in_b:
                print(key)
    print(BORDER_STRONG)
    print()
    print()

'''
Get keys and values from a file
Args:
    file_path(str): file path of the file
Returns:
    dict: a dict of keys and values in the file
'''
def extract_key_value_from_text(file_path):
    print("READING:", file_path, "...")
    keysAndValues = {}

    with open(file_path, 'r') as file:
        for line in file:
            line = line.strip()
            if line:
                if '=' in line:
                    key, value = line.split('=', 1)
                else:
                    print("WARNING: Cannot identify key and value in this line =>", line)
                    continue
                if key != '':
                    if key not in keysAndValues:
                        keysAndValues[key] = value
                    else:
                        print('WARNING: Repeated key found in one file, value will not be recorded, key:', key)
                else:
                    print("WARNING: Cannot identify key in this line =>", line)
    return keysAndValues

'''
Merge 2 dict and return the merged copy
Args:
    dict1(dict): dict 1 with keys and values
    dict2(dict): dict 2 with keys and values
Returns:
    dict: a dict of keys and values merged from 2 dicts
'''
def merge_dictionaries(dict1, dict2):
    merged_dict = dict1.copy()
    merged_dict.update(dict2)
    return merged_dict

'''
Merge 2 dict and return the merged copy
Args:
    dict_a(dict): dict a with keys and values
    dict_b(dict): dict b with keys and values
Returns:
    dict: a dict of differences between 2 different dicts
'''
def compare_key_value(dict_a, dict_b):
    keys = set(dict_a.keys()).union(set(dict_b.keys()))
    key_diff = {}
    value_diff = {}
    differences = {}
    for key in keys:
        if dict_a.get(key) != dict_b.get(key):
            if dict_a.get(key) == None or dict_b.get(key) == None:
                key_diff[key] = [dict_a.get(key), dict_b.get(key)]
            else:
                value_diff[key] = [dict_a.get(key), dict_b.get(key)]

    # Merging two dicts
    differences = merge_dictionaries(key_diff, value_diff)

    # Ignoring keys
    for key in to_ignore():
        differences.pop(key, None)

    return differences

'''
Given a dict of differences of keys and values, output the differences
Args:
    diff(dict): The differences of 2 dicts
    value_only(bool) - optional : Print value diff only
'''
def print_key_value_diff(diff, value_only=False):
    print()
    print(BORDER_STRONG)
    print("Comparing keys and values...")
    count_value = 0
    count_key = 0
    if not diff:
        print("No difference was found.")
    else:
        print("There are ", len(diff), " differences found in two files")
        if value_only is True:
            print("Note: Due to value_only set as True, printing only value differences in this method.")
        print(BORDER_STRONG)
        for k in diff.keys():
            printOutput = True
            output = []
            output.append("Key: " + k)
            if value_only is True and (diff[k][0] == None or diff[k][1] == None):
                printOutput = False

            if diff[k][0] == None:
                count_key+=1
                output.append("Key in " + file_b + " does not exist in " + file_a)
            elif diff[k][1] == None:
                count_key+=1
                output.append("Key in " + file_a + " does not exist in " + file_b)
            else:
                count_value+=1
                output.append("Different value found")
                output.append("Value in " + file_a + ": " + diff[k][0])
                output.append("Value in " + file_b + ": " + diff[k][1])
            output.append(BORDER_WEAK)

            if printOutput is True:
                for op in output:
                    print(op)
        print(BORDER_STRONG)
        if count_key > 0:
            print("There are ", count_key, " missing keys spotted in both files.")
        if count_value > 0:
            print("There are ", count_value, " value differences spotted in both files.")
    print(BORDER_STRONG)

'''
System arguements
Args:
    1(str): file_path 1
    2(str): file_path 2
'''
if len(sys.argv) != 3:
    print("Usage: python compare_keys.py <file_a> <file_b>")
    sys.exit(1)

file_a = sys.argv[1]
file_b = sys.argv[2]

try:
    # Extracting key and value from the file
    key_value_a = extract_key_value_from_text(file_a)
    if not key_value_a:
        raise NoKeyValueException("ERROR: No key and value found in " + file_a + ". Please check the file.")

    key_value_b = extract_key_value_from_text(file_b)
    if not key_value_b:
        raise NoKeyValueException("ERROR: No key and value found in " + file_b + ". Please check the file.")

    # Compare only keys in two different schemas
    compare_keys(key_value_a.keys(), key_value_b.keys())

    # Compare keys and values in two different schemas
    differences = compare_key_value(key_value_a, key_value_b)
    print_key_value_diff(differences)
except NoKeyValueException as e:
    print(e)
except Exception as e:
    print('An error occured:', e)

### This is a script used for finding the differences in Keys and Values of 2 json schema files

### To run the script, make sure python is installed. Usage: python compare_sed.py <file_a> <file_b>
```bash
EMB-FQ15QJ60 ~ % python3 compare_sed.py a.txt b.tx
READING: a.txt ...
WARNING: Cannot identify key and value in this line => Something
WARNING: Cannot identify key in this line => =
READING: b.txt ...
WARNING: Repeated key found in one file, value will not be recorded, key: key1
WARNING: Cannot identify key and value in this line => what
##################################################################
Comparing keys...
##################################################################
1  keys missing in: a.txt
key5

------------------------------------------------------------------
1  keys missing in: b.txt
key4
##################################################################



##################################################################
Comparing keys and values...
There are  5  differences found in two files
##################################################################
Key: key5
Key in b.txt does not exist in a.txt
------------------------------------------------------------------
Key: key4
Key in a.txt does not exist in b.txt
------------------------------------------------------------------
Key: c
Different value found
Value in a.txt: 2=1
Value in b.txt:
------------------------------------------------------------------
Key: key3
Different value found
Value in a.txt: c
Value in b.txt: b
------------------------------------------------------------------
Key: key1
Different value found
Value in a.txt: a
Value in b.txt:
------------------------------------------------------------------
##################################################################
There are  2  missing keys spotted in both files.
There are  3  value differences spotted in both files.
##################################################################
```

## For function print_key_value_diff(diff, value_only=False), value_only can be set to true in the compare_sed.py to view only value differences
print_key_value_diff(differences, True), example output:
```bash
EMB-FQ15QJ60 24-684464-DiffIn_P_SED % python3 compare_sed.py a.txt b.txt
READING: a.txt ...
WARNING: Cannot identify key and value in this line => Something
WARNING: Cannot identify key in this line => =
READING: b.txt ...
WARNING: Repeated key found in one file, value will not be recorded, key: key1
WARNING: Cannot identify key and value in this line => what
##################################################################
Comparing keys...
##################################################################
1  keys missing in: a.txt
key5

------------------------------------------------------------------
1  keys missing in: b.txt
key4
##################################################################



##################################################################
Comparing keys and values...
There are  5  differences found in two files
Note: Due to value_only set as True, printing only value differences in this method.
##################################################################
Key: c
Different value found
Value in a.txt: 2=1
Value in b.txt:
------------------------------------------------------------------
Key: key1
Different value found
Value in a.txt: a
Value in b.txt:
------------------------------------------------------------------
Key: key3
Different value found
Value in a.txt: c
Value in b.txt: b
------------------------------------------------------------------
##################################################################
There are  2  missing keys spotted in both files.
There are  3  value differences spotted in both files.
##################################################################
```



### Confluence page for more info: https://confluence-oss.seli.wh.rnd.internal.ericsson.com/x/oZ3dJ
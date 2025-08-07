# Structure

The data for Rebater is stored without the following file structure:

```txt
data
├── sources
│   ├── [Format/Supplier]
│   │   ├── [Quarter]
│   │   │   ├── Report.xlsx
│   :   :   :
├── transformers
│   ├── Bostik.json
│   :
├── tables
│   ├── Table.csv
│   :
├── rebates
│   ├── [Quarter]
│   │   ├── Supplier.csv
│   :   :
├── truth
│   ├── [Quarter]
│   │   ├── EXPECTED.csv
│   :   :
├── upload
│   ├── [Quarter]
│   │   ├── TOTAL.xlsx
│   :   :
```

## Sources Folder

This is where the accountant places the files they get from the suppliers. The folder follows a tree structure, where each file is sorted (1) by the format the come in and which supplier they are from, and then (2) the quarter they are for.

- Each supplier can have multiple types of formats, so do not feel forced to put all files from one supplier in just one folder.
- The sub-folder for quarter MUST follow the format `YYYY-QQ` (an example is `2024-Q1`). Any folder that do not follow this format are ignored.

## Transformers Folder

This is where the account places there transformer configurations.

## Rebates/Destination Folder

This is where the program places the rebates it extracts from the sources. They are sorted by quarter. Each file contains all rebates generated from the transformer it is created from. They are in CSV format by default.

- The sub-folder for quarter MUST follow the format `YYYY-QQ` (an example is `2024-Q1`). Any folder that do not follow this format are ignored.

## Upload/Output Folder

This is where the Excel files containing all rebates from a specific quarter are located. They are sorted by quarter.

- The sub-folder for quarter MUST follow the format `YYYY-QQ` (an example is `2024-Q1`). Any folder that do not follow this format are ignored.

# Structure

- [Structure](#structure)
  - [Overview](#overview)
  - [Sources Folder](#sources-folder)
  - [Tables/References Folder](#tablesreferences-folder)
  - [Transformers Folder](#transformers-folder)
  - [Rebates/Destination Folder](#rebatesdestination-folder)
  - [Truth Folder](#truth-folder)
  - [Upload/Output Folder](#uploadoutput-folder)

## Overview

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

## Tables/References Folder

This is where the accountant puts their [reference tables](./supplements.md#reference-tables). The name of each table is important, and most not be changed. References cannot be held in sub-folders.

## Transformers Folder

This is where the accountant places their [transformer configurations](./schema.md).

## Rebates/Destination Folder

This is where the program places the rebates it extracts from the sources. They are sorted by quarter. Each file contains all rebates generated from the transformer it is created from. They are in CSV format by default.

- The sub-folder for quarter MUST follow the format `YYYY-QQ` (an example is `2024-Q1`). Any folder that do not follow this format are ignored.

## Truth Folder

This is where the accountant the rebate data that is expected of the transformers, when they are run. They are sorted by quarter. Each file contains all rebates generated from the transformer it is created from. They are in CSV format by default.

- The sub-folder for quarter MUST follow the format `YYYY-QQ` (an example is `2024-Q1`). Any folder that do not follow this format are ignored.

## Upload/Output Folder

This is where the Excel files containing all rebates from a specific quarter are located. They are sorted by quarter.

- The sub-folder for quarter MUST follow the format `YYYY-QQ` (an example is `2024-Q1`). Any folder that do not follow this format are ignored.

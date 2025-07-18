# File Structure

- [File Structure](#file-structure)
  - [Layout](#layout)
  - [Specification](#specification)
    - [Source Folder](#source-folder)
    - [Transformers Folder](#transformers-folder)
    - [Tables Folder](#tables-folder)
    - [Rebates Folder](#rebates-folder)
    - [Truth Folder](#truth-folder)
    - [Output Folder](#output-folder)

## Layout

All data for Rebator is stored within the protected `data` folder, with in the repository. Below is a diagram of the folder.

```txt
data
├── sources
│   ├── [Format/Supplier]
│   │   ├── [Year]
│   │   │   ├── [Quarter]
│   │   │   │   ├── Report.xlsx
│   :   :   :   :
├── transformers
│   ├── Bostik.json
│   :
├── tables
│   ├── Table.csv
│   :
├── rebates
│   ├── [Year]
│   │   ├── [Quarter]
│   │   │   ├── Supplier.csv
│   :   :   :
├── truth
│   ├── [Year]
│   │   ├── [Quarter]
│   │   │   ├── EXPECTED.csv
│   :   :   :
└── OUTPUT.xlsx
```

## Specification

### Source Folder

The `sources` subfolder contains all of the source files that the transformaers take their data from. It is sorted first by supplier (and optionally supplier format), and they by year and quarter.

### Transformers Folder

The `transformers` subfolder contains all of the configurations for the transformers.

### Tables Folder

The `tables` subfolder contains all of the [reference tables](./table.md) for the Rebator.

### Rebates Folder

The `rebates` subfolder contains the output folder for the transformers. The files are sorted by supplier ID.

### Truth Folder

The `truth` subfolder contains the expected rebate output from the transformers. This is used to spot differences between it and rebates in the `rebate` folder.

### Output Folder

Finally, the `OUTPUT.xlsx` is the combined output of all the data in the `rebates` folder, into one Excel file.

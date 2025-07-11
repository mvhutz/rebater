# File Structure

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
└── OUTPUT.xlsx
```

## Specification

Let dive deeper into this structure.

- The `sources` subfolder contains all of the source files that the transformaers take their data from. It is sorted first by supplier (and optionally supplier format), and they by year and quarter.
- The `transformers` subfolder contains all of the configurations for the transformers.
- The `tables` subfolder contains all of the [reference tables](./table.md) for the Rebator.
- The `rebates` subfolder contains the output folder for the transformers. The files are sorted by supplier ID.
- Finally, the `OUTPUT.xlsx` is the combined output of all the data in the `rebates` folder, into one Excel file.

# Design Of Rebator

## High-level

```mermaid
graph LR
  subgraph Sources
    subgraph FQ1[2024 Q3]
      F1@{ shape: docs, label: "Format 1" }
      F2@{ shape: docs, label: "Format 2" }
    end
    subgraph FQ2[2024 Q4]
      F3@{ shape: docs, label: "Format 3" }
    end
  end

  subgraph Runner
    T1[[Transformer 1]]
    T2[[Transformer 2]]
    T3[[Transformer 3]]
  end

  subgraph Destinations
    subgraph DQ1[2024 Q3]
      D1[(Destination 1)]
      D2[(Destination 2)]
    end
    subgraph DQ2[2024 Q4]
      D3[(Destination 3)]
    end
  end

  subgraph Output
    O1[(2024 Q3)]
    O2[(2024 Q4)]
  end

  F1 -- Sources --> T1 -- Rebates --> D1 --> O1
  F2 -- Sources --> T2 -- Rebates --> D2 --> O1
  F3 -- Sources --> T3 -- Rebates --> D3 --> O2
```

Each quarter, the accountant is given a set of files (sources) from each supplier. When these come in, they are sorted by the accountant into the ['sources' folder](./structure.md#sources-folder). Given time, the accountant will amass a collection of files to run the Rebater on.

Separately, for each format collected, a corresponding [transformer](./transformer.md) should be made. These convert the sources of a certain format into a set of workable rebate data. The resulting data is put into its corresponding [destination](./structure.md#rebatesdestination-folder). (You can read about the process better in [this page](./transformer.md#process).)

When the user begins the program, it:

1. Collects all source files.
2. Runs each transformer, individually.
3. Collects all resulting data, and puts it in its corresponding location.

Finally, the program collects all rebates for the entire quarter, and combines it into one Excel file, and places it in [the output folder](./structure.md#uploadoutput-folder).

## Underlying Technology

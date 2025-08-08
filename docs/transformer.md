# Transformer

- [Transformer](#transformer)
  - [Overview](#overview)
  - [Process](#process)
    - [1 Extract Files](#1-extract-files)
    - [2 Preprocess Data](#2-preprocess-data)
    - [3 Extract Properties](#3-extract-properties)
    - [4 Post-process Data](#4-post-process-data)
    - [5 Store Data](#5-store-data)

## Overview

A transformer extracts from a certain format of source files.

## Process

```mermaid
graph
  S[(Sources)]

  S -- File 1 --> 1
  S -- File 2 --> 1
  S -- File 3 --> 1

  subgraph 1[1: Extract Files]
    SI@{ shape: doc, label: "Excel" }
    SS@{ shape: docs, label: "Table Data" }
    SI -- Extract --> SS
  end

  1 --> SST
  1 --> SST
  1 --> SST

  SST@{ shape: docs, label: "All Table Data" }

  SST --> 2
  SST --> 2
  SST --> 2

  subgraph 2[2: Preprocess Data]
    IT1@{ shape: doc, label: "Table" }
    OT1@{ shape: processes, label: "Table Operations" }
    FT1@{ shape: doc, label: "Modified Table" }

    IT1 --> OT1 --> FT1
  end

  2 --> SSJ
  2 --> SSJ
  2 --> SSJ

  SSJ[(Joint Table)]

  SSJ --> 3

  subgraph 3[3: Extract Properties]
    R@{ shape: doc, label: "Row" }

    subgraph P1[Property 1]
      I1((" "))
      O1@{ shape: processes, label: "Row Operations" }
      F1((" "))
    end

    subgraph P2[Property 2]
      I2((" "))
      O2@{ shape: processes, label: "Row Operations" }
      F2((" "))
    end

    subgraph P3[Property 3]
      I3((" "))
      O3@{ shape: processes, label: "Row Operations" }
      F3((" "))
    end

    RO@{ shape: doc, label: "Rebate" }

    I1 -- null --> O1 -- Property Value --> F1 --> RO
    I2 -- null --> O2 -- Property Value --> F2 --> RO
    I3 -- null --> O3 -- Property Value --> F3 --> RO
    R --> P1
    R --> P2
    R --> P3
  end

  3 --> RT
  3 --> RT
  3 --> RT

  RT[(Rebate Table)]

  RT --> 4

  subgraph 4[4: Postprocess Data]
    IT4@{ shape: doc, label: "Table" }
    OT4@{ shape: processes, label: "Table Operations" }
    FT4@{ shape: doc, label: "Modified Table" }

    IT4 --> OT4 --> FT4
  end

  4 --> FT

  FT[(Final Table)]

  FT --> D1
  FT --> D2
  FT --> D3

  subgraph 5[5: Store Rebates]
    D1@{ shape: doc, label: "Destination 1" }
    D2@{ shape: doc, label: "Destination 2" }
    D3@{ shape: doc, label: "Destination 3" }
  end
```

In brief, a transformer does the following operations:

1. Extract tabular data from a set of sources.
2. Transform each table via a certain set of operations. Combine all tables vertically into a single, processed table.
3. Chop the processed table into a set of rows, and for each row, extract a set of properties. Combine the properties into a new "rebate" object, and store them in a rebate table.
4. Run a final set of table operations on the rebates.
5. Store the rebates permanently in various destination locations.

### 1 Extract Files

```mermaid
graph LR
  S[(Sources)]

  S -- File 1 --> 1
  S -- File 2 --> 1
  S -- File 3 --> 1

  subgraph 1[1: Extract Files]
    SI@{ shape: doc, label: "Excel" }
    SS@{ shape: docs, label: "Table Data" }
    SI -- Extract --> SS
  end

  1 --> SST
  1 --> SST
  1 --> SST

  SST@{ shape: docs, label: "All Table Data" }
```

First, the transformer searches for a set of sources, and extracts the data from it, in tabular format. This is defined via [various "source" operations](./schema.md#sources).

Each operation is run sequentially, and produces 2D matrices of text data. These are all collected into one set of tables, and moved to pre-processing.

### 2 Preprocess Data

```mermaid
graph LR
  SST@{ shape: docs, label: "All Table Data" }

  SST --> 2
  SST --> 2
  SST --> 2

  subgraph 2[2: Preprocess Data]
    IT1@{ shape: doc, label: "Table" }
    OT1@{ shape: processes, label: "Table Operations" }
    FT1@{ shape: doc, label: "Modified Table" }

    IT1 --> OT1 --> FT1
  end

  2 --> SSJ
  2 --> SSJ
  2 --> SSJ

  SSJ[(Joint Table)]
```

Almost always, tables taken directly from Excel sheets are not *ready* for extraction. In this case, *ready* means:

1. Every row represents a rebate.
2. Every row contains all needed properties about that rebate.
3. No row contains data about more than one rebate.

To achieve this, each table will need to be refined. This is done through various **"table" operations**. Each operation follows the same format:

- A "table" operation receives some table.
- That table is copied, and modified in some way.
- The modified copy is returned.

Each operation is run sequentially, with each one feeding its results to the next. At the end, the final table is ready to move on to the extraction process.

*[(Learn more about the different types of table operations here.)](./schema.md#pre--and-post-processing)*

### 3 Extract Properties

```mermaid
graph
  SSJ[(Joint Table)]

  SSJ --> 3

  subgraph 3[3: Extract Properties]
    R@{ shape: doc, label: "Row" }

    subgraph P1[Property 1]
      I1((" "))
      O1@{ shape: processes, label: "Row Operations" }
      F1((" "))
    end

    subgraph P2[Property 2]
      I2((" "))
      O2@{ shape: processes, label: "Row Operations" }
      F2((" "))
    end

    subgraph P3[Property 3]
      I3((" "))
      O3@{ shape: processes, label: "Row Operations" }
      F3((" "))
    end

    RO@{ shape: doc, label: "Rebate" }

    I1 -- null --> O1 -- Property Value --> F1 --> RO
    I2 -- null --> O2 -- Property Value --> F2 --> RO
    I3 -- null --> O3 -- Property Value --> F3 --> RO
    R --> P1
    R --> P2
    R --> P3
  end

  3 --> RT
  3 --> RT
  3 --> RT

  RT[(Rebate Table)]
```

During extraction, each row is taken individually, and turned into a rebate. What this means is:

1. A row is taken from the preprocessed table.
2. A set of *properties* are extracted from this row.
3. These *properties* are combined into an object, representing a rebate.
4. The rebate object is put in a final "rebate table".

These properties can be a rebate's "purchaseAmount", "invoiceDate", "supplierId", etc. But how are these properties extracted from the row in the first place? Through a set of **row operations**. A "row" operation is a process, that takes (1) in "input" value (string, number, etc.) and (2) a row of data, and returns a modified "output" value.

```mermaid
graph LR
  VI((Value))
  R[[Row]]
  O@{ shape: diamond, label: "Op." }
  VF((New Value))

  VI --> O
  R -. Context .-> O
  O --> VF
```

> *(I suppose, it should really be called a "value" operation, with a row as context. But that is just semantics.)*

These operations are chained together, one by one. The initial value given is *null*, and pushed through these operations to generate a final value. This final value is assigned to the rebate's property.

```mermaid
graph LR
  VI((*null*))
  R[[Row]]

  VI --> O1@{ shape: diamond, label: "Op. 1" }
  R -.-> O1
  O1 --> O2@{ shape: diamond, label: "Op. 2" }
  R -.-> O2
  O2 --> O3@{ shape: diamond, label: "Op. 3" }
  R -.-> O3

  VF((Result))

  O3 --> VF
```

This process is done on all rows of the table.

*[(Learn more about the different types of row operations here.)](./schema.md#propertiesrow-transformations)*

### 4 Post-process Data

```mermaid
graph LR
  RT[(Rebate Table)]

  RT --> 4

  subgraph 4[4: Postprocess Data]
    IT4@{ shape: doc, label: "Table" }
    OT4@{ shape: processes, label: "Table Operations" }
    FT4@{ shape: doc, label: "Modified Table" }

    IT4 --> OT4 --> FT4
  end

  4 --> FT

  FT[(Final Table)]
```

After extraction, the set of rebates are combined vertically, into one giant table of rebates. From here, the transformer is allowed to refine the table further, before it is sent off to storage.

Sometimes, certain rebates should not be considered, based on various factors. It is possible for rebates with null purchases (0.00) to be extracted. So, it is common to filter them out during this stage. The same "table" operations for preprocessing apply here, as well.

*[(Learn more about the different types of table operations here.)](./schema.md#pre--and-post-processing)*

### 5 Store Data

```mermaid
graph LR
  FT[(Final Table)]

  FT --> D1
  FT --> D2
  FT --> D3

  subgraph 5[5: Store Rebates]
    D1@{ shape: doc, label: "Destination 1" }
    D2@{ shape: doc, label: "Destination 2" }
    D3@{ shape: doc, label: "Destination 3" }
  end
```

Finally, now that the rebates have been extracted, they must be placed in their appropriate location. These locations are defined through different **destinations** in the transformer.

Each rebate is copied to each permanent location.

*[(Learn more about the different types of destinations here.)](./schema.md#destinations)*

# Transformer

- [Transformer](#transformer)
  - [Overview](#overview)
  - [Process](#process)
    - [1. Extract Files](#1-extract-files)
    - [2. Preprocess Data](#2-preprocess-data)
    - [3. Extract Properties](#3-extract-properties)
    - [4. Postprocess Data](#4-postprocess-data)
    - [5. Store Data](#5-store-data)

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

### 1. Extract Files

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

First, the transformer searches for a set of sources, and extracts the data from it, in tabular format.

This is done via [various "source" operations](./schema.md#sources).

### 2. Preprocess Data

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

### 3. Extract Properties

```mermaid
graph LR
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

### 4. Postprocess Data

```mermaid
graph
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

### 5. Store Data

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

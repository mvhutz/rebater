# Transformer Schema

- [Transformer Schema](#transformer-schema)
  - [Overview](#overview)
  - [Metadata](#metadata)
    - [Transformer Name](#transformer-name)
    - [Transformer Tags](#transformer-tags)
    - [Transformer Dependencies](#transformer-dependencies)
  - [Sources](#sources)
    - [Excel](#excel)
  - [Pre/Post-Processing](#prepost-processing)
    - [Chop](#chop)
    - [Coalesce](#coalesce)
    - [Debug](#debug)
    - [Filter](#filter)
    - [Header](#header)
      - [Keep](#keep)
      - [Drop](#drop)
    - [Percolate](#percolate)
    - [Select](#select)
    - [Set](#set)
    - [Trim (Table)](#trim-table)
  - [Properties/Row Transformations](#propertiesrow-transformations)
    - [Coerce Date](#coerce-date)
    - [Coerce Number](#coerce-number)
    - [Coerce USD](#coerce-usd)
    - [Absolute](#absolute)
    - [Add](#add)
    - [Character](#character)
    - [Column](#column)
    - [Concat](#concat)
    - [Counter](#counter)
    - [Divide](#divide)
    - [Equals](#equals)
    - [Literal](#literal)
    - [Meta](#meta)
    - [Multiply](#multiply)
    - [Reference](#reference)
    - [Replace](#replace)
    - [Search](#search)
    - [Sign](#sign)
    - [Subtract](#subtract)
    - [Sum](#sum)
    - [Trim (Row)](#trim-row)
    - [Utility (Row)](#utility-row)
  - [Destinations](#destinations)
    - [Rebate](#rebate)
    - [Utility (Destination)](#utility-destination)

## Overview

Each transformer is defined by an XML document, stored in [the `transformers` folder](./structure.md#transformers-folder). It uses the following structure:

```xml
<?xml version="1.0" ?>
<transformer>
  <!-- Metadata... -->
  
  <sources>
    <!-- Sources... -->
  </sources>
  
  <preprocess>
    <!-- Table operations... -->
  </preprocess>
  
  <property name="<NAME>">
    <!-- Row operations... -->
  </property>
  
  <postprocess>
    <!-- Table operations... -->
  </postprocess>
  
  <destinations>
    <!-- Destinations... -->
  </destinations>
</transformer>
```

## Metadata

Certain information about the trasnformer itself can be specified.

### Transformer Name

A transformer can be given a name. The name must be unique; no two transformers can have the same name.

```xml
<name>My New Transformer</name>
```

### Transformer Tags

A transformer can be given a tag. These can be used to group and run certain sets of transformers. A transformer can have any number of tags.

```xml
<tag>Tag 1</tag>
<tag>Tag 2</tag>
```

### Transformer Dependencies

Some transformers require another transformer to be run before it (i.e. those which use [utilities](./supplements.md#utilites)). The user can specify these dependencies using the `<requires>` tag.

The transformer whose name matches the text inside is guaranteed to run before it.

```xml
<!-- The "Alice" transformer will be run before this transformer. -->
<requires>Alice</requires>
```

## Sources

Under the `<sources>` tag, users can specify various types of files that the transformer will use duing execution.

### Excel

The `<excel>` source extracts specific sheets from Excel source files.

| Attribute | Value | Description |
|-|-|-|
| `group` | `string` | Only Excel files from this source group will be considered. |
| `file` | `string?` | If specified, only sources matching this file name will be processed. Supports [`glob`](https://en.wikipedia.org/wiki/Glob_(programming)#Syntax) patterns. |
| `sheets` | `string[]?` | A comma-delimilated set of sheet names. If specified, only names within this list are considered. Supports [regular expressions](https://en.wikipedia.org/wiki/Regular_expression). |

```xml
<!-- Extracts all sheets named "Detail" from source files in the "American Olean-US" group. -->
<excel group="American Olean-US" sheets="Detail" />

<!-- Extracts all sheets from source files in the "Schonox" group. -->
<excel group="Schonox" />

<!-- Extracts sheets named either "2-Mapei_Indepdent Distributors" or "3-Daltile" from the source group "Mapei". -->
<excel group="Mapei" sheets="2-Mapei_Indepdent Distributors,3-Daltile" />
```

## Pre/Post-Processing

Under the `<preprocess>` and `<postprocess>` tags, users can do operations on the tabular data before or after the extraction process.

### Chop

The `<chop>` tag divides a table vertically, at a certain row. It does this by:

1. Finding the first row that matches certain criteria.
2. Choosing to keep all rows above or below that row.

Note that this operation never keeps the row that is matched.

| Attribute | Value | Description |
|-|-|-|
| `column` | `string` or `number` | The column whose cell value will be matched. Can either be an index, or an Excel column label. |
| `is` | `string[]` | A comma-separated list of values that the `column` should match, to be considered. |
| `keep` | `"top"` or `"bottom"` | When a row is matched, which side of the table to *keep*. |
| `otherwise` | `"drop"` or `"take"` | If no row is matched, whether to discard the whole table (`"drop"`), or keep the whole table (`"take"`). |

```xml
<!-- Find the first row whose column A contains either "SALES" or "TOTAL SALES". If found, keep all rows above it. Otherwise, discard the entire table. -->
<chop column="A" is="SALES,TOTAL SALES" keep="top" otherwise="drop" />
```

### Coalesce

The `<coalesce>` tag is used to *combine* certain rows based on certain criteria. Specifically, the tag defines a set of `match` columns. If any two rows contain the same value in all of these columns, they are *combined* into one row. The process to do that is:

1. Check each column, one by one.
2. If the column is in `match`, take either value. (It is the same in both rows.)
3. If the column is in `combine`, take the value in each row (assuming they are numbers), and add them together.
4. Otherwise, take the value from the first column.

Here is an example, where we `match` on column "C", and `combine` on column "A".

| Row | A | B | C | D | E |
|-|-|-|-|-|-|
| 1st | $1.81 | 2024 | 8202025440 | 0115271181 | 159814 |
| 2nd | $0.91 | 2024 | 8202025440 | 0115329617 | 162120 |
| **Final** | **$2.72** | **2024** | **8202025440** | **0115271181** | **159814** |

This process is done until no more rows can be combined.

| Attribute | Value | Description |
|-|-|-|
| `match` | `string[]` | A comma-separated list of columns to match on. |
| `combine` | `string[]` | A comma-separated list of columns to combine. |

```xml
<!-- Match on column D, and combine columns F, and G. -->
<coalesce match="D" combine="F,G" />
```

### Debug

The `<debug>` prints all tables that are passed through it. It returns the table it is given, unchanged.

The table is printed to `./utility/<QUARTER>/debug/<NAME>/<FILE>.csv`, where `QUARTER` is the current quarter, `NAME` is the name specified inside the tag, and `FILE` is the name of the source the table came from.

| Attribute | Value | Description |
|-|-|-|
| `[INSIDE]` | `string` | The name of the file that the table will be printed to. |

```xml
<!-- All tables passing through this operation will be printed to the folder "./utility/<QUARTER>/debug/TEST 1". -->
<debug>TEST 1</debug>
```

### Filter

The `<filter>` tag allows you to drop rows based on the result of a set of row operations.

It goes through each row in the table, and individually run a set of row operations on them. If the resulting value is "true", the row is kept. Otherwise, it is dropped.

| Attribute | Value | Description |
|-|-|-|
| `[INSIDE]` | `operation[]` | The set of row operations, that will be run.. |

```xml
<!-- Keeps all rows whose value in column E is "1". -->
<filter>
  <column>E</column>
  <equals>
    <literal>1</literal>
  </equals>
</filter>
```

### Header

The `<header>` tag reorganizes the columns present in a table, based on the values on their first row value (header).

The tag defines an ordered list of `names`, which identify all column's whose header matches that name. The tag can either `"keep"` these columns, or `"drop"` them.

#### Keep

If the user acts to `"keep"`, then:

- A new table is created, with each name getting its own column.
- For each name, it finds the first column with a matching header. Its data is copied over.
- If no header is found, the name is ignored, and its column is removed.
- After all columns are found, they are combined (in the order that the names where specified), and returned as a table.

Here is an example:

| Rebate $ | Year Id | Month Name |
|-|-|-|
| $1.81 | 2024 | October |
| $0.91 | 2024 | October |
| $25.84 | 2024 | October |
| $45.05 | 2024 | October |
| $2.71 | 2024 | October |
| $84.50 | 2024 | October |

I we choose to keep the names "Rebate $", "Month", "Month Name", and "Rebate $", then the resulting table would be:

| Rebate $ | Year Id | Rebate $ |
|-|-|-|
| $1.81 | October | $1.81 |
| $0.91 | October | $0.91 |
| $25.84 | October | $25.84 |
| $45.05 | October | $45.05 |
| $2.71 | October | $2.71 |
| $84.50 | October | $84.50 |

#### Drop

If the user acts to `"drop"`, then:

- The operations goes through the list of names, sequentially.
- For each name, it deletes all columns whose header matches.
- The resulting table is returned.

| Attribute | Value | Description |
|-|-|-|
| `[INSIDE]` | `string[]` | The set of names to consider. Each must be specified within a `<name>` tag. |
| `action` | `"drop"` or `"keep"` | Whether to keep the found columns, or drop them. |

```xml
<!-- Create a new table, which only the "ACCOUNT NAME", "DATE" and "INV #" columns. -->
<header action="keep">
  <name>ACCOUNT NAME</name>
  <name>DATE</name>
  <name>INV #</name>
</header>

<!-- Drop all columns named "Show Unit" -->
<header action="drop">
  <name>Show Unit</name>
</header>
```

### Percolate

The `<percolate>` tag fills in certain cells based on the values above them.

The operation looks through certain defined columns, for cells that contain some value (for example, looking for blank cells). For each cell it finds, it looks up, for the first cell that has a different value, and copied it over.

Imagine a table with a tree-like format, like this one:

| A | B | C |
|-|-|-|
| 2024 | October | $1.81 |
| | | $0.91 |
| | November | $25.84 |
| | | $45.05 |
| | | $2.71 |
| 2025 | January | $84.50 |

This does not allow for row-by-row extraction, because some rows have more data than others. To fix this, we can percolate on columns "A" and "B", matching cells with "". Now, the table looks like this:

| A | B | C |
|-|-|-|
| 2024 | October | $1.81 |
| 2024 | October | $0.91 |
| 2024 | November | $25.84 |
| 2024 | November | $45.05 |
| 2024 | November | $2.71 |
| 2025 | January | $84.50 |

Much better.

| Attribute | Value | Description |
|-|-|-|
| `columns` | `string[]` | A comma-separated list of the columns to percolate over. |
| `matches` | `string[]` | A comma-separated list of values to replace. If not defined, the operation will replace all blank cells. |

```xml
<!-- Percolates over column C, and replaces all blank cells. -->
<percolate columns="C" matches="" />
```

### Select

The `<select>` tag is a more specific version of the `<filter>` tag, which filters rows by the value of a specific column value.

| Attribute | Value | Description |
|-|-|-|
| `column` | `string` | The column to match values in. |
| `is` | `string[]` | The specific cell value to match rows against. |
| `action` | `"drop"` or `"keep"` | Whether to get rid of the any matching row (`"drop"`) or keep it (`"keep"`) and get rid of all others that do not match. |

```xml
<!-- Get rid of all rows whose column G value is "0.00". -->
<select column="G" is="0.00" action="drop"/>
```

### Set

The `<set>` tag replace the value of a specific column.

For each row, a set of row transformations are performed on it. The resulting value is put into a specific column cell of that row.

### Trim (Table)

| Attribute | Value | Description |
|-|-|-|
| `column` | `string` | The column to replace values in. |
| `[INSIDE]` | `operation[]` | The set of operations to perform on each row. |

```xml
<!-- Set each cell in column "AI" to the sum of all values in the "AE" column -->
<set column="AI">
  <sum>AE</sum>
</set>
```

## Properties/Row Transformations

### Coerce Date

### Coerce Number

### Coerce USD

### Absolute

### Add

### Character

### Column

### Concat

### Counter

### Divide

### Equals

### Literal

### Meta

### Multiply

### Reference

### Replace

### Search

### Sign

### Subtract

### Sum

### Trim (Row)

### Utility (Row)

## Destinations

### Rebate

### Utility (Destination)

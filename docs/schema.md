# Transformer Schema

- [Transformer Schema](#transformer-schema)
  - [Overview](#overview)
  - [Metadata](#metadata)
    - [Transformer Name](#transformer-name)
    - [Transformer Tags](#transformer-tags)
    - [Transformer Dependencies](#transformer-dependencies)
  - [Sources](#sources)
    - [Excel](#excel)
  - [Pre- and Post-Processing](#pre--and-post-processing)
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

Certain information about the transformer itself can be specified.

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

Some transformers require another transformer to be run before it (i.e. those which use [utilities](./supplements.md#utilities)). The user can specify these dependencies using the `<requires>` tag.

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

## Pre- and Post-Processing

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
| `[INSIDE]` | `operation[]` | The set of row operations, that will be run… |

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

| Rebate | Year Id | Month Name |
|-|-|-|
| $1.81 | 2024 | October |
| $0.91 | 2024 | October |
| $25.84 | 2024 | October |
| $45.05 | 2024 | October |
| $2.71 | 2024 | October |
| $84.50 | 2024 | October |

If we choose to keep the names "Rebate", "Month", "Month Name", and "Rebate", then the resulting table would be:

| Rebate | Year Id | Rebate |
|-|-|-|
| $1.81 | October | $1.81 |
| $0.91 | October | $0.91 |
| $25.84 | October | $25.84 |
| $45.05 | October | $45.05 |
| $2.71 | October | $2.71 |
| $84.50 | October | $84.50 |

#### Drop

If the user acts to `"drop"`, then:

- The operations go through the list of names, sequentially.
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

### Trim (Table)

The `<trim>` tag deletes a certain number of rows at the top and bottom of a table.

| Attribute | Value | Description |
|-|-|-|
| `top` | `number?` | The number of columns to remove on top. |
| `bottom` | `number?` | The number of columns to remove on the bottom. |

```xml
<!-- Remove the top column of every table that passes through. -->
<trim top="1"/>
```

## Properties/Row Transformations

Under the `<property>` tag, users can extract specific types of data from each row that is fed into transformer.

The name of the property is specified by the `name` attribute. This name must be unique.

```xml
<!-- Extracts the "purchaseId" from a row. -->
<property name="purchaseId">
  <!-- Various operations... -->
</property>
```

Each property extracts their data through various row operations. These are defined below.

### Coerce Date

The `<coerce as="date">` tag attempts to parse the value as a date. Then, it returns the formatted date.

| Attribute | Value | Description |
|-|-|-|
| `year` | `"assume"` or `"keep"` | If `"assume"`, the date's year will automatically be converted to the year of the current quarter. |
| `parse` | `string[]?` | A comma-separated list of extra formats to parse the string from. If your date is in an uncommon format, use this. |
| `format` | `string?` | Optionally, change the format to return the date in. By default, it is `M/D/YYYY`. |

```xml
<!-- Parse the date using the format "YYYYMMDD". Return it as "M/D/YYYY". -->
<coerce as="date" parse="YYYYMMDD" />

<!-- Parse the date using conventional methods. Return the quarter number (Q). -->
<coerce as="date" format="Q" />
```

### Coerce Number

The `<coerce as="number">` tag attempts to extract a number from a string.

| Attribute | Value | Description |
|-|-|-|
| `otherwise` | `string?` | If the value is not a number, return this value instead. |

```xml
<!-- Attempt to coerce to number. Otherwise, return "99999". -->
<coerce as="number" otherwise="99999" />
```

### Coerce USD

The `<coerce as="usd">` tag attempts turn a number to a USD amount. So, if you gave it `-1.111101`, it would return `$-1.11`.

| Attribute | Value | Description |
|-|-|-|
| `round` | `"up"` or `"down"` or `"default"` | The direction to round the number. |

```xml
<!-- Convert to USD; round up to 2nd decimal place. -->
<coerce as="usd" round="up" />
```

### Absolute

The `<abs>` tag returns the absolute value of its input.

```xml
<!-- Return the absolute value. -->
<abs/>
```

### Add

The `<add>` tag adds to its input, the resulting value of another set of row operations.

| Attribute | Value | Description |
|-|-|-|
| `[INSIDE]` | `operation[]` | The set of operations to perform in parallel. |

```xml
<!-- For every value, add 0.03 to it. -->
<add>
  <literal>0.03</literal>
</add>
```

### Character

The `<character>` can select or remove certain characters from its input.

| Attribute | Value | Description |
|-|-|-|
| `select` | `string` | The set of operations to perform in parallel. |
| `action` | `"keep"` or `"drop"` | If `"keep"`, all characters not present in `select` will be removed. If `"drop"`, all characters present in `select` will be removed. |

```xml
<!-- Remove all but digits. -->
<character action="keep">1234567890</character>

<!-- Remove all periods in the input. -->
<character action="drop">.</character>
```

### Column

The `<column>` tag discards the input it is given, and returns a specific column value from the given row.

| Attribute | Value | Description |
|-|-|-|
| `[INSIDE]` | `string` | The column index to extract from. |

```xml
<!-- For every row, return its first cell value (column A). -->
<column>A</column>
```

### Concat

The `<concat>` tag append to its input, the resulting value of another set of row operations.

Optionally, to can define "separator" text to go between the two values.

| Attribute | Value | Description |
|-|-|-|
| `separator` | `string?` | If specified, is placed between the two values. |
| `[INSIDE]` | `operation[]` | The set of operations to perform in parallel. |

```xml
<!-- Combines a row's column A value, and column B value, with ", " in the middle. -->
<column>A</column>
<concat separator=", ">
  <column>B</column>
</concat>

<!-- If column A was "Apple", and column B was "Banana", these operations would return "Apple, Banana". -->
```

### Counter

The `<counter>` tag initially returns 0. But, every time an input is passed through, its value increments by one.

```xml
<!-- Returns 0. -->
<counter />

<!-- Returns 1. -->
<counter />
```

### Divide

The `<divide>` tag divides its input by the resulting value of another set of row operations.

| Attribute | Value | Description |
|-|-|-|
| `[INSIDE]` | `operation[]` | The set of operations to perform in parallel. |

```xml
<!-- For every value, divide it by 0.03. -->
<divide>
  <literal>0.03</literal>
</divide>
```

### Equals

The `<divide>` tag compares its input with the resulting value of another set of row operations. If they match, it returns "true". Otherwise, it returns "false".

| Attribute | Value | Description |
|-|-|-|
| `[INSIDE]` | `operation[]` | The set of operations to perform in parallel. |

```xml
<!-- Returns "true" if its input equals "0.03". -->
<equals>
  <literal>0.03</literal>
</equals>
```

### Literal

The `<literal>` tag discards the input it is given, and returns the value inside it.

| Attribute | Value | Description |
|-|-|-|
| `[INSIDE]` | `string` | The value to return. |

```xml
<!-- Returns "0.03", no matter what input. -->
<literal>0.03</literal>
```

### Meta

The `<meta>` tag discards the input it is given, and returns a contextual value. There are a few types this could be:

- `"quarter.lastday"` returns the last day of the current quarter, in "M/D/YYYY" format.
- `"quarter.number"` returns the ordinal of the current quarter.
- `"row.source"` returns the name of the source file that the current row came from.

| Attribute | Value | Description |
|-|-|-|
| `[INSIDE]` | `string` | The meta-value to return |

```xml
<!-- Returns the quarter number, no matter what input. -->
<meta>quarter.number</meta>
```

### Multiply

The `<multiply>` tag multiplies its input by the resulting value of another set of row operations.

| Attribute | Value | Description |
|-|-|-|
| `[INSIDE]` | `operation[]` | The set of operations to perform in parallel. |

```xml
<!-- For every value, multiply it by 0.03. -->
<multiply>
  <literal>0.03</literal>
</multiply>
```

### Reference

The `<reference>` tag performs a lookup on a set of tabular data, called a [reference](./supplements.md#reference-tables).

Given a reference `table`, this operation:

- Searches the records in that reference.
- Finds the first record in with a certain property `match`, which equals the input value.
- Once found, it returns finds the `take` property of that record, and returns its value.

It only searches records whose `group` property matches those specified. If no record is found, the user is prompted to add a new record that matches this request.

| Attribute | Value | Description |
|-|-|-|
| `table` | `string` | The reference table to search in. |
| `match` | `string` | The name of the property to match against. |
| `take` | `string` | The name of the property to return. |
| `group` | `string` | Only recognize records with a group that match this. |

```xml
<!-- Imagine we have a month value, like January. -->
<literal>JANUARY</literal>

<!--
If we want to find out its quarter number, We could use a reference table. The table would contain 12 records each with a "name" property, and a "quarter" property. Then, we can use this tag to extract the correct value.

Note that, because the group property does not apply to this type of table, we can specify "*", which matches all groups.
-->
<reference table="MONTHS" match="name" take="quarter" group="*"/>

```

### Replace

The `<replace>` tag allows user to make granular modifications to parts of any input. The tag has two phases: (1) matching and (2) replacing. There are 3 ways to find matches:

- If you specify a set of `characters`, they will be replaced, each individually.
- If you specify a `substring`, each matching substring will be replaced.
- If you specify `all`, the entire string will be replaced if it matches this value.

For each part of the input that is matched, it will be replaced with "put". (Optionally, if you specify "put_meta", a [meta-value](#meta) will be replaced, instead.)

| Attribute | Value | Description |
|-|-|-|
| `characters` | `string?` | Matches any characters in the input, that are present in this value. |
| `substring` | `string?` | Matches any part of the string that equals this value. |
| `all` | `string?` | Matches the entire input against a specific value. Supports regular expressions. |
| `put` | `string?` | Replace each instance with this value. |
| `put_meta` | `string?` | Replace each instance with this meta-value. |

```xml
<!-- Replace any instances of "12/16/1996" in the input, with "12/31/2024". -->
<replace substring="12/16/1996" put="12/31/2024" />

<!-- If the input is empty, replace it with the formatted last day of the quarter. -->
<replace all="" put_meta="quarter.lastday" />
```

### Search

The `<search>` tag is a generalized version of [`<reference>`](#reference). Given a reference `table`, it searches that table for a matching record.

| Attribute | Value | Description |
|-|-|-|
| `table` | `string` | The reference table to search in. |
| `take` | `string` | The name of the property to return. |

Inside the tag, the user can place `<match>` tags. These allow the user to add criteria for *what* to search through. Each tag contains a `id` property (what property of the records to match for), and a set of child operations (performed on the input row, to determine what value to match against the property). For example, if you wish to find a record whose "customerName" was equal to "John", you would specify:

```xml
<match id="customerName">
  <literal>John</literal>
</match>
```

All row operations apply inside the `<match>` tag, allowing for complex operations. The first record matching all criteria specified is returned. When no record is found, it asks the user for input.

| Attribute | Value | Description |
|-|-|-|
| `id` | `string` | The name of the property to match against. |
| `primary` | `boolean?` | The user is given suggestions when asks for input. If `true`, this criterion will be considered. |
| `optional` | `boolean?` | If `true`, this criterion is ignored when the user is asked for input. |
| `[INSIDE]` | `operation[]` | The set of operations to determine the value to match against. |

```xml
<!-- Search "customers" for a record in the "Bostik" group, with a "customerName" equal to column B. Return that record's "fuseId". -->
<search table="customers" take="fuseId">
  <match id="customerName" primary="true">
    <column>B</column>
  </match>
  <!-- "group" is a property, after all! -->
  <match id="group" optional="true">
    <literal>Bostik</literal>
  </match>
</search>
```

### Sign

The `<sign>` tag returns the sign (-1, 0, or 1) of its input.

```xml
<!-- Return the sign value. -->
<sign/>
```

### Subtract

The `<subtract>` tag subtract from its input, the resulting value of another set of row operations.

| Attribute | Value | Description |
|-|-|-|
| `[INSIDE]` | `operation[]` | The set of operations to perform in parallel. |

```xml
<!-- For every value, subtract 0.03 from it. -->
<subtract>
  <literal>0.03</literal>
</subtract>
```

### Sum

The `<sum>` tag returns the sum of all values of a certain column. It is limited to the table that the row comes from.

| Attribute | Value | Description |
|-|-|-|
| `[INSIDE]` | `string` | The index of the column to sum. |

```xml
<!-- Imagine this returns "FILE.xlsx". -->
<meta>row.source</meta>

<!-- This returns the sum of column AE in "FILE.xlsx". -->
<sum>AE</sum>
```

### Trim (Row)

The `<trim>` tag trims any whitespace (spaces, tabs) of the ends of its input.

```xml
<!-- Trim whitespace. -->
<trim />
```

### Utility (Row)

The `<utility>` tag is identical to the [`<reference>`](#reference), but specifically for [utility tables](./supplements.md).

```xml
<!-- From the example in <reference>: if your table was a utility instead, you would use this. -->
<utility table="MONTHS" match="name" take="quarter" group="*"/>

```

## Destinations

Under the `<destinations>` tag, users can specify various locations in which the rebate data will be stored.

### Rebate

The most common destination is to store your final data as rebates, using the `<rebate>` tag. This stores your data under the `rebates` folder in your data directory.

Specifically, under `./rebates/<QUARTER>/<NAME>.csv`, where `QUARTER` is the current quarter, and `NAME` is the one specified by the tag.

| Attribute | Value | Description |
|-|-|-|
| `[INSIDE]` | `operation[]` | The name of the file you wish to store your data in. |

```xml
<!-- Store all data under "Futura.csv". -->
<rebate>Futura</rebate>
```

### Utility (Destination)

In the case that your transformer builds [utility files](./supplements.md#utilities), you can specify to place your data in them using the `<utility>` tag.

Much like the `<rebate>` tag, this stores your data under `./utility/<QUARTER>/<NAME>.csv`.

| Attribute | Value | Description |
|-|-|-|
| `[INSIDE]` | `operation[]` | The name of the file you wish to store your data in. |

```xml
<!-- Store your utility data under "Futura.csv". -->
<utility>Futura</utility>
```

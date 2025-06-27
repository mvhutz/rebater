# Data Transformer

A **Transformer** is a process that turns a *specific* format of rebate reports into a FUSE-ready state.

## Background

To give some context, there are many types of formats for reports.

- Report formats differ between suppliers.
- Per supplier, there are different types of reports, each with different formats. (For example, discrepancy reports.)
- Inside of a single report, there are different sheets, with different formats. (For example, a specific sheet for Canadian suppliers.)
- Sometimes, specific rows inside of a table may require different processing.

The point is, generalizing a complex process like rebate processing is futile. Instead the Rebator takes in a set of transformers, each which convert a tiny subset of the data into processable rebates, and run them all concurrently.

This makes the process (1) efficient while also (2) maximizing customization.

## Design

A transformer is split into five phases: (1) pulling from sources, (2) preprocessing files, (3) extracting data, (4) combining and postprocessing data, and finally (5) send it to a single file.

### Pulling from Sources

First, the transformer searches for source files (Excel, PDF, *et cetera*), reads the rows of data in those files into a 2D matrix of strings. (Read about [the file structure](../structure.md) for more.)

For example, for [this Excel sheet](./example.xlsx), it would be read into a matrix of data like below:

| A      | B          | C     | D   | E     | F      |
| ------ | ---------- | ----- | --- | ----- | ------ |
| Amount | Rebate ($) | Date  |     | Total | $72.79 |
| 469.56 | 14.09      | 45933 |     |       |        |
| 0      | 0          | 45934 |     |       |        |
| 148.93 | 4.47       | 45940 |     |       |        |
| 523.03 | 15.69      | 45943 |     |       |        |
| 314.63 | 9.44       | 45943 |     |       |        |
| 438.87 | 13.17      | 45943 |     |       |        |
| 243.10 | 7.29       | 45944 |     |       |        |

*[(Read more about different types of sources here.)](./sources.md)*

### Preprocessing Data

Next, the Rebator sends each table read from the source files through a set of preprocessing steps. These are run sequentially, one-by-one, for each table. These can include: trimming the top and bottom, removing certain columns or rows based on criteria, and much more. The point of this is to get the data into a format that we can extract information from. *[(Read more about different types of preprocessing transformations here.)](./preprocessing.md)*

In the example above, if we trim the top row of the table, we get the following table:

| A      | B     | C     |
| ------ | ----- | ----- |
| 469.56 | 14.09 | 45933 |
| 288.29 | 8.65  | 45934 |
| 0      | 0     | 45940 |
| 523.03 | 15.69 | 45943 |
| 314.63 | 9.44  | 45943 |
| 438.87 | 13.17 | 45943 |
| 243.10 | 7.29  | 45944 |

This is much more suitable for data extraction.

### Extracting Data

Now, the data is in a row-by-row format, with the data we desire clearly presented. Now, we must extract the relevant content. Specifically:

1. The transformer reads each table, row by row, and selects a specific set of properties to save. (These are specified within [its schema](../shema.md).)
2. For each property, the transformers runs a set of defined transformations (much like how we preprocessed the data in the previous step). The intent is to produce a single value from that row, for that property.
3. Once all proerties are found (for a given row), they are then combined into a new, resulting row.
4. Finally, once all resulting rows are found, they are combined into a final table.

For our example above, image we want our final table to contain the `rebateAmount`, `purchaseAmount`, and `invoiceDate`. We can define each property to have the following transformations, given a specific row `R`:

- For `purchaseAmount`, take `R`, and get column `A`. Format it as a USD amount, and return.
- For `rebateAmount`, take `R`, and get column `B`. Format it as a USD amount, and return.
- For `invoiceDate`, take `R`, and get column `C`. Convert it from a Excel date (which is the number of days since 1900) into the format `MM/DD/YYYY`. Return the formated date.

With this set of transformations, we run them all on each row of the table above, and get the resulting table below:

| purchaseAmount | rebateAmount | invoiceDate |
| -------------- | ------------ | ----------- |
| $469.56        | $14.09       | 10/3/2025   |
| $288.29        | $8.65        | 10/4/2025   |
| $0.00          | $0.00        | 10/10/2025  |
| $523.03        | $15.69       | 10/13/2025  |
| $314.63        | $9.44        | 10/13/2025  |
| $438.87        | $13.17       | 10/13/2025  |
| $243.10        | $7.29        | 10/14/2025  |

*[(Read more about different types of extraction transformations here.)](./extraction.md)*

### Postprocessing Data

Next, the transformation makes any final touches on the data. It uses the same methods as the preprocessing step does. In essense, this is to cull any unneeded data.

For our example, let's say we do not want to record rebates that do not reimbuse the supplier at all. In this case, we can chose to drop all rows for with the `rebateAmount` is `$0.00`. Now, our data look like this:

| purchaseAmount | rebateAmount | invoiceDate |
| -------------- | ------------ | ----------- |
| $469.56        | $14.09       | 10/3/2025   |
| $288.29        | $8.65        | 10/4/2025   |
| $523.03        | $15.69       | 10/13/2025  |
| $314.63        | $9.44        | 10/13/2025  |
| $438.87        | $13.17       | 10/13/2025  |
| $243.10        | $7.29        | 10/14/2025  |

### Destination

Finally, each transformer sends their final table into a certain file. This can can in the form of Excel, CSV, or more.

*[(Read more about different types of destinations here.)](./destination.md)*

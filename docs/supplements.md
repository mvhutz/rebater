# Supplemental Data

- [Supplemental Data](#supplemental-data)
  - [Overview](#overview)
  - [Reference Tables](#reference-tables)
  - [Utilities](#utilities)

## Overview

During the execution of row and table transformations, the program is given extraneous data, to help broaden the capabilities of those operations.

## Reference Tables

A **reference** is a table of data, used by transformers as a lookup guide. They are stored as CSV files under [the `tables` folder](./structure.md#tablesreferences-folder). These tables are meant to be modified by the accountant.

There are some important restrictions on the type of data present in a reference file:

1. Each column header must be unique.
2. Each record must have a value for "group". This determines which transformer can use this record. Each record can only have one group. If the accountant wishes all transformers to use this record, they may specify the wildcard value of "*".

## Utilities

These are reference tables, built by other transformers, using the [`<utility>` tag](./schema.md#utility-destination). They are identical to reference tables.

To ensure a transformer can use it, it must make sure to [`<require>`](./schema.md#transformer-dependencies) that the transformer which makes the utility is run before it.

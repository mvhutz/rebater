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

The transformer whose name matches the text inside is garunteed to run before it.

```xml
<!--
The "Alice" transformer will be
run before this transformer.
-->
<requires>Alice</requires>
```

## Sources

Under the `<sources>` tag, users can specify various types of files that the transformer will use duing execution.

### Excel

## Pre/Post-Processing

### Chop

### Coalesce

### Debug

### Filter

### Header

### Percolate

### Select

### Set

### Trim (Table)

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

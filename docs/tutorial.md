# Tutorial

## Quick Start

To begin using **Rebator**, follow these steps below:

1. In settings, under the "Advanced" tab, ensure a folder is set for the ["Data Directory"](./structure.md). This diectory will hold your sources, [transformers](./transformer.md), and output files. Unless you have your own pre-filled folder, it should begin empty.
2. Under the `sources` sub-folder, begin placing your sources into groups, separated by format. Format meaning, not just what file type each file is, but *how* the data is structured inside.
   1. Inside each group, sort the files by year, and quarter. In the end, every file should have the path `./sources/GROUP/????/Q?/FILE.xlsx`.
3. Now that you have some source files, you need to create some transformer configurations. Look at [this reference](./configuration.md) for the schema, and [this high-level explanation](./transformer.md) for some intuition.
4. Next, under "Context" tab in settings, select the year and quarter you wish to process.
5. Optionally, select which transformers you wish to run in the "Transformers" tab.
6. Finally, in the system page, press the big blue "Start" button.

## Pages

On the left side of the app, there are pages for system status and documentation.

### System Page

The page controls and displays system status. You can start the system here, cancel it during processing, and view its results.

#### Performance Results Table

When finished running, the system will generate a report, detailing how long each transformer took to complete. Click the button that appears bellow the status icon to view it.

#### Discrepancy Table

When finished running, the system will optionally generate a report, detailing the differences between rebates found in the `rebates` folder, and those in the `truth` folder. Click the button that appears bellow the status icon to view it.

You can enable this feature in the "Advanced" tab of settings.

## Visibility

In the top right corner of the page, there is a drop down to show/hide the tabs on top, or the settings bar to the side.

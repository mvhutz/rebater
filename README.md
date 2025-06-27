# 👷 Rebator

A desktop application to automate Fuse Alliance's Rebate process for its suppliers. The process of manually extracting data from FUSE reports is a long, complicated process. There are many, inconsistent formats for the data, depending on the many different suppliers. This application attempts to make the process faster, and simpler.

## Design

Rebator runs a set of [transformers](./docs/transformer/index.md) on a [directory of reports](./docs/structure.md) from the suppliers, and turns into a resulting rebate table.

## Installation

To download the Rebator, complete the following steps:

1. Download [Node.js v24](https://nodejs.org/en/download).
2. [Clone the repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) for Rebator (`mvhutz/rebator`).
3. Open a Terminal in the folder where you cloned the repository.
4. Run `npm install`, to install the dependencies of the program.

## Run

To run the program, run the command `npm start` where you cloned the repository.

## Resources

- [How do I configure Rebator?](./docs/shema.md)
- [What is the file structure for Rebator?](./docs/structure.md)
- [What is a transformer?](./docs/transformer/index.md)

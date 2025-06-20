import csv
from typing import Dict, List

NAME = "Esmer Tile"
ID = "1106"

# ---------------------------------------------------------------------------- #

GUESS_FILE = f"./data/rebates/{ID}/{NAME}.csv"
TRUTH_FILE = f"./data/truth/{ID}/full.csv"
GROUP = f"{NAME}"
CUSTOMER_OUTPUT = "./data/customer_mini.csv"
DISTRIBUTOR_OUTPUT = "./data/distributor_mini.csv"

def read_rebate(file: str):
  with open(file, newline='') as csvfile:
    reader = csv.reader(csvfile, delimiter=',', quotechar='"')
    next(reader)
    return [(row[1]+row[5]+row[7], row[3], row[4]) for row in reader]

customerNames = read_rebate(GUESS_FILE)
fuseIds = read_rebate(TRUTH_FILE)

customerMatches: Dict[str, str] = {}
distributorsMatches: Dict[str, str] = {}

for ident1, customerName, fuzzyName in customerNames:
  for ident2, fuseId, trueName in fuseIds:
    if ident1 != ident2: continue
    customerMatches[customerName] = fuseId
    distributorsMatches[fuzzyName] = trueName

customerOutput: List[List[str]] = [
  ["group", "customerName", "fuseId"]
]

distributorOutput: List[List[str]] = [
  ["group", "fuzzyName", "trueName"]
]

for customerName, fuseId in customerMatches.items():
  customerOutput.append([GROUP, customerName, fuseId])

for fuzzyName, trueName in distributorsMatches.items():
  distributorOutput.append([GROUP, fuzzyName, trueName])

with open(CUSTOMER_OUTPUT, 'w') as csvfile:
    writer = csv.writer(csvfile, delimiter=',', quotechar='"')
    writer.writerows(customerOutput)

with open(DISTRIBUTOR_OUTPUT, 'w') as csvfile:
    writer = csv.writer(csvfile, delimiter=',', quotechar='"')
    writer.writerows(distributorOutput)

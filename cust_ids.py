import csv
from typing import Dict, List

NAME = "Gallaher"
ID = "1107"

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

# 12/18/2024,1113,1174,TA Supply,$97.40,$3.90,517355,12/18/2024
# 12/17/2024,1113,1174,TA Supply,$97.40,$3.90,517355,12/17/2024

# 11/6/2024,1113,1340,TA Supply,$8.51,$0.34,479723,11/6/2024
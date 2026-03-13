#!/usr/bin/env python3
"""
Scrape ABS Census 2021 QuickStats for Australian suburbs.
Uses the ABS API endpoint for Census data.
Free, no API key needed.
"""

import json
import re
import time
import urllib.request
import urllib.error
from html.parser import HTMLParser

# Top 100 Australian suburbs by population/significance
# Format: (SAL code, suburb name, state, postcode)
# SAL codes from ABS ASGS 2021
SUBURBS = [
    # NSW
    ("SAL14168", "Sydney", "NSW", "2000"),
    ("SAL10228", "Bondi", "NSW", "2026"),
    ("SAL13222", "Parramatta", "NSW", "2150"),
    ("SAL12368", "Manly", "NSW", "2095"),
    ("SAL13734", "Surry Hills", "NSW", "2010"),
    ("SAL13003", "Newtown", "NSW", "2042"),
    ("SAL12466", "Marrickville", "NSW", "2204"),
    ("SAL13525", "Strathfield", "NSW", "2135"),
    ("SAL10541", "Burwood", "NSW", "2134"),
    ("SAL10688", "Chatswood", "NSW", "2067"),
    ("SAL13095", "North Sydney", "NSW", "2060"),
    ("SAL13291", "Penrith", "NSW", "2750"),
    ("SAL11569", "Hurstville", "NSW", "2220"),
    ("SAL10329", "Brookvale", "NSW", "2100"),
    ("SAL10063", "Bankstown", "NSW", "2200"),
    ("SAL11827", "Lane Cove", "NSW", "2066"),
    ("SAL12918", "Mosman", "NSW", "2088"),
    ("SAL13810", "Thornleigh", "NSW", "2120"),
    ("SAL10965", "Dee Why", "NSW", "2099"),
    ("SAL11076", "Epping", "NSW", "2121"),
    ("SAL14305", "Wahroonga", "NSW", "2076"),
    ("SAL12174", "Liverpool", "NSW", "2170"),
    ("SAL10267", "Blacktown", "NSW", "2148"),
    ("SAL13399", "Randwick", "NSW", "2031"),
    ("SAL10917", "Cronulla", "NSW", "2230"),
    # VIC
    ("SAL12558", "Melbourne", "VIC", "3000"),
    ("SAL13454", "Richmond", "VIC", "3121"),
    ("SAL14062", "St Kilda", "VIC", "3182"),
    ("SAL10462", "Brunswick", "VIC", "3056"),
    ("SAL11226", "Fitzroy", "VIC", "3065"),
    ("SAL10809", "Collingwood", "VIC", "3066"),
    ("SAL14058", "South Yarra", "VIC", "3141"),
    ("SAL13367", "Prahran", "VIC", "3181"),
    ("SAL10642", "Carlton", "VIC", "3053"),
    ("SAL11389", "Hawthorn", "VIC", "3122"),
    ("SAL10325", "Brighton", "VIC", "3186"),
    ("SAL10578", "Camberwell", "VIC", "3124"),
    ("SAL10292", "Box Hill", "VIC", "3128"),
    ("SAL11310", "Glen Waverley", "VIC", "3150"),
    ("SAL10736", "Clayton", "VIC", "3168"),
    ("SAL11267", "Footscray", "VIC", "3011"),
    ("SAL14499", "Williamstown", "VIC", "3016"),
    ("SAL14091", "Toorak", "VIC", "3142"),
    ("SAL11061", "Elsternwick", "VIC", "3185"),
    ("SAL10940", "Dandenong", "VIC", "3175"),
    # QLD
    ("SAL10319", "Brisbane City", "QLD", "4000"),
    ("SAL14034", "South Brisbane", "QLD", "4101"),
    ("SAL11287", "Fortitude Valley", "QLD", "4006"),
    ("SAL14596", "Woolloongabba", "QLD", "4102"),
    ("SAL13005", "New Farm", "QLD", "4005"),
    ("SAL14408", "West End", "QLD", "4101"),
    ("SAL13183", "Paddington", "QLD", "4064"),
    ("SAL14095", "Toowong", "QLD", "4066"),
    ("SAL11585", "Indooroopilly", "QLD", "4068"),
    ("SAL14194", "Surfers Paradise", "QLD", "4217"),
    ("SAL10517", "Bundall", "QLD", "4217"),
    ("SAL14109", "Townsville City", "QLD", "4810"),
    ("SAL10566", "Cairns City", "QLD", "4870"),
    ("SAL10611", "Cannon Hill", "QLD", "4170"),
    # SA
    ("SAL10004", "Adelaide", "SA", "5000"),
    ("SAL13028", "North Adelaide", "SA", "5006"),
    ("SAL11308", "Glenelg", "SA", "5045"),
    ("SAL14262", "Unley", "SA", "5061"),
    ("SAL13032", "Norwood", "SA", "5067"),
    ("SAL13383", "Prospect", "SA", "5082"),
    # WA
    ("SAL13311", "Perth", "WA", "6000"),
    ("SAL11291", "Fremantle", "WA", "6160"),
    ("SAL14118", "Subiaco", "WA", "6008"),
    ("SAL11886", "Leederville", "WA", "6007"),
    ("SAL13001", "Nedlands", "WA", "6009"),
    ("SAL10740", "Claremont", "WA", "6010"),
    ("SAL14452", "West Perth", "WA", "6005"),
    # TAS
    ("SAL11430", "Hobart", "TAS", "7000"),
    ("SAL10089", "Battery Point", "TAS", "7004"),
    ("SAL13624", "Sandy Bay", "TAS", "7005"),
    ("SAL11849", "Launceston", "TAS", "7250"),
    # ACT
    ("SAL10610", "Canberra", "ACT", "2601"),
    ("SAL10299", "Braddon", "ACT", "2612"),
    ("SAL11732", "Kingston", "ACT", "2604"),
    # NT
    ("SAL10951", "Darwin City", "NT", "0800"),
    ("SAL13256", "Parap", "NT", "0820"),
]

class QuickStatsParser(HTMLParser):
    """Parse ABS QuickStats HTML to extract key demographic data."""
    def __init__(self):
        super().__init__()
        self.data = {}
        self.current_text = []
        self.in_body = False
    
    def handle_data(self, data):
        self.current_text.append(data.strip())
    
    def get_text(self):
        return ' '.join(t for t in self.current_text if t)


def parse_quickstats(html_text):
    """Extract key stats from QuickStats page text."""
    data = {}
    
    # Extract from the readable text
    lines = html_text.split('\n')
    full_text = html_text
    
    # Population
    m = re.search(r'People\s+([\d,]+)', full_text)
    if m:
        data['population'] = int(m.group(1).replace(',', ''))
    
    # Median age
    m = re.search(r'Median age\s+(\d+)', full_text)
    if m:
        data['medianAge'] = int(m.group(1))
    
    # Median weekly household income
    m = re.search(r'Median weekly household income\s+\$([\d,]+)', full_text)
    if m:
        data['medianWeeklyIncome'] = int(m.group(1).replace(',', ''))
        data['medianIncome'] = data['medianWeeklyIncome'] * 52
    
    # Median monthly mortgage
    m = re.search(r'Median monthly mortgage repayments?\s+\$([\d,]+)', full_text)
    if m:
        data['medianMonthlyMortgage'] = int(m.group(1).replace(',', ''))
    
    # Median weekly rent
    m = re.search(r'Median weekly rent\s+(?:\([^)]+\)\s+)?\$([\d,]+)', full_text)
    if m:
        data['medianWeeklyRent'] = int(m.group(1).replace(',', ''))
    
    # Average motor vehicles
    m = re.search(r'Average number of motor vehicles per dwelling\s+([\d.]+)', full_text)
    if m:
        data['avgMotorVehicles'] = float(m.group(1))
    
    # Average people per household
    m = re.search(r'Average number of people per household\s+([\d.]+)', full_text)
    if m:
        data['avgPeoplePerHousehold'] = float(m.group(1))
    
    return data


def fetch_quickstats(sal_code):
    """Fetch QuickStats page for a given SAL code."""
    url = f"https://www.abs.gov.au/census/find-census-data/quickstats/2021/{sal_code}"
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (compatible; PropertyDataHub/1.0; educational research)'
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='replace')
            return html
    except urllib.error.HTTPError as e:
        print(f"  HTTP Error {e.code} for {sal_code}")
        return None
    except Exception as e:
        print(f"  Error fetching {sal_code}: {e}")
        return None


def main():
    results = []
    total = len(SUBURBS)
    
    for i, (sal_code, name, state, postcode) in enumerate(SUBURBS):
        print(f"[{i+1}/{total}] Fetching {name}, {state} ({sal_code})...")
        
        html = fetch_quickstats(sal_code)
        if not html:
            print(f"  Skipped (no response)")
            continue
        
        # Parse — we need to extract from the raw HTML text
        # Simple regex-based extraction from HTML
        text_content = re.sub(r'<[^>]+>', ' ', html)
        text_content = re.sub(r'\s+', ' ', text_content)
        
        stats = parse_quickstats(text_content)
        
        if not stats.get('population'):
            print(f"  Warning: No population data found")
        
        slug = f"{name.lower().replace(' ', '-')}-{state.lower()}-{postcode}"
        
        suburb_data = {
            "slug": slug,
            "name": name,
            "state": state,
            "postcode": postcode,
            "salCode": sal_code,
            "source": "ABS Census 2021",
            **stats
        }
        
        results.append(suburb_data)
        print(f"  Got: pop={stats.get('population', '?')}, age={stats.get('medianAge', '?')}, income=${stats.get('medianIncome', '?')}")
        
        # Be polite — 1 second between requests
        time.sleep(1)
    
    # Write output
    output_path = "src/data/suburbs-abs.json"
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nDone! Wrote {len(results)} suburbs to {output_path}")
    print(f"Suburbs with population data: {sum(1 for r in results if r.get('population'))}")


if __name__ == "__main__":
    main()

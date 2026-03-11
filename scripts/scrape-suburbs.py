#!/usr/bin/env python3
"""
Scrape real AU suburb property data from government open data sources.
Sources:
  - Victorian Government Property Sales Report (via web.archive.org)
  - Additional states to be added as sources are found

No API key needed. All data is from public government reports.
"""
import json
import time
import urllib.request
import urllib.error
from pathlib import Path

# Known working government data downloads (web archive for reliability)
VIC_SOURCES = [
    {
        "url": "https://web.archive.org/web/20240718210312/https://www.land.vic.gov.au/__data/assets/excel_doc/0023/706334/median-house-q4-2023.xls",
        "period": "2023-Q4",
        "format": "xls"
    }
]

def download_file(url, dest):
    """Download a file with browser-like headers."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "*/*",
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            Path(dest).write_bytes(data)
            return True
    except Exception as e:
        print(f"  Download error: {e}")
        return False

def parse_vic_xls(filepath):
    """Parse Victorian Government Property Sales Report XLS."""
    try:
        import xlrd
    except ImportError:
        print("xlrd not installed. Run: pip install xlrd")
        return []
    
    wb = xlrd.open_workbook(filepath)
    sheet = wb.sheet_by_index(0)
    suburbs = []
    
    for r in range(7, sheet.nrows):
        name = str(sheet.cell_value(r, 0)).strip()
        if not name:
            continue
        
        median = sheet.cell_value(r, 5)  # Latest quarter median
        prev_q = sheet.cell_value(r, 4)  # Previous quarter
        num_sales = sheet.cell_value(r, 6)  # Number of sales
        
        try:
            median = int(float(median)) if median else None
        except (ValueError, TypeError):
            median = None
        try:
            prev_q = int(float(prev_q)) if prev_q else None
        except (ValueError, TypeError):
            prev_q = None
        try:
            num_sales = int(float(num_sales)) if num_sales else None
        except (ValueError, TypeError):
            num_sales = None
        
        if median and median > 50000:  # Sanity check
            growth = None
            if prev_q and prev_q > 0:
                growth = round((median - prev_q) / prev_q * 100, 1)
            
            suburbs.append({
                "name": name.title(),
                "state": "VIC",
                "postcode": "",  # Not in this dataset
                "medianHousePrice": median,
                "prevQuarterMedian": prev_q,
                "quarterlyGrowth": growth,
                "numSales": num_sales,
                "source": "Victorian Government Property Sales Report",
                "period": "2023-Q4",
                "scraped_at": time.strftime("%Y-%m-%d"),
            })
    
    return suburbs

def generate_postcodes_vic(suburbs):
    """Add postcodes for well-known VIC suburbs."""
    # Top VIC suburbs with known postcodes
    known = {
        "Melbourne": "3000", "South Yarra": "3141", "Richmond": "3121",
        "St Kilda": "3182", "Fitzroy": "3065", "Brunswick": "3056",
        "Toorak": "3142", "Hawthorn": "3122", "Footscray": "3011",
        "Geelong": "3220", "Ballarat": "3350", "Bendigo": "3550",
        "Carlton": "3053", "Collingwood": "3066", "Prahran": "3181",
        "Albert Park": "3206", "Kew": "3101", "Camberwell": "3124",
        "Brighton": "3186", "Malvern": "3144", "Armadale": "3143",
        "South Melbourne": "3205", "Port Melbourne": "3207",
        "Williamstown": "3016", "Northcote": "3070", "Preston": "3072",
        "Coburg": "3058", "Essendon": "3040", "Moonee Ponds": "3039",
        "Sunshine": "3020", "Werribee": "3030", "Cranbourne": "3977",
        "Frankston": "3199", "Dandenong": "3175", "Box Hill": "3128",
        "Glen Waverley": "3150", "Doncaster": "3108", "Ringwood": "3134",
        "Heidelberg": "3084", "Ivanhoe": "3079", "Eltham": "3095",
        "Mornington": "3931", "Rosebud": "3939", "Sorrento": "3943",
    }
    for s in suburbs:
        if s["name"] in known:
            s["postcode"] = known[s["name"]]
    return suburbs

def main():
    import tempfile
    output_path = Path(__file__).parent.parent / "src" / "data" / "suburbs-real.json"
    all_suburbs = []
    
    # === VIC DATA ===
    print("=== Downloading Victorian Government Property Data ===")
    for source in VIC_SOURCES:
        tmp = tempfile.NamedTemporaryFile(suffix=".xls", delete=False)
        tmp.close()
        print(f"Downloading {source['period']} data...")
        if download_file(source["url"], tmp.name):
            suburbs = parse_vic_xls(tmp.name)
            suburbs = generate_postcodes_vic(suburbs)
            print(f"  Parsed {len(suburbs)} suburbs from VIC {source['period']}")
            all_suburbs.extend(suburbs)
        else:
            print(f"  Failed to download {source['url']}")
    
    # === Save results ===
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(all_suburbs, indent=2))
    print(f"\nTotal: {len(all_suburbs)} suburbs saved to {output_path}")
    
    # Stats
    has_price = sum(1 for s in all_suburbs if s.get("medianHousePrice"))
    has_growth = sum(1 for s in all_suburbs if s.get("quarterlyGrowth") is not None)
    print(f"With prices: {has_price}, With growth data: {has_growth}")
    
    # Top 5 most expensive
    by_price = sorted([s for s in all_suburbs if s.get("medianHousePrice")], 
                       key=lambda x: x["medianHousePrice"], reverse=True)
    print("\nTop 5 most expensive:")
    for s in by_price[:5]:
        print(f"  {s['name']}, {s['state']}: ${s['medianHousePrice']:,}")

if __name__ == "__main__":
    main()

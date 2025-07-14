# Data Download Guide

This guide explains how to download RISMA (Real-time In-Situ Monitoring for Agriculture) and Sentinel-1 SAR data using the provided tools.

## RISMA Data Download

RISMA provides soil moisture, temperature, and other agricultural measurements across Canadian stations.

### Setup and Usage

```python
from inversion import RismaData

# Initialize RISMA data downloader
risma = RismaData(workspace_dir='../assets')

# Define parameters
stations = ['RISMA_MB1', 'RISMA_MB2', 'RISMA_MB3', 'RISMA_MB4',
           'RISMA_MB5', 'RISMA_MB6', 'RISMA_MB7', 'RISMA_MB8',
           'RISMA_MB9', 'RISMA_MB10', 'RISMA_MB11', 'RISMA_MB12',
           'RISMA_MB13']
parameters = ['Air Temp', 'Soil temperature', 'Soil Moisture']
sensors = 'average'
depths = ['0 to 5 cm', '5 cm']

# Download data
risma.download_risma_data(
    out_dir='../assets/inputs/RISMA_CSV_files',
    stations=stations,
    parameters=parameters,
    sensors=sensors,
    depths=depths,
    start_date='2023-01-01',
    end_date='2024-01-01'
)

# Load the downloaded data
risma_df = risma.load_df()
```

## Sentinel-1 Data Download

Sentinel-1 provides SAR (Synthetic Aperture Radar) imagery that can be used for soil moisture estimation.

### Prerequisites

1. Google Earth Engine account
2. Valid GEE project ID
3. ROI (Region of Interest) asset uploaded to GEE

### Usage

```python
from inversion import S1Data

# Define station IDs
stations = ['MB1', 'MB2', 'MB3', 'MB4', 'MB5', 'MB6', 'MB7', 'MB8', 
           'MB9', 'MB10', 'MB11', 'MB12', 'MB13', 'MB14', 'MB15']

# Initialize Sentinel-1 downloader
s1 = S1Data(workspace_dir='../assets', auto_download=False)

# Download data
s1.download_S1_data(
    stations=stations,
    buffer_distance=20,
    start_date='2010-01-01',
    end_date='2024-01-01',
    gee_project_id='your-gee-project-id',
    roi_asset_id='RISMA_Stations_Canada'
)

# Load the downloaded data
s1_df = s1.load_df()
```

## Output Format

### RISMA Data
- CSV files containing time series of:
  - Air temperature
  - Soil temperature
  - Soil moisture
  - Additional meteorological parameters

### Sentinel-1 Data
- Processed SAR data including:
  - VV polarization
  - VH polarization
  - Incidence angles
  - Orbit information

## Data Structure

The downloaded data will be organized in the following structure:
```
assets/
├── inputs/
│   ├── RISMA_CSV_files/
│   │   └── [station_data].csv
│   └── Sentinel1_CSV_files/
│       └── [processed_sar_data].csv
└── outputs/
    └── [processed_results].csv
```

## Notes

- Ensure you have sufficient storage space for Sentinel-1 data
- RISMA data download requires stable internet connection
- GEE queries might take time depending on the area and time range
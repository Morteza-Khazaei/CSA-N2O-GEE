# Soil Moisture and Roughness Estimation using Sentinel-1

This repository contains the complete workflow for estimating soil surface parameters—specifically soil moisture and roughness—from Sentinel-1 radar backscatter using radiative transfer models and machine learning.

## Project Overview

The workflow consists of four main components:
1. Data acquisition from RISMA stations and Sentinel-1
2. Phenology calculation using BBCH scale
3. Soil parameter inversion using radiative transfer models
4. Ensemble Random Forest modeling and GEE deployment

## Project Structure

### 1. Data Download (`download/`)

Downloads and processes required datasets:
- RISMA station data (soil moisture, temperature)
- Sentinel-1 SAR data (VV/VH backscatter)

### 2. Phenology Calculation (`phenology/`)

Calculates crop growth stages using:
- Growing Degree Days (GDD)
- BBCH scale conversion
- Temporal progression modeling

### 3. Parameter Inversion (`inversion/`)

Performs radiative transfer model inversion to estimate:
- Surface Soil Moisture (SSM)
- Surface Soil Temperature (SST)
- Roughness parameters (s, l)
- Vegetation parameters (c, d, w)

### 4. Ensemble Modeling (`modeling/`)

Trains and deploys Random Forest models:
- Multiple parameter estimation
- Model performance evaluation
- GEE model deployment

## Setup and Installation

### Prerequisites
- Python 3.7+
- Google Earth Engine account
- Git

### Installation

```bash
# Clone repository
pip install git+https://github.com/Morteza-Khazaei/inversion.git
cd inversion

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies in normal mode
pip install .

# Install dependencies in development mode
pip install -e .
```

## Data Structure

```
assets/
├── config/
│   ├── gdd/
│   │   ├── crop_base_temp.json        # Base temperature for GDD calculation
│   │   ├── crop_bbch_k_b_coff.json    # BBCH conversion coefficients
│   │   └── crop_gdd_thresh.json       # GDD thresholds for growth stages
│   └── inversion/
│       └── crop_inversion_bounds.json  # Parameter bounds for RT models
├── inputs/
│   ├── RISMA_CSV_files/
│   │   ├── RISMA_MB1_2010_to_2024.csv
│   │   ├── RISMA_MB2_2010_to_2024.csv
│   │   └── ...
│   └── Sentinel1_CSV_files/
│       └── ...
└── outputs/
    ├── bbch_df.csv                     # Phenology results
    ├── inv_df.csv                      # Inversion results
    ├── ensemble_trees_s_n15_md15.csv   # RF model for roughness
    ├── ensemble_trees_SSM_n15_md15.csv # RF model for soil moisture
    └── ensemble_trees_vvs_n15_md15.csv # RF model for backscatter
```

## Usage

Each component has its own README with detailed instructions:
- [Data Download Guide](download/README.md)
- [Phenology Calculation Guide](phenology/README.md)
- [Inversion Guide](inversion/README.md)
- [Estimation Guide](modeling/README.md)

## References

- BBCH Scale Documentation
- Sentinel-1 Technical Guide
- RISMA Network Documentation
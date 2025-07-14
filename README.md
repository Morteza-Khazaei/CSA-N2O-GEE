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

### 4. Ensemble Modeling (`estimation/`)

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
├── inputs/
│   ├── RISMA_CSV_files/
│   └── Sentinel1_CSV_files/
└── outputs/
    ├── bbch_df.csv
    ├── inv_df.csv
    └── rf_models/
```

## Usage

Each component has its own README with detailed instructions:
- [Data Download Guide](download/README.md)
- [Phenology Calculation Guide](phenology/README.md)
- [Inversion Guide](inversion/README.md)
- [Estimation Guide](estimation/README.md)

## References

- BBCH Scale Documentation
- Sentinel-1 Technical Guide
- RISMA Network Documentation
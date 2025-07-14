# Soil Parameter Inversion Guide

This guide explains how to perform soil parameter inversion using Sentinel-1 SAR data and RISMA ground measurements.

## Overview

The inversion process estimates soil parameters including:
- Surface Soil Moisture (SSM)
- Surface Soil Temperature (SST)
- Roughness parameters (s, l)
- Vegetation parameters (c, d, w)

## Prerequisites

Before running the inversion, you need:
1. Processed Sentinel-1 data (VV/VH backscatter)
2. RISMA ground measurements
3. BBCH phenological stages

## Usage

```python
from inversion import Inverse

# Configure RT models
RT_models = {
    'RT_s': 'PRISM1',  # Options: 'AIEM', 'PRISM1'
    'RT_c': 'Diff'     # Options: 'Diffuse', 'Specular'
}

# Initialize inverter
inv = Inverse(
    workspace_dir='../assets',
    fGHz=5.405,        # Sentinel-1 frequency
    models=RT_models,
    acftype='exp'      # Autocorrelation function type
)

# Run inversion
inv_df = inv.run(input_df)

# Save results
inv_df.to_csv("../assets/outputs/inv_df.csv", index=False)
```

## Input Parameters

The input DataFrame should contain:
- `date`: Observation date
- `doy`: Day of Year
- `year`: Year
- `VV`: VV polarization backscatter
- `VH`: VH polarization backscatter
- `BBCH`: Growth stage
- `lc`: Land cover type

## Output Parameters

The inversion produces:
- `SSM`: Surface Soil Moisture [m³/m³]
- `SST`: Surface Soil Temperature [K]
- `s`: RMS height [cm]
- `l`: Correlation length [cm]
- `c`: Vegetation cover fraction
- `d`: Plant water content
- `w`: Plant structure parameter
- `vvs`: Simulated VV backscatter
- `vvv`: Vegetation contribution

## Visualization

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Plot time series of all parameters
parameters = ['VV', 'VH', 'vvs', 'vvv', 'SSM', 'SST', 'c', 's', 'l', 'd', 'w']
num_parameters = len(parameters)

fig, axes = plt.subplots(num_parameters, 1, figsize=(10, 3 * num_parameters), sharex=True)

for i, param in enumerate(parameters):
    sns.lineplot(ax=axes[i], x='doy', y=param, data=inv_df, hue='year', style='lc')
    axes[i].set_title(param)

plt.tight_layout()
plt.show()
```

## Data Structure

```
assets/
├── inputs/
│   ├── RISMA_CSV_files/
│   └── Sentinel1_CSV_files/
└── outputs/
    ├── bbch_df.csv
    └── inv_df.csv
```

## Notes

- The inversion process combines radiative transfer models for both soil and vegetation
- PRISM1 is used for soil backscatter modeling
- Diffuse scattering is considered for vegetation contribution
- Results are sensitive to input data quality and model parameters
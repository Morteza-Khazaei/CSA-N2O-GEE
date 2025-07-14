# Ensemble Random Forest Estimation Guide

This guide explains how to use Ensemble Random Forest models for soil parameter estimation using inverted SAR data.

## Overview

The Ensemble RF process:
- Trains multiple Random Forest models for different soil parameters
- Uploads trained models to Google Earth Engine
- Enables large-scale soil parameter mapping

## Prerequisites

Before running the Ensemble RF, you need:
1. Processed inversion results (inv_df.csv)
2. Google Earth Engine account
3. Valid GEE project ID

## Usage

```python
from inversion import RegressionRF
import pandas as pd

# Load inverted data
inv_df = pd.read_csv("../assets/outputs/inv_df.csv", parse_dates=['date'])

# Initialize RF model
ensrf = RegressionRF(workspace_dir='../assets', df=inv_df)

# Train RF models
rf_models = ensrf.run(vars=['SSM', 'vvs', 's'])

# Upload models to GEE
passed = ensrf.upload_rf_to_gee(
    rf_models, 
    gee_project_id='your-gee-project-id', 
    save_dectree=True
)
```

## Input Parameters

The input DataFrame should contain:
- All parameters from inversion results
- Target variables for estimation (e.g., SSM, vvs, s)
- Features used for training:
  - VV/VH backscatter
  - Incidence angles
  - Temporal features
  - Land cover information

## Output Results

The process generates:
- Trained RF models for each target variable
- Model performance metrics
- Decision tree visualizations (if save_dectree=True)
- GEE-compatible model files

## Data Structure

```
assets/
├── inputs/
│   └── rf_models/
│       ├── model_SSM.pkl
│       ├── model_vvs.pkl
│       └── model_s.pkl
└── outputs/
    ├── rf_metrics.csv
    └── decision_trees/
```

## Model Parameters

Default RF parameters:
- n_estimators: 100
- max_depth: 10
- min_samples_split: 2
- min_samples_leaf: 1

## Notes

- Models are trained using cross-validation
- Performance metrics include R², RMSE, and MAE
- Uploaded models can be used for GEE-based mapping
- Decision trees help visualize the model structure
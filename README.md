# Growing Degree Days (GDD) and BBCH Calculator

This repository contains tools for calculating cumulative Growing Degree Days (GDD) and converting them to BBCH (Biologische Bundesanstalt, Bundessortenamt und Chemische Industrie) growth stages for crop phenology monitoring.

## Overview

The system calculates:
- Daily and cumulative Growing Degree Days (GDD)
- Corresponding BBCH growth stages
- Cumulative Soil Moisture (SSM)

## Requirements

- Python 3.7+
- Required packages:
  - pandas
  - numpy
  - matplotlib
  - seaborn

## Usage

1. Place your input data in the `assets` directory
2. Run the BBCH calculation:

```python
from phenology.inversion import BBCH

# Initialize BBCH calculator
pheno = BBCH(workspace_dir='assets')

# Run calculations
df = pheno.run()

# Save results
df.to_csv('assets/outputs/bbch_df.csv', index=False)
```

## Data Visualization

The package includes functions to visualize:
- GDD accumulation over time
- BBCH stages throughout the growing season
- Relationship between cumulative SSM and GDD

Example visualization code:

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Plot BBCH vs Day of Year
plt.figure(figsize=(10, 6))
sns.lineplot(x='doy', y='BBCH', data=df, hue='year')
plt.xlabel('Day of Year (DOY)')
plt.ylabel('BBCH Stage')
plt.title('Crop Development Stages Through Growing Season')
plt.show()
```

## Output Format

The generated CSV file contains the following columns:
- doy: Day of Year
- year: Growing season year
- cum_GDD: Cumulative Growing Degree Days
- cum_SSM: Cumulative Soil Surface Moisture
- BBCH: Calculated BBCH growth stage

## References

BBCH growth stages are based on the uniform BBCH scale, a system for coding phenologically similar growth stages of plants.

For more information, see:
- [BBCH Scale Documentation](https://en.wikipedia.org/wiki/BBCH-scale)
- [Growing Degree Days Calculator](https://www.canr.msu.edu/uploads/resources/pdfs/growing_degree_days_calculation_(e2959).pdf)
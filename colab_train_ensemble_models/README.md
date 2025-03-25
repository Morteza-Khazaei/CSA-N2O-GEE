# Soil Moisture and Radar Backscatter Analysis Notebook

## Overview

This Jupyter Notebook implements a workflow for analyzing soil moisture and radar backscatter using the Oh et al. (2004) empirical surface backscattering model and processes RISMA (Real-time In-Situ Soil Monitoring for Agriculture) data. The notebook includes tools for data preprocessing, modeling, visualization, and exporting machine learning models to Google Earth Engine (GEE) assets. It integrates Python libraries such as `pandas`, `numpy`, `matplotlib`, and `geemap` for Earth Engine interaction.

The primary objectives of this notebook are:
1. **Soil Moisture Processing**: Read and preprocess RISMA soil moisture data from CSV files for specific stations and time windows.
2. **Backscatter Modeling**: Implement the Oh04 model to calculate radar backscatter (HH, VV, VH polarizations) based on soil moisture, roughness, and incidence angle.
3. **Data Visualization**: Generate plots of backscatter as a function of soil moisture, roughness, or incidence angle.
4. **Machine Learning Export**: Convert Random Forest regression models to GEE-compatible assets for further analysis or deployment.

The notebook is designed for researchers or practitioners working on remote sensing, soil moisture retrieval, or radar backscatter modeling.

## Prerequisites

To run this notebook, ensure you have the following installed:

- **Python 3.11+**
- **Jupyter Notebook**
- **Required Python Libraries**:
  - `numpy`
  - `pandas`
  - `seaborn`
  - `matplotlib`
  - `scipy`
  - `os`
  - `geemap` (for Google Earth Engine integration)
  - `earthengine-api` (Python API for GEE)
- **Google Earth Engine Account**: You need an active GEE account and authentication set up to export models to GEE assets.
- **RISMA CSV Files**: Place the RISMA CSV files (e.g., `RISMA_MB11_avg_2015_2023.csv`) in the `./RISMA_CSV_SSM_2015_2023` directory.

Install dependencies using pip:
```bash
pip install numpy pandas seaborn matplotlib scipy geemap earthengine-api

# Code Structure

The notebook is organized into the following key components:

- **Imports**: Loads essential Python libraries such as `numpy`, `pandas`, `matplotlib`, `seaborn`, `scipy`, `geemap`, and `earthengine-api`.
- **SurfaceScatter Class**: A base class defining the structure for surface scattering models.
- **Oh04 Model**: Implements the Oh et al. (2004) backscatter model, including methods to calculate HH, VV, and VH polarizations and generate plots.
- **RISMA Data Processing**: Custom functions to read RISMA CSV files, filter data by orbit (ascending/descending), and aggregate soil moisture measurements.
- **GEE Integration**: Scripts to convert Random Forest models into GEE-compatible formats and export them as assets for use in Earth Engine.

These components are designed to work together, starting with data ingestion, followed by modeling, visualization, and finally exporting results.

# Key Features

The notebook offers the following standout functionalities:

- **Backscatter Modeling**: Computes radar backscatter coefficients (HH, VV, VH) based on input parameters like soil moisture, surface roughness, and incidence angle using the Oh04 model.
- **Data Visualization**: Generates insightful plots showing backscatter values (in dB) as a function of soil moisture, roughness, or incidence angle, leveraging `matplotlib` and `seaborn`.
- **Machine Learning Export**: Converts trained Random Forest regression models into GEE-compatible strings and exports them as assets, enabling scalable analysis within Google Earth Engine.

These features make the notebook a powerful tool for both local analysis and cloud-based remote sensing workflows.

# Example Data

The notebook processes RISMA soil moisture data collected from stations MB1 to MB15 over the period of 2015 to 2023. Here’s what you can expect:

- **Input**: CSV files containing soil moisture measurements, with filenames like `RISMA_MB11_avg_2015_2023.csv`.
- **Output**: Processed dataframes with columns such as:
  - `date`: Date of measurement.
  - `sensor`: Sensor identifier.
  - `SSM`: Surface soil moisture value.
  - `station`: Station identifier (e.g., MB1, MB2).
  - `op`: Orbit pass (ascending or descending).
- **Visuals**: Backscatter plots (e.g., HH, VV, VH in dB) plotted against soil moisture or other parameters.

This data serves as a practical example for testing the notebook’s modeling and visualization capabilities.

# Notes

Here are some additional tips and considerations:

- **File Paths**: If your RISMA CSV files are stored in a different directory, update the `risma_directory_path` variable in the notebook to match your setup.
- **GEE Asset Naming**: When exporting to GEE, ensure the `asset_id` is unique to avoid overwriting existing assets in your GEE project.
- **Error Handling**: The notebook assumes well-formatted CSV files. For robustness, consider adding checks for missing data or incorrect file formats.
- **Performance**: Processing large datasets or exporting many models to GEE may require stable internet and sufficient memory.

These notes can help you troubleshoot issues and optimize your experience with the notebook.

# References

The following resources were used or are recommended for further reading:

- Oh, Y. (2004). Quantitative retrieval of soil moisture content and surface roughness from multipolarized radar observations of bare soil surface. *IEEE Transactions on Geoscience and Remote Sensing*, 42(3), 596-601.
- Ulaby, F. T., Moore, R. K., & Fung, A. K. (2014). *Microwave Radar and Radiometric Remote Sensing*, Chapter 10.5.

These works provide the theoretical foundation for the backscatter modeling implemented in the notebook.
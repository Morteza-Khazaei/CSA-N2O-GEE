# Soil Moisture and Roughness Estimation using Sentinel-1

This repository contains the complete workflow for estimating soil surface parameters—specifically soil moisture and roughness—from Sentinel-1 radar backscatter. The methodology uses a radiative transfer model inside an inversion process to separate the backscatter signals from bare soil and vegetation, removing vegetation interference during the growing season.

Crop phenology is used to calculate Growing Degree Days (GDD) from ground-based soil temperature measurements, which helps in estimating crop height. This crop height information is critical for accurately modeling the vegetation's contribution to the radar signal.

Finally, ensemble models are trained and uploaded to Google Earth Engine (GEE), enabling large-scale estimation and mapping of soil moisture and roughness.

## Project Structure

The repository is organized into the following directories, each corresponding to a specific stage of the workflow:

-   `data_download/`: Scripts and notebooks for downloading the required datasets.
-   `BBCH_calculation/`: Code for calculating crop growth stages based on the BBCH scale.
-   `Inversion/`: Scripts to perform model inversion for retrieving key phenological dates.
-   `Ensemble_model_training/`: Notebooks and scripts for training ensemble models using the outputs from the inversion step.
-   `GEE_upload/`: Utilities and scripts to upload the final trained models and results to Google Earth Engine.

## Setup and Installation

To get started with this project, you need to set up a Python virtual environment and install the necessary packages.

### 1. Create a Virtual Environment

It is highly recommended to use a virtual environment to manage project dependencies. You can create one using `venv`:

```bash
# Create a virtual environment named .venv
python -m venv .venv

# Activate the virtual environment
# On Windows:
# .\.venv\Scripts\activate
# On macOS and Linux:
source .venv/bin/activate
```

### 2. Install Dependencies

Install the required packages using pip. The core `inversion` package is installed directly from its GitHub repository.

```bash
# Install the inversion package
pip install git+https://github.com/Morteza-Khazaei/inversion.git

# It is recommended to have a requirements.txt file for other dependencies.
# If available, install them using:
# pip install -r requirements.txt
```

## Workflow

The project workflow consists of five main steps, executed sequentially. Each step corresponds to a directory in this repository.

### Step 1: Download Data (`data_download/`)

The first step is to acquire all the necessary data. The scripts in the `data_download/` directory handle the download of Sentinel-1 radar imagery, weather data for soil temperature, and other required datasets.

### Step 2: Calculate BBCH (`BBCH_calculation/`)

This step uses ground-based soil temperature to calculate Growing Degree Days (GDD). This information, along with crop phenology models (e.g., BBCH scale), is used to estimate crop height throughout the growing season. The code is located in the `BBCH_calculation/` directory.

### Step 3: Perform Model Inversion (`Inversion/`)

This is the core scientific step. It uses a radiative transfer model within an inversion process. Using the crop height estimated in the previous step, it separates the Sentinel-1 backscatter signal into components from bare soil and vegetation, effectively removing vegetation interference. The scripts and logic for this process are located in the `Inversion/` directory.

### Step 4: Train Ensemble Models (`Ensemble_model_training/`)

Using the soil backscatter data from the inversion step, we train ensemble models to predict the final soil surface parameters: soil moisture and roughness. The `Ensemble_model_training/` directory contains the notebooks and scripts for this machine learning task.

### Step 5: Upload to Google Earth Engine (`GEE_upload/`)

The final step is to upload the trained ensemble models to Google Earth Engine. This allows for the large-scale application of the models to estimate and map soil moisture and roughness over vast areas. The `GEE_upload/` directory provides the necessary tools for this task.
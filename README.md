# CSA N2O Project
This repository contains the code and resources for the CSA N2O project, which focuses on estimating soil surface moisture using remote sensing data and machine learning techniques.

## Project Overview

The primary goal of this project is to develop and implement a robust methodology for estimating soil surface moisture (SSM) using Sentinel-1 radar data. The approach involves several key steps:

1.  **Vegetation Backscatter Removal**: Utilizing the water cloud model to isolate the backscatter contribution from vegetation, allowing for a more accurate assessment of the soil's backscatter.
2.  **Bare Soil Backscatter Modeling**: Training an ensemble of machine learning models to predict bare soil backscatter based on various environmental and sensor parameters.
3.  **Soil Surface Roughness Estimation**: Developing models to estimate soil surface roughness, a critical factor influencing radar backscatter.
4.  **Soil Surface Moisture Estimation**: Employing machine learning models to estimate SSM from the processed radar backscatter data, taking into account the estimated surface roughness.

## Repository Structure

The repository is organized into several directories, each containing specific components of the project:

-   **colab\_train\_ensemble\_models**: Contains Jupyter Notebooks and scripts for training the ensemble models, including data preprocessing, model training, and evaluation.
-   **data**: Stores the raw and processed datasets used in the project.
-   **gee\_scripts**: Includes scripts for interacting with Google Earth Engine (GEE), such as exporting models and performing large-scale analyses.
-   **models**: Contains the trained machine learning models and related files.
-   **utils**: Houses utility functions and scripts used across different parts of the project.
-   **README.md**: This file, providing an overview of the project and repository.

## Key Technologies

The project leverages the following key technologies:

-   **Sentinel-1**: Radar data source for backscatter measurements.
-   **Google Earth Engine (GEE)**: Cloud-based platform for geospatial data analysis and processing.
-   **Python**: Primary programming language for data processing, modeling, and scripting.
-   **Machine Learning**: Ensemble models (e.g., Random Forest, Gradient Boosting) for backscatter, roughness, and moisture estimation.
-   **Water Cloud Model**: Used for vegetation backscatter removal.

## Getting Started

To get started with the project, follow these steps:
    ```bash
    git clone https://github.com/your-username/CSA-N2O-Project.git
    ```
2.  **Install Dependencies**: Install the required Python packages. A `requirements.txt` file will be provided to facilitate this:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Set Up Google Earth Engine**: Ensure you have a Google Earth Engine account and have authenticated the Earth Engine Python API.
4.  **Explore the Notebooks**: Navigate to the `colab_train_ensemble_models` directory and explore the Jupyter Notebooks to understand the data processing and modeling steps.
5.  **Run the Scripts**: Execute the scripts in the `gee_scripts` directory to interact with Google Earth Engine and perform large-scale analyses.
6.  **Data**: Download the necessary datasets and place them in the `data` directory.
7. **Models**: Download the pre-trained models and place them in the `models` directory.
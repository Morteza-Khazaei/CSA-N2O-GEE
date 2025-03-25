# GEE Script for Soil Surface Moisture (SSM) Estimation using Sentinel-1

This Google Earth Engine (GEE) JavaScript code estimates Soil Surface Moisture (SSM) using Sentinel-1 GRD data, along with pre-trained Random Forest Regression (RFR) models. It processes Sentinel-1 data, calculates vegetation indices, and applies RFR models to estimate SSM. The results are then exported as an Earth Engine asset.

## Overview

The script performs the following key tasks:

1.  **Data Acquisition and Preprocessing:**
    * Loads RISMA station data and pre-trained RFR models from user assets.
    * Acquires Sentinel-1 GRD and Sentinel-2 SR data within a specified time range and region of interest (ROI).
    * Applies a Refined Lee speckle filter to Sentinel-1 data.
    * Calculates the Radar Vegetation Index (RVI) and converts Sentinel-1 data to dB.
    * Masks clouds in Sentinel-2 data.
    * Adds date, year, day of year, crop type, and orbit pass information to Sentinel-1 images.
2.  **SSM Estimation:**
    * Applies pre-trained RFR models to Sentinel-1 data to estimate SSM.
    * The RFR models utilize features like VV, VH, angle, RVI, year, day of year, land cover, and orbit pass.
3.  **Data Aggregation and Export:**
    * Calculates the mean SSM within buffered regions around RISMA stations.
    * Exports the aggregated SSM data as an Earth Engine asset.

## Usage

1.  **Load Assets:**
    * Ensure that the following assets are available in your GEE account:
        * `RISMA_Stations`: Feature collection of RISMA station locations.
        * `ensemble_trees_wcm_ssr_param_withRVI_n7_md15_2015to2023_RefineLEE`, `ensemble_trees_wcm_vvs_param_withRVI_n7_md15_2015to2023_RefineLEE`, `ensemble_trees_wcm_ssm_param_withRVI_n7_md15_2015to2023_RefineLEE`, `ensemble_trees_wcm_ssm_param_withRVI_n10_md20_2015to2023_RefineLEE_median`, `ensemble_trees_wcm_ssr_param_withRVI_n10_md20_2015to2023_RefineLEE_median`, `ensemble_trees_wcm_vvs_param_withRVI_n10_md20_2015to2023_RefineLEE_median`, `ensemble_trees_wcm_ssm_param_withRVI_n10_md20_2015to2023_RefineLEE_median_new_constant`, `ensemble_trees_wcm_ssr_param_withRVI_n10_md20_2015to2023_RefineLEE_median_new_constant`, `ensemble_trees_wcm_vvs_param_withRVI_n10_md20_2015to2023_RefineLEE_median_new_constant`: Pre-trained RFR models.
2.  **Set Parameters:**
    * Modify `startDate` and `endDate` to specify the desired time range.
    * Adjust the buffer distance in `RISMA_StationsBBox` if needed.
    * Modify the `labels` array to include the desired crop types from the AAFC/ACI dataset.
3.  **Run the Script:**
    * Execute the script in the GEE Code Editor.
4.  **Exported Data:**
    * The processed SSM data will be exported as an Earth Engine asset named `'RISMA_Stations_With_VSM_S1_desc_WCM_2015to2023_buffer5m_rvi_RFR_n5_md15_allcroptypes_RefineLEE'`.

## Variables

* `RISMA_Stations`: Feature collection of RISMA stations.
* `trees_ssr_param`, `trees_vvs_param`, `trees_ssm_param`, `trees_ssm_param_md`, `trees_ssr_param_md`, `trees_vvs_param_md`, `trees_ssm_param_md_new`, `trees_ssr_param_md_new`, `trees_vvs_param_md_new`: Feature collections containing pre-trained RFR models.
* `roi`: Region of interest geometry.
* `startDate`, `endDate`: Date range for data acquisition.
* `labels`: Crop type labels to keep from the AAFC/ACI dataset.
* `cropType`: AAFC/ACI crop type image.
* `remappedCropType`, `maskedCropType`: Remapped and masked crop type images.
* `S1`: Sentinel-1 GRD image collection.
* `S2`: Sentinel-2 SR image collection.
* `classifier_s_param`, `classifier_vvs_param`, `classifier_ssm_param`: RFR classifiers.
* `feature_names_n100`, `feature_names_n25`: Feature names for RFR models.
* `S1WithSSM`: Sentinel-1 image collection with SSM estimations.
* `RISMA_StationsBBox`: Buffered bounding boxes around RISMA stations.
* `stackSSM`: Stacked SSM image.
* `pointWithSSM`: Aggregated SSM data around RISMA station regions.

## Functions

* `RefinedLee(img)`: Applies the Refined Lee speckle filter.
* `leefilter(image)`: Applies the Lee speckle filter.
* `gammamap(image)`: Applies the Gamma MAP speckle filter.
* `toPower(image)`: Converts image data from dB to power units.
* `toDB(image)`: Converts image data from power units to dB.
* `normalize(image)`: Normalizes incidence angle.
* `addRVI(image)`: Calculates the Radar Vegetation Index (RVI).
* `maskS2clouds(image)`: Masks clouds in Sentinel-2 images.
* `add_params(image)`: Adds date, year, day of year, crop type, and orbit pass bands to Sentinel-1 images.

## Dependencies

* Google Earth Engine (GEE) JavaScript API
* Pre-trained RFR models stored as Earth Engine assets.
* `COPERNICUS/S1_GRD` image collection
* `COPERNICUS/S2_SR_HARMONIZED` image collection
* `AAFC/ACI` image collection

## Notes

* The RFR models are pre-trained and loaded from user assets. Ensure they are correctly configured.
* The `labels` array determines the crop types used from the AAFC/ACI dataset.
* The output scale is set to 10 meters. Adjust as needed.
* The buffer distance around RISMA stations can be adjusted in the `RISMA_StationsBBox` definition.
* The output asset name is `'RISMA_Stations_With_VSM_S1_desc_WCM_2015to2023_buffer5m_rvi_RFR_n5_md15_allcroptypes_RefineLEE'`. Change the asset name in the export function if needed.
# GEE Sentinel-1 Processing for RISMA Stations

This Google Earth Engine (GEE) JavaScript code processes Sentinel-1 GRD imagery around a specified RISMA (Regional Integrated Soil Monitoring Area) station. It applies a Refined Lee speckle filter, performs temporal analysis, and exports the resulting data as a CSV file to Google Drive.

## Overview

The script performs the following key tasks:

1.  **Region of Interest (ROI) Definition:**
    * Defines the ROI based on a specified `stationId` from the `RISMA_Stations` feature collection.
    * Applies a buffer of `bufferDistance` meters around the station geometry.
2.  **Sentinel-1 Data Acquisition and Preprocessing:**
    * Filters Sentinel-1 GRD imagery based on the ROI, date range (`startDate` to `endDate`), polarization (VV), and instrument mode (IW).
    * Applies a mask to remove edge effects.
    * Converts the data from dB to power units.
    * **Refined Lee Speckle Filtering:**
        * Applies a Refined Lee speckle filter to smooth the imagery while preserving edges. This filter is the same as the one used in SNAP s1tbx.
    * Converts the data back to dB.
    * Adds date (year and day of year) and crop type information from the `AAFC/ACI` dataset.
3.  **Temporal Analysis:**
    * Separates the Sentinel-1 collection into descending and ascending orbit passes.
    * Renames the bands for clarity, incorporating the date and orbit pass information.
    * Combines the descending and ascending collections into a single image.
4.  **Region Reduction:**
    * Reduces the combined image data within the ROI using `reduceRegions` and median reducer to extract the median value of each band within the buffered region.
5.  **Data Export:**
    * Exports the resulting feature collection as a CSV file to Google Drive, including the station ID, buffer distance, and date range in the filename.

## Usage

1.  **Set Parameters:**
    * Modify the `stationId` variable to specify the desired RISMA station.
    * Adjust the `bufferDistance` variable to define the buffer radius (in meters).
    * Change the `startDate` and `endDate` variables to set the desired date range.
2.  **Run the Script:**
    * Execute the script in the GEE Code Editor.
3.  **Exported Data:**
    * The processed data will be exported as a CSV file to your Google Drive in the specified folder (`GEE_Exports_S1_RISMA_Buffer` + `bufferDistance` + `m_refinedLee_reduce_regions`).

## Variables

* `stationId`: The ID of the RISMA station (e.g., 'MB15').
* `bufferDistance`: The buffer distance around the station (in meters).
* `startDate`: The start date for the Sentinel-1 data (e.g., '2010-01-01').
* `endDate`: The end date for the Sentinel-1 data (e.g., '2024-01-01').
* `roi`: The region of interest geometry.
* `S1`: The processed Sentinel-1 image collection.
* `desc`: Sentinel-1 images from descending orbits.
* `asc`: Sentinel-1 images from ascending orbits.
* `imagesDESC`: renamed bands for descending images.
* `imagesASC`: renamed bands for ascending images.
* `images`: combined image of ascending and descending orbits.
* `pointWithValues`: median reduced region features.

## Functions

* `RefinedLee(img)`: Applies the Refined Lee speckle filter.
* `toPower(image)`: Converts image data from dB to power units.
* `toDB(image)`: Converts image data from power units to dB.
* `enhanceImage(image)`: Adds date and crop type bands to the image.
* `renameBands(imageCollection, suffix)`: Renames image bands with a specified suffix.

## Dependencies

* Google Earth Engine (GEE) JavaScript API
* `RISMA_Stations` feature collection
* `COPERNICUS/S1_GRD` image collection
* `AAFC/ACI` image collection

## Notes

* Ensure that the `RISMA_Stations` feature collection is available in your GEE account.
* The output scale is set to 10 meters. Adjust as needed.
* The export folder is set to `'GEE_Exports_S1_RISMA_Buffer' + bufferDistance + 'm_refinedLee_reduce_regions'`. Change the folder name in the export function if needed.
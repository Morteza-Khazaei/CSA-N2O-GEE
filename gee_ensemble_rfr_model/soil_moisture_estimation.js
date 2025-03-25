var RISMA_Stations = ee.FeatureCollection("projects/ee-mortezakhazaei1370/assets/RISMA_Stations_Canada"),
    roi = /* color: #d63000 */ee.Geometry.Point([-98.00146835280317, 49.53198197535566]),
    trees_ssr_param = ee.FeatureCollection("projects/ee-mortezakhazaei1370/assets/ensemble_trees_wcm_ssr_param_withRVI_n7_md15_2015to2023_RefineLEE"),
    trees_vvs_param = ee.FeatureCollection("projects/ee-mortezakhazaei1370/assets/ensemble_trees_wcm_vvs_param_withRVI_n7_md15_2015to2023_RefineLEE"),
    trees_ssm_param = ee.FeatureCollection("projects/ee-mortezakhazaei1370/assets/ensemble_trees_wcm_ssm_param_withRVI_n7_md15_2015to2023_RefineLEE"),
    trees_ssm_param_md = ee.FeatureCollection("projects/ee-mortezakhazaei1370/assets/ensemble_trees_wcm_ssm_param_withRVI_n10_md20_2015to2023_RefineLEE_median"),
    trees_ssr_param_md = ee.FeatureCollection("projects/ee-mortezakhazaei1370/assets/ensemble_trees_wcm_ssr_param_withRVI_n10_md20_2015to2023_RefineLEE_median"),
    trees_vvs_param_md = ee.FeatureCollection("projects/ee-mortezakhazaei1370/assets/ensemble_trees_wcm_vvs_param_withRVI_n10_md20_2015to2023_RefineLEE_median"),
    trees_ssm_param_md_new = ee.FeatureCollection("projects/ee-mortezakhazaei1370/assets/ensemble_trees_wcm_ssm_param_withRVI_n10_md20_2015to2023_RefineLEE_median_new_constant"),
    trees_ssr_param_md_new = ee.FeatureCollection("projects/ee-mortezakhazaei1370/assets/ensemble_trees_wcm_ssr_param_withRVI_n10_md20_2015to2023_RefineLEE_median_new_constant"),
    trees_vvs_param_md_new = ee.FeatureCollection("projects/ee-mortezakhazaei1370/assets/ensemble_trees_wcm_vvs_param_withRVI_n10_md20_2015to2023_RefineLEE_median_new_constant");

Map.addLayer(RISMA_Stations, {}, 'risma_stations');

// Refined Lee speckle filter (same as in SNAP s1tbx!)
function RefinedLee(img) {
  // img must be in natural units, i.e. not in dB!
  // Set up 3x3 kernels 
  var weights3 = ee.List.repeat(ee.List.repeat(1,3),3);
  var kernel3 = ee.Kernel.fixed(3,3, weights3, 1, 1, false);

  var mean3 = img.reduceNeighborhood(ee.Reducer.mean(), kernel3);
  var variance3 = img.reduceNeighborhood(ee.Reducer.variance(), kernel3);

  // Use a sample of the 3x3 windows inside a 7x7 windows to determine gradients and directions
  var sample_weights = ee.List([[0,0,0,0,0,0,0], [0,1,0,1,0,1,0],[0,0,0,0,0,0,0], [0,1,0,1,0,1,0], [0,0,0,0,0,0,0], [0,1,0,1,0,1,0],[0,0,0,0,0,0,0]]);

  var sample_kernel = ee.Kernel.fixed(7,7, sample_weights, 3,3, false);

  // Calculate mean and variance for the sampled windows and store as 9 bands
  var sample_mean = mean3.neighborhoodToBands(sample_kernel); 
  var sample_var = variance3.neighborhoodToBands(sample_kernel);

  // Determine the 4 gradients for the sampled windows
  var gradients = sample_mean.select(1).subtract(sample_mean.select(7)).abs();
  gradients = gradients.addBands(sample_mean.select(6).subtract(sample_mean.select(2)).abs());
  gradients = gradients.addBands(sample_mean.select(3).subtract(sample_mean.select(5)).abs());
  gradients = gradients.addBands(sample_mean.select(0).subtract(sample_mean.select(8)).abs());

  // And find the maximum gradient amongst gradient bands
  var max_gradient = gradients.reduce(ee.Reducer.max());

  // Create a mask for band pixels that are the maximum gradient
  var gradmask = gradients.eq(max_gradient);

  // duplicate gradmask bands: each gradient represents 2 directions
  gradmask = gradmask.addBands(gradmask);

  // Determine the 8 directions
  var directions = sample_mean.select(1).subtract(sample_mean.select(4)).gt(sample_mean.select(4).subtract(sample_mean.select(7))).multiply(1);
  directions = directions.addBands(sample_mean.select(6).subtract(sample_mean.select(4)).gt(sample_mean.select(4).subtract(sample_mean.select(2))).multiply(2));
  directions = directions.addBands(sample_mean.select(3).subtract(sample_mean.select(4)).gt(sample_mean.select(4).subtract(sample_mean.select(5))).multiply(3));
  directions = directions.addBands(sample_mean.select(0).subtract(sample_mean.select(4)).gt(sample_mean.select(4).subtract(sample_mean.select(8))).multiply(4));
  // The next 4 are the not() of the previous 4
  directions = directions.addBands(directions.select(0).not().multiply(5));
  directions = directions.addBands(directions.select(1).not().multiply(6));
  directions = directions.addBands(directions.select(2).not().multiply(7));
  directions = directions.addBands(directions.select(3).not().multiply(8));

  // Mask all values that are not 1-8
  directions = directions.updateMask(gradmask);

  // "collapse" the stack into a singe band image (due to masking, each pixel has just one value (1-8) in it's directional band, and is otherwise masked)
  directions = directions.reduce(ee.Reducer.sum());  

  //var pal = ['ffffff','ff0000','ffff00', '00ff00', '00ffff', '0000ff', 'ff00ff', '000000'];
  //Map.addLayer(directions.reduce(ee.Reducer.sum()), {min:1, max:8, palette: pal}, 'Directions', false);

  var sample_stats = sample_var.divide(sample_mean.multiply(sample_mean));

  // Calculate localNoiseVariance
  var sigmaV = sample_stats.toArray().arraySort().arraySlice(0,0,5).arrayReduce(ee.Reducer.mean(), [0]);

  // Set up the 7*7 kernels for directional statistics
  var rect_weights = ee.List.repeat(ee.List.repeat(0,7),3).cat(ee.List.repeat(ee.List.repeat(1,7),4));

  var diag_weights = ee.List([[1,0,0,0,0,0,0], [1,1,0,0,0,0,0], [1,1,1,0,0,0,0], 
    [1,1,1,1,0,0,0], [1,1,1,1,1,0,0], [1,1,1,1,1,1,0], [1,1,1,1,1,1,1]]);

  var rect_kernel = ee.Kernel.fixed(7,7, rect_weights, 3, 3, false);
  var diag_kernel = ee.Kernel.fixed(7,7, diag_weights, 3, 3, false);

  // Create stacks for mean and variance using the original kernels. Mask with relevant direction.
  var dir_mean = img.reduceNeighborhood(ee.Reducer.mean(), rect_kernel).updateMask(directions.eq(1));
  var dir_var = img.reduceNeighborhood(ee.Reducer.variance(), rect_kernel).updateMask(directions.eq(1));

  dir_mean = dir_mean.addBands(img.reduceNeighborhood(ee.Reducer.mean(), diag_kernel).updateMask(directions.eq(2)));
  dir_var = dir_var.addBands(img.reduceNeighborhood(ee.Reducer.variance(), diag_kernel).updateMask(directions.eq(2)));

  // and add the bands for rotated kernels
  for (var i=1; i<4; i++) {
    dir_mean = dir_mean.addBands(img.reduceNeighborhood(ee.Reducer.mean(), rect_kernel.rotate(i)).updateMask(directions.eq(2*i+1)));
    dir_var = dir_var.addBands(img.reduceNeighborhood(ee.Reducer.variance(), rect_kernel.rotate(i)).updateMask(directions.eq(2*i+1)));
    dir_mean = dir_mean.addBands(img.reduceNeighborhood(ee.Reducer.mean(), diag_kernel.rotate(i)).updateMask(directions.eq(2*i+2)));
    dir_var = dir_var.addBands(img.reduceNeighborhood(ee.Reducer.variance(), diag_kernel.rotate(i)).updateMask(directions.eq(2*i+2)));
  }

  // "collapse" the stack into a single band image (due to masking, each pixel has just one value in it's directional band, and is otherwise masked)
  dir_mean = dir_mean.reduce(ee.Reducer.sum());
  dir_var = dir_var.reduce(ee.Reducer.sum());

  // A finally generate the filtered value
  var varX = dir_var.subtract(dir_mean.multiply(dir_mean).multiply(sigmaV)).divide(sigmaV.add(1.0));

  var b = varX.divide(dir_var);

  var result = dir_mean.add(b.multiply(img.subtract(dir_mean)));
  return(result.arrayFlatten([['sum']]));
}

//---------------------------------------------------------------------------//
// Lee filter 
//---------------------------------------------------------------------------//
/** Lee Filter applied to one image. It is implemented as described in 
 J. S. Lee, “Digital image enhancement and noise filtering by use of local statistics,” 
 IEEE Pattern Anal. Machine Intell., vol. PAMI-2, pp. 165–168, Mar. 1980.*/
 
var leefilter = function(image) {
  var KERNEL_SIZE = 3
  
  var bandNames = image.bandNames().remove('angle');
  //S1-GRD images are multilooked 5 times in range
  var enl = 5
  // Compute the speckle standard deviation
  var eta = 1.0/Math.sqrt(enl); 
  eta = ee.Image.constant(eta);

  // MMSE estimator
  // Neighbourhood mean and variance
  var oneImg = ee.Image.constant(1);

  var reducers = ee.Reducer.mean().combine({
                reducer2: ee.Reducer.variance(),
                sharedInputs: true
                });
  var stats = image.select(bandNames).reduceNeighborhood({reducer: reducers,kernel: ee.Kernel.square(KERNEL_SIZE/2,'pixels'), optimization: 'window'})
  var meanBand = bandNames.map(function(bandName){return ee.String(bandName).cat('_mean')});
  var varBand = bandNames.map(function(bandName){return ee.String(bandName).cat('_variance')});
  
  var z_bar = stats.select(meanBand);
  var varz = stats.select(varBand);

  // Estimate weight 
  var varx = (varz.subtract(z_bar.pow(2).multiply(eta.pow(2)))).divide(oneImg.add(eta.pow(2)));
  var b = varx.divide(varz);

  //if b is negative set it to zero
  var new_b = b.where(b.lt(0), 0)
  var output = oneImg.subtract(new_b).multiply(z_bar.abs()).add(new_b.multiply(image.select(bandNames)));
  output = output.rename(bandNames);
  return image.addBands(output, null, true);
}

//---------------------------------------------------------------------------//
// GAMMA MAP filter 
//---------------------------------------------------------------------------//
/** Gamma Maximum a-posterior Filter applied to one image. It is implemented as described in 
Lopes A., Nezry, E., Touzi, R., and Laur, H., 1990.  Maximum A Posteriori Speckle Filtering and First Order texture Models in SAR Images.  
International  Geoscience  and  Remote  Sensing  Symposium (IGARSS).  */

var gammamap =  function(image) {
  var KERNEL_SIZE = 7;
  var enl = 5;
  var bandNames = image.bandNames().remove('angle');
  //Neighbourhood stats
  var reducers = ee.Reducer.mean().combine({
                reducer2: ee.Reducer.stdDev(),
                sharedInputs: true
                });
  var stats = image.select(bandNames).reduceNeighborhood({reducer: reducers,kernel: ee.Kernel.square(KERNEL_SIZE/2,'pixels'), optimization: 'window'})
  var meanBand = bandNames.map(function(bandName){return ee.String(bandName).cat('_mean')});
  var stdDevBand = bandNames.map(function(bandName){return ee.String(bandName).cat('_stdDev')});
  
  var z = stats.select(meanBand);
  var sigz = stats.select(stdDevBand);
  
  // local observed coefficient of variation
  var ci = sigz.divide(z);
  // noise coefficient of variation (or noise sigma)
  var cu = 1.0/Math.sqrt(enl);
  // threshold for the observed coefficient of variation
  var cmax = Math.sqrt(2.0) * cu

  cu = ee.Image.constant(cu);
  cmax = ee.Image.constant(cmax);
  var enlImg = ee.Image.constant(enl);
  var oneImg = ee.Image.constant(1);
  var twoImg = ee.Image.constant(2);

  var alpha = oneImg.add(cu.pow(2)).divide(ci.pow(2).subtract(cu.pow(2)));

  //Implements the Gamma MAP filter described in equation 11 in Lopez et al. 1990
  var q = image.select(bandNames).expression("z**2 * (z * alpha - enl - 1)**2 + 4 * alpha * enl * b() * z", {z: z, alpha: alpha,enl: enl})
  var rHat = z.multiply(alpha.subtract(enlImg).subtract(oneImg)).add(q.sqrt()).divide(twoImg.multiply(alpha));

  //if ci <= cu then its a homogenous region ->> boxcar filter
  var zHat = (z.updateMask(ci.lte(cu))).rename(bandNames)
  //if cmax > ci > cu then its a textured medium ->> apply Gamma MAP filter
  rHat = (rHat.updateMask(ci.gt(cu)).updateMask(ci.lt(cmax))).rename(bandNames)
  //if ci>=cmax then its strong signal ->> retain
  var x = image.select(bandNames).updateMask(ci.gte(cmax)).rename(bandNames)

  // Merge
  var output = ee.ImageCollection([zHat,rHat,x]).sum();
  return image.addBands(output, null, true);
}

//Function to convert from dB
var toPower = function (image) {
  var bands = ee.Image(10.0).pow(image.select('V.*').divide(10.0));
  return image.addBands(bands, null, true);
};

//Function to convert to dB
var toDB = function (image) {
  var bands = image.select('V.*').log10().multiply(10.0);
  return image.addBands(bands, null, true);
};

var normalize = function(image) {
  // I. E. Mladenova, T. J. Jackson, R. Bindlish and S. Hensley, "Incidence Angle Normalization of Radar Backscatter Data," in IEEE Transactions on Geoscience and Remote Sensing, vol. 51, no. 3, pp. 1791-1804, March 2013, doi: 10.1109/TGRS.2012.2205264. keywords: {Backscatter;Soil moisture;Vegetation mapping;Instruments;Spaceborne radar;Aircraft;Backscatter;incidence angle effect;incidence angle normalization;Soil Moisture Active Passive (SMAP)},
  var theta_i_rad = image.select('angle').multiply(Math.PI).divide(180);
  var theta_ref = ee.Image.constant(38).rename('angle');
  var theta_ref_rad = theta_ref.multiply(Math.PI).divide(180);
  var cos2_thi = theta_i_rad.cos().pow(2);
  var cos2_thr = theta_ref_rad.cos().pow(2);
  var norm = image.select('V.*').multiply(cos2_thr).divide(cos2_thi).rename(['VV', 'VH']);
  
  return image.addBands(norm, null, true).addBands(theta_ref, null, true);
};

var addRVI = function (image){
  var rvi = image.expression('(4 * vh) / (vv + vh)', 
    {
      'vv': image.select('VV'),
      'vh': image.select('VH')
    }).rename('rvi');

    return image.addBands(rvi);
};

// var addRadarVWC = function(image){
//   // Kim, Y., Jackson, T., Bindlish, R., Hong, S., Jung, G., & Lee, K. (2013). Retrieval of wheat growth parameters with radar vegetation indices. IEEE Geoscience and Remote Sensing Letters, 11(4), 808-812.
//   var vwc = image.expression('20.786 * rvi - 7.1304', 
//     {
//       'rvi': image.select('rvi')
//     }).rename('vwc');

//     return image.addBands(vwc);
// }

var startDate = ee.Date('2015-01-01');
var endDate = ee.Date('2023-12-31');

// Define the labels you want to keep
var labels = [120, 
              130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 
              140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 
              150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 
              160, 161, 162, 163, 164, 165, 166, 167, 168, 169,
              170, 171, 172, 173, 174, 175, 176, 177, 178, 179,
              180, 181, 182, 183, 184, 185, 186, 187, 188, 189,
              190, 191, 192, 193, 194, 195, 196, 197, 198, 199];

var cropType = ee.ImageCollection('AAFC/ACI')
    .filter(ee.Filter.date(startDate, endDate))
    .first()

// Remap the image to keep only the selected classes
var remappedCropType = cropType.remap(labels, labels, 0);

// Optionally, mask out areas that don't match the selected classes
var maskedCropType = remappedCropType
  // .updateMask(remappedCropType.eq(146))
  .rename('croptype');

Map.addLayer(maskedCropType.randomVisualizer(), {}, '2020 Canada AAFC Annual Crop Inventory', false);


var bandNames = ee.List(["B2", "B3", "B4", "B5", "B6", "B7", "B8", "B8A", "B11", "B12"]);


//Sentinel-1 GRD
var S1 = ee.ImageCollection("COPERNICUS/S1_GRD")  
  .filterBounds(roi) 
  .filterDate(startDate, endDate)
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  // .filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'))
  // .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
  .map(function(image) {
    var edge = image.lt(-30.0);
    var maskedImage = image.mask().and(edge.not());
    return image.updateMask(maskedImage)
  })
  .map(toPower)
  // Apply the Refined Lee filter to each image in the collection
  .map(function(image){
    var proj = image.select('VV').projection();
    var bandNames = image.bandNames().remove('angle');
    var cleanImage = ee.ImageCollection(bandNames.map(function(b){
      var resampled = image.select([b]).resample('bicubic');
      return RefinedLee(resampled);
    })).toBands()
      .reproject(proj)
      .rename(bandNames)
      .copyProperties(image);
    return image.addBands(cleanImage, null, true);
  })
  // .map(leefilter)
  // .map(gammamap)
  // .map(normalize)
  .map(addRVI)
  .map(toDB)

print(S1);
// Map.addLayer(S1.select(['VV', 'VH']), {min:0}, 'S1' , false);
// Map.addLayer(S1.select(['rvi', 'vwc']), {min:0}, 'VWC' , false);

//##############################################################
// Step-1: Prepare a NDVI time-series
//##############################################################

// Write a function for Cloud masking
function maskS2clouds(image) {
  var qa = image.select('QA60');
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(
             qa.bitwiseAnd(cirrusBitMask).eq(0));
  
  return image.updateMask(mask)
      .divide(10000)
      .toFloat()
      .copyProperties(image, ["system:time_start"]);
}

var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filter(ee.Filter.date(startDate, endDate))
  // .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .filterBounds(roi)
  .map(maskS2clouds)
  .select(['B.*']);
  
print('Original Collection', S2.size());

var visualization = {
  min: 0.0,
  max: 0.3,
  bands: ['B4', 'B3', 'B2'],
};

// Map.addLayer(S2, visualization, 'S2', false);
// var june = S2.filter(ee.Filter.calendarRange(6, 7, 'month'));

Map.addLayer(S2.filter(ee.Filter.date('2022-06-01', '2022-06-10')).first(), visualization, 'S2-June-10', false);
Map.addLayer(S2.filter(ee.Filter.date('2022-06-10', '2022-06-20')).first(), visualization, 'S2-June-20', false);
Map.addLayer(S2.filter(ee.Filter.date('2022-06-20', '2022-07-01')).first(), visualization, 'S2-June-30', false);

Map.addLayer(S2.filter(ee.Filter.date('2022-07-01', '2022-07-10')).first(), visualization, 'S2-July-10', false);
Map.addLayer(S2.filter(ee.Filter.date('2022-07-10', '2022-07-20')).first(), visualization, 'S2-July-20', false);
Map.addLayer(S2.filter(ee.Filter.date('2022-07-20', '2022-08-01')).first(), visualization, 'S2-July-30', false);

// Add params as a new band to each S1 image.
var add_params = function(image){
    var date = image.date()
    var year = date.get('year')
    var orbitpass = ee.String(image.get('orbitProperties_pass'))
    var orbitpass_val = ee.Algorithms.If(orbitpass.equals('ASCENDING'), 0, 1)
    var orbitpass_img = ee.Image.constant(orbitpass_val).toDouble().rename('op')
    
    var yearImage = ee.Image.constant(year).rename('year');
    var doyImage = ee.Image.constant(date.getRelative('day', 'year').add(1)).rename('doy');

    // Filter the cropType image collection by year.  We're assuming
    // a single image represents the entire year.  If you have multiple
    // images per year, you'll need to adjust the filter.
    var croptype_for_year = ee.ImageCollection('AAFC/ACI').filter(ee.Filter.calendarRange(year, year, 'year')).first()
    croptype_for_year = croptype_for_year.remap(labels, labels, 0).rename('lc')
    // Add the croptype band to the S1 image.
    return image.addBands([yearImage, doyImage, croptype_for_year, orbitpass_img])
}

S1 = ee.ImageCollection(S1.map(add_params).distinct('system:time_start'))

// convert strings to ee.String objects
var ee_strings_s_param = trees_ssr_param_md_new.aggregate_array('tree').map(function (tree) {
  return ee.String(tree).replace('#', '\n', 'g');
});

// print(ee_strings_s_param)

// pass list of ee.Strings to an ensemble decision tree classifier (i.e. RandomForest)
var classifier_s_param = ee.Classifier.decisionTreeEnsemble(ee_strings_s_param);
// print(classifier_s_param)

// convert strings to ee.String objects
var ee_strings_vvs_param = trees_vvs_param_md_new.aggregate_array('tree').map(function (tree) {
  return ee.String(tree).replace('#', '\n', 'g');
});

// print(ee_strings_soil_param)

// pass list of ee.Strings to an ensemble decision tree classifier (i.e. RandomForest)
var classifier_vvs_param = ee.Classifier.decisionTreeEnsemble(ee_strings_vvs_param);
// print(classifier_soil_param)


var feature_names_n100 = ['VH', 'VV', 'angle', 'rvi', 'year', 'doy', 'lc', 'op']

// convert strings to ee.String objects
var ee_strings_ssm_param = trees_ssm_param_md_new.aggregate_array('tree').map(function (tree) {
  return ee.String(tree).replace('#', '\n', 'g');
})

// print(ee_strings_ssm_param)

// pass list of ee.Strings to an ensemble decision tree classifier (i.e. RandomForest)
var classifier_ssm_param = ee.Classifier.decisionTreeEnsemble(ee_strings_ssm_param)
// print(classifier_ssm_param)

var feature_names_n25 = ['angle', 'vvs', 's', 'year', 'doy', 'lc', 'op'];

var S1WithSSM = S1.map(function(image){
  var ssrImage = image.select(feature_names_n100).classify(classifier_s_param, 's')
  var sigma_soil = image.select(feature_names_n100).classify(classifier_vvs_param, 'vvs');
  var ssm = image.addBands([ssrImage, sigma_soil]).select(feature_names_n25).classify(classifier_ssm_param, 'ssm')
  return image.addBands([ssrImage, sigma_soil, ssm]);
})

print('S1WithSSM: ', S1WithSSM)

var ssm_vis = ['#800000', '#bd0000', '#fa0e00', '#ff4000', '#ff7200', '#ffa400', '#ffd500', '#e8ff0f', '#bcff3a', '#91ff66', '#66ff91', '#3affbc', '#0ff8e8', '#00c3ff', '#008dff', '#0057ff', '#0022ff', '#0000fa', '#0000bd', '#000080']

Map.addLayer(S1WithSSM.select('ssm'), {min:0.2, max:0.48, palette:ssm_vis}, 'SSM', false)

Map.addLayer(S1WithSSM.select('ssm').max(), {min:0.5, max:0.85, palette:ssm_vis}, 'SSM-max', false)
Map.addLayer(S1WithSSM.select('ssm').filter(ee.Filter.date('2022-05-01', '2022-05-10')).first(), {min:0.05, max:0.25, palette:ssm_vis}, 'SSM-May-10', false)
Map.addLayer(S1WithSSM.select('ssm').filter(ee.Filter.date('2022-05-10', '2022-05-20')).first(), {min:0.15, max:0.30, palette:ssm_vis}, 'SSM-May-20', false)
Map.addLayer(S1WithSSM.select('ssm').filter(ee.Filter.date('2022-05-20', '2022-06-01')).first(), {min:0.2, max:0.32, palette:ssm_vis}, 'SSM-May-30', false)
Map.addLayer(S1WithSSM.select('ssm').filter(ee.Filter.date('2022-06-01', '2022-06-10')).first(), {min:0.2, max:0.32, palette:ssm_vis}, 'SSM-June-10', false)
Map.addLayer(S1WithSSM.select('ssm').filter(ee.Filter.date('2022-06-10', '2022-06-20')).first(), {min:0.2, max:0.25, palette:ssm_vis}, 'SSM-June-20', false)
Map.addLayer(S1WithSSM.select('ssm').filter(ee.Filter.date('2022-06-20', '2022-07-01')).first(), {min:0.2, max:0.25, palette:ssm_vis}, 'SSM-June-30', false)
Map.addLayer(S1WithSSM.select('ssm').filter(ee.Filter.date('2022-07-01', '2022-07-10')).first(), {min:0.2, max:0.25, palette:ssm_vis}, 'SSM-Jul-10', false)
Map.addLayer(S1WithSSM.select('ssm').filter(ee.Filter.date('2022-07-10', '2022-07-20')).first(), {min:0.2, max:0.25, palette:ssm_vis}, 'SSM-Jul-20', false)
Map.addLayer(S1WithSSM.select('ssm').filter(ee.Filter.date('2022-07-20', '2022-08-01')).first(), {min:0.2, max:0.25, palette:ssm_vis}, 'SSM-Jul-30', false)

var RISMA_StationsBBox = RISMA_Stations.map(function(f){
  var geom = f.geometry()
  var buffer = geom.buffer({
    distance: 5, 
    maxError: null, 
    // proj: geom.projection()
  }).bounds()
  return ee.Feature(buffer).copyProperties(f);
});

Map.addLayer(RISMA_StationsBBox, {}, 'RISMA_StationsBBox');
Map.addLayer(RISMA_Stations, {}, 'risma_stations');

var stackSSM = S1WithSSM.select('ssm').toBands();

var bandNames = stackSSM.bandNames();
// print(bandNames)

var newBandNames = bandNames.map(function(name) {
  var parts = ee.String(name).split('_');
  return ee.String(parts.get(4))//.cat('_').cat(parts.get(-1))
});

print(newBandNames);

stackSSM = stackSSM.rename(newBandNames);
print(stackSSM)

var pointWithSSM = stackSSM.reduceRegions({
  collection: RISMA_StationsBBox,
  reducer: ee.Reducer.mean(),
  scale: 10,  // meters
  tileScale: 16
  // crs: 'EPSG:3310',  // California Albers projection
});

print(pointWithSSM);

// Export an ee.FeatureCollection as an Earth Engine asset.
Export.table.toAsset({
  collection: pointWithSSM,
  description:'RISMA_Stations_With_VSM_S1_desc_WCM_2015to2023_buffer5m_rvi_RFR_n5_md15_allcroptypes_RefineLEE',
  assetId: 'RISMA_Stations_With_VSM_S1_desc_WCM_2015to2023_buffer5m_rvi_RFR_n5_md15_allcroptypes_RefineLEE',
});
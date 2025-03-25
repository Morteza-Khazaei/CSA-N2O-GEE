var stationId = 'MB15';
var bufferDistance = 15; //meters

var startDate = ee.Date('2010-01-01');
var endDate = ee.Date('2024-01-01');

var RISMA_Stations = ee.FeatureCollection("projects/ee-mortezakhazaei1370/assets/RISMA_Stations_Canada");

var roi = RISMA_Stations.filter(ee.Filter.eq('Station ID', stationId)).geometry().buffer(bufferDistance);
Map.centerObject(roi, 16);
Map.addLayer(roi, {}, 'ROI', true);

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


// Combined function to add date and crop type efficiently
var enhanceImage = function(image) {
  var date = image.date();
  var year = ee.Image.constant(date.get('year')).rename('year').toDouble();
  var doy = ee.Image.constant(date.getRelative('day', 'year').add(1)).rename('doy').toDouble();
  var cropType = ee.ImageCollection('AAFC/ACI')
    .filterDate(date.get('year'), date.advance(1, 'year'))
    .first()
    .clip(roi);
  return image.addBands([year, doy, cropType]);
};

// Process Sentinel-1 collection with chaining
var S1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(roi)
  .filterDate(startDate, endDate)
  .filter(ee.Filter.and(
    ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'),
    ee.Filter.eq('instrumentMode', 'IW')
  ))
  .map(function(image) {
    var edge = image.lt(-30.0);
    return image.updateMask(image.mask().and(edge.not()));
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
  .map(toDB)
  .map(enhanceImage);

var S1 = ee.ImageCollection(S1.distinct('system:time_start'));
print(S1);

var desc = S1.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'));
var asc = S1.filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'));
print(desc);
print(asc);


Map.addLayer(desc, {}, 'desc', false);
Map.addLayer(asc, {}, 'asc', false);

// Rename bands efficiently
var renameBands = function(imageCollection, suffix) {
  var image = imageCollection.toBands();
  var bandNames = image.bandNames().map(function(name) {
    var parts = ee.String(name).split('_');
    return ee.String(parts.get(4)).cat('_').cat(parts.get(-1)).cat('_').cat(suffix);
  });
  return image.rename(bandNames);
};

var imagesDESC = renameBands(desc, 'desc');
var imagesASC = renameBands(asc, 'asc');
var images = ee.Image.cat([imagesDESC, imagesASC]).toShort();
print('Combined Image', images);

var pointWithValues = images.reduceRegions({
  collection: roi,
  reducer: ee.Reducer.median(),
  scale: 10,  // meters
  tileScale: 16
  // crs: 'EPSG:3310',  // California Albers projection
});

print(pointWithValues);

// Export to Google Drive as CSV
Export.table.toDrive({
  collection: pointWithValues,
  description: 'RISMA_' + stationId + '_2015_to_2023_buffer' + bufferDistance + 'm', // File name in Drive
  folder: 'GEE_Exports_S1_RISMA_Buffer' + bufferDistance + 'm_refinedLee_reduce_regions', // Optional: Specify a folder in Google Drive
  fileFormat: 'CSV' // Export as CSV file
});
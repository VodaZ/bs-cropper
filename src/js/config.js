export const config = {
  mainImage: {
    style: {
      width: '100%',
      height: '100%',
    },
  },
  cropRatio: 2/1,
  canvas: {
    style: {
      width: '100%',
    },
  },
  export: {
    sampleBaseXSize: 500,
    legendSpacing: 5,
    margin: 10,
    fontSize: 30,
    headerFontSize: 40,
    samplesOnOneImage: 3,
  },
};

export const {
  sampleBaseXSize,
  margin,
  legendSpacing,
  fontSize,
  headerFontSize,
  samplesOnOneImage,
} = config.export;

export const sampleSize = {
  x: sampleBaseXSize,
  y: sampleBaseXSize / config.cropRatio,
};

export const exportSize = {
  x: (2 * margin) + sampleSize.x,
  y: ((3 * margin) + (((2 * legendSpacing) + fontSize + sampleSize.y) *
    samplesOnOneImage) + headerFontSize),
};

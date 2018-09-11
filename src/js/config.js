export const config = {
  mainImage: {
    style: {
      width: '66%',
      maxHeight: '100%',
    },
  },
  cropRatio: 10 / 3,
  canvas: {
    style: {
      width: '100%',
    },
  },
  export: {
    sampleBaseXSize: 1000,
    xOffset: 100,
    yOffset: 10,
    spacing: 10,
    margin: 10,
    fontSize: 30,
    samplesOnOneImage: 5,
  },
};

export const {
  sampleBaseXSize,
  margin,
  spacing,
  xOffset,
  yOffset,
  fontSize,
  samplesOnOneImage,
} = config.export;

export const sampleSize = {
  x: sampleBaseXSize,
  y: sampleBaseXSize / config.cropRatio,
};

export const exportSize = {
  x: (2 * margin) + sampleSize.x + xOffset,
  y: (2 * margin) + (samplesOnOneImage * sampleSize.y) + ((samplesOnOneImage - 1) * spacing),
};

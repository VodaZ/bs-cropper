import fileDownload from 'react-file-download';
import { append, reduce } from 'ramda';

import {
  exportSize,
  fontSize,
  headerFontSize,
  legendSpacing,
  margin,
  sampleSize,
} from './config';


function dataURLToBlob(dataURL) {
  const BASE64_MARKER = ';base64,';

  if (dataURL.indexOf(BASE64_MARKER) === -1) {
    const parts = dataURL.split(',');
    const contentType = parts[0].split(':')[1];
    const raw = decodeURIComponent(parts[1]);

    return new Blob([raw], { type: contentType });
  }

  const parts = dataURL.split(BASE64_MARKER);
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;

  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; i += 1) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

function sampleToFile(
  {
    canvas,
    promises,
  },
  {
    index,
    sample,
  },
) {
  const promise = new Promise((resolve) => {
    const context = canvas.getContext('2d');
    const { url, name } = sample;
    const image = new window.Image();

    const sampleXOfffset = margin;
    const sampleYOffset = (((sampleSize.y + (2 * legendSpacing) + fontSize) * index) +
      (2 * margin) + headerFontSize);
    const textYOffset = sampleYOffset + sampleSize.y + fontSize;

    context.fillText(name, sampleXOfffset, textYOffset);

    image.setAttribute('src', url);
    image.addEventListener('load', () => {
      context.drawImage(image, sampleXOfffset, sampleYOffset, sampleSize.x, sampleSize.y);
      resolve();
    });
  });

  return {
    canvas,
    promises: append(promise, promises),
  };
}

export const samplesToFile = (fileName) => ({ index, samples }) => {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('width', exportSize.x);
  canvas.setAttribute('height', exportSize.y);

  const context = canvas.getContext('2d');
  context.fillStyle = 'white';
  context.fillRect(0, 0, exportSize.x, exportSize.y);

  context.fillStyle = 'black';
  context.font = `${headerFontSize}px Arial`;
  context.fillText(`${fileName}`, margin, margin + headerFontSize);
  context.font = `${fontSize}px Arial`;

  const result = reduce(sampleToFile, {
    canvas,
    promises: [],
  }, samples);

  Promise
    .all(result.promises)
    .then(() => {
      const exportUrl = result.canvas.toDataURL('image/jpeg', 1);
      const blob = dataURLToBlob(exportUrl);
      const filename = `${fileName}-${index + 1}.jpg`;
      const file = new File([blob], filename);
      fileDownload(file, filename);
    })
};

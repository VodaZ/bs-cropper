import React from 'react';

export const SamplePreviewFactory = (remove, { id, name, url }) => {
  return (
    <div className="samplePreview" key={id}>
      <div className="sampleInfo">
        {name}
        <br />
        <button onClick={() => remove(id)}>X</button>
      </div>
      <div className="sampleImage">
        <img src={url} alt={name} />
      </div>
    </div>
  );
};

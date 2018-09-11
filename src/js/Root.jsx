// https://codepen.io/nakome/pen/vmKwQg
// https://codepen.io/hartzis/pen/VvNGZP
// https://github.com/iroy2000/react-redux-boilerplate

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { HashRouter as Router } from 'react-router-dom';

import uuid from 'uuid';

import {
  pipe,
  applySpec,
  append,
  path,
  map,
  reject,
  propEq,
  assoc,
  sort,
  toPairs,
  groupBy,
  nth,
} from 'ramda';

import { samplesToFile } from 'fileHandlers.js';

import { SamplePreviewFactory } from './SamplePreview';

import {
  config,
  samplesOnOneImage,
} from './config';

export default class Root extends Component {
  constructor() {
    super();

    this.state = {
      samples: [],
    };
  }

  get content() {
    return (
      <Router>
        {this.props.routes}
      </Router>
    );
  }

  fileInputted(e) {
    e.preventDefault();

    if (e.target.files.length) {
      const reader = new FileReader();
      const file = e.target.files[0];

      reader.onloadend = () => {
        this.setState({
          imagePreviewUrl: reader.result,
        });
      };

      reader.readAsDataURL(file)
    }
  }

  use() {
    this.setState({
      croppedImgUrl: this.refs.cropper.getCroppedCanvas()
        .toDataURL('image/jpeg', 1),
    });
  }

  cropNameChanged(e) {
    this.setState({
      cropName: e.target.value,
    });
  }

  saveUsed() {
    const id = uuid.v4();

    const newSample = pipe(
      applySpec({
        name: path(['state', 'cropName']),
        url: path(['state', 'croppedImgUrl']),
      }),
      assoc('id', id),
    )(this);

    const newSamples = pipe(
      path(['state', 'samples']),
      append(newSample),
    )(this);

    this.setState({
      samples: newSamples,
    });
  }

  removeSample = id => {
    const { samples } = this.state;
    const newSamples = reject(propEq('id', id), samples);

    this.setState({
      samples: newSamples,
    });
  };

  clear() {
    this.setState({
      samples: [],
    });
  }

  sort() {
    const { samples } = this.state;
    const newSamples = sort((a, b) => a.name.localeCompare(b.name), samples);

    this.setState({
      samples: newSamples,
    });
  }

  saveToFile() {
    return pipe(
      path(['state', 'samples']),
      toPairs,
      groupBy(([i]) => Math.floor(i / (samplesOnOneImage + 1))),
      map(map(nth(1))),
      map(toPairs),
      map(map(([i, sample]) => ({
        index: parseInt(i, 10),
        sample,
      }))),
      map(samplesToFile),
    )(this);
  }

  render() {
    return (
      <div className="appWrapper">
        <div className="imagePanel">
          <div className="imageInclude">
            <input type="file" onChange={e => this.fileInputted(e)}/>
            <button onClick={() => this.use()}>Use</button>
          </div>
          <div className="imageCrop">
            <Cropper
              ref="cropper"
              src={this.state.imagePreviewUrl}
              style={config.mainImage.style}
              aspectRatio={config.cropRatio}
            />
          </div>
          <div className="sampleSettings">
            <div className="cropSettingsWrapper">
              <input type="text" onChange={e => this.cropNameChanged(e)}/>
              <button onClick={() => this.saveUsed()}>Move right</button>
            </div>
            <div className="cropImageWrapper">
              <img src={this.state.croppedImgUrl} alt=""/>
            </div>
          </div>
        </div>
        <div className="samplesPanel">
          <button onClick={() => this.saveToFile()}>Export</button>
          <button onClick={() => this.clear()}>Clear</button>
          <button onClick={() => this.sort()}>Sort</button>
          {map(sample => SamplePreviewFactory(this.removeSample, sample), this.state.samples)}
        </div>
      </div>
    );
  }
}

Root.propTypes = {
  routes: PropTypes.element.isRequired,
  store: PropTypes.object.isRequired,
};

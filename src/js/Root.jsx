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
  prop,
  propEq,
  assoc,
  sort,
  toPairs,
  groupBy,
  reverse,
  nth,
} from 'ramda';

import { samplesToFile } from './fileHandlers';
import { SamplePreviewFactory } from './SamplePreview';
import { config, samplesOnOneImage } from './config';

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

  componentDidMount () {
    this.refs.cropper.img.addEventListener('cropend', () => this.use());
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

  exportNameChanged(e) {
    this.setState({
      exportName: e.target.value
    });
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
      samples: newSamples
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
      groupBy(([i]) => Math.floor(i / samplesOnOneImage)),
      map(map(nth(1))),
      map(toPairs),
      map(map(([i, sample]) => ({
        index: parseInt(i, 10),
        sample,
      }))),
      toPairs,
      map(([i, samples]) => ({
        index: parseInt(i, 10),
        samples
      })),
      map(samplesToFile(this.state.exportName)),
    )(this);
  }

  moveImageUp() {
    this.refs.cropper.move(0, -40);
  }

  moveImageRight() {
    this.refs.cropper.move(40, 0);
  }

  moveImageLeft() {
    this.refs.cropper.move(-40, 0);
  }

  moveImageDown() {
    this.refs.cropper.move(0, 40);
  }

  render() {
    const revertedSamples = pipe(
      prop('samples'),
      reverse
    )(this.state);

    return (
      <div className="appWrapper">
        <div className="imagePanel">
          <div className="navigation">
            <div className="up" role="button" onClick={() => this.moveImageUp()}>A</div>
            <div className="left" role="button" onClick={() => this.moveImageLeft()}>&lt;</div>
            <div className="right" role="button" onClick={() => this.moveImageRight()}>&gt;</div>
            <div className="down" role="button" onClick={() => this.moveImageDown()}>V</div>
          </div>

          <div className="imageInclude">
            <input type="file" onChange={e => this.fileInputted(e)} />
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
        </div>
        <div className="samplesPanel">
          <div className="sampleSettings">
            <div className="cropSettingsWrapper">
              <input type="text" onChange={e => this.cropNameChanged(e)} />
              <button onClick={() => this.saveUsed()}>Use sample</button>
            </div>
            <div className="cropImageWrapper">
              <img src={this.state.croppedImgUrl} alt="" />
            </div>
          </div>

          <div className="samplesList">
            <input type="text" onChange={e => this.exportNameChanged(e)} />
            <button onClick={() => this.saveToFile()}>Export</button>
            <button onClick={() => this.clear()}>Clear</button>
            <button onClick={() => this.sort()}>Sort</button>
            {map(sample => SamplePreviewFactory(this.removeSample, sample), revertedSamples)}
          </div>
        </div>
      </div>
    );
  }
}

Root.propTypes = {
  routes: PropTypes.element.isRequired,
  store: PropTypes.object.isRequired,
};

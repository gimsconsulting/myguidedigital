declare module 'react-color' {
  import { Component } from 'react';

  export interface ColorResult {
    hex: string;
    rgb: {
      r: number;
      g: number;
      b: number;
      a?: number;
    };
    hsl: {
      h: number;
      s: number;
      l: number;
      a?: number;
    };
  }

  export interface ColorPickerProps {
    color?: string | { r: number; g: number; b: number; a?: number };
    onChange?: (color: ColorResult) => void;
    onChangeComplete?: (color: ColorResult) => void;
    disableAlpha?: boolean;
    presetColors?: string[];
    width?: string | number;
  }

  export class SketchPicker extends Component<ColorPickerProps> {}
  export class ChromePicker extends Component<ColorPickerProps> {}
  export class BlockPicker extends Component<ColorPickerProps> {}
  export class CirclePicker extends Component<ColorPickerProps> {}
  export class CompactPicker extends Component<ColorPickerProps> {}
  export class GithubPicker extends Component<ColorPickerProps> {}
  export class HuePicker extends Component<ColorPickerProps> {}
  export class MaterialPicker extends Component<ColorPickerProps> {}
  export class PhotoshopPicker extends Component<ColorPickerProps> {}
  export class SliderPicker extends Component<ColorPickerProps> {}
  export class SwatchesPicker extends Component<ColorPickerProps> {}
  export class TwitterPicker extends Component<ColorPickerProps> {}
}

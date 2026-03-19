declare module 'react-image-annotation' {
  import { Component } from 'react';

  export interface Geometry {
    x: number;
    y: number;
    width: number;
    height: number;
    type?: string;
  }

  export interface AnnotationData {
    geometry: Geometry;
    data?: {
      id?: string | number;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export interface AnnotationProps {
    src: string;
    alt?: string;
    annotations?: AnnotationData[];
    value?: Partial<AnnotationData>;
    onChange?: (annotation: Partial<AnnotationData>) => void;
    onSubmit?: (annotation: Partial<AnnotationData>) => void;
    renderEditor?: (props: any) => React.ReactNode;
    renderContent?: (props: any) => React.ReactNode;
    disableEditor?: boolean;
    allowTouch?: boolean;
    type?: 'RECTANGLE' | 'POINT' | 'ELLIPSE';
    [key: string]: any;
  }

  export default class Annotation extends Component<AnnotationProps> {}
}

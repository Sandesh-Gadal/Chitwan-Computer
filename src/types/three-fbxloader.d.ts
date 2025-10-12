declare module 'three/examples/jsm/loaders/FBXLoader.js' {
  import { Loader, Object3D, LoadingManager } from 'three';

  export class FBXLoader extends Loader<Object3D> {
    constructor(manager?: LoadingManager);

    load(
      url: string,
      onLoad: (object: Object3D) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent | Error) => void
    ): void;

    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<Object3D>;

    parse(FBXText: string | ArrayBuffer, path: string): Object3D;
  }
}

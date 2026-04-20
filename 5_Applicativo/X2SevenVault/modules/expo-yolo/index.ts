// Reexport the native module. On web, it will be resolved to ExpoYoloModule.web.ts
// and on native platforms to ExpoYoloModule.ts
export { default } from './src/ExpoYoloModule';
// export { default as ExpoYoloView } from './src/ExpoYoloView';
export * from './src/ExpoYolo.types';


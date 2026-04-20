import { NativeModule, requireNativeModule } from "expo";

import { ExpoYoloModuleEvents } from "./ExpoYolo.types";

declare class ExpoYoloModule extends NativeModule<ExpoYoloModuleEvents> {
  performInference(uri: string): Promise<number[]>;
  closeInterpreter(): void;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoYoloModule>("ExpoYolo");

import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './ExpoYolo.types';

type ExpoYoloModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class ExpoYoloModule extends NativeModule<ExpoYoloModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(ExpoYoloModule, 'ExpoYoloModule');

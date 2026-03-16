import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoYoloViewProps } from './ExpoYolo.types';

const NativeView: React.ComponentType<ExpoYoloViewProps> =
  requireNativeView('ExpoYolo');

export default function ExpoYoloView(props: ExpoYoloViewProps) {
  return <NativeView {...props} />;
}

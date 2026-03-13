import * as React from 'react';

import { ExpoYoloViewProps } from './ExpoYolo.types';

export default function ExpoYoloView(props: ExpoYoloViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}

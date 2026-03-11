import { useTensorflowModel } from 'react-native-fast-tflite';

const LABELS = ['airpods','bottle','eletric_socket','helmet','micro'];
const THRESHOLD = 0.3;

export default function useTFLite() {
  const tf = useTensorflowModel(
    require('../assets/best_int8.tflite')
  );

  const model = tf.state === 'loaded' ? tf.model : undefined;

  return { model, LABELS, THRESHOLD };
}
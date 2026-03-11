export function parseYOLO(outputs: any, labels: string[], threshold: number) {
  'worklet';

  // ✅ Guard: outputs non valido
  if (!outputs || !Array.isArray(outputs) || outputs.length < 3) {
    return [];
  }

  const boxes = outputs[0];
  const scores = outputs[1];
  const classes = outputs[2];

  // ✅ Guard: scores non valido
  if (!scores || !boxes || !classes) {
    return [];
  }

  const detections = [];

  for (let i = 0; i < scores.length; i++) {
    const confidence = scores[i];

    if (confidence > threshold) {
      const classId = classes[i];

      // ✅ Guard: classId valido e label esistente
      if (classId == null || !labels[classId]) continue;

      // ✅ Guard: box valido
      if (!boxes[i] || boxes[i].length < 4) continue;

      detections.push({
        label: labels[classId],
        confidence,
        box: {
          x1: boxes[i][0],
          y1: boxes[i][1],
          x2: boxes[i][2],
          y2: boxes[i][3],
        },
      });
    }
  }

  return detections;
}
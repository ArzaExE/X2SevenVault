import { useResizePlugin } from 'vision-camera-resize-plugin'

export function useImageResize() {
  const { resize } = useResizePlugin()

  async function detectObjects(model: any, imageData: any) {

    const resized = resize(imageData, {
      scale: {
        width: 640,
        height: 640,
      },
      pixelFormat: 'rgb',
      dataType: 'uint8',
    })

    const outputs = await model.run(resized)

    return outputs
  }

  return { detectObjects }
}
package expo.modules.yolo

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL
import android.content.Context
import org.tensorflow.lite.Interpreter
import org.tensorflow.lite.support.common.FileUtil
import android.net.Uri
import android.graphics.BitmapFactory
import org.tensorflow.lite.support.image.ImageProcessor
import org.tensorflow.lite.support.image.TensorImage
import org.tensorflow.lite.support.image.ops.ResizeOp
import org.tensorflow.lite.support.common.ops.NormalizeOp
import org.tensorflow.lite.support.common.ops.CastOp
import org.tensorflow.lite.DataType
import android.graphics.Bitmap
import org.tensorflow.lite.support.tensorbuffer.TensorBuffer

class ExpoYoloModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  private var interpreter: Interpreter? = null
  private val IMAGE_SIZE = 640
  private val NORM_MEAN = 0f
  private val NORM_STDDEV = 255f

  private fun initInterpreter(context: Context) {
    var modelBuffer = FileUtil.loadMappedFile(context, "yolo.tflite")

    interpreter = Interpreter(modelBuffer)
  }
  private val context
  get() = requireNotNull(appContext.reactContext)
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ExpoYolo')` in JavaScript.
    Name("ExpoYolo")

    AsyncFunction("performInference") { uri: String ->
      if(interpreter == null) initInterpreter(context)
      val filePath = Uri.parse(uri)
      val bitmap = BitmapFactory.decodeStream(context.contentResolver.openInputStream(filePath))

      if(bitmap == null) {
        throw Exception("Could not decode bitmap")
      }

      val imageProcessor = ImageProcessor.Builder()
        .add(ResizeOp(IMAGE_SIZE,IMAGE_SIZE, ResizeOp.ResizeMethod.BILINEAR))
        .add(NormalizeOp(NORM_MEAN, NORM_STDDEV))
        .add(CastOp(DataType.FLOAT32))
        .build()
      
      val propsPerDetection = 9
      val numDetections = 8400

      val resizedBitmap = Bitmap.createScaledBitmap(bitmap, IMAGE_SIZE, IMAGE_SIZE, false)
      val tensorImage =  TensorImage(DataType.FLOAT32)
      tensorImage.load(resizedBitmap)
      
      val processedImage = imageProcessor.process(tensorImage)
      val imageBuffer = processedImage.buffer

      val output = TensorBuffer.createFixedSize(intArrayOf(1, propsPerDetection, numDetections), DataType.FLOAT32)
      interpreter!!.run(imageBuffer, output.buffer )
      return@AsyncFunction output.floatArray
    }

    Function("closeInterpreter") {
      interpreter!!.close()
    }
    // Defines constant property on the module.
    Constant("PI") {
      Math.PI
    }

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(ExpoYoloView::class) {
      // Defines a setter for the `url` prop.
      Prop("url") { view: ExpoYoloView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      // Defines an event that the view can send to JavaScript.
      Events("onLoad")
    }
  }
}

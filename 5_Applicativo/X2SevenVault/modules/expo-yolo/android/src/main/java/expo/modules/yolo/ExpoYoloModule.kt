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
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.RectF
import org.tensorflow.lite.support.tensorbuffer.TensorBuffer

class ExpoYoloModule : Module() {

  private var interpreter: Interpreter? = null
  private val IMAGE_SIZE = 640
  private val NORM_MEAN = 0f
  private val NORM_STDDEV = 255f

  private fun initInterpreter(context: Context) {
    val modelBuffer = FileUtil.loadMappedFile(context, "yolo.tflite")
    interpreter = Interpreter(modelBuffer)
  }

  private fun letterbox(bitmap: Bitmap, size: Int): Bitmap {
    val result = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(result)
    canvas.drawColor(Color.BLACK)
    val scale = minOf(size.toFloat() / bitmap.width, size.toFloat() / bitmap.height)
    val scaledW = (bitmap.width * scale).toInt()
    val scaledH = (bitmap.height * scale).toInt()
    val left = (size - scaledW) / 2f
    val top = (size - scaledH) / 2f
    val dst = RectF(left, top, left + scaledW, top + scaledH)
    canvas.drawBitmap(bitmap, null, dst, null)
    return result
  }

  private val context
    get() = requireNotNull(appContext.reactContext)

  override fun definition() = ModuleDefinition {
    Name("ExpoYolo")

    AsyncFunction("performInference") { uri: String ->
      if (interpreter == null) initInterpreter(context)

      val filePath = Uri.parse(uri)
      val bitmap = BitmapFactory.decodeStream(context.contentResolver.openInputStream(filePath))
        ?: throw Exception("Could not decode bitmap")

      val resizedBitmap = letterbox(bitmap, IMAGE_SIZE)

      val outputFile = java.io.File(context.cacheDir, "resized_debug.jpg")
      java.io.FileOutputStream(outputFile).use { out ->
        resizedBitmap.compress(Bitmap.CompressFormat.JPEG, 95, out)
      }
      android.util.Log.d("ExpoYolo", "Immagine salvata in: ${outputFile.absolutePath}")

      val imageProcessor = ImageProcessor.Builder()
        .add(NormalizeOp(NORM_MEAN, NORM_STDDEV))
        .add(CastOp(DataType.FLOAT32))
        .build()

      val propsPerDetection = 9
      val numDetections = 8400

      val tensorImage = TensorImage(DataType.FLOAT32)
      tensorImage.load(resizedBitmap)

      val processedImage = imageProcessor.process(tensorImage)
      val imageBuffer = processedImage.buffer

      val output = TensorBuffer.createFixedSize(intArrayOf(1, propsPerDetection, numDetections), DataType.FLOAT32)
      interpreter!!.run(imageBuffer, output.buffer)

      return@AsyncFunction output.floatArray
    }

    Function("closeInterpreter") {
      interpreter!!.close()
    }

    Constant("PI") {
      Math.PI
    }

    Events("onChange")

    Function("hello") {
      "Hello world! 👋"
    }

    AsyncFunction("setValueAsync") { value: String ->
      sendEvent("onChange", mapOf("value" to value))
    }

    View(ExpoYoloView::class) {
      Prop("url") { view: ExpoYoloView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      Events("onLoad")
    }
  }
}
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
    interpreter = Interpreter(modelBuffer) // Motore di TensorFlow Lite che esegue il modello di machine learning.
  }

  private fun letterbox(bitmap: Bitmap, size: Int): Bitmap {
    // Crea una bitmap quadrata vuota delle dimensioni richieste (es. 640x640)
    val result = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888) 
    // Crea un canvas per disegnare sulla bitmap risultato
    val canvas = Canvas(result)
    // Riempie tutto il canvas con colore nero (le "barre" laterali)
    canvas.drawColor(Color.BLACK)
    // Calcola il fattore di scala per adattare l'immagine mantenendo le proporzioni
    val scale = minOf(size.toFloat() / bitmap.width, size.toFloat() / bitmap.height)
     // Calcola la larghezza dell'immagine scalata
    val scaledW = (bitmap.width * scale).toInt()
     // Calcola l'altezza dell'immagine scalata
    val scaledH = (bitmap.height * scale).toInt()
    // Calcola l'offset orizzontale per centrare l'immagine
    val left = (size - scaledW) / 2f
    // Calcola l'offset verticale per centrare l'immagine
    val top = (size - scaledH) / 2f
    // Definisce il rettangolo di destinazione (dove verrà disegnata l'immagine scalata)
    val dst = RectF(left, top, left + scaledW, top + scaledH)
    // Disegna l'immagine originale nel rettangolo di destinazione (la scala automaticamente)
    canvas.drawBitmap(bitmap, null, dst, null)
    // Restituisce la bitmap quadrata con l'immagine centrata e bordi neri
    return result
  }

  private val context
    get() = requireNotNull(appContext.reactContext)

  override fun definition() = ModuleDefinition {
    // Definisce il nome del modulo esposto a React Native (verrà importato come 'ExpoYolo')
    Name("ExpoYolo")

    // Definisce una funzione asincrona chiamabile da JavaScript/TypeScript
    AsyncFunction("performInference") { uri: String ->
      
      // Inizializza l'interprete TensorFlow Lite se non è già stato fatto
      if (interpreter == null) initInterpreter(context)

      // Converte la stringa URI in un oggetto Uri
      val filePath = Uri.parse(uri)
      
      // Decodifica l'immagine dal file system dell'app in un Bitmap
      val bitmap = BitmapFactory.decodeStream(context.contentResolver.openInputStream(filePath))
        ?: throw Exception("Could not decode bitmap")  // Lancia errore se il decoding fallisce

      // Ridimensiona l'immagine a formato quadrato (640x640) con tecnica letterbox (bordi neri)
      val resizedBitmap = letterbox(bitmap, IMAGE_SIZE)

      // Crea un processore di immagini per le trasformazioni pixel
      val imageProcessor = ImageProcessor.Builder()
        .add(NormalizeOp(NORM_MEAN, NORM_STDDEV))  // Normalizza i pixel (valori da 0-255 a 0-1)
        .add(CastOp(DataType.FLOAT32))             // Converte i pixel da interi a float32
        .build()

      // Numero di proprietà per ogni rilevamento (4 coordinate + 5 classi = 9)
      val propsPerDetection = 9
      
      // Numero di rilevamenti/ancore restituiti dal modello YOLO
      val numDetections = 8400

      // Crea un contenitore per l'immagine di input nel formato TensorFlow Lite
      val tensorImage = TensorImage(DataType.FLOAT32)
      
      // Carica l'immagine ridimensionata nel tensore
      tensorImage.load(resizedBitmap)

      // Applica le trasformazioni (normalizzazione e cast) all'immagine
      val processedImage = imageProcessor.process(tensorImage)
      
      // Estrae il buffer dei pixel processati (input del modello)
      val imageBuffer = processedImage.buffer

      // Prepara il buffer di output con shape [1, 9, 8400] (batch, proprietà, rilevamenti)
      val output = TensorBuffer.createFixedSize(intArrayOf(1, propsPerDetection, numDetections), DataType.FLOAT32)
      
      // Esegue l'inferenza: input (immagine) -> output (rilevamenti)
      interpreter!!.run(imageBuffer, output.buffer)

      // Restituisce l'array float dei risultati a JavaScript/TypeScript
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
import tensorflow as tf

interpreter = tf.lite.Interpreter(model_path="yolo.tflite")
interpreter.allocate_tensors()

print("Input:", interpreter.get_input_details())
print("Output:", interpreter.get_output_details())
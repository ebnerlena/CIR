import os
import os.path
import mediapipe as mp
import cv2

mp_drawing = mp.solutions.drawing_utils
mp_face_mesh = mp.solutions.face_mesh

def extract_face_landmarks(image_path):
    image = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    with mp_face_mesh.FaceMesh(min_detection_confidence=0.5, min_tracking_confidence=0.5) as face_mesh:
        results = face_mesh.process(image_rgb)
        if results.multi_face_landmarks:
          landmarks = results.multi_face_landmarks[0].landmark
        else:
          return None
    return landmarks

# Create and store the landmarks for every picture
classes = ["neutral", "happy"]
for c in classes:
    for dirpath, dirnames, filenames in os.walk(f"D:\Documents\GitHub\CIR\emotion_classification\data\emotion_dataset\\train\\{c}"):
        for filename in filenames:
            full_path = dirpath + "/" + filename
            print(full_path)
            landmarks = extract_face_landmarks(full_path)
            if landmarks:
                if not os.path.exists(f"data\emotion_dataset\\train\\{c}_data"):
                    os.makedirs(f"data\emotion_dataset\\train\\{c}_data")
                with open(f"data\emotion_dataset\\train\\{c}_data/{filename}.csv", "w") as file:
                    file.write("Class;number;x;y;z\n")
                    
                    if c == "neutral":
                        klass = "non_smile"
                    elif c == "happy":
                        klass = "smile"

                    for i, landmark in enumerate(landmarks):
                        file.write(klass + ";" + str(i) + ";" + str(landmark.x) + ";" + str(landmark.y) + ";" + str(landmark.z) + "\n")

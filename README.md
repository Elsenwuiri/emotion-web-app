# Emotion Web App

Real-time facial emotion recognition built with Flask, TensorFlow, and OpenCV.

The project supports two main flows:

- Fine-tuning the existing emotion model in `test.ipynb`
- Running the Flask web app in `app.py` with the fine-tuned model

## Project Files

- `app.py` - Flask backend for webcam emotion prediction
- `templates/index.html` - Frontend UI
- `static/script.js` - Camera capture and prediction loop
- `static/style.css` - UI styling
- `test.ipynb` - Fine-tuning, saving, and evaluation notebook
- `requirements.txt` - Python dependencies
- `model/` - Saved model files

## Requirements

- Windows
- Python 3.12 or compatible environment
- Internet access for KaggleHub dataset download the first time you run the notebook
- Webcam access in your browser

## Start From Zero

### 1. Open the project folder

Open the folder in VS Code:

`DEEP LEARNING\emotion-web-app`

### 2. Activate the virtual environment

If you want to use the included environment, open PowerShell in the project folder and run:

```powershell
.\tf_env\Scripts\Activate.ps1
```

If you prefer a fresh environment, create one first and then activate it:

```powershell
python -m venv tf_env
.\tf_env\Scripts\Activate.ps1
```

### 3. Install dependencies

Install everything required by the app and notebook:

```powershell
pip install -r requirements.txt
```

## Fine-Tune the Existing Model

Open `test.ipynb` and run the cells in order from top to bottom.

### Cell 1

Load the base model and display the summary.

### Cell 2

Download the dataset with KaggleHub, build the training and validation datasets, unfreeze the last layers, and compile the model.

Notes:

- The dataset is downloaded automatically from KaggleHub.
- The notebook uses `image_dataset_from_directory` with grayscale images sized to `48 x 48`.

### Cell 3

Train / fine-tune the model with:

- `train_ds`
- `val_ds`
- `class_weight`

This cell runs the fine-tuning step.

### Cell 4

Save the fine-tuned model to disk.

Current output file:

- `emotion_model_finetuned.keras`

Important:

- `app.py` loads the model from `model/emotion_model_finetuned.keras`
- After Cell 4 finishes, copy or move the saved file into the `model/` folder, or update the path in `app.py`

Example PowerShell command:

```powershell
Copy-Item .\emotion_model_finetuned.keras .\model\emotion_model_finetuned.keras
```

### Cell 5

Evaluate the saved fine-tuned model with:

- Confusion Matrix
- Precision
- Recall
- F1-Score
- Classification Report

This evaluation cell loads `emotion_model_finetuned.keras` directly from disk.

## Run the Web App

After the fine-tuned model is saved, start the Flask app:

```powershell
python app.py
```

Then open the local address shown in the terminal, usually:

```text
http://127.0.0.1:5000
```

The app will use `model/emotion_model_finetuned.keras` for predictions.

## Output Files

After a successful run, you should have:

- `emotion_model_finetuned.keras` - fine-tuned full model
- `best_emotion_model.h5` - best checkpoint from training if checkpointing is enabled

## Troubleshooting

- If the notebook cannot download the dataset, check your internet connection and KaggleHub access.
- If the webcam does not start, allow camera permission in the browser.
- If `app.py` fails to load the model, confirm that `model/emotion_model_finetuned.keras` exists.
- If you change the model name, update the path in `app.py` accordingly.# emotion-web-app

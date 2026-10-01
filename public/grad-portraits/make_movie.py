## python3 make_movie.py

import cv2
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

# --- Configuration ---
image_folder = "selected_images"
names_file = "names.txt"
output_video = "portrait_movie.mp4"
fourcc = cv2.VideoWriter_fourcc(*'avc1')
duration_per_slide = 6  # seconds
fps = 24

# 1. Read the list of names
with open(names_file, 'r', encoding='utf-8') as f:
    names = [line.strip() for line in f.readlines() if line.strip()]

# 2. Get the list of images and sort them alphabetically
valid_exts = ['.jpg', '.jpeg', '.png']
images = [f for f in os.listdir(image_folder) if os.path.splitext(f)[1].lower() in valid_exts]
images.sort()

if len(images) != len(names):
    print(f"Warning: Found {len(images)} images but {len(names)} names. They must match exactly.")

# 3. Get video dimensions based on the very first image
first_img_path = os.path.join(image_folder, images[0])
first_img = cv2.imread(first_img_path)
height, width, _ = first_img.shape

# Initialize the video writer
video = cv2.VideoWriter(output_video, fourcc, fps, (width, height))

print(f"Building {len(images)} slide movie. This may take a moment...")

# Load a font using standard macOS font paths
font_paths = [
    "/Library/Fonts/Arial.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc"
]
font = None
for path in font_paths:
    try:
        font = ImageFont.truetype(path, 18) # Set to 18 for proper scaling
        break
    except IOError:
        continue

if font is None:
    print("Warning: Could not find system fonts. Using default.")
    font = ImageFont.load_default()

# 4. Loop through images and names to create frames
for img_name, person_name in zip(images, names):
    img_path = os.path.join(image_folder, img_name)

    # Safety check
    frame_check = cv2.imread(img_path)
    if frame_check is None:
        print(f"Failed to load: {img_path}")
        continue

    # Open the original image
    pil_img = Image.open(img_path)

    # --- SEPIA TONE EFFECT ---
    # Convert to grayscale, then remap tones to classic sepia colors
    gray_img = pil_img.convert('L')
    pil_img = ImageOps.colorize(
        gray_img,
        black=(20, 10, 0),        # Deep warm brown/black for shadows
        mid=(140, 95, 60),        # Warm brown for midtones
        white=(255, 240, 220)     # Creamy off-white for highlights
    )

    # Resize and letterbox with black padding
    pil_img = ImageOps.pad(pil_img, (width, height), method=Image.Resampling.LANCZOS, color=(0, 0, 0))

    # Convert to RGBA to allow drawing a semi-transparent text box
    pil_img = pil_img.convert('RGBA')

    # Create a separate transparent overlay for the text and box
    overlay = Image.new('RGBA', pil_img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Calculate text dimensions
    bbox = draw.textbbox((0, 0), person_name, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    # Define exact center coordinates for the text
    center_x = width // 2
    center_y = height - 100  # Distance from the bottom of the frame

    # Calculate padding for the background rectangle
    pad_x = 25
    pad_y = 20
    rect_left = center_x - (text_w // 2) - pad_x
    rect_top = center_y - (text_h // 2) - pad_y
    rect_right = center_x + (text_w // 2) + pad_x
    rect_bottom = center_y + (text_h // 2) + pad_y

    # Draw the semi-transparent black rectangle (180 out of 255 opacity)
    draw.rectangle([rect_left, rect_top, rect_right, rect_bottom], fill=(0, 0, 0, 180))

    # Draw the text precisely perfectly centered in that box using anchor="mm"
    draw.text((center_x, center_y), person_name, font=font, fill=(255, 255, 255), anchor="mm")

    # Merge the overlay down onto the photo
    pil_img = Image.alpha_composite(pil_img, overlay)

    # Convert the finished PIL image back to OpenCV's BGR format
    frame = cv2.cvtColor(np.array(pil_img.convert('RGB')), cv2.COLOR_RGB2BGR)

    # Write frames for duration
    frames_to_write = duration_per_slide * fps
    for _ in range(frames_to_write):
        video.write(frame)

    print(f"Added slide for: {person_name}")

video.release()
print(f"\nSuccess! Movie saved to: {output_video}")

import os
from PIL import Image
import numpy as np

def process_image(input_path, output_path):
    print(f"Processing {input_path}...")
    from rembg import remove
    
    # 1. Remove background
    original_img = Image.open(input_path)
    print("Original size:", original_img.size)
    img = remove(original_img)
    
    # img is now RGBA
    img = img.convert("RGBA")
    
    # 2. Add blue gradient / lightning effect at the bottom
    # We'll create a blue glow that fades in from the bottom
    width, height = img.size
    
    # Create an overlay image for the blue effect
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    
    # Define the colors
    # #55C2FF (85, 194, 255) and #1E6FD9 (30, 111, 217)
    
    # We want the bottom part (e.g. bottom 30%) to fade into blue
    fade_height = int(height * 0.35)
    start_y = height - fade_height
    
    # Convert image to numpy array to modify alpha and add color
    img_array = np.array(img)
    
    for y in range(start_y, height):
        # progress goes from 0 (at start_y) to 1 (at height)
        progress = (y - start_y) / fade_height
        
        # Calculate the blend factor (using power for non-linear fade)
        blend = progress ** 1.5
        
        # Color mix between light blue and dark blue
        r = int(85 * (1 - blend) + 30 * blend)
        g = int(194 * (1 - blend) + 111 * blend)
        b = int(255 * (1 - blend) + 217 * blend)
        
        for x in range(width):
            # Only apply where there is content (alpha > 0)
            alpha = img_array[y, x, 3]
            if alpha > 0:
                # We want to tint the existing pixels with the blue color
                # and maybe feather the alpha at the very bottom
                
                # Tint the pixel
                old_r, old_g, old_b = img_array[y, x, 0], img_array[y, x, 1], img_array[y, x, 2]
                
                # The more we go down, the more the pixel takes the blue color
                new_r = int(old_r * (1 - blend) + r * blend)
                new_g = int(old_g * (1 - blend) + g * blend)
                new_b = int(old_b * (1 - blend) + b * blend)
                
                # The alpha should fade out at the very bottom
                # If progress is > 0.8, fade out alpha
                new_alpha = alpha
                if progress > 0.7:
                    alpha_fade = 1.0 - ((progress - 0.7) / 0.3)
                    new_alpha = int(alpha * alpha_fade)
                
                img_array[y, x, 0] = new_r
                img_array[y, x, 1] = new_g
                img_array[y, x, 2] = new_b
                img_array[y, x, 3] = new_alpha

    # Convert back to image
    result = Image.fromarray(img_array)
    
    # Save the result
    result.save(output_path)
    print(f"Saved to {output_path}")

if __name__ == '__main__':
    input_file = r"C:\Users\Lenovo\.gemini\antigravity-ide\brain\5cb9e19a-8bf2-45f6-9802-8bed208410f3\media__1785477050024.jpg"
    output_file = r"c:\Users\Lenovo\Downloads\port\assets\image_2_edited.png"
    process_image(input_file, output_file)

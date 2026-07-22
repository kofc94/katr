import qrcode
from PIL import Image, ImageDraw, ImageFilter

def make_artistic_scannable_qr():
    # 1. Create QR code with maximum Error Correction H (30% redundancy)
    qr = qrcode.QRCode(
        version=5,  # 37x37 grid, high density
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=24,  # High resolution (1080x1080px)
        border=4,
    )
    qr.add_data('https://katr.org')
    qr.make(fit=True)

    matrix = qr.get_matrix()
    grid_size = len(matrix)
    box_size = 24
    border = 4
    img_size = (grid_size + border * 2) * box_size

    # 2. Base Canvas: 100% Transparent RGBA (alpha = 0)
    img = Image.new('RGBA', (img_size, img_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 3. Draw Finder Patterns (The 3 big corner targets) with Gold & Navy
    def draw_finder_pattern(row, col):
        x = (col + border) * box_size
        y = (row + border) * box_size
        size = 7 * box_size
        
        # Outer Gold Square with rounded corners
        draw.rounded_rectangle([x, y, x + size - 1, y + size - 1], radius=16, fill=(245, 158, 11, 255))
        # Inner Navy Square
        pad1 = box_size
        draw.rounded_rectangle([x + pad1, y + pad1, x + size - pad1 - 1, y + size - pad1 - 1], radius=10, fill=(7, 14, 27, 255))
        # Core Gold Target
        pad2 = box_size * 2
        draw.rounded_rectangle([x + pad2, y + pad2, x + size - pad2 - 1, y + size - pad2 - 1], radius=6, fill=(251, 191, 36, 255))

    finder_coords = [(0, 0), (0, grid_size - 7), (grid_size - 7, 0)]
    for r, c in finder_coords:
        draw_finder_pattern(r, c)

    # Helper to check if (r, c) is in finder pattern
    def is_finder(r, c):
        for fr, fc in finder_coords:
            if fr <= r < fr + 7 and fc <= c < fc + 7:
                return True
        return False

    # 4. Draw QR Modules (data dots) as elegant rounded gold modules
    for r in range(grid_size):
        for c in range(grid_size):
            if is_finder(r, c):
                continue
            if matrix[r][c]:
                x = (c + border) * box_size
                y = (r + border) * box_size
                pad = 2
                draw.rounded_rectangle([x + pad, y + pad, x + box_size - pad - 1, y + box_size - pad - 1], 
                                       radius=6, fill=(245, 158, 11, 255))

    # 5. Add Horse & Jockey Centerpiece Emblem
    center_ratio = 0.28
    center_size = int(img_size * center_ratio)
    cx = (img_size - center_size) // 2
    cy = (img_size - center_size) // 2

    # Create emblem badge overlay
    badge = Image.new('RGBA', (center_size, center_size), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(badge)

    # Outer Gold ring
    b_draw.ellipse([0, 0, center_size - 1, center_size - 1], fill=(245, 158, 11, 255), outline=(251, 191, 36, 255), width=5)
    
    # Inner Navy circular field
    ring_pad = 6
    inner_diameter = center_size - (ring_pad * 2)
    b_draw.ellipse([ring_pad, ring_pad, center_size - ring_pad - 1, center_size - ring_pad - 1], fill=(7, 14, 27, 255))

    # Process official graphic: convert white background to navy/transparent or crop circle
    try:
        official_img = Image.open('/Users/eric/dev/katr/2026/assets/official_graphic.jpg').convert('RGBA')
        
        # Multiply/Blend white background of image into navy background or key out pure white
        datas = official_img.getdata()
        new_data = []
        for item in datas:
            # If color is close to pure white, make it transparent
            if item[0] > 235 and item[1] > 235 and item[2] > 235:
                new_data.append((7, 14, 27, 0))
            else:
                new_data.append(item)
        official_img.putdata(new_data)

        # Scale horse image to fit inside emblem
        h_target_w = int(inner_diameter * 0.88)
        orig_w, orig_h = official_img.size
        scale = h_target_w / float(orig_w)
        h_target_h = int(orig_h * scale)
        
        resized_horse = official_img.resize((h_target_w, h_target_h), Image.Resampling.LANCZOS)
        
        # Position in center of emblem
        hx = (center_size - h_target_w) // 2
        hy = (center_size - h_target_h) // 2
        badge.paste(resized_horse, (hx, hy), resized_horse)
    except Exception as e:
        print("Horse embed detail:", e)

    # Gold inner accent border ring around emblem
    b_draw.ellipse([ring_pad+3, ring_pad+3, center_size - ring_pad - 4, center_size - ring_pad - 4], outline=(245, 158, 11, 255), width=2)

    # Paste badge on center of QR image
    img.paste(badge, (cx, cy), badge)

    # Save transparent PNG and JPG
    output_png = '/Users/eric/dev/katr/2026/assets/katr_qr_artwork.png'
    output_jpg = '/Users/eric/dev/katr/2026/assets/katr_qr_artwork.jpg'
    
    img.save(output_png, format='PNG')
    
    final_rgb = Image.new('RGB', img.size, (7, 14, 27))
    final_rgb.paste(img, mask=img.split()[3])
    final_rgb.save(output_jpg, quality=98)
    print("Artistic Scannable QR code successfully updated with transparent background!")

if __name__ == '__main__':
    make_artistic_scannable_qr()

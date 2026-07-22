import qrcode
from PIL import Image, ImageDraw

def create_scannable_horse_qr():
    # 1. Create QR code instance with high error correction (Error-Correction-H = up to 30% damage/overlay recovery)
    qr = qrcode.QRCode(
        version=4,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=16,
        border=3,
    )
    qr.add_data('https://katr.org')
    qr.make(fit=True)

    # 2. Render base QR image with Bright Gold modules (#f59e0b) on white background
    qr_raw = qr.make_image(fill_color="#f59e0b", back_color="white").convert('RGBA')

    # Convert white background to 100% transparent (alpha = 0)
    data = qr_raw.getdata()
    new_data = []
    for item in data:
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            new_data.append((0, 0, 0, 0))  # Transparent background
        else:
            new_data.append(item)
            
    qr_img = Image.new('RGBA', qr_raw.size)
    qr_img.putdata(new_data)

    # 3. Create a styled rounded emblem badge for the center
    qr_w, qr_h = qr_img.size
    logo_size = int(qr_w * 0.28)  # 28% of QR size keeps it 100% scannable

    # Create badge canvas with transparent background
    badge = Image.new('RGBA', (logo_size, logo_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(badge)
    
    # Draw circular gold outer ring and imperial navy inner field
    draw.ellipse([0, 0, logo_size - 1, logo_size - 1], fill="#f59e0b", outline="#fbbf24", width=3)
    
    ring_pad = 5
    draw.ellipse([ring_pad, ring_pad, logo_size - ring_pad - 1, logo_size - ring_pad - 1], fill="#070e1b")

    # Draw inner gold accent circle
    inner_pad = int(logo_size * 0.12)
    draw.ellipse([inner_pad, inner_pad, logo_size - inner_pad - 1, logo_size - inner_pad - 1], 
                 fill="#070e1b", outline="#fbbf24", width=2)
    
    # Add text "KATR" inside badge
    try:
        from PIL import ImageFont
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", int(logo_size * 0.22))
    except Exception:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), "KATR", font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (logo_size - tw) // 2
    ty = (logo_size - th) // 2
    draw.text((tx, ty), "KATR", fill="#fbbf24", font=font)

    # Calculate position to paste badge in center of QR
    pos_x = (qr_w - logo_size) // 2
    pos_y = (qr_h - logo_size) // 2
    qr_img.paste(badge, (pos_x, pos_y), badge)

    # Save transparent PNG QR code to assets
    qr_img.save('/Users/eric/dev/katr/2026/assets/katr_qr_code.png', format='PNG')
    print("Transparent scannable QR code successfully generated at 2026/assets/katr_qr_code.png!")

if __name__ == '__main__':
    create_scannable_horse_qr()

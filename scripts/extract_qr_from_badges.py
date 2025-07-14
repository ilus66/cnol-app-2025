import os
import csv
from pdf2image import convert_from_path
from pyzbar.pyzbar import decode
from PIL import Image

BADGES_DIR = 'badges1/'
OUTPUT_CSV = 'qr_codes_extraits.csv'

def extract_qr_from_pdf(pdf_path):
    try:
        # Convertir la première page du PDF en image
        images = convert_from_path(pdf_path, first_page=1, last_page=1)
        if not images:
            return None
        image = images[0]
        # Chercher les QR codes dans l'image
        decoded_objs = decode(image)
        for obj in decoded_objs:
            if obj.type == 'QRCODE':
                return obj.data.decode('utf-8')
        return None
    except Exception as e:
        print(f"Erreur extraction QR pour {pdf_path}: {e}")
        return None

def main():
    results = []
    for filename in os.listdir(BADGES_DIR):
        if filename.lower().endswith('.pdf'):
            pdf_path = os.path.join(BADGES_DIR, filename)
            qr_code = extract_qr_from_pdf(pdf_path)
            results.append({
                'fichier': filename,
                'qr_code': qr_code or ''
            })
            print(f"{filename}: {qr_code}")
    # Écrire le CSV
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['fichier', 'qr_code']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for row in results:
            writer.writerow(row)
    print(f"Extraction terminée. Résultats dans {OUTPUT_CSV}")

if __name__ == '__main__':
    main() 
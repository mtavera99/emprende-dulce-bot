import shutil
import zipfile
import os

src_dir = "/Users/santiagotavera/Desktop/Trabajos/lowticket-bot/libros-pdf/dist/pdf"
dst_dir = "/Users/santiagotavera/Desktop/Trabajos/lowticket-bot/dist_pdfs"

for f in os.listdir(src_dir):
    if f.endswith(".pdf"):
        src_file = os.path.join(src_dir, f)
        dst_file = os.path.join(dst_dir, f)
        shutil.copy2(src_file, dst_file)
        print(f"Copied {f} ({os.path.getsize(dst_file)} bytes)")

# Update zip package
zip_path = os.path.join(dst_dir, "Emprende_Dulce_Pack_Completo_2026.zip")
files_to_zip = [
    "01_Helados_Artesanales_Guia_Maestra.pdf",
    "02_Postres_en_Vaso_Para_Emprender.pdf",
    "03_Recetario_Navideno_Postres_y_Cajas_Regalo.pdf",
    "Bono_01_Calculadora_Costos_y_Precios.html",
    "Bono_02_Directorio_Proveedores_Colombia.pdf",
    "Bono_03_Guia_Ventas_WhatsApp_Postres.pdf"
]

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for fname in files_to_zip:
        fpath = os.path.join(dst_dir, fname)
        if os.path.exists(fpath):
            zipf.write(fpath, arcname=fname)
            print(f"Added to zip: {fname}")

print(f"Updated zip: {zip_path} ({os.path.getsize(zip_path)} bytes)")

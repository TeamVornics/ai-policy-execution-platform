from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

def create_sample_pdf(filepath):
    print(f"Generating PDF at {filepath}...")
    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter
    
    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, height - 72, "POLICY: IT Asset Management Policy 2024")
    
    # Body
    c.setFont("Helvetica", 12)
    text_lines = [
        "1. All employees must return company-issued laptops to the IT Department",
        "   within 3 days of resignation or termination.",
        "",
        "2. The HR Manager is responsible for notifying the IT Team at least 24 hours",
        "   before the employee's last working day.",
        "",
        "3. Lost or damaged equipment must be reported immediately to the System Admin.",
        "   Employees may be liable for repairs if negligence is proven."
    ]
    
    y = height - 100
    for line in text_lines:
        c.drawString(72, y, line)
        y -= 15
        
    c.save()
    print("✅ PDF generated successfully.")

if __name__ == "__main__":
    os.makedirs("demo_data", exist_ok=True)
    create_sample_pdf("demo_data/sample_policy.pdf")

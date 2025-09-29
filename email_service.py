import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from config import EmailConfig


def send_email_with_logo(subject, body_html, recipients):
    """
    Envía un correo HTML con una firma que incluye el logo y texto institucional.
    """
    msg = MIMEMultipart("related")
    msg["Subject"] = subject
    msg["From"] = EmailConfig.SMTP_USER
    msg["To"] = ", ".join(recipients)

    # Plantilla de firma
    firma_html = """
    <br>
    <div style="display: flex; align-items: center; justify-content: flex-start;">
        <img src="cid:logo" alt="Logo" style="height: 100px; margin-right: 15px;">
        <span style="font-weight: bold; font-size: 14px;">
            Notificaciones Laboratorios<br>
            I.U Colegio Mayor de Antioquia<br>
            Cra 78 Nº 65 - 46 Robledo
        </span>
    </div>
    """

    # Unir cuerpo y firma
    full_html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        {body_html}
        {firma_html}
      </body>
    </html>
    """

    # Adjuntar HTML
    msg.attach(MIMEText(full_html, "html", "utf-8"))

    # Adjuntar logo
    logo_path = os.path.abspath(os.path.join("static", "img", "logo-correo.gif"))
    if os.path.exists(logo_path):
        with open(logo_path, "rb") as f:
            image = MIMEImage(f.read())
            image.add_header("Content-ID", "<logo>")
            image.add_header("Content-Disposition", "inline", filename="logo-correo.gif")
            msg.attach(image)
    else:
        print(f"⚠️ Logo no encontrado en {logo_path}")

    # Envío seguro
    try:
        with smtplib.SMTP(EmailConfig.SMTP_SERVER, EmailConfig.SMTP_PORT) as server:
            server.starttls()
            server.login(EmailConfig.SMTP_USER, EmailConfig.SMTP_PASSWORD)
            server.sendmail(EmailConfig.SMTP_USER, recipients, msg.as_string())
    except Exception as e:
        print(f"❌ Error enviando correo: {e}")


def send_prestamo_notification_html(
    cod_articulo, nombre_equipo, quien_entrega, ubicacion_original, email_entrega,
    quien_recibe, ubicacion_destino, email_recibe, fecha_prestamo
):
    """
    Construye el HTML del préstamo y lo envía a ambas partes.
    """
    subject = f"Préstamo de equipo: {nombre_equipo}"

    # HTML del cuerpo (sin firma)
    body_html = f"""
    <p>Hola,</p>
    <p>Se ha registrado un préstamo de equipo en el sistema GestionLab de los laboratorios de la Institución Universitaria Colegio Mayor de Antioquia con los siguientes datos:</p>
    <ul>
        <li><b>📦 Equipo:</b> {nombre_equipo} (Placa: {cod_articulo})</li>
        <li><b>👤 Entregado por:</b> {quien_entrega}</li>
        <li><b>📍 Ubicación original:</b> {ubicacion_original}</li>
        <li><b>👤 Recibido por:</b> {quien_recibe}</li>
        <li><b>📍 Ubicación destino:</b> {ubicacion_destino}</li>
        <li><b>📅 Fecha de préstamo:</b> {fecha_prestamo}</li>
    </ul>
    <p>Por favor conservar este correo como comprobante.</p>
    """

    send_email_with_logo(subject, body_html, [email_entrega, email_recibe])
# =====================================================================================================

# ==============================FUNCIÓN PARA CORREO DE DEVOLUCIÓN =========================================


# =====================================================================================================
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
            Notificaciones Mantenimientos<br>
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


def send_mantenimiento_notification_html(
    lista_equipos, nombre_tecnico, id_proceso,
    persona_responsable, email_recibe, fecha_mantenimiento, vencimiento_mantenimiento, tipo_mantenimiento
):
    """
    Construye el HTML del préstamo y lo envía a ambas partes.
    """
    tipo = "Preventivo" if tipo_mantenimiento == "fecha_mantenimiento" else "Correctivo"
    subject = f"Mantenimiento {tipo}"

    # Lista HTML de equipos
    equipos_html = "".join([
        f"<li><b>🖥️ Equipo:</b> {e['nombre_equipo']} (Placa: {e['cod_articulo']})</li>"
        for e in lista_equipos
    ])

    # HTML del cuerpo (sin firma)
    body_html = f"""
    <p>Hola,</p>
    <p>Se ha registrado un mantenimiento <b>{tipo}</b> en el sistema <b>Mantenimientos Tecnología</b> con la siguiente información:</p>
    <ul>
        {equipos_html}
        <li><b>👤 Tecnico responsable:</b> {nombre_tecnico}</li>
        <li><b>📍 Proceso:</b> {id_proceso}</li>
        <li><b>👤 Responsable del equipo:</b> {persona_responsable}</li>
        <li><b>🗓 Ejecución de mantenimiento:</b> {fecha_mantenimiento}</li>
        <li><b>🗓 Vencimiento de mantenimiento:</b> {vencimiento_mantenimiento}</li>
    </ul>
    <p>Prevención instalación de software no autorizado dan cumplimiento a la Resolución No. 
    163 del 18 de mayo de 2023 por medio de la cual se actualizan los lineamientos de Tecnología e informática 
    en la Institución Universitaria Colegio Mayor de Antioquia:    
    </p>
    <p><b>ARTÍCULO 23. USO GENERAL:</b> “Queda estrictamente prohibido inspeccionar, copiar y almacenar programas de cómputo, software y demás fuentes que violen las leyes de derechos de autor.”</p>
    
    <p><b>ARTÍCULO 33. INSTALACIÓN Y DESINSTALACIÓN:</b> “La instalación y desinstalación de programas es facultad exclusiva del personal de Informática.”</p>

    <p><b>ARTICULO 34 DERECHOS DE AUTOR:</b> “Queda estrictamente prohibido instalar, copiar y almacenar software que viole la ley de derechos de autor.”</p>

    <p><b>Aviso:</b> Este correo ha sido generado automáticamente. Por favor no responda a este mensaje.</p>
    
    <p>Por favor conservar este correo como comprobante.</p>
    """

    send_email_with_logo(subject, body_html, [email_recibe])
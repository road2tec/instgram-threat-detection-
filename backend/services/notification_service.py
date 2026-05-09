import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

class NotificationService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.email_user = os.getenv('EMAIL_USER')
        self.email_pass = os.getenv('EMAIL_PASS')

    def send_threat_alert(self, recipient_email, threat_data):
        """Sends a detailed forensic alert email when a threat is detected"""
        if not self.email_user or not self.email_pass:
            print("[ERROR] Email credentials not configured. Skipping alert.")
            return False

        try:
            msg = MIMEMultipart()
            msg['From'] = f"Cyber-Violet Security <{self.email_user}>"
            msg['To'] = recipient_email
            msg['Subject'] = f"🚨 URGENT: Cyber-Threat Detected - {threat_data.get('category', 'Alert').upper()}"

            # Professional HTML Email Template
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                        <div style="background-color: #f44336; color: white; padding: 20px; text-align: center;">
                            <h2 style="margin: 0;">Forensic Threat Detected</h2>
                        </div>
                        <div style="padding: 20px;">
                            <p>An investigator-initiated scan has detected a high-risk signature on the monitored network.</p>
                            
                            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                                <h3 style="margin-top: 0; color: #f44336;">Incident Details:</h3>
                                <strong>Source:</strong> {threat_data.get('username', 'Unknown Profile')}<br>
                                <strong>Threat Category:</strong> {threat_data.get('category', 'General')}<br>
                                <strong>Severity:</strong> {threat_data.get('severity', 'High')}<br>
                                <strong>Confidence:</strong> {float(threat_data.get('confidence', 0)) * 100}%<br>
                                <strong>Timestamp:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}
                            </div>

                            <p><strong>Threat Content Snippet:</strong></p>
                            <blockquote style="font-style: italic; color: #666; border-left: 4px solid #ddd; padding-left: 15px;">
                                "{threat_data.get('text', 'No content available')[:200]}..."
                            </blockquote>

                            <p>Please log in to the dashboard immediately to take mitigation steps.</p>
                            
                            <a href="http://localhost:3000/dashboard" 
                               style="display: inline-block; background-color: #8b5cf6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                               View Incident Dashboard
                            </a>
                        </div>
                        <div style="background-color: #eee; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                            This is an automated forensic alert from the Cyber-Violet Intelligence Platform.
                        </div>
                    </div>
                </body>
            </html>
            """
            
            msg.attach(MIMEText(html_body, 'html'))

            # Secure SMTP Connection
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_user, self.email_pass)
            server.send_message(msg)
            server.quit()
            
            print(f"[SUCCESS] Forensic alert email sent to {recipient_email}")
            return True

        except Exception as e:
            print(f"[ERROR] Failed to send email alert: {str(e)}")
            return False

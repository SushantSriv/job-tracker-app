import os
import requests

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")  # legg til i .env-filen
FROM_EMAIL = "sushant.nmbu@gmail.com"  # må matche verifisert adresse hos SendGrid

def send_status_email(to_email: str, job_title: str, new_status: str):
    subject = f"📢 Oppdatering for søknad: {job_title}"
    content = f"""
    Hei,

    Statusen for din søknad på <strong>{job_title}</strong> er endret til: 
    <span style="color: blue;"><strong>{new_status.upper()}</strong></span>.

    Lykke til videre!  
    Hilsen Job Tracker App
    """

    try:
        response = requests.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={
                "Authorization": f"Bearer {SENDGRID_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "personalizations": [
                    {
                        "to": [{"email": to_email}],
                        "subject": subject
                    }
                ],
                "from": {"email": FROM_EMAIL},
                "content": [
                    {"type": "text/html", "value": content}
                ]
            },
            verify=False,
            timeout=5  # valgfritt: timeout etter 5 sekunder
        )

        if response.status_code != 202:
            print(f"❌ SendGrid-feil: {response.status_code} – {response.text}")
        else:
            print("✅ E-post sendt via SendGrid!")

    except requests.exceptions.RequestException as e:
        print(f"❌ Feil ved sending: {e}")

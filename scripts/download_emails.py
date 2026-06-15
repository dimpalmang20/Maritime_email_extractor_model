import imaplib
import email
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

RAW_EMAIL_FOLDER = "datasets/raw_emails"

os.makedirs(RAW_EMAIL_FOLDER, exist_ok=True)

# Find next email number
existing_files = [
    f for f in os.listdir(RAW_EMAIL_FOLDER)
    if f.startswith("email_") and f.endswith(".txt")
]

if existing_files:
    numbers = [
        int(f.replace("email_", "").replace(".txt", ""))
        for f in existing_files
    ]
    next_number = max(numbers) + 1
else:
    next_number = 1

print("Connecting to mailbox...")

mail = imaplib.IMAP4_SSL(EMAIL_HOST)

mail.login(
    EMAIL_USERNAME,
    EMAIL_PASSWORD
)

mail.select("INBOX")

status, messages = mail.search(None, "ALL")

email_ids = messages[0].split()
start_from = 1380
email_ids = email_ids[start_from:]

print(f"Total Emails Found: {len(email_ids)}")

for email_id in email_ids:

    status, msg_data = mail.fetch(
        email_id,
        "(RFC822)"
    )

    for response_part in msg_data:

        if isinstance(response_part, tuple):

            msg = email.message_from_bytes(
                response_part[1]
            )

            body = ""

            if msg.is_multipart():

                for part in msg.walk():

                    content_type = part.get_content_type()

                    if content_type == "text/plain":

                        try:
                            body += part.get_payload(
                                decode=True
                            ).decode(
                                errors="ignore"
                            )
                        except:
                            pass

            else:

                try:
                    body = msg.get_payload(
                        decode=True
                    ).decode(
                        errors="ignore"
                    )
                except:
                    pass

            filename = (
                f"email_{next_number:03d}.txt"
            )

            filepath = os.path.join(
                RAW_EMAIL_FOLDER,
                filename
            )

            with open(
                filepath,
                "w",
                encoding="utf-8"
            ) as f:

                f.write(body)

            print(
                f"Saved {filename}"
            )

            next_number += 1

mail.logout()

print("Done")
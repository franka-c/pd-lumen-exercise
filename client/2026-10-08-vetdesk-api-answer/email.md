Fictional client, created for an internal DECODE exercise.

# VetDesk partner API, writing appointments

Transcribed as received. The "Date" line is the exercise template's placeholder. The
email arrived on 8 October 2026.

From: Tomislav Jurić tomislav.juric@example.com
To: Iva Marić
Date: the day of the exercise
Subject: VetDesk partner API, writing appointments

---

Iva,

I had the call with VetDesk support. Short version: the partner API allows creating
and updating appointments, with a partner key that they issue per practice group.
Lumen qualifies as one group. Rate limit is 60 requests per minute per key, and
writes go into a pending state that the clinic's VetDesk shows in a separate colour
until a staff member confirms, or automatically after 15 minutes if the slot is still
free.

Reading is as we thought: owners, pets, appointments, vaccinations, prescriptions,
all available. Prescriptions cannot be written, only read, so the approval has to
stay on our side and be written back as a note on the record.

They will issue a sandbox key next week. Documentation attached (PDF, in Drive under
Lumen / VetDesk / partner-api-v3.pdf).

Tomislav

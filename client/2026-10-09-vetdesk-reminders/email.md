Fictional client, created for an internal DECODE exercise.

From: Tomislav (Lumen IT)
To: Iva
Date: 9 October 2026
Subject: Re: reminder rules in VetDesk

Hi Iva,

The reminder rules live in VetDesk and stay there. Reception sets them per species
and per vaccine, for example rabies every 12 months for dogs.

We cannot give you the rules themselves through the API. What you can read is the
result: for each pet, VetDesk returns the reminders that are due, with the type,
the due date and the clinic. That is a read-only endpoint, and you can call it as
often as you need.

So the app should show what VetDesk says is due, and not work anything out itself.
If a rule changes, reception changes it in VetDesk and the app picks it up on the
next read.

Tomislav
